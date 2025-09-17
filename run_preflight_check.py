from generate import load_catalog, build_layer_tables
from pathlib import Path
from functools import reduce
from operator import mul

if __name__ == '__main__':
    df = load_catalog(Path('traits_catalog.csv'))
    tables = build_layer_tables(df)
    print('Layers found:', ', '.join(sorted(tables.keys())))
    missing = []
    for l, opts in tables.items():
        for trait, path, weight, rarity in opts:
            p = Path(str(path))
            if not p.exists() and not str(p).startswith('http'):
                missing.append((l, trait, str(p)))
    print('Missing count:', len(missing))
    for m in missing[:40]:
        print(' -', m)
    counts = [len(opts) for opts in tables.values()]
    print('Per-layer counts:', counts)
    try:
        total = 1
        for c in counts:
            total *= c
    except Exception:
        total = 0
    print('Total possible combinations:', total)
