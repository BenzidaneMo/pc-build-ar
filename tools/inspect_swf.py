"""Print a lesson SWF's structure: root frames, named instances, sprite labels."""
import sys
from swf import Swf, TAG_NAMES


def main(path):
    s = Swf(path)
    print(f'{path}: {s.width}x{s.height} @ {s.fps}fps, root frames={len(s.root.frames)}')
    print('root labels:', s.root.labels)
    print('exports:', s.exports)
    named = {}

    def walk(tl, owner, depth=0):
        for fi, dl in enumerate(tl.display_lists()):
            for d, p in dl.items():
                if p.get('name') and (owner, p['name']) not in named:
                    named[(owner, p['name'])] = (fi, p.get('char'))
    walk(s.root, 'root')
    for sid, tl in s.sprites.items():
        walk(tl, sid)
    for (owner, name), (fi, cid) in named.items():
        kind = TAG_NAMES.get(s.chars.get(cid, (None,))[0], '?')
        extra = ''
        if cid in s.sprites:
            sp = s.sprites[cid]
            extra = f'frames={len(sp.frames)} labels={sp.labels}'
        print(f'  in {owner} frame {fi}: {name} -> char {cid} ({kind}) {extra}')


if __name__ == '__main__':
    main(sys.argv[1])
