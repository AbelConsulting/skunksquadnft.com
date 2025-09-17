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
    - Default order (background → foreground): background, tail, body, head, arm_right, arm_left, emblem, badge, shoes
  - You can override with:
      --layer-order "background,body,tail,head,arm_right,arm_left,badge,shoes"

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

# ✅ Updated default order per your spec (Background, Tail, Body)
DEFAULT_LAYER_ORDER = [
    "background",
    "tail",
    "arm_right",
    "arm_left",
    "body",
    "head",
    "emblem",
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
    df.attrs["__csv_path__"] = csv_path
    return df

def build_layer_tables(df: pd.DataFrame) -> Dict[str, List[Tuple[str, Path, float, str]]]:
    tables: Dict[str, List[Tuple[str, Path, float, str]]] = defaultdict(list)
    csv_parent = None
    if "__csv_path__" in df.attrs:
        csv_parent = Path(df.attrs["__csv_path__"]).parent

    for _, row in df.iterrows():
        layer = str(row["layer"]).strip()
        trait = str(row["trait_name"]).strip()
        raw_path = str(row["file"]).strip()
        # Resolve relative paths against the CSV directory if provided
        if csv_parent and not re.match(r'^[a-zA-Z]+://', raw_path) and not Path(raw_path).is_absolute():
            filepath = (csv_parent / raw_path).resolve()
        else:
            filepath = Path(raw_path).expanduser()
        weight = float(row["weight"])
        rarity = str(row["rarity_tier"]).strip()
        tables[layer].append((trait, filepath, weight, rarity))
    return tables

def load_from_dir(dir_path: Path) -> pd.DataFrame:
    """
    Build a DataFrame similar to the CSV format from a directory structure.
    Expects directories named with a leading number and layer name (e.g. '1.background').
    Files inside are treated as trait files; trait_name is derived from filename.
    Optional root weights.json can map rarity→weight.
    """
    dir_path = Path(dir_path).expanduser()
    if not dir_path.exists() or not dir_path.is_dir():
        raise FileNotFoundError(f"Traits directory not found: {dir_path}")

    rows = []
    # optional weights.json in the root of the traits dir
    weights_map = {}
    weights_file = dir_path / "weights.json"
    if weights_file.exists():
        try:
            with open(weights_file, "r", encoding="utf-8") as wf:
                weights_map = json.load(wf)
        except Exception:
            weights_map = {}
    for child in sorted(dir_path.iterdir()):
        if not child.is_dir():
            continue
        # derive layer name from directory (strip numeric prefix and dot)
        layer_name = child.name
        if "." in layer_name:
            layer_name = layer_name.split(".", 1)[1]
        for f in sorted(child.iterdir()):
            if f.is_file() and f.suffix.lower() in {".png", ".webp", ".jpg", ".jpeg"}:
                trait_name = f.stem
                rarity = "common"
                # try to infer rarity from filename token (if present)
                m = re.search(r'_(common|rare|epic|legendary|mythic|moonshot)', f.name, re.IGNORECASE)
                if m:
                    rarity = m.group(1).lower()
                # weight from weights_map if available
                weight = float(weights_map.get(rarity, 1.0))
                rows.append({
                    "layer": layer_name,
                    "trait_name": trait_name,
                    "file": str(f.resolve()),
                    "weight": weight,
                    "rarity_tier": rarity,
                    "notes": ""
                })
    if not rows:
        raise RuntimeError(f"No trait files found in directory: {dir_path}")
    df = pd.DataFrame(rows)
    df.attrs["__csv_path__"] = str(dir_path)
    return df

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
    # Fix malformed scheme like 'https:/...' -> 'https://'
    s = re.sub(r'^(https?):/+', r"\1://", s)

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
        s = str(p).replace("\\", "/")
        try:
            if base_img is None:
                # First layer sets the canvas size (or use enforce_size if provided)
                first = open_image_keep_size(s, None)
                if size_ref is None:
                    size_ref = first.size
                    base_img = first
                else:
                    base_img = Image.new("RGBA", size_ref, (0,0,0,0))
                    # Paste centered
                    x = (size_ref[0] - first.size[0]) // 2
                    y = (size_ref[1] - first.size[1]) // 2
                    base_img.paste(first, (x, y), first)
            else:
                layer_img = open_image_keep_size(s, size_ref)
                base_img.alpha_composite(layer_img)
        except FileNotFoundError:
            raise FileNotFoundError(f"Missing file for layer '{layer}': {p}")
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
    ap.add_argument("--traits-dir", type=Path, default=None, help="Path to a traits directory (alternative to --csv)")
    ap.add_argument("--outdir", type=Path, default=Path("output"), help="Output directory")
    ap.add_argument("--preflight", action="store_true", help="Validate all referenced assets and exit")
    ap.add_argument("--verbose", action="store_true", help="Enable verbose logging")
    ap.add_argument("--rarity-weights", type=str, default=None, help="Comma-separated rarity=weight pairs, e.g. 'legendary=0.1,rare=1,common=10'")
    ap.add_argument("--supply", type=int, default=10, help="Number of editions to mint")
    ap.add_argument("--name-prefix", type=str, default="Skunk Squad #", help="Token name prefix")
    ap.add_argument("--description", type=str, default="Skunk Squad: community-first, generative rarity, and Skunk Works access.", help="Metadata description")
    ap.add_argument("--base-uri", type=str, default="ipfs://METADATA_CID/", help="Base URI for metadata directory (contract baseURI)")
    ap.add_argument("--images-suburi", type=str, default=None, help="Optional base URI specifically for images (e.g., ipfs://IMAGES_CID/)")
    ap.add_argument("--layer-order", type=str, default=None, help="Comma-separated order (background,body,tail,head,arm_right,arm_left,badge,shoes)")
    ap.add_argument("--seed", type=int, default=None, help="PRNG seed for reproducibility")
    ap.add_argument("--max-retries", type=int, default=100000, help="Max attempts to find unique combos")
    ap.add_argument("--image-width", type=int, default=None, help="Force output image width (optional)")
    ap.add_argument("--image-height", type=int, default=None, help="Force output image height (optional)")
    args = ap.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    if args.traits_dir:
        df = load_from_dir(args.traits_dir)
    else:
        df = load_catalog(args.csv)

    # Parse rarity weight mapping
    rarity_weights = {}
    if args.rarity_weights:
        for pair in args.rarity_weights.split(","):
            if "=" in pair:
                k, v = pair.split("=", 1)
                try:
                    rarity_weights[k.strip()] = float(v.strip())
                except ValueError:
                    print(f"Warning: invalid rarity weight for '{pair}', skipping")

    tables = build_layer_tables(df)

    # Apply rarity weight mapping (override weights)
    if rarity_weights:
        for layer, opts in tables.items():
            new_opts = []
            for trait, path, weight, rarity in opts:
                rw = rarity_weights.get(rarity, rarity_weights.get(rarity.lower(), None))
                if rw is not None:
                    new_opts.append((trait, path, float(rw), rarity))
                else:
                    new_opts.append((trait, path, weight, rarity))
            tables[layer] = new_opts

    def vprint(*a, **k):
        if args.verbose:
            print(*a, **k)

    def preflight_assets(tables: Dict[str, List[Tuple[str, Path, float, str]]]) -> List[str]:
        """Return a list of missing asset descriptions (empty if all present)."""
        missing = []
        for layer, opts in tables.items():
            for trait, path, weight, rarity in opts:
                s = str(path)
                s = s.replace("\\", "/")
                s = re.sub(r'^(https?):/+', r"\1://", s)
                p = Path(s)
                if p.exists():
                    vprint(f"OK: {layer} -> {s}")
                    continue
                if re.match(r'^[a-zA-Z]+://', s):
                    try:
                        with urllib.request.urlopen(s) as resp:
                            if resp.status >= 400:
                                missing.append(f"{layer}:{trait} -> URL error {resp.status} {s}")
                                continue
                    except Exception as e:
                        missing.append(f"{layer}:{trait} -> {s} ({e})")
                        continue
                else:
                    missing.append(f"{layer}:{trait} -> {s} (local file missing)")
        return missing

    # --- generation start ---
    layer_order = parse_layer_order(args.layer_order)

    # Ensure required layers exist in tables
    for L in layer_order:
        if L not in tables:
            vprint(f"Warning: layer '{L}' not present in CSV (will be skipped if empty)")

    missing = preflight_assets(tables)
    if missing:
        vprint("Preflight found missing assets:")
        for m in missing:
            vprint("  ", m)
    if args.preflight:
        if missing:
            print("Preflight failed: missing assets listed above.")
            raise SystemExit(1)
        print("Preflight OK: all assets present.")
        raise SystemExit(0)

    out_images = Path(args.outdir) / "images"
    out_meta = Path(args.outdir) / "metadata"
    out_images.mkdir(parents=True, exist_ok=True)
    out_meta.mkdir(parents=True, exist_ok=True)

    enforce_size = None
    if args.image_width and args.image_height:
        enforce_size = (int(args.image_width), int(args.image_height))

    used_signatures = set()
    manifest_rows = []
    edition = 1
    attempts = 0

    # Pre-filter options to those that exist or are URLs
    usable_tables = {}
    for layer, opts in tables.items():
        usable = []
        for trait, path, weight, rarity in opts:
            s = str(path).replace('\\','/')
            p = Path(s)
            if p.exists() or re.match(r'^[a-zA-Z]+://', s):
                usable.append((trait, s, float(weight), rarity))
            else:
                vprint(f"Skipping missing file for layer {layer}: {s}")
        if usable:
            usable_tables[layer] = usable

    # If any layer in layer_order has no usable entries, generation will fail
    for L in layer_order:
        if L not in usable_tables:
            print(f"Error: no usable assets found for layer '{L}'. Cannot generate images.")
            raise SystemExit(1)

    while edition <= args.supply and attempts < args.max_retries:
        attempts += 1
        chosen_files = OrderedDict()
        chosen_meta = OrderedDict()
        try:
            for layer in layer_order:
                opts = usable_tables[layer]
                name, path_str, rarity = choose_trait([(t, Path(p), w, r) for (t,p,w,r) in opts])
                chosen_files[layer] = Path(path_str)
                chosen_meta[layer] = (name, rarity)

            sig = combo_signature({k: v[0] for k,v in chosen_meta.items()})
            if sig in used_signatures:
                # duplicate, retry
                continue

            # Compose and save image
            img = compose_image(chosen_files, enforce_size=enforce_size)
            img_path = out_images.joinpath(f"{edition}.png")
            img.save(img_path)

            # Build metadata
            image_ref = (args.images_suburi.rstrip('/') + '/' + f"{edition}.png") if args.images_suburi else (args.base_uri.rstrip('/') + '/' + f"images/{edition}.png")
            meta = {
                "name": f"{args.name_prefix}{edition}",
                "description": args.description,
                "image": image_ref,
                "attributes": make_attributes(chosen_meta)
            }
            meta_path = out_meta.joinpath(f"{edition}.json")
            with open(meta_path, 'w', encoding='utf-8') as mf:
                json.dump(meta, mf, indent=2)

            manifest_rows.append({
                'edition': edition,
                'signature': sig,
                'image': str(img_path),
                'metadata': str(meta_path)
            })
            used_signatures.add(sig)
            if args.verbose:
                print(f"Created edition {edition} (sig={sig})")
            edition += 1

        except FileNotFoundError as e:
            print(f"Asset error during generation: {e}")
            raise

    if edition <= args.supply:
        print(f"Stopped after {attempts} attempts; produced {edition-1} unique editions.")
    else:
        print(f"Successfully generated {args.supply} editions.")

    # Write manifest CSV
    import csv
    manifest_path = Path(args.outdir) / 'manifest.csv'
    with open(manifest_path, 'w', newline='', encoding='utf-8') as mf:
        writer = csv.DictWriter(mf, fieldnames=['edition','signature','image','metadata'])
        writer.writeheader()
        for r in manifest_rows:
            writer.writerow(r)

if __name__ == '__main__':
    main()

 