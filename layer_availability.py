#!/usr/bin/env python3
import csv
import re
from pathlib import Path
from collections import defaultdict

CSV = Path('traits_catalog.csv')
if not CSV.exists():
    print(f"ERROR: {CSV} not found")
    raise SystemExit(2)

csv_parent = CSV.resolve().parent
remote_re = re.compile(r'^[a-zA-Z]+://')

per_layer = defaultdict(lambda: {'total':0,'local':0,'missing':0,'remote':0})

with CSV.open(newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        layer = row.get('layer','').strip()
        raw = (row.get('file') or '').strip()
        per_layer[layer]['total'] += 1
        if not raw:
            per_layer[layer]['missing'] += 1
            continue
        if remote_re.match(raw):
            per_layer[layer]['remote'] += 1
            continue
        p = Path(raw)
        if not p.is_absolute():
            p = (csv_parent / p).resolve()
        if p.exists():
            per_layer[layer]['local'] += 1
        else:
            per_layer[layer]['missing'] += 1

# Print per-layer summary
print('Layer availability summary:')
for layer, stats in per_layer.items():
    print(f"- {layer}: total={stats['total']}, local={stats['local']}, remote={stats['remote']}, missing={stats['missing']}")

# Compute theoretical combinations using only local counts (count 0 -> treat as 0)
from math import prod
local_counts = [stats['local'] for stats in per_layer.values() if stats['local'] > 0]
if not local_counts:
    print('\nNo local trait files found. 0 combinations available.')
else:
    combos = 1
    for c in local_counts:
        combos *= c
    print(f'\nTheoretical combinations using available local files: {combos}')
    if combos < 1:
        print('Not enough local assets to produce any full images.')

# Export per-layer CSV
out = Path('output') / 'layer_availability.csv'
out.parent.mkdir(parents=True, exist_ok=True)
with out.open('w', newline='', encoding='utf-8') as f:
    import csv
    w = csv.writer(f)
    w.writerow(['layer','total','local','remote','missing'])
    for layer, stats in per_layer.items():
        w.writerow([layer, stats['total'], stats['local'], stats['remote'], stats['missing']])
print(f'\nWrote per-layer availability to: {out}')
