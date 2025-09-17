#!/usr/bin/env python3
"""
Attempt to map trait CSV entries to local PNG files in the workspace.
Creates `traits_catalog.mapped.csv` with updated `file` paths when a unique local match is found.
"""
import csv
from pathlib import Path
import re
import sys

ROOT = Path('.').resolve()
CSV = ROOT / 'traits_catalog.csv'
OUT = ROOT / 'traits_catalog.mapped.csv'

if not CSV.exists():
    print('traits_catalog.csv not found', file=sys.stderr)
    sys.exit(2)

# Gather all png files under repo (exclude output folder)
pngs = [p for p in ROOT.rglob('*.png') if 'output' not in p.parts]
png_basenames = [p.name for p in pngs]

def normalize(s):
    return re.sub(r'[^a-z0-9]+', '_', s.lower()).strip('_')

png_tokens = [(p, normalize(p.name)) for p in pngs]

mapped = []
ambiguous = []
notfound = []

with CSV.open(newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    headers = reader.fieldnames
    rows = list(reader)

for row in rows:
    raw = (row.get('file') or '').strip()
    trait = (row.get('trait_name') or '').strip()
    layer = (row.get('layer') or '').strip()
    if not raw:
        key = f'{layer} {trait}'
    else:
        # if already a local path and exists, keep
        if not re.match(r'^[a-zA-Z]+://', raw):
            p = Path(raw)
            if not p.is_absolute():
                p = (CSV.parent / p).resolve()
            if p.exists():
                mapped.append((row, str(p.relative_to(ROOT))))
                row['file'] = str(p.relative_to(ROOT)).replace('\\','/')
                continue
    # try to find a candidate
    needle = normalize(layer + ' ' + trait)
    scores = []
    for p, token in png_tokens:
        score = 0
        if needle in token:
            score += 10
        # incremental token matching
        for t in normalize(trait).split('_'):
            if t and t in token:
                score += 1
        for t in normalize(layer).split('_'):
            if t and t in token:
                score += 1
        if score>0:
            scores.append((score, p))
    if not scores:
        notfound.append((layer, trait))
        continue
    scores.sort(key=lambda x: (-x[0], str(x[1])))
    # check top two if tie
    if len(scores)>1 and scores[0][0]==scores[1][0]:
        ambiguous.append((layer, trait, scores[:3]))
        continue
    best = scores[0][1]
    rel = best.relative_to(ROOT)
    row['file'] = str(rel).replace('\\','/')
    mapped.append((row, str(rel)))

# Write mapped CSV
with OUT.open('w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=headers)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

print(f'Mapped {len(mapped)} entries. Ambiguous: {len(ambiguous)}. Not found: {len(notfound)}')
if ambiguous:
    print('\nSample ambiguous entries:')
    for a in ambiguous[:10]:
        layer, trait, scores = a
        print(f'- {layer} / {trait}:')
        for sc, p in scores:
            print(f'   {sc:3d} {p}')
if notfound:
    print('\nSample not found:')
    for nf in notfound[:20]:
        print(f'- {nf[0]} / {nf[1]}')

print(f'Wrote mapped CSV to: {OUT}')
print('When happy, rename it to traits_catalog.csv or run the generator with `--csv traits_catalog.mapped.csv`.')
