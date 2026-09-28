"""Turn extracted lesson manifests + exported bitmaps/shapes into web assets.

Output per lesson:
- public/lessons/<Lesson>/<id>.webp  bitmaps cropped to their visible area
- public/lessons/<Lesson>/v<id>.svg  the few genuine vector layers (white backdrops etc.)
- src/content/lessons/<Lesson>.json:
    draws   unique drawable layers: {b, x, y, w, h} (1:1 bitmap), {b, m, w, h}
            (transformed bitmap; m maps cropped-bitmap px -> stage px) or
            {v, m, x0, y0, w, h} (svg; m maps shape space -> stage px; + mask: data URL
            of the svg when it is used as a mask)
    clips   every animated sprite: labels, draw indices per frame (or a sub-clip
            key, or {mask, items}: items shown only inside the svg draw `mask`),
            named children (hotspots, buttons...) as frame ranges + rects
    scenes  root timeline runs: static draws + which clips are on stage

Usage: python build_assets.py [Lesson ...]     (default: all lessons)
"""
import base64
import json
import os
from concurrent.futures import ProcessPoolExecutor
import re
import shutil
import sys

from PIL import Image

from swf import Swf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
CACHE = os.path.join(HERE, '.cache')
QUALITY = 82
LESSONS = ['PowerSupply', 'Motherboard', 'ExpansionCards', 'InternalDrive',
           'ExternalDrives', 'InternalCables', 'ExternalCables']


def find_image(lesson, bid):
    for ext in ('png', 'jpg', 'gif'):
        p = os.path.join(CACHE, 'images', lesson, f'{bid}.{ext}')
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f'{lesson} bitmap {bid}')


def encode(args):
    """Crop one bitmap to its alpha bbox and save it as WebP (cached). Returns the crop box."""
    lesson, bid, out_dir = args
    im = Image.open(find_image(lesson, bid)).convert('RGBA')
    box = im.getchannel('A').getbbox()
    dest = os.path.join(out_dir, f'{bid}.webp')
    if box and not os.path.exists(dest):
        im.crop(box).save(dest + '.tmp', 'WEBP', quality=QUALITY, method=6)
        os.replace(dest + '.tmp', dest)
    return bid, None if box is None else (box[0], box[1], box[2] - box[0], box[3] - box[1])


def bitmap_ids(src):
    ids = set()

    def walk(layers):
        for l in layers:
            if 'bmp' in l:
                ids.add(l['bmp'])
            elif 'mask' in l:
                walk(l['layers'])

    for f in [f for p in src['parts'].values() for f in p['frames']] + src['scenes']:
        walk(f['layers'])
    return sorted(ids)


def runs(items, key):
    """Merge consecutive frames with equal key(item) into {from, to, ...}."""
    out = []
    for i, it in enumerate(items):
        k = key(it)
        if out and out[-1]['_k'] == k:
            out[-1]['to'] = i
        else:
            out.append({'from': i, 'to': i, '_k': k, **it})
    for r in out:
        del r['_k']
    return out


def named_runs(frames):
    out = {}
    for i, f in enumerate(frames):
        for c in f['clips']:
            rs = out.setdefault(c['name'], [])
            if rs and rs[-1]['to'] == i - 1 and rs[-1]['rect'] == c['rect']:
                rs[-1]['to'] = i
            else:
                rs.append({'from': i, 'to': i, 'rect': c['rect']})
    return out


def build(lesson):
    src = json.load(open(os.path.join(CACHE, 'manifests', lesson + '.json'), encoding='utf-8'))
    swf = Swf(os.path.join(ROOT, 'legacy', 'models', lesson + '.swf'))
    out_dir = os.path.join(ROOT, 'public', 'lessons', lesson)
    os.makedirs(out_dir, exist_ok=True)
    draws, draw_index = [], {}
    with ProcessPoolExecutor() as pool:
        # bitmap id -> (bx, by, w, h) or None if fully transparent
        crops = dict(pool.map(encode, [(lesson, b, out_dir) for b in bitmap_ids(src)], chunksize=4))

    def crop(bid):
        return crops[bid]

    def add(d):
        k = json.dumps(d, sort_keys=True)
        if k not in draw_index:
            draw_index[k] = len(draws)
            draws.append(d)
        return draw_index[k]

    def use(layer):
        if 'sub' in layer:
            return layer['sub']  # drawn at the sub-clip's own current frame
        if 'bmp' in layer:
            c = crop(layer['bmp'])
            if c is None:
                return None
            bx, by, w, h = c
            a, b, cc, d, tx, ty = layer['m']
            # shift origin to the crop box: p_stage = M * (p_crop + (bx, by))
            tx2, ty2 = a * bx + cc * by + tx, b * bx + d * by + ty
            if abs(a - 1) < 1e-3 and abs(d - 1) < 1e-3 and abs(b) < 1e-3 and abs(cc) < 1e-3:
                return add({'b': layer['bmp'], 'x': round(tx2, 1), 'y': round(ty2, 1), 'w': w, 'h': h})
            return add({'b': layer['bmp'], 'm': [round(a, 5), round(b, 5), round(cc, 5), round(d, 5),
                                                 round(tx2, 2), round(ty2, 2)], 'w': w, 'h': h})
        if 'vector' in layer:
            vid = layer['vector']
            svg = os.path.join(CACHE, 'shapes', lesson, f'{vid}.svg')
            if not os.path.exists(svg):
                return None
            dest = os.path.join(out_dir, f'v{vid}.svg')
            if not os.path.exists(dest):
                shutil.copyfile(svg, dest)
            text = open(svg, encoding='utf-8').read()
            if '#6699cc' in text:
                return None  # the old Flash "back" button baked into scenes
            head = text[:600]
            w = float(re.search(r'width="([\d.]+)px"', head).group(1))
            h = float(re.search(r'height="([\d.]+)px"', head).group(1))
            xmin, _, ymin, _ = swf.shape_bounds(vid)
            return add({'v': vid, 'm': layer['m'], 'x0': xmin / 20, 'y0': ymin / 20, 'w': w, 'h': h})
        return None

    mask_ids = set()

    def ids(layers):
        out = []
        for l in layers:
            if 'mask' in l:
                # masked run of layers: {mask: svg draw index, items: [...]}
                items, mask = ids(l['layers']), use(l['mask'])
                if mask is None:
                    out += items
                elif items:
                    mask_ids.add(mask)
                    out.append({'mask': mask, 'items': items})
            else:
                i = use(l)
                if i is not None:
                    out.append(i)
        return out

    clips = {}
    for key, p in src['parts'].items():
        clips[key] = {
            'labels': p['labels'],
            'frames': [ids(f['layers']) for f in p['frames']],
            'named': named_runs(p['frames']),
        }
    scenes = runs([{'draws': ids(sc['layers']), 'clips': sc['clips']} for sc in src['scenes']],
                  key=lambda s: json.dumps(s))
    # CSS mask-image is always fetched in CORS mode, which fails from file:// (the web.zip build):
    # an unloadable mask hides everything inside it. Masks ship inline as data: URLs instead.
    for i in sorted(mask_ids):
        text = open(os.path.join(CACHE, 'shapes', lesson, f"{draws[i]['v']}.svg"), encoding='utf-8').read()
        draws[i]['mask'] = 'data:image/svg+xml;base64,' + base64.b64encode(text.encode('utf-8')).decode('ascii')
    content = {
        'name': lesson, 'width': src['width'], 'height': src['height'], 'fps': src['fps'],
        'rootLabels': src['rootLabels'], 'scenes': scenes, 'clips': clips,
        'ui': src['uiClips'], 'draws': draws,
    }
    dest = os.path.join(ROOT, 'src', 'content', 'lessons')
    os.makedirs(dest, exist_ok=True)
    with open(os.path.join(dest, lesson + '.json'), 'w', encoding='utf-8') as f:
        json.dump(content, f, separators=(',', ':'))
    size = sum(os.path.getsize(os.path.join(out_dir, n)) for n in os.listdir(out_dir))
    print(f'{lesson}: {len(draws)} draws, {len(clips)} clips, {len(scenes)} scene runs, '
          f'{size / 1e6:.1f} MB on disk', flush=True)


if __name__ == '__main__':
    for lesson in sys.argv[1:] or LESSONS:
        build(lesson)
