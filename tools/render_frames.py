"""Render clip frames from the built web assets into one labelled strip, to see
what a frame shows while transcribing a lesson.

Usage: python render_frames.py <Lesson> <clip> <frame> [frame ...]
       (clip "@root" renders the scene's static layers)
"""
import json
import os
import sys

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')


def render(lesson, data, draw_ids, base):
    for i in draw_ids:
        if isinstance(i, str):  # sub-clip at its first frame
            render(lesson, data, data['clips'][i]['frames'][0], base)
            continue
        d = data['draws'][i]
        if 'b' not in d:
            continue
        im = Image.open(os.path.join(ROOT, 'public', 'lessons', lesson, f'{d["b"]}.webp')).convert('RGBA')
        if 'x' in d:
            base.alpha_composite(im, (int(round(d['x'])), int(round(d['y']))))
        else:
            a, b, c, dd, tx, ty = d['m']
            # PIL wants the inverse mapping (output -> input)
            det = a * dd - b * c
            inv = (dd / det, -c / det, (c * ty - dd * tx) / det, -b / det, a / det, (b * tx - a * ty) / det)
            layer = im.transform(base.size, Image.AFFINE, inv, resample=Image.BILINEAR)
            base.alpha_composite(layer)


def main(lesson, clip, frames):
    data = json.load(open(os.path.join(ROOT, 'src', 'content', 'lessons', lesson + '.json'), encoding='utf-8'))
    w, h = int(data['width']), int(data['height'])
    tiles = []
    for f in frames:
        base = Image.new('RGBA', (w, h), 'white')
        scene = next(s for s in data['scenes'] if s['from'] <= 3 <= s['to']) if clip != '@root' else \
            next(s for s in data['scenes'] if s['from'] <= f <= s['to'])
        render(lesson, data, scene['draws'], base)
        if clip != '@root':
            render(lesson, data, data['clips'][clip]['frames'][f], base)
            for name, runs in data['clips'][clip]['named'].items():
                for r in runs:
                    if r['from'] <= f <= r['to'] and r['rect'] and 'instructions' not in name:
                        x0, x1, y0, y1 = r['rect']
                        ImageDraw.Draw(base).rectangle((x0, y0, x1, y1), outline='red')
                        ImageDraw.Draw(base).text((x0 + 2, y0 + 2), name, fill='red')
        ImageDraw.Draw(base).text((6, 6), f'{clip} #{f}', fill='blue')
        tiles.append(base.convert('RGB').resize((w // 2, h // 2)))
    cols = min(4, len(tiles))
    sheet = Image.new('RGB', (cols * (w // 2), -(-len(tiles) // cols) * (h // 2)), 'white')
    for i, t in enumerate(tiles):
        sheet.paste(t, ((i % cols) * (w // 2), (i // cols) * (h // 2)))
    out = os.path.join(HERE, '.cache', f'frames-{lesson}-{clip}.png')
    sheet.save(out)
    print(out)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], [int(x) for x in sys.argv[3:]])
