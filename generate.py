import argparse
import hashlib
import json
import os
import random
from collections import defaultdict, OrderedDict
from pathlib import Path
from typing import Dict, List, Tuple

from PIL import Image
import pandas as pd


Overview
--------
This script composes layered PNGs into final NFT images using a trait catalog CSV.
It also emits ERC-721 style metadata JSON files and a manifest of generated editions.

Input
-----
- traits_catalog.csv (columns):
    layer, trait_name, file, weight, rarity_tier, notes

  * 'file' should be a path to a transparent PNG for that trait.
  * If a layer is sometimes absent, include a 'None' trait that points to a 1x1 fully-transparent PNG.
  * Weights are relative; they do not need to sum to 100.

Layers
------
- The drawing order is controlled by the order of 'layer' names in LAYER_ORDER below.
  Ensure the order goes from background (bottom) to foreground (top).

Usage
-----
python generate_skunks.py \
    --csv traits_catalog.csv \
    --outdir output \
    --supply 100 \
    --name-prefix "Skunk Squad #" \
    --description "Skunk Squad: community-first, generative rarity, and Skunk Works access." \
    --base-uri "ipfs://METADATA_CID/" \
    --seed 42

After generation, upload the /output/images to IPFS/ArDrive, obtain an images base URI,
then update the JSON 'image' fields if you prefer an images-specific base URI.


License
-------
MIT


LAYER_ORDER = [
    "background",
    "body",
    "tail",
    "head",
    "eyes",
    "mouth",
    "shoes",
    "accessory",
]

def load_catalog(csv_path: Path) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    required = {"layer","trait_name","file","weight","rarity_tier"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"CSV is missing columns: {', '.join(sorted(missing))}")
    return df

def build_layer_tables(df: pd.DataFrame) -> Dict[str, List[Tuple[str, Path, float, str]]]:
    tables: Dict[str, List[Tuple[str, Path, float, str]]] = defaultdict(list)
    for _, row in df.iterrows():
        layer = str(row["layer"])
        trait = str(row["trait_name"])

        """
        Overview:
            This script composes layered PNGs into final NFT images using a trait catalog CSV.
            It also emits ERC-721 style metadata JSON files and a manifest of generated editions.

        Input:
            - traits_catalog.csv (columns):
                layer, trait_name, file, weight, rarity_tier, notes
              * 'file' should be a path to a transparent PNG for that trait.
              * If a layer is sometimes absent, include a 'None' trait that points to a 1x1 fully-transparent PNG.
              * Weights are relative; they do not need to sum to 100.

        Layers:
            - The drawing order is controlled by the order of 'layer' names in LAYER_ORDER below.
              Ensure the order goes from background (bottom) to foreground (top).

        Usage:
            python generate_skunks.py \
                --csv traits_catalog.csv \
                --outdir output \
                --supply 100 \
                --name-prefix "Skunk Squad #" \
                --description "Skunk Squad: community-first, generative rarity, and Skunk Works access." \
                --base-uri "ipfs://METADATA_CID/" \
                --seed 42

            After generation, upload the /output/images to IPFS/ArDrive, obtain an images base URI,
            then update the JSON 'image' fields if you prefer an images-specific base URI.

        License: MIT
        """

        import argparse
        import hashlib
        import json
        import os
        import random
        from collections import defaultdict, OrderedDict
        from pathlib import Path
        from typing import Dict, List, Tuple

        from PIL import Image
        import pandas as pd
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", type=Path, default=Path("traits_catalog.csv"))
        LAYER_ORDER = [
            "background",
            "body",
            "tail",
            "head",
            "eyes",
            "mouth",
            "shoes",
            "accessory",
        ]
    if args.seed is not None:
        random.seed(args.seed)

    df = load_catalog(args.csv)
    tables = build_layer_tables(df)

    # Ensure every layer in LAYER_ORDER exists in the CSV
    missing_layers = [l for l in LAYER_ORDER if l not in tables]
    if missing_layers:
        raise ValueError(f"No traits found for layers: {', '.join(missing_layers)}")

    out_images = args.outdir / "images"
    out_meta   = args.outdir / "metadata"
    out_images.mkdir(parents=True, exist_ok=True)
    out_meta.mkdir(parents=True, exist_ok=True)

    used = set()
    manifest_rows = []
    attempts = 0
    created = 0

    images_base_uri = args.images_suburi if args.images_suburi else (args.base_uri.rstrip("/") + "/images/")

    while created < args.supply and attempts < args.max_retries:
        attempts += 1

        # Choose traits per layer
        chosen_files: Dict[str, Path] = OrderedDict()
        chosen_meta: Dict[str, Tuple[str,str]] = OrderedDict()  # layer -> (trait_name, rarity_tier)
        for layer in LAYER_ORDER:
            trait_name, path, rarity = choose_trait(tables[layer])
            chosen_files[layer] = path
            chosen_meta[layer] = (trait_name, rarity)

        sig = combo_signature({layer: chosen_meta[layer][0] for layer in chosen_meta})
        if sig in used:
            continue
        used.add(sig)

        token_id = created + 1
        # Compose image
        img = compose_image(chosen_files)
        img_path = out_images / f"{token_id}.png"
        img.save(img_path, format="PNG")

        # Create metadata
        attributes = make_attributes(chosen_meta)
        metadata = {
            "name": f"{args.name_prefix}{token_id}",
            "description": args.description,
            "image": images_base_uri + f"{token_id}.png",
            "external_url": args.base_uri,  # you can point this to your website
            "attributes": attributes,
        }
        meta_path = out_meta / f"{token_id}.json"
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

        manifest_rows.append({
            "token_id": token_id,
            "signature": sig,
            **{f"{layer}": chosen_meta[layer][0] for layer in LAYER_ORDER}
        })
        created += 1

    if created < args.supply:
        raise RuntimeError(f"Could only create {created}/{args.supply} unique editions after {attempts} attempts. "
                           "Consider adding more traits or layers, or increase --max-retries.")

    # Write manifest
    manifest_path = args.outdir / "manifest.csv"
    pd.DataFrame(manifest_rows).to_csv(manifest_path, index=False)

    # Also write a quick README with next steps
    readme_path = args.outdir / "README.txt"
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(
            "Output structure:\n"
            " - images/: final PNGs (upload to IPFS/ArDrive)\n"
            " - metadata/: ERC-721 JSON metadata\n"
            " - manifest.csv: a flat view of each token's chosen traits\n\n"
            "Suggested next steps:\n"
            "1) Upload images/ to IPFS/ArDrive and capture the CID/TxID.\n"
            "2) If using a separate images base URI, re-run generator with --images-suburi.\n"
            "3) Pin/Store metadata/ and point your contract's baseURI to the metadata directory.\n"
        )

    print(f"Done. Generated {created} editions into {args.outdir}")

if __name__ == "__main__":
    main()