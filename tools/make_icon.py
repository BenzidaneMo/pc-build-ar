"""Draws the app icon (the favicon's monitor, white on a teal tile) -> build/icon.png + build/icon.ico.

Usage: python tools/make_icon.py
"""
from pathlib import Path

from PIL import Image, ImageDraw

TEAL = (14, 124, 134, 255)
WHITE = (255, 255, 255, 255)
OUT = Path(__file__).resolve().parent.parent / 'build'


def draw(size=1024):
    u = size / 32  # same 32-unit grid as the favicon in index.html
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=7 * u, fill=TEAL)
    d.rounded_rectangle([5 * u, 7 * u, 27 * u, 21 * u], radius=1.6 * u, fill=WHITE)  # screen bezel
    d.rectangle([7 * u, 9 * u, 25 * u, 19 * u], fill=TEAL)  # screen
    d.rectangle([14 * u, 21 * u, 18 * u, 24 * u], fill=WHITE)  # neck
    d.rounded_rectangle([10 * u, 24 * u, 22 * u, 26 * u], radius=u, fill=WHITE)  # foot
    return img


def main():
    OUT.mkdir(exist_ok=True)
    img = draw()
    img.resize((512, 512), Image.LANCZOS).save(OUT / 'icon.png')
    img.save(OUT / 'icon.ico', sizes=[(s, s) for s in (16, 24, 32, 48, 64, 128, 256)])
    print('wrote', OUT / 'icon.png', OUT / 'icon.ico')


if __name__ == '__main__':
    main()
