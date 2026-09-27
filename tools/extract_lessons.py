"""Build per-lesson frame manifests from the legacy lesson SWFs.

Every lesson frame in the originals is a full-stage (664x412) bitmap drawn
at 1:1, so a part's animation is just "which bitmap(s) are on screen at
frame N". This script records that, plus named child clips (hotspots,
latches, rotate tools...) as stage-space rectangles.

Usage: python extract_lessons.py            -> writes .cache/manifests/<Lesson>.json
Requires images exported first (see export_assets.sh).
"""
import json
import struct
import os
import sys

from swf import Swf, TAG_NAMES

HERE = os.path.dirname(os.path.abspath(__file__))
LEGACY = os.path.join(HERE, '..', 'legacy')
OUT = os.path.join(HERE, '.cache', 'manifests')
LESSONS = ['PowerSupply', 'Motherboard', 'ExpansionCards', 'InternalDrive',
           'ExternalDrives', 'InternalCables', 'ExternalCables', 'exploreMode']
SHAPES = (2, 22, 32, 83)
IDENTITY = (1.0, 0.0, 0.0, 1.0, 0, 0)


def mul(m, n):
    """Compose matrices: apply n, then m."""
    a, b, c, d, tx, ty = m
    a2, b2, c2, d2, tx2, ty2 = n
    return (a * a2 + c * b2, b * a2 + d * b2, a * c2 + c * d2, b * c2 + d * d2,
            a * tx2 + c * ty2 + tx, b * tx2 + d * ty2 + ty)


def xform_rect(m, r):
    a, b, c, d, tx, ty = m
    pts = [(x, y) for x in (r[0], r[1]) for y in (r[2], r[3])]
    xs = [a * x + c * y + tx for x, y in pts]
    ys = [b * x + d * y + ty for x, y in pts]
    return [min(xs), max(xs), min(ys), max(ys)]


def union(r, s):
    if r is None:
        return s
    if s is None:
        return r
    return [min(r[0], s[0]), max(r[1], s[1]), min(r[2], s[2]), max(r[3], s[3])]


def button_hit_records(code, body):
    """(char, matrix) of a DefineButton/DefineButton2's hit-test state records."""
    from swf import Bits, read_matrix
    pos = 5 if code == 34 else 2
    out = []
    while pos < len(body) and body[pos]:
        flags = body[pos]
        char, _depth = struct.unpack_from('<HH', body, pos + 1)
        b = Bits(body, pos + 5)
        m = read_matrix(b)
        if code == 34:  # CXFORMWITHALPHA
            has_add, has_mult = b.ub(1), b.ub(1)
            n = b.ub(4)
            for _ in range(4 * (has_add + has_mult)):
                b.sb(n)
            b.align()
        pos = b.pos
        if flags & 0x10:  # filter list: not parsed; stop with what we have
            if flags & 0x08:
                out.append((char, m))
            break
        if flags & 0x20:
            pos += 1
        if flags & 0x08:
            out.append((char, m))
    return out


HELPERS = ('instructions_mc', 'iRotateTools', 'highlight_mc', 'highlight', 'mcHotSpot',
           'btnCancel', 'btnBack', 'btnNext', 'defaultInst_mc')


def is_helper(name):
    """Named children that are UI/hit areas rather than scenery (the app draws its own)."""
    return name in HELPERS or name.startswith(('bHotSpot', 'btn')) or name.endswith(('Btn', 'BtnRam'))


class Lesson:
    def __init__(self, name):
        self.name = name
        self.swf = Swf(os.path.join(LEGACY, 'models', name + '.swf'))
        self.unknown = {}
        self.subclips = {}

    def bounds(self, cid, m=IDENTITY, frame=0):
        """Stage-space bounds (twips) of a character's given frame."""
        s = self.swf
        if cid in s.sprites:
            dls = list(s.sprites[cid].display_lists())
            if not dls:
                return None
            r = None
            for p in dls[min(frame, len(dls) - 1)].values():
                if 'char' in p:
                    r = union(r, self.bounds(p['char'], mul(m, p.get('matrix', IDENTITY))))
            return r
        sb = s.shape_bounds(cid)
        if sb:
            return xform_rect(m, sb)
        code, body = s.chars.get(cid, (None, b''))
        if code in (7, 34):
            r = None
            for char, bm in button_hit_records(code, body):
                r = union(r, self.bounds(char, mul(m, bm)))
            return r
        return None

    def layers(self, dl, m=IDENTITY, owner=None):
        """Flatten one display list into drawable layers + named clips.
        Named visual sprites become sub-clips ({'sub': '<owner>.<name>'}) with their own frame state."""
        s = self.swf
        bitmaps, clips = [], []
        for depth in sorted(dl):
            p = dl[depth]
            if 'char' not in p or p.get('clip_depth'):
                continue
            cx = p.get('cxform')
            # fully transparent (alpha multiplier 0): still clickable, never drawn
            hidden = bool(cx and cx[0] and cx[2][3] <= 0 and (not cx[1] or cx[2][7] <= 0))
            cid = p['char']
            pm = mul(m, p.get('matrix', IDENTITY))
            code = s.chars.get(cid, (None,))[0]
            name = p.get('name')
            if name:
                r = self.bounds(cid, pm)
                clips.append({'name': name, 'char': cid, 'rect': [round(v / 20, 1) for v in r] if r else None})
                if owner and cid in s.sprites and not is_helper(name):
                    key = f'{owner}.{name}'
                    if key not in self.subclips:
                        self.subclips[key] = None  # guard against recursion
                        self.subclips[key] = self.clip(cid, pm, key)
                    bitmaps.append({'sub': key})
                continue
            if hidden:
                continue
            if code in SHAPES:
                fill = s.shape_bitmap_fill(cid)
                if fill:
                    bid, fm = fill
                    # bitmap pixel -> stage pixel (fill matrix is in twips per pixel)
                    t = mul(pm, fm)
                    bitmaps.append({'bmp': bid, 'm': [round(v / 20, 5) for v in t[:4]] + [round(t[4] / 20, 2), round(t[5] / 20, 2)]})
                else:
                    self.unknown['vector-shape'] = self.unknown.get('vector-shape', 0) + 1
                    bitmaps.append({'vector': cid, 'm': [round(v, 5) for v in pm[:4]] + [round(pm[4] / 20, 2), round(pm[5] / 20, 2)]})
            elif code in (7, 34):
                # unnamed buttons are the click targets (CPU lever, latches...)
                r = self.bounds(cid, pm)
                clips.append({'name': f'btn{cid}', 'char': cid,
                              'rect': [round(v / 20, 1) for v in r] if r else None})
            elif cid in s.sprites and len(s.sprites[cid].frames) == 1:
                b2, c2 = self.layers(next(s.sprites[cid].display_lists()), pm, owner)
                bitmaps += b2
                clips += c2
            elif cid in s.sprites:
                # unnamed nested animation: approximated by its first frame
                self.unknown['anon-anim-sprite'] = self.unknown.get('anon-anim-sprite', 0) + 1
                b2, c2 = self.layers(next(s.sprites[cid].display_lists()), pm, owner)
                bitmaps += b2
                clips += c2
            else:
                kind = TAG_NAMES.get(code, str(code))
                self.unknown[kind] = self.unknown.get(kind, 0) + 1
        return bitmaps, clips

    def clip(self, cid, m=IDENTITY, key=None):
        tl = self.swf.sprites[cid]
        frames = []
        for dl in tl.display_lists():
            bitmaps, clips = self.layers(dl, m, key)
            frames.append({'layers': bitmaps, 'clips': clips})
        return {'char': cid, 'labels': tl.labels, 'frames': frames}

    def manifest(self):
        """Clips = every multi-frame sprite placed on the root timeline (named
        parts keep their instance name, unnamed close-up views become s<id>).
        Scenes = per root frame, the static layers + which clips are placed."""
        s = self.swf
        clips, ui, scenes = {}, {}, []
        for dl in s.root.display_lists():
            layers, present = [], []
            for depth in sorted(dl):
                p = dl[depth]
                cid = p.get('char')
                if cid is None or p.get('clip_depth'):
                    continue
                name = p.get('name')
                if cid in s.sprites and len(s.sprites[cid].frames) > 1:
                    key = name or f's{cid}'
                    if key not in clips:
                        clips[key] = self.clip(cid, p.get('matrix', IDENTITY), key)
                    present.append(key)
                elif name:
                    r = self.bounds(cid, p.get('matrix', IDENTITY))
                    ui[name] = {'char': cid, 'rect': [round(v / 20, 1) for v in r] if r else None}
                else:
                    b, _ = self.layers({depth: p})
                    layers += b
            scenes.append({'layers': layers, 'clips': present})
        clips.update({k: v for k, v in self.subclips.items() if v})
        return {'name': self.name, 'width': s.width, 'height': s.height, 'fps': s.fps,
                'rootLabels': s.root.labels, 'scenes': scenes,
                'parts': clips, 'uiClips': ui, 'unsupported': self.unknown}


def main():
    os.makedirs(OUT, exist_ok=True)
    for name in sys.argv[1:] or LESSONS:
        m = Lesson(name).manifest()
        with open(os.path.join(OUT, name + '.json'), 'w', encoding='utf-8') as f:
            json.dump(m, f, indent=1)
        nf = sum(len(p['frames']) for p in m['parts'].values())
        print(f"{name}: parts={list(m['parts'])} ui={list(m['uiClips'])} "
              f"frames={nf} scenes={len(m['scenes'])} unsupported={m['unsupported']}")


if __name__ == '__main__':
    main()
