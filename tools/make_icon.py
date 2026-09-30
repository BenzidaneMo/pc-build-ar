"""Makes the packaged app's icon from build/icon1.png -> build/icon.png + build/icon.ico.
(The header's logo and the browser tab's public/favicon.svg are line drawings of the same idea:
BrandLogo in src/components/Decor.tsx.)

Usage: python tools/make_icon.py

icon1.png is a rounded tile on a slightly different background. The tile is found from the pixels
(its edges, then its corner radius along the diagonal), cropped, and its corners cut away along
that radius (antialiased), so they're transparent in the icon.
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / 'build'
SOURCE = OUT / 'icon1.png'
EDGE = 15        # colour difference from the background that counts as the tile
SUPERSAMPLE = 4  # the corner mask is drawn larger, then reduced: smooth edges


def tile(img):
    """(left, top, right, bottom, radius) of the rounded tile in img."""
    W, H = img.size
    bg = img.getpixel((2, 2))
    diff = lambda xy: sum(abs(a - b) for a, b in zip(img.getpixel(xy), bg))
    first = lambda pts: next(i for i, p in enumerate(pts) if diff(p) > EDGE)
    left = first([(x, H // 2) for x in range(W)])
    right = W - 1 - first([(W - 1 - x, H // 2) for x in range(W)])
    top = first([(W // 2, y) for y in range(H)])
    bottom = H - 1 - first([(W // 2, H - 1 - y) for y in range(H)])
    # along a corner's diagonal the tile starts r(1 - 1/√2) in: the smallest of the four corners
    steps = min(first([(x + sx * k, y + sy * k) for k in range(min(W, H) // 2)])
                for x, y, sx, sy in ((left, top, 1, 1), (right, top, -1, 1), (left, bottom, 1, -1), (right, bottom, -1, -1)))
    return left, top, right, bottom, steps / (1 - 1 / math.sqrt(2))


def make():
    src = Image.open(SOURCE).convert('RGB')
    left, top, right, bottom, r = tile(src)
    w, h = right - left + 1, bottom - top + 1
    mask = Image.new('L', (w * SUPERSAMPLE, h * SUPERSAMPLE), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w * SUPERSAMPLE - 1, h * SUPERSAMPLE - 1], radius=r * SUPERSAMPLE, fill=255)
    cut = src.crop((left, top, right + 1, bottom + 1)).convert('RGBA')
    cut.putalpha(mask.resize((w, h), Image.LANCZOS))
    side = max(w, h)
    icon = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    icon.paste(cut, ((side - w) // 2, (side - h) // 2))
    print(f'tile {w} x {h} at ({left}, {top}), corner radius {r:.0f}')
    return icon


def main():
    img = make()
    img.resize((512, 512), Image.LANCZOS).save(OUT / 'icon.png')
    img.save(OUT / 'icon.ico', sizes=[(s, s) for s in (16, 24, 32, 48, 64, 128, 256)])
    print('wrote', OUT / 'icon.png', OUT / 'icon.ico')


if __name__ == '__main__':
    main()
