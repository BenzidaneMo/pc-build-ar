"""Condensed view of a lesson for transcribing it into src/content/lessons.ts:
root labels + frame scripts, then per clip: frame count, labels, named children
(frame ranges), and non-boilerplate script lines per frame (1-based as in Flash).

Usage: python summarize_lesson.py <Lesson>
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
BOILER = re.compile(
    r'^\s*([{}]|else|break;|default:|return;|stop\(\);|case \d:|switch.*|'
    r'if\(_root\.iShell\.mbExpertMode\)|instructions_mc\._visible = (true|false);|'
    r'highlight_mc\._visible = (true|false);|prevFrame\(\);|nextFrame\(\);|'
    r'onEnterFrame = (function\(\)|null;)|mcRotation = (true|false);|var mcRotation = false;|'
    r'function (stopRotation|startRotation)\(.*\)|\};?)\s*$')


def script_lines(folder):
    out = {}
    if not os.path.isdir(folder):
        return out
    for fr in os.listdir(folder):
        m = re.match(r'frame_(\d+)$', fr)
        if not m:
            continue
        lines = []
        for root, _, files in os.walk(os.path.join(folder, fr)):
            for f in sorted(files):
                for line in open(os.path.join(root, f), encoding='utf-8', errors='replace'):
                    if line.strip() and not BOILER.match(line):
                        lines.append(line.strip())
        if lines:
            out[int(m.group(1))] = lines
    return dict(sorted(out.items()))


def main(lesson):
    man = json.load(open(os.path.join(HERE, '.cache', 'manifests', lesson + '.json'), encoding='utf-8'))
    sdir = os.path.join(HERE, '.cache', 'scripts', lesson, 'scripts')
    print(f'== {lesson} root labels {man["rootLabels"]}')
    prev = None
    for i, sc in enumerate(man['scenes']):
        if sc['clips'] != prev:
            print(f'   scene@{i}: {sc["clips"]}')
            prev = sc['clips']
    for fr, lines in script_lines(sdir).items():
        print(f'   root frame_{fr}: ' + ' | '.join(lines)[:600])
    for key, p in man['parts'].items():
        print(f'\n## {key} (DefineSprite_{p["char"]}) frames={len(p["frames"])} labels={p["labels"]}')
        named = {}
        for i, f in enumerate(p['frames']):
            for c in f['clips']:
                r = named.setdefault(c['name'], [i, i, c['rect']])
                r[1] = i
        for n, (a, b, r) in named.items():
            if 'instructions' in n or n == 'btnCancel':
                continue
            print(f'   child {n}: frames {a}-{b} rect {r}')
        for fr, lines in script_lines(os.path.join(sdir, f'DefineSprite_{p["char"]}')).items():
            print(f'   frame_{fr}: ' + ' | '.join(lines)[:700])


if __name__ == '__main__':
    main(sys.argv[1])
