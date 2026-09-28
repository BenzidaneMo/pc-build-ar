"""Extract the legacy EXPLORE views: one photo per view plus its labelled callouts.

Each legacy/media/explore/explore<Part>.swf has root labels viewFront, viewBack, ... (view360 is the
FLV spin video, skipped). A view is a sprite holding a bitmap-filled shape (the photo) and unnamed
buttons, one per callout: their text is the label, their hit-test shape the feature on the photo.

Needs the JPEXS exports first (see CLAUDE.md):
  "$J" -jar $FF -format image:png_gif_jpeg -export image tools/.cache/explore-img legacy/media/explore
  "$J" -jar $FF -format text:plain -export text tools/.cache/explore-text legacy/media/explore

Output: public/media/explore/<Swf>/<view>.webp and src/content/explore.json
  {<Swf>: [{view, img, w, h, callouts: [{en, rect: [x, y, w, h] as % of the photo}]}]}
Usage: python tools/extract_explore.py [--debug]   (--debug also draws the callouts to tools/.cache/explore-debug/)
"""
import json
import os
import struct
import sys

from PIL import Image, ImageDraw

from swf import Bits, Swf, read_matrix

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
SRC = os.path.join(ROOT, 'legacy', 'media', 'explore')
CACHE = os.path.join(HERE, '.cache')
OUT = os.path.join(ROOT, 'public', 'media', 'explore')
VIEW_ORDER = ['Front', 'Back', 'Top', 'Bottom', 'Right', 'Left']


def mul(p, q):
    """Matrix product p∘q for (a, b, c, d, tx, ty) tuples (twips)."""
    a, b, c, d, tx, ty = p
    a2, b2, c2, d2, tx2, ty2 = q
    return (a * a2 + c * b2, b * a2 + d * b2, a * c2 + c * d2, b * c2 + d * d2,
            a * tx2 + c * ty2 + tx, b * tx2 + d * ty2 + ty)


def apply(m, x, y):
    a, b, c, d, tx, ty = m
    return a * x + c * y + tx, b * x + d * y + ty


ID = (1.0, 0.0, 0.0, 1.0, 0, 0)


def button_records(s, cid):
    """DefineButton2 -> [(state flags, char, matrix)]."""
    code, tb = s.chars[cid]
    if code != 34:
        return []
    pos, out = 5, []
    while tb[pos]:
        f = tb[pos]
        ch, _ = struct.unpack_from('<HH', tb, pos + 1)
        b = Bits(tb, pos + 5)
        m = read_matrix(b)
        has_add, has_mult = b.ub(1), b.ub(1)
        n = b.ub(4)
        [b.sb(n) for _ in range(4 * (has_add + has_mult))]
        b.align()
        pos = b.pos
        if f & 0x10:
            raise ValueError(f'button {cid}: filter lists not supported')
        if f & 0x20:
            pos += 1
        out.append((f, ch, m))
    return out


def text_of(swf_name, cid):
    p = os.path.join(CACHE, 'explore-text', swf_name, f'{cid}.txt')
    if not os.path.exists(p):
        return ''
    raw = open(p, encoding='utf-8').read().replace('--- RECORDSEPARATOR ---', ' ')
    return ' '.join(raw.split())


def image_of(swf_name, bid):
    for ext in ('jpg', 'png', 'gif'):
        p = os.path.join(CACHE, 'explore-img', swf_name, f'{bid}.{ext}')
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f'{swf_name} bitmap {bid}')


def placements(s, sid, m=ID):
    """Every (char, matrix) placed in sprite `sid` on any frame, matrices composed down to it."""
    seen, out = set(), []
    for dl in s.sprites[sid].display_lists():
        for p in dl.values():
            c = p.get('char')
            pm = mul(m, p.get('matrix', ID))
            key = (c, pm)
            if c is None or key in seen:
                continue
            seen.add(key)
            out.append((c, pm, p.get('name')))
            if c in s.sprites:
                out += placements(s, c, pm)
    return out


def view(s, swf_name, frame_dl):
    photo, callouts = None, []
    for p in frame_dl.values():
        c = p.get('char')
        if c not in s.sprites:
            continue
        for ch, m, name in placements(s, c, p.get('matrix', ID)):
            code = s.chars.get(ch, (None,))[0]
            if code in (2, 22, 32, 83) and photo is None:
                fills = s.shape_bitmap_fills(ch)
                if fills:
                    bid, fm = fills[-1]
                    photo = (bid, mul(m, fm))
            elif code == 34 and name is None:
                recs = button_records(s, ch)
                # swf.py doesn't keep DefineText tags: the JPEXS text export has one file per text id
                texts = [text_of(swf_name, r[1]) for r in recs if s.chars.get(r[1]) is None]
                label = ' '.join(dict.fromkeys(t for t in texts if t))  # some buttons repeat the text per state
                hits = [(r[1], mul(m, r[2])) for r in recs if r[0] & 8 and s.shape_bounds(r[1])]
                if not label or not hits:
                    continue
                pts = []
                for hc, hm in hits:
                    x0, x1, y0, y1 = s.shape_bounds(hc)
                    pts += [apply(hm, x, y) for x in (x0, x1) for y in (y0, y1)]
                xs, ys = [q[0] for q in pts], [q[1] for q in pts]
                callouts.append((label, (min(xs), min(ys), max(xs), max(ys))))
    return photo, callouts


def extract(path, debug):
    swf_name = os.path.basename(path)
    base = swf_name[:-4]
    s = Swf(path)
    frames = list(s.root.display_lists())
    views = []
    for label, fi in sorted(s.root.labels.items(), key=lambda kv: kv[1]):
        if not label.startswith('view') or label == 'view360':
            continue
        photo, callouts = view(s, swf_name, frames[fi])
        if not photo:
            continue  # the view button exists in every SWF, but not every part has that view
        bid, pm = photo
        im = Image.open(image_of(swf_name, bid)).convert('RGB')
        w, h = im.size
        # photo pixel -> twips is pm (a bitmap fill matrix is 20 twips per pixel); invert for the callouts
        a, b, c, d, tx, ty = pm
        det = a * d - b * c

        def to_px(x, y):
            x, y = x - tx, y - ty
            return (d * x - c * y) / det, (-b * x + a * y) / det

        out = []
        for text, (x0, y0, x1, y1) in callouts:
            (px0, py0), (px1, py1) = to_px(x0, y0), to_px(x1, y1)
            px0, px1 = sorted((max(0, px0), min(w, px1)))
            py0, py1 = sorted((max(0, py0), min(h, py1)))
            if px1 - px0 < 2 or py1 - py0 < 2:
                print(f'  {base} {label}: callout "{text}" off the photo', file=sys.stderr)
                continue
            out.append({'en': text, 'rect': [round(100 * px0 / w, 1), round(100 * py0 / h, 1),
                                             round(100 * (px1 - px0) / w, 1), round(100 * (py1 - py0) / h, 1)]})
        name = label[4:]
        os.makedirs(os.path.join(OUT, base), exist_ok=True)
        im.save(os.path.join(OUT, base, f'{name.lower()}.webp'), 'WEBP', quality=85, method=6)
        views.append({'view': name, 'img': f'{base}/{name.lower()}.webp', 'w': w, 'h': h, 'callouts': out})
        if debug:
            dbg = im.copy()
            g = ImageDraw.Draw(dbg)
            for co in out:
                x, y, cw, ch = co['rect']
                box = (x * w / 100, y * h / 100, (x + cw) * w / 100, (y + ch) * h / 100)
                g.rectangle(box, outline='red', width=2)
                g.text((box[0] + 3, box[1] + 3), co['en'], fill='red')
            os.makedirs(os.path.join(CACHE, 'explore-debug'), exist_ok=True)
            dbg.save(os.path.join(CACHE, 'explore-debug', f'{base}-{name}.png'))
    views.sort(key=lambda v: VIEW_ORDER.index(v['view']) if v['view'] in VIEW_ORDER else 99)
    if not views:
        # cables and peripherals: no views, just a photo or two (close-up of the connector)
        folder = os.path.join(CACHE, 'explore-img', swf_name)
        for n, f in enumerate(sorted(os.listdir(folder), key=lambda f: int(f.split('.')[0]))):
            im = Image.open(os.path.join(folder, f)).convert('RGB')
            os.makedirs(os.path.join(OUT, base), exist_ok=True)
            im.save(os.path.join(OUT, base, f'photo{n + 1}.webp'), 'WEBP', quality=85, method=6)
            views.append({'view': f'Photo{n + 1}', 'img': f'{base}/photo{n + 1}.webp', 'w': im.width, 'h': im.height, 'callouts': []})
    return base, views


if __name__ == '__main__':
    debug = '--debug' in sys.argv
    result = {}
    for f in sorted(os.listdir(SRC)):
        if f.endswith('.swf'):
            base, views = extract(os.path.join(SRC, f), debug)
            result[base] = views
            print(f'{base}: ' + ', '.join(f"{v['view']}({len(v['callouts'])})" for v in views))
    with open(os.path.join(ROOT, 'src', 'content', 'explore.json'), 'w', encoding='utf-8') as fh:
        json.dump(result, fh, ensure_ascii=False, indent=1)
