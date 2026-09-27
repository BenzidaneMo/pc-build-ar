"""One-off: generate src/content/parts.json + lesson order from legacy/essentials.xml,
and convert the tray images to WebP (public/media/{thumbs,images}).

After generation, parts.json is the hand-maintained source of truth.
The legacy XML is not well-formed and mixes UTF-8 with cp1252, so it's
read with regexes, not an XML parser.
"""
import json
import os
import re

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
LEGACY = os.path.join(ROOT, 'legacy')

# ar = classroom Arabic, fr = term used in Algerian classes, en = original label
NAMES = {
    'iPowerSupply': ('علبة التغذية', "Bloc d'alimentation", 'Power Supply'),
    'iPowerSupplyScrews': ('براغي علبة التغذية', "Vis du bloc d'alimentation", 'Power Supply Screws'),
    'iRAM1': ('الذاكرة الحية 1', 'Barrette RAM 1', 'RAM 1'),
    'iRAM2': ('الذاكرة الحية 2', 'Barrette RAM 2', 'RAM 2'),
    'iCPU': ('المعالج', 'Processeur', 'CPU'),
    'iThermalGlue': ('المعجون الحراري', 'Pâte thermique', 'Thermal Compound'),
    'iHeatsink': ('المشتت الحراري والمروحة', 'Ventirad', 'Heat Sink'),
    'iMoboScrews': ('براغي اللوحة الأم', 'Vis de la carte mère', 'Motherboard Screws'),
    'iMobo': ('اللوحة الأم', 'Carte mère', 'Motherboard'),
    'iNic': ('بطاقة الشبكة', 'Carte réseau', 'NIC'),
    'iNicScrews': ('برغي بطاقة الشبكة', 'Vis de la carte réseau', 'NIC Screw'),
    'iWireless': ('بطاقة الشبكة اللاسلكية', 'Carte Wi-Fi', 'Wireless NIC'),
    'iWirelessScrews': ('برغي البطاقة اللاسلكية', 'Vis de la carte Wi-Fi', 'Wireless NIC Screw'),
    'iVideoCard': ('بطاقة الرسوميات', 'Carte graphique', 'Video Adapter'),
    'iVideoScrews': ('برغي بطاقة الرسوميات', 'Vis de la carte graphique', 'Video Adapter Screw'),
    'iHD': ('القرص الصلب', 'Disque dur', 'Hard Disk Drive'),
    'iHDScrews': ('براغي القرص الصلب', 'Vis du disque dur', 'Hard Disk Screws'),
    'iDvdDrive': ('قارئ الأقراص الضوئية', 'Lecteur DVD', 'Optical Drive'),
    'iDvdScrews': ('براغي قارئ الأقراص', 'Vis du lecteur DVD', 'Optical Drive Screws'),
    'iFloppyDrive': ('قارئ الأقراص المرنة', 'Lecteur de disquette', 'Floppy Drive'),
    'iFloppyScrews': ('براغي قارئ الأقراص المرنة', 'Vis du lecteur de disquette', 'Floppy Drive Screws'),
    'iPata1': ('كابل PATA', 'Nappe PATA (IDE)', 'PATA Cable'),
    'iPata2': ('كابل القرص المرن', 'Nappe disquette', 'Floppy Cable'),
    'iSata': ('كابل SATA', 'Câble SATA', 'SATA Cable'),
    'iCasePanels': ('غطاء العلبة', 'Panneaux du boîtier', 'Case Panels'),
    'iPanelScrews': ('براغي الغطاء', 'Vis des panneaux', 'Case Panel Screws'),
    'iMonitor': ('كابل الشاشة', 'Câble écran (VGA)', 'Monitor Cable'),
    'iKeyboard': ('لوحة المفاتيح', 'Clavier', 'Keyboard'),
    'iMouse': ('الفأرة', 'Souris', 'Mouse'),
    'iUSB': ('كابل USB', 'Câble USB', 'USB Cable'),
    'iEthernet': ('كابل الشبكة', 'Câble Ethernet (RJ45)', 'Ethernet Cable'),
    'iAntenna': ('الهوائي اللاسلكي', 'Antenne Wi-Fi', 'Wireless Antenna'),
    'iPowerCord': ('كابل الكهرباء', "Câble d'alimentation", 'Power Cord'),
}


def webp(src_dir, dst_dir, name):
    """Convert one legacy image (case-insensitive lookup) to WebP; return new filename."""
    files = {f.lower(): f for f in os.listdir(src_dir)}
    real = files.get(name.lower())
    if not real:
        return None
    os.makedirs(dst_dir, exist_ok=True)
    out = os.path.splitext(real)[0] + '.webp'
    Image.open(os.path.join(src_dir, real)).convert('RGBA').save(
        os.path.join(dst_dir, out), 'WEBP', quality=85, method=6)
    return out


def main():
    text = open(os.path.join(LEGACY, 'essentials.xml'), 'rb').read().decode('utf-8', 'replace')
    parts = []
    for m in re.finditer(r'<thumb\s+([^>]*)>(.*?)</thumb>', text, re.S):
        attrs = dict(re.findall(r'(\w+)\s*=\s*"([^"]*)"', m.group(1)))
        body = m.group(2)
        field = lambda tag: (re.search(f'<{tag}>(.*?)</{tag}>', body, re.S) or [None, ''])[1].strip()
        pid = attrs['id']
        ar, fr, en = NAMES[pid]
        explore = field('explore')
        parts.append({
            'id': pid,
            'name': {'ar': ar, 'fr': fr, 'en': en},
            'requires': attrs.get('linkTo') or None,
            'thumb': webp(os.path.join(LEGACY, 'media', 'thumbs'), os.path.join(ROOT, 'public', 'media', 'thumbs'), field('smallImg')),
            'image': webp(os.path.join(LEGACY, 'media', 'images'), os.path.join(ROOT, 'public', 'media', 'images'), field('largeImg')),
            'explore': explore or None,
        })
    lessons = []
    for m in re.finditer(r'<lesson\s+layer="(\d+)"\s+file="([^"]+)">(.*?)</lesson>', text, re.S):
        lessons.append({'layer': int(m.group(1)), 'file': m.group(2)[:-4],
                        'parts': re.findall(r'<modelName id="(\w+)"', m.group(3))})
    dest = os.path.join(ROOT, 'src', 'content')
    os.makedirs(dest, exist_ok=True)
    with open(os.path.join(dest, 'parts.json'), 'w', encoding='utf-8') as f:
        json.dump({'parts': parts, 'lessons': lessons}, f, ensure_ascii=False, indent=2)
    missing = [p['id'] for p in parts if not p['thumb'] or not p['image']]
    print(f'{len(parts)} parts, {len(lessons)} lessons; missing images: {missing}')


if __name__ == '__main__':
    main()
