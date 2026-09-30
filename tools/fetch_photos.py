"""Photos of today's parts for «اكتشف القطع», from Wikimedia Commons, freely licensed and credited.

Usage:
  python tools/fetch_photos.py search "<query>" [n]   list candidate files with their licence
  python tools/fetch_photos.py preview "File:..." ...  save small previews to tools/.cache/photo-candidates/
  python tools/fetch_photos.py                        fetch everything in tools/photos.json
  python tools/fetch_photos.py credits                only rewrite CREDITS.md from photoCredits.json
  python tools/fetch_photos.py sizes                  only rewrite explorePhotos.json (after changing a photo by hand)

tools/photos.json maps an explore entry id to its Commons files ["File:...", ...]. Each file is
downloaded about 1200 px wide, saved as WebP in public/media/explore/modern/<id>-<n>.webp, and its
credit (author, licence, source page) is written to src/content/photoCredits.json. Anything that
is not CC0, public domain, CC BY or CC BY-SA is refused. A null slot is a photo put there by hand:
it's kept as it is, without a credit.

src/content/explorePhotos.json lists every photo in the folder with its size (the app shapes the
photo's box, and places the callouts, from it).
"""
import html
import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'public', 'media', 'explore', 'modern')
CREDITS = os.path.join(ROOT, 'src', 'content', 'photoCredits.json')
SIZES = os.path.join(ROOT, 'src', 'content', 'explorePhotos.json')
# Manufacturer product photos chosen by the project owner (not from Commons): copied from a local
# file (`from`, relative to the repo), cropped (`crop`) and credited to the maker.
PRODUCTS = os.path.join(os.path.dirname(__file__), 'product_photos.json')
LIST = os.path.join(os.path.dirname(__file__), 'photos.json')
PREVIEWS = os.path.join(os.path.dirname(__file__), '.cache', 'photo-candidates')
API = 'https://commons.wikimedia.org/w/api.php'
# Wikimedia asks for an identifiable User-Agent: the project's public repository
UA = 'pc-build-ar/1.0 (educational PC assembly simulator; https://github.com/BenzidaneMo/pc-build-ar)'
ALLOWED = re.compile(r'^(CC0|Public domain|PD\b.*|CC BY(-SA)? \d\.\d( \w+)?)$', re.I)
WIDTH = 1200


def get(url, raw=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            return data if raw else json.loads(data)
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 + attempt * 3)


def api(**params):
    params.update(format='json', formatversion='2')
    return get(API + '?' + urllib.parse.urlencode(params))


def plain(s):
    """HTML from extmetadata -> plain text."""
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s or ''))).strip()


def info(titles, width=WIDTH):
    d = api(action='query', titles='|'.join(titles), prop='imageinfo',
            iiprop='url|size|extmetadata', iiurlwidth=width)
    out = {}
    for p in d['query']['pages']:
        if 'imageinfo' not in p:
            out[p['title']] = None
            continue
        ii = p['imageinfo'][0]
        m = ii.get('extmetadata', {})
        out[p['title']] = {
            'thumb': ii.get('thumburl') or ii['url'],
            'size': (ii.get('width'), ii.get('height')),
            'license': plain(m.get('LicenseShortName', {}).get('value')),
            'licenseUrl': plain(m.get('LicenseUrl', {}).get('value')),
            'author': plain(m.get('Artist', {}).get('value')) or plain(m.get('Credit', {}).get('value')),
            'source': ii.get('descriptionurl'),
        }
    return out


def search(query, n=15):
    d = api(action='query', list='search', srnamespace=6, srsearch=query, srlimit=n)
    titles = [x['title'] for x in d['query']['search']]
    meta = info(titles, 320) if titles else {}
    for t in titles:
        m = meta.get(t) or {}
        ok = 'OK ' if ALLOWED.match(m.get('license', '')) else 'no '
        print(f"{ok}{m.get('license', '?'):<16} {m.get('size')}  {t}")


def preview(titles):
    os.makedirs(PREVIEWS, exist_ok=True)
    for t, m in info(titles, 480).items():
        if not m:
            print('missing:', t)
            continue
        name = re.sub(r'[^\w.-]+', '_', t[5:])[:80]
        Image.open(io.BytesIO(get(m['thumb'], raw=True))).convert('RGB').save(os.path.join(PREVIEWS, name + '.jpg'), quality=85)
        print(os.path.join(PREVIEWS, name + '.jpg'), '|', m['license'], '|', m['author'][:60])


def fetch():
    entries = json.load(open(LIST, encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    credits = {}
    for entry, titles in entries.items():
        meta = info([t for t in titles if t])
        for n, t in enumerate(titles, 1):
            if not t:
                continue
            m = meta.get(t)
            if not m:
                raise SystemExit(f'{entry}: {t} not found')
            if not ALLOWED.match(m['license']):
                raise SystemExit(f'{entry}: {t} has licence "{m["license"]}", which is not allowed')
            name = f'{entry}-{n}.webp'
            im = Image.open(io.BytesIO(get(m['thumb'], raw=True))).convert('RGB')
            if im.width > WIDTH:
                im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
            im.save(os.path.join(OUT, name), 'WEBP', quality=85, method=6)
            credits[name] = {'title': t[5:], 'author': m['author'] or 'unknown', 'license': m['license'],
                             'licenseUrl': m['licenseUrl'], 'source': m['source']}
            print(f'{name}  {im.width}x{im.height}  {m["license"]}  {m["author"][:50]}')
            time.sleep(0.5)
    credits.update(products())
    with open(CREDITS, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(credits, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    write_credits_md(credits)
    write_sizes()


def write_sizes():
    """explorePhotos.json: every photo of the folder with its size, whatever its origin."""
    sizes = {f: list(Image.open(os.path.join(OUT, f)).size) for f in sorted(os.listdir(OUT))
             if f.endswith('.webp') and f != 'uefi.webp'}
    with open(SIZES, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('{\n' + ',\n'.join(f' "{k}": {json.dumps(v)}' for k, v in sizes.items()) + '\n}\n')


def products():
    """The manufacturer photos: converted from their local file when it's there, else kept as they are."""
    out = {}
    for stem, p in json.load(open(PRODUCTS, encoding='utf-8')).items():
        name = f'{stem}.webp'
        src = os.path.join(ROOT, p['from'])
        if os.path.exists(src):
            im = Image.open(src).convert('RGBA')
            if p.get('crop'):
                im = im.crop(p['crop'])
            flat = Image.new('RGB', im.size, 'white')
            flat.paste(im, mask=im.getchannel('A'))
            if flat.width > WIDTH:
                flat = flat.resize((WIDTH, round(flat.height * WIDTH / flat.width)), Image.LANCZOS)
            flat.save(os.path.join(OUT, name), 'WEBP', quality=85, method=6)
        out[name] = {'title': p['title'], 'author': p['author'], 'license': p['license'], 'licenseUrl': '',
                     'source': p['source']}
        print(f'{name}  {p["license"]}  {p["author"]}')
    return out


def write_credits_md(credits):
    """CREDITS.md at the repo root: every photo with its author, licence and source."""
    lines = [
        '# Credits',
        '',
        'The lessons and the photos of their parts («حاسوب 2007» in «اكتشف القطع») come from Cisco',
        'Networking Academy\'s *IT Essentials Virtual Desktop* and remain its property.',
        '',
        '## Photos of today\'s parts («اكتشف القطع»)',
        '',
        'From Wikimedia Commons, under the licences below. Changes: resized to at most 1200 px wide and',
        'converted to WebP (`tools/fetch_photos.py`). The resized photos keep their original licence.',
        '',
        '| File | Author | Licence | Source |',
        '|---|---|---|---|',
    ]
    for name, c in credits.items():
        if c['license'] == 'Manufacturer photo':
            continue
        author = c['author'].replace('|', '/')
        lic = f"[{c['license']}]({c['licenseUrl']})" if c['licenseUrl'] else c['license']
        lines.append(f"| `{name}` | {author} | {lic} | [{c['title']}]({c['source']}) |")
    made = [(n, c) for n, c in credits.items() if c['license'] == 'Manufacturer photo']
    if made:
        lines += ['', '## Manufacturer photos', '',
                  'Product photos from the makers\' pages, used for teaching in a non-commercial app; they remain',
                  'the property of their makers (`tools/product_photos.json`).', '',
                  '| File | Maker | Source |', '|---|---|---|']
        lines += [f"| `{n}` | {c['author']} | [{c['title']}]({c['source']}) |" for n, c in made]
    with open(os.path.join(ROOT, 'CREDITS.md'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'search':
        search(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 15)
    elif len(sys.argv) > 2 and sys.argv[1] == 'preview':
        preview(sys.argv[2:])
    elif len(sys.argv) > 1 and sys.argv[1] == 'credits':
        write_credits_md(json.load(open(CREDITS, encoding='utf-8')))
    elif len(sys.argv) > 1 and sys.argv[1] == 'sizes':
        write_sizes()
    else:
        fetch()
