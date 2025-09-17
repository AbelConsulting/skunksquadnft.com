#!/usr/bin/env python3
import csv
import json
import re
from pathlib import Path
import sys

CSV = Path('traits_catalog.csv')
if not CSV.exists():
    print(f"ERROR: {CSV} not found", file=sys.stderr)
    sys.exit(2)

csv_parent = CSV.resolve().parent
remote_re = re.compile(r'^[a-zA-Z]+://')

rows = []
missing = []
remote = []
exists_cnt = 0

with CSV.open(newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader, start=1):
        layer = row.get('layer','').strip()
        trait = row.get('trait_name','').strip()
        raw = (row.get('file') or '').strip()
        if not raw:
            status = 'empty'
            missing.append((layer, trait, raw))
        elif remote_re.match(raw):
            status = 'remote'
            remote.append((layer, trait, raw))
        else:
            p = Path(raw)
            if not p.is_absolute():
                p = (csv_parent / p).resolve()
            if p.exists():
                status = 'ok'
                exists_cnt += 1
            else:
                status = 'missing'
                missing.append((layer, trait, str(p)))
        rows.append({'row': i, 'layer': layer, 'trait': trait, 'raw': raw, 'status': status})

# Print a table-like summary
print('\nAsset check results for traits_catalog.csv')
print('-----------------------------------------')
print(f'Total entries: {len(rows)}')
print(f'Local files found: {exists_cnt}')
print(f'Remote entries (URLs): {len(remote)}')
print(f'Missing local files: {len(missing)}')
print('\nMissing entries (first 50):')
for m in missing[:50]:
    print(f' - Layer: {m[0]!r}, Trait: {m[1]!r}, Path/URL: {m[2]}')

# Optionally write missing to a CSV
out_missing = Path('output') / 'missing_assets.csv'
out_missing.parent.mkdir(parents=True, exist_ok=True)
with out_missing.open('w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['layer','trait_name','path_or_url'])
    for m in missing:
        writer.writerow(m)

# Also write remote list
out_remote = Path('output') / 'remote_assets.csv'
with out_remote.open('w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['layer','trait_name','url'])
    for r in remote:
        writer.writerow(r)

print(f'\nWrote missing list to: {out_missing}\nWrote remote list to: {out_remote}\n')

# Exit 0 but keep counts in exit code? Not necessary
sys.exit(0)
