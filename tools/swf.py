"""Minimal SWF (Flash 8) reader: tags, sprites, placements, bitmaps.

Enough to pull the pre-rendered frames and hotspot geometry out of the
legacy lesson SWFs without JPEXS. Coordinates are in twips (1/20 px)
unless a function says otherwise.
"""
import struct
import zlib

TAG_NAMES = {
    0: 'End', 1: 'ShowFrame', 2: 'DefineShape', 4: 'PlaceObject', 5: 'RemoveObject',
    6: 'DefineBits', 8: 'JPEGTables', 9: 'SetBackgroundColor', 12: 'DoAction',
    20: 'DefineBitsLossless', 21: 'DefineBitsJPEG2', 22: 'DefineShape2',
    26: 'PlaceObject2', 28: 'RemoveObject2', 32: 'DefineShape3', 35: 'DefineBitsJPEG3',
    34: 'DefineButton2', 7: 'DefineButton', 46: 'DefineMorphShape', 84: 'DefineMorphShape2',
    36: 'DefineBitsLossless2', 39: 'DefineSprite', 43: 'FrameLabel', 56: 'ExportAssets',
    59: 'DoInitAction', 69: 'FileAttributes', 70: 'PlaceObject3', 83: 'DefineShape4',
}


class Bits:
    def __init__(self, data, pos=0):
        self.data, self.pos, self.bit = data, pos, 0

    def ub(self, n):
        v = 0
        for _ in range(n):
            byte = self.data[self.pos]
            v = (v << 1) | ((byte >> (7 - self.bit)) & 1)
            self.bit += 1
            if self.bit == 8:
                self.bit, self.pos = 0, self.pos + 1
        return v

    def sb(self, n):
        v = self.ub(n)
        return v - (1 << n) if n and v & (1 << (n - 1)) else v

    def fb(self, n):
        return self.sb(n) / 65536.0

    def align(self):
        if self.bit:
            self.bit, self.pos = 0, self.pos + 1


def read_rect(b: Bits):
    n = b.ub(5)
    r = [b.sb(n) for _ in range(4)]  # xmin, xmax, ymin, ymax
    b.align()
    return r


def read_matrix(b: Bits):
    sx = sy = 1.0
    r0 = r1 = 0.0
    if b.ub(1):
        n = b.ub(5)
        sx, sy = b.fb(n), b.fb(n)
    if b.ub(1):
        n = b.ub(5)
        r0, r1 = b.fb(n), b.fb(n)
    n = b.ub(5)
    tx, ty = b.sb(n), b.sb(n)
    b.align()
    return (sx, r0, r1, sy, tx, ty)  # a, b, c, d, tx, ty


def iter_tags(data, pos, end):
    while pos < end:
        code_len, = struct.unpack_from('<H', data, pos)
        pos += 2
        code, length = code_len >> 6, code_len & 0x3F
        if length == 0x3F:
            length, = struct.unpack_from('<I', data, pos)
            pos += 4
        yield code, data[pos:pos + length]
        pos += length
        if code == 0:
            break


def cstr(data, pos):
    end = data.index(b'\0', pos)
    return data[pos:end].decode('utf-8', 'replace'), end + 1


def parse_place2(body, po3=False):
    """PlaceObject2/3 -> dict(depth, char, matrix, name, move, ratio, clip_depth)."""
    flags = body[0]
    flags2 = body[1] if po3 else 0
    pos = 2 if po3 else 1
    depth, = struct.unpack_from('<H', body, pos)
    pos += 2
    if po3 and (flags2 & 8 or (flags2 & 16 and flags & 2)):
        _, pos = cstr(body, pos)  # class name
    out = {'depth': depth, 'move': bool(flags & 1)}
    if flags & 2:
        out['char'], = struct.unpack_from('<H', body, pos)
        pos += 2
    if flags & 4:
        b = Bits(body, pos)
        out['matrix'] = read_matrix(b)
        pos = b.pos
    if flags & 8:  # color transform: skip by parsing
        b = Bits(body, pos)
        has_add, has_mult = b.ub(1), b.ub(1)
        n = b.ub(4)
        cx = [b.sb(n) for _ in range(4 * (has_add + has_mult))]
        b.align()
        pos = b.pos
        out['cxform'] = (has_mult, has_add, cx)
    if flags & 16:
        out['ratio'], = struct.unpack_from('<H', body, pos)
        pos += 2
    if flags & 32:
        out['name'], pos = cstr(body, pos)
    if flags & 64:
        out['clip_depth'], = struct.unpack_from('<H', body, pos)
        pos += 2
    return out


class Timeline:
    """A root movie or sprite: list of frames, each a list of control tags."""

    def __init__(self, tags):
        self.frames = [[]]
        self.labels = {}
        for code, body in tags:
            if code == 1:
                self.frames.append([])
            elif code == 43:
                self.labels[cstr(body, 0)[0]] = len(self.frames) - 1
            elif code in (4, 5, 26, 28, 70, 12):
                self.frames[-1].append((code, body))
        if not self.frames[-1]:
            self.frames.pop()

    def display_lists(self):
        """Yield the display list (depth -> placement dict) after each frame."""
        dl = {}
        for frame in self.frames:
            for code, body in frame:
                if code in (26, 70):
                    p = parse_place2(body, po3=(code == 70))
                    if p['move'] and p['depth'] in dl:
                        cur = dict(dl[p['depth']])
                        if 'char' in p:  # replace character, keep other state
                            cur = {k: v for k, v in cur.items() if k not in ('ratio',)}
                        cur.update({k: v for k, v in p.items() if k != 'move'})
                        dl[p['depth']] = cur
                    else:
                        dl[p['depth']] = {k: v for k, v in p.items() if k != 'move'}
                elif code == 28:
                    dl.pop(struct.unpack_from('<H', body, 0)[0], None)
                elif code == 5:
                    dl.pop(struct.unpack_from('<H', body, 2)[0], None)
            yield dict(dl)


class Swf:
    def __init__(self, path):
        raw = open(path, 'rb').read()
        sig, self.version = raw[:3], raw[3]
        body = zlib.decompress(raw[8:]) if sig == b'CWS' else raw[8:]
        b = Bits(body)
        r = read_rect(b)
        self.width, self.height = (r[1] - r[0]) / 20, (r[3] - r[2]) / 20
        pos = b.pos
        self.fps = body[pos + 1] + body[pos] / 256
        pos += 4
        self.chars = {}      # id -> (code, body)
        self.sprites = {}    # id -> Timeline
        self.exports = {}    # name -> id
        self.jpeg_tables = b''
        root_tags = []
        for code, tb in iter_tags(body, pos, len(body)):
            if code == 39:
                sid, _ = struct.unpack_from('<HH', tb, 0)
                self.sprites[sid] = Timeline(list(iter_tags(tb, 4, len(tb))))
                self.chars[sid] = (code, tb)
            elif code == 8:
                self.jpeg_tables = tb
            elif code == 56:
                n, = struct.unpack_from('<H', tb, 0)
                p = 2
                for _ in range(n):
                    cid, = struct.unpack_from('<H', tb, p)
                    name, p = cstr(tb, p + 2)
                    self.exports[name] = cid
            elif code in TAG_NAMES and TAG_NAMES[code].startswith('Define') and len(tb) >= 2:
                self.chars[struct.unpack_from('<H', tb, 0)[0]] = (code, tb)
            root_tags.append((code, tb))
        self.root = Timeline(root_tags)

    def shape_bounds(self, cid):
        """Bounds (twips) of a DefineShape*, or None for non-shapes."""
        code, tb = self.chars.get(cid, (None, None))
        if code not in (2, 22, 32, 83):
            return None
        return read_rect(Bits(tb, 2))

    def shape_bitmap_fill(self, cid):
        """First bitmap fill of a shape as (bitmap_id, fill_matrix), or None."""
        code, tb = self.chars[cid]
        b = Bits(tb, 2)
        read_rect(b)
        if code == 83:
            read_rect(b)
            b.pos += 1
        pos = b.pos
        n = tb[pos]
        pos += 1
        if n == 0xFF:
            n, = struct.unpack_from('<H', tb, pos)
            pos += 2
        rgba = code in (32, 83)
        for _ in range(n):
            kind = tb[pos]
            pos += 1
            if kind == 0x00:
                pos += 4 if rgba else 3
            elif kind in (0x10, 0x12, 0x13):
                b = Bits(tb, pos)
                read_matrix(b)
                pos = b.pos
                if code == 83:
                    pos += 0  # spread/interp bits live in the count byte below
                cnt = tb[pos] & 0x0F
                pos += 1 + cnt * (1 + (4 if rgba else 3))
                if kind == 0x13:
                    pos += 2
            elif kind in (0x40, 0x41, 0x42, 0x43):
                bid, = struct.unpack_from('<H', tb, pos)
                if bid != 0xFFFF:
                    return bid, read_matrix(Bits(tb, pos + 2))
                b = Bits(tb, pos + 2)
                read_matrix(b)
                pos = b.pos
            else:
                return None
        return None
