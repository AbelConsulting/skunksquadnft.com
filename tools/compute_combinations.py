import argparse
from pathlib import Path
import pandas as pd
import re
import math

DEFAULT_LAYER_ORDER = [
    "background",
    "tail",
    "body",
    "head",
    "arm_right",
    "arm_left",
    "emblem",
    "badge",
    "shoes",
]

parser = argparse.ArgumentParser()
parser.add_argument('--csv', type=str, default='traits_catalog.mapped.csv')
parser.add_argument('--layer-order', type=str, default=None)
args = parser.parse_args()

csv_path = Path(args.csv)
if not csv_path.exists():
    print(f"CSV not found: {csv_path}")
    raise SystemExit(1)

df = pd.read_csv(csv_path)
if 'layer' not in df.columns or 'file' not in df.columns:
    print('CSV missing required columns')
    raise SystemExit(1)

csv_parent = csv_path.parent

# determine layer order
if args.layer_order:
    layer_order = [x.strip() for x in args.layer_order.split(',') if x.strip()]
else:
    layer_order = DEFAULT_LAYER_ORDER

layers = {}
for _, row in df.iterrows():
    layer = str(row['layer']).strip()
    raw_path = str(row['file']).strip()
    # resolve similar to generator
    if csv_parent and not re.match(r'^[a-zA-Z]+://', raw_path) and not Path(raw_path).is_absolute():
        filepath = (csv_parent / raw_path).resolve()
    else:
        filepath = Path(raw_path)
    exists = filepath.exists()
    is_url = bool(re.match(r'^[a-zA-Z]+://', str(raw_path)))
    layers.setdefault(layer, []).append({'raw': raw_path, 'resolved': str(filepath), 'exists': exists, 'is_url': is_url})

# report per-layer counts
print('Per-layer counts (total / local_exists / remote_urls):')
available_counts = {}
for layer in layer_order:
    opts = layers.get(layer, [])
    total = len(opts)
    local = sum(1 for o in opts if o['exists'])
    remote = sum(1 for o in opts if o['is_url'])
    available_counts[layer] = local
    print(f"- {layer}: {total} total, {local} local files, {remote} remote URLs")

# layers not in layer_order
other_layers = [l for l in layers.keys() if l not in layer_order]
if other_layers:
    print('\nOther layers present in CSV (not in layer order):')
    for l in other_layers:
        opts = layers[l]
        total = len(opts)
        local = sum(1 for o in opts if o['exists'])
        remote = sum(1 for o in opts if o['is_url'])
        print(f"- {l}: {total} total, {local} local, {remote} remote")

# compute combinations using only local existing files
zero_layers = [l for l,c in available_counts.items() if c==0]
if zero_layers:
    print('\nCannot produce any combinations: following layers have 0 local options:')
    for l in zero_layers:
        print(f"- {l}")
    combos_local = 0
else:
    combos_local = math.prod(available_counts[l] for l in layer_order)

# compute optimistic combinations counting remote URLs as available
available_counts_incl_remote = {}
for layer in layer_order:
    opts = layers.get(layer, [])
    local = sum(1 for o in opts if o['exists'])
    remote = sum(1 for o in opts if o['is_url'])
    available_counts_incl_remote[layer] = local + remote
if any(v==0 for v in available_counts_incl_remote.values()):
    combos_remote = 0
else:
    combos_remote = math.prod(available_counts_incl_remote[l] for l in layer_order)

print(f"\nTotal theoretical combinations (local only): {combos_local}")
print(f"Total theoretical combinations (include remote URLs): {combos_remote}")

# show example counts summary
print('\nSummary:')
print(f"Layers checked: {len(layer_order)}")
print(f"Layers with 0 local options: {len(zero_layers)}")

# print top missing examples
if zero_layers:
    print('\nExamples of missing assets for first zero layer:')
    l = zero_layers[0]
    for o in layers.get(l, [])[:10]:
        print(f"- {o['raw']} -> resolved {o['resolved']}, exists={o['exists']}, is_url={o['is_url']}")

# exit with code 0
