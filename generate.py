
"""
Skunk Squad NFT Image & Metadata Generator

Overview:
  - Composes layered PNGs into final NFT images using a trait catalog CSV.
  - Emits ERC-721 style metadata JSON files and a manifest of generated editions.

Input CSV columns (traits_catalog.csv):
  layer, trait_name, file, weight, rarity_tier, notes
    * 'file' is a path to a transparent PNG for that trait.
    * To make a layer optional, add a "None" trait pointing to a transparent PNG (e.g., transparent.png).
    * Weights are relative; they do NOT need to sum to 100.

Layer order:
  - Default order is defined by LAYER_ORDER below (background → foreground).
  - You can override with --layer-order "background,body,tail,head,eyes,mouth,shoes,accessory"

Usage:
  python generate.py \
    --csv traits_catalog.csv \
    --outdir output \
    --supply 100 \
    --name-prefix "Skunk Squad #" \
    --description "Skunk Squad: community-first, generative rarity, and Skunk Works access." \
    --base-uri "ipfs://METADATA_CID/" \
    --seed 42

  After generation, upload output/images to IPFS/ArDrive.
  If you have a distinct base URI for images, pass --images-suburi "ipfs://IMAGES_CID/".

License: MIT
"""

import argparse
import hashlib
import json
import random
from collections import defaultdict, OrderedDict
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import io
import re
import urllib.request

from PIL import Image
import pandas as pd

DEFAULT_LAYER_ORDER = [
    "background",
    "body",
    "tail",
    "head",
    "arm_right",
    "arm_left",
    "badge",
    "shoes",    
]

def load_catalog(csv_path: Path) -> pd.DataFrame:
    csv_path = Path(csv_path).expanduser()
    if not csv_path.exists():
        raise FileNotFoundError(f"Traits CSV not found at: {csv_path}")
    df = pd.read_csv(csv_path)
    required = {"layer","trait_name","file","weight","rarity_tier"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"CSV is missing columns: {', '.join(sorted(missing))}")
    # Clean types
    df["layer"] = df["layer"].astype(str)
    df["trait_name"] = df["trait_name"].astype(str)
    df["file"] = df["file"].astype(str)
    df["weight"] = pd.to_numeric(df["weight"], errors="coerce").fillna(0.0)
    df["rarity_tier"] = df["rarity_tier"].astype(str)
    if "notes" not in df.columns:

        df["notes"] = ""
    return df

def build_layer_tables(df: pd.DataFrame) -> Dict[str, List[Tuple[str, Path, float, str]]]:

    tables: Dict[str, List[Tuple[str, Path, float, str]]] = defaultdict(list)
    for _, row in df.iterrows():
        layer = str(row["layer"])
        trait = str(row["trait_name"])
        filepath = Path(str(row["file"])).expanduser()
        weight = float(row["weight"])
        rarity = str(row["rarity_tier"])
        tables[layer].append((trait, filepath, weight, rarity))
    return tables

def choose_trait(options: List[Tuple[str, Path, float, str]]) -> Tuple[str, Path, str]:
    # Weighted random choice
    names, paths, weights, rarities = zip(*options)
    # Avoid all-zero weights
    if sum(weights) <= 0:
        weights = [1.0] * len(weights)
    choice_idx = random.choices(range(len(options)), weights=weights, k=1)[0]
    return names[choice_idx], paths[choice_idx], rarities[choice_idx]

def combo_signature(traits_by_layer: Dict[str, str]) -> str:
    # Deterministic signature (sorted by layer name)
    sig_src = "|".join(f"{layer}:{traits_by_layer[layer]}" for layer in sorted(traits_by_layer.keys()))
    return hashlib.sha256(sig_src.encode("utf-8")).hexdigest()

def open_image_keep_size(path: Path, size_ref: Optional[Tuple[int,int]]) -> Image.Image:
    s = str(path)
    # Normalize Windows backslashes which may appear in CSV URLs
    s = s.replace("\\", "/")

    img = None
    # If it's a local file path that exists, open directly
    p = Path(s)
    if p.exists():
        img = Image.open(p).convert("RGBA")
    else:
        # If it looks like a URL (scheme://...), try to fetch it
        if re.match(r'^[a-zA-Z]+://', s):
            try:
                with urllib.request.urlopen(s) as resp:
                    data = resp.read()
                img = Image.open(io.BytesIO(data)).convert("RGBA")
            except Exception as e:
                raise FileNotFoundError(f"Unable to fetch image from URL '{s}': {e}")
        else:
            raise FileNotFoundError(f"Missing file for asset: {s}")

    if size_ref and img.size != size_ref:
        # If the layer asset differs in size, paste centered onto a transparent canvas
        canvas = Image.new("RGBA", size_ref, (0,0,0,0))
        x = (size_ref[0] - img.size[0]) // 2
        y = (size_ref[1] - img.size[1]) // 2
        canvas.paste(img, (x, y), img)
        return canvas
    return img

def compose_image(chosen_files: "OrderedDict[str, Path]", enforce_size: Optional[Tuple[int,int]]=None) -> Image.Image:
    base_img = None
    size_ref = enforce_size
    for idx, (layer, p) in enumerate(chosen_files.items()):
        if not p.exists():
            raise FileNotFoundError(f"Missing file for layer '{layer}': {p}")
        if base_img is None:
            # First layer sets the canvas size (or use enforce_size if provided)
            first = Image.open(p).convert("RGBA")
            if size_ref is None:
                size_ref = first.size
                base_img = first
            else:
                base_img = Image.new("RGBA", size_ref, (0,0,0,0))
                base_img.alpha_composite(open_image_keep_size(p, size_ref))
        else:
            base_img.alpha_composite(open_image_keep_size(p, size_ref))
    return base_img

def make_attributes(chosen_meta: "OrderedDict[str, Tuple[str,str]]") -> List[Dict[str,str]]:
    attrs = []
    for layer, (trait_name, rarity) in chosen_meta.items():
        attrs.append({
            "trait_type": layer,
            "value": trait_name,
            "rarity_tier": rarity
        })
    return attrs

def parse_layer_order(arg: Optional[str]) -> List[str]:
    if not arg:
        return DEFAULT_LAYER_ORDER
    layers = [x.strip() for x in arg.split(",") if x.strip()]
    if not layers:
        return DEFAULT_LAYER_ORDER
    return layers

def main():
    ap = argparse.ArgumentParser(description="Skunk Squad image & metadata generator")
    ap.add_argument("--csv", type=Path, default=Path(__file__).parent.joinpath("traits_catalog.csv"), help="Path to traits catalog CSV")
    ap.add_argument("--outdir", type=Path, default=Path("output"), help="Output directory")
    ap.add_argument("--supply", type=int, default=10, help="Number of editions to mint")
    ap.add_argument("--name-prefix", type=str, default="Skunk Squad #", help="Token name prefix")
    ap.add_argument("--description", type=str, default="Skunk Squad: community-first, generative rarity, and Skunk Works access.", help="Metadata description")
    ap.add_argument("--base-uri", type=str, default="ipfs://METADATA_CID/", help="Base URI for metadata directory (contract baseURI)")
    ap.add_argument("--images-suburi", type=str, default=None, help="Optional base URI specifically for images (e.g., ipfs://IMAGES_CID/)")
    ap.add_argument("--layer-order", type=str, default=None, help="Comma-separated order (background,body,tail,head,arm_right,arm_left,shoes,badge)")
    ap.add_argument("--seed", type=int, default=None, help="PRNG seed for reproducibility")
    ap.add_argument("--max-retries", type=int, default=100000, help="Max attempts to find unique combos")
    ap.add_argument("--image-width", type=int, default=None, help="Force output image width (optional)")
    ap.add_argument("--image-height", type=int, default=None, help="Force output image height (optional)")
    args = ap.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    df = load_catalog(args.csv)
    tables = build_layer_tables(df)

    layer_order = parse_layer_order(args.layer_order)
    # Ensure every layer exists in the TSV
    missing_layers = [l for l in layer_order if l not in tables]
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

    enforce_size = None
    if args.image_width and args.image_height:
        enforce_size = (args.image_width, args.image_height)

    while created < args.supply and attempts < args.max_retries:
        attempts += 1

        # Choose traits per layer
        chosen_files: "OrderedDict[str, Path]" = OrderedDict()
        chosen_meta: "OrderedDict[str, Tuple[str,str]]" = OrderedDict()  # layer -> (trait_name, rarity_tier)
        for layer in layer_order:
            trait_name, path, rarity = choose_trait(tables[layer])
            chosen_files[layer] = path
            chosen_meta[layer] = (trait_name, rarity)

        sig = combo_signature({layer: chosen_meta[layer][0] for layer in chosen_meta})
        if sig in used:
            continue
        used.add(sig)

        token_id = created + 1
        # Compose image
        img = compose_image(chosen_files, enforce_size=enforce_size)
        img_path = out_images / f"{token_id}.png"
        img.save(img_path, format="PNG")

        # Create metadata
        attributes = make_attributes(chosen_meta)
        metadata = {
            "name": f"{args.name_prefix}{token_id}",
            "description": args.description,
            "image": images_base_uri.rstrip("/") + f"/{token_id}.png",
            "external_url": "https://skunksquadnft.com",
            "attributes": attributes,
        }
        meta_path = out_meta / f"{token_id}.json"
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

        manifest_rows.append({
            "token_id": token_id,
            "signature": sig,
            **{f"{layer}": chosen_meta[layer][0] for layer in layer_order}
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

    print(f"Done. Generated {created} editions into {args.outdir} (attempts={attempts})")

if __name__ == "__main__":
    main()

