"""Tile smoke screenshots into one image for quick review: python tools/contact_sheet.py <dir> [cols]"""
import os
import sys

from PIL import Image, ImageDraw

d = sys.argv[1]
cols = int(sys.argv[2]) if len(sys.argv) > 2 else 4
files = sorted(f for f in os.listdir(d) if f.endswith('.png') and f != 'sheet.png')
tw, th = 520, 350
sheet = Image.new('RGB', (cols * tw, -(-len(files) // cols) * th), 'white')
for i, f in enumerate(files):
    im = Image.open(os.path.join(d, f)).convert('RGB').crop((0, 68, 1040, 760)).resize((tw, th - 12))
    x, y = (i % cols) * tw, (i // cols) * th
    sheet.paste(im, (x, y + 12))
    ImageDraw.Draw(sheet).text((x + 4, y), f, fill='black')
sheet.save(os.path.join(d, 'sheet.png'))
print(os.path.join(d, 'sheet.png'))
