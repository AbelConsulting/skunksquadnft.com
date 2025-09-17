import csv
from pathlib import Path
import re

# Simple normalization map. Extend as needed.
NORMALIZE = {
    # canonical -> list of possible variants
    'background': ['background', 'background_common', 'background_rare', 'bg'],
    'body': ['body', 'image', 'main_image', 'body_common', 'base body', 'basebody', 'base_body'],
    'tail': ['tail', 'tails', 'tail_common', 'tail_rare', 'tailail_common_gold', 'tail_common_green', 'tail_common_plain', 'tail_common_red'],
    'head': ['head', 'head_common', 'head_rare', 'head_common_burger', 'head_common burger', 'head_common_commando'],
    'arm_right': ['arm_right', 'hand-right', 'hand_right', 'hand-right_common', 'hand_right_common'],
    'arm_left': ['arm_left', 'hand_left', 'hand-left', 'hand_left_common'],
    'badge': ['badge', 'emblem', 'emblem_common', 'emblem-legendary_fire', 'emblem_mythic_opensail'],
    'shoes': ['shoes', 'shoe', 'shoes_common', 'shoe_common'],
    'emblem': ['emblem'],
}

# invert the map for lookup
lookup = {}
for canon, variants in NORMALIZE.items():
    for v in variants:
        lookup[v.lower()] = canon


def normalize_layer(name: str):
    if not name:
        return name
    s = name.strip().lower()
    s = s.replace('-', '_')
    s = s.replace('  ', ' ')
    s = re.sub(r"[^a-z0-9_ ]+", "", s)
    # direct match
    if s in lookup:
        return lookup[s]
    # token-based match
    tokens = re.split(r'[ _]', s)
    for t in tokens:
        if t in lookup:
            return lookup[t]
    # fallback heuristics
    if 'tail' in s:
        return 'tail'
    if 'head' in s:
        return 'head'
    if 'body' in s or 'image' in s or 'main' in s:
        return 'body'
    if 'hand' in s or 'arm' in s:
        if 'left' in s:
            return 'arm_left'
        return 'arm_right'
    if 'shoe' in s:
        return 'shoes'
    if 'emblem' in s or 'badge' in s:
        return 'badge'
    if 'background' in s or 'bg' in s:
        return 'background'
    return name


def fix_csv(inpath: Path, outpath: Path):
    rows = []
    with inpath.open('r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for r in reader:
            orig = r.get('layer', '')
            new = normalize_layer(orig)
            r['layer'] = new
            rows.append(r)
    with outpath.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)


if __name__ == '__main__':
    inp = Path('traits_catalog.mapped.csv')
    out = Path('traits_catalog.mapped.fixed.csv')
    if not inp.exists():
        print('Input CSV not found:', inp)
        raise SystemExit(1)
    fix_csv(inp, out)
    print('Wrote', out)
