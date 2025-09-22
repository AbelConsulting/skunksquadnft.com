"""
Skunk Squad NFT Image & Metadata Generator - Sample Images Version

Overview:
  - Uses pre-made sample images instead of layered trait composition
  - Generates metadata for each sample image with randomized attributes
  - Creates a collection using the 4 sample images as the base artwork

Usage:
  python generate.py \
    --outdir output \
    --supply 100 \
    --name-prefix "Skunk Squad #" \
    --description "Skunk Squad: community-first, generative rarity, and Skunk Works access." \
    --base-uri "ipfs://METADATA_CID/" \
    --seed 42

License: MIT
"""

import argparse
import hashlib
import json
import random
import shutil
from collections import defaultdict, OrderedDict
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import io
import re

from PIL import Image
import pandas as pd

# Sample images configuration
SAMPLE_IMAGES = [
    {
        "file": "assets/skunksample1.png",
        "rarity_tier": "rare",
        "traits": {
            "Background": "Urban Alley",
            "Body Style": "Classic",
            "Expression": "Cool",
            "Rarity": "Rare"
        }
    },
    {
        "file": "assets/skunksample2.png", 
        "rarity_tier": "epic",
        "traits": {
            "Background": "Neon City",
            "Body Style": "Enhanced", 
            "Expression": "Confident",
            "Rarity": "Epic"
        }
    },
    {
        "file": "assets/skunksample3.png",
        "rarity_tier": "ultra", 
        "traits": {
            "Background": "Mystic Portal",
            "Body Style": "Legendary",
            "Expression": "Mysterious", 
            "Rarity": "Ultra"
        }
    },
    {
        "file": "assets/skunksample4.png",
        "rarity_tier": "common",
        "traits": {
            "Background": "Simple",
            "Body Style": "Standard",
            "Expression": "Friendly",
            "Rarity": "Common"
        }
    }
]

# Randomizable trait variations
TRAIT_VARIATIONS = {
    "Personality": ["Bold", "Clever", "Mysterious", "Playful", "Serious", "Adventurous", "Wise", "Mischievous"],
    "Power Level": ["Novice", "Skilled", "Expert", "Master", "Legendary", "Ultra"],
    "Element": ["Fire", "Water", "Earth", "Air", "Lightning", "Shadow", "Light", "Void"],
    "Squad Role": ["Leader", "Scout", "Guardian", "Strategist", "Warrior", "Healer", "Spy", "Engineer"]
}

def choose_sample_image() -> dict:
    """Choose a random sample image with its associated traits"""
    return random.choice(SAMPLE_IMAGES)

def generate_random_traits(base_traits: dict) -> List[Dict[str, str]]:
    """Generate randomized traits including base traits and random variations"""
    attributes = []
    
    # Add base traits from the sample image
    for trait_type, value in base_traits.items():
        attributes.append({
            "trait_type": trait_type,
            "value": value
        })
    
    # Add randomized traits
    for trait_type, options in TRAIT_VARIATIONS.items():
        value = random.choice(options)
        attributes.append({
            "trait_type": trait_type,
            "value": value
        })
    
    # Add some special traits with lower probability
    if random.random() < 0.1:  # 10% chance
        attributes.append({
            "trait_type": "Special",
            "value": "Genesis Collection"
        })
    
    if random.random() < 0.05:  # 5% chance
        attributes.append({
            "trait_type": "Achievement", 
            "value": "First Edition"
        })
    
    return attributes

def combo_signature(sample_file: str, traits: List[Dict[str, str]]) -> str:
    """Create a signature for this combination"""
    trait_str = "|".join(f"{t['trait_type']}:{t['value']}" for t in sorted(traits, key=lambda x: x['trait_type']))
    sig_src = f"{sample_file}|{trait_str}"
    return hashlib.sha256(sig_src.encode("utf-8")).hexdigest()

def main():
    ap = argparse.ArgumentParser(description="Skunk Squad sample image generator")
    ap.add_argument("--outdir", type=Path, default=Path("output"), help="Output directory")
    ap.add_argument("--verbose", action="store_true", help="Enable verbose logging")
    ap.add_argument("--supply", type=int, default=10, help="Number of editions to mint")
    ap.add_argument("--name-prefix", type=str, default="Skunk Squad #", help="Token name prefix")
    ap.add_argument("--description", type=str, default="Skunk Squad: community-first, generative rarity, and Skunk Works access.", help="Metadata description")
    ap.add_argument("--base-uri", type=str, default="ipfs://METADATA_CID/", help="Base URI for metadata directory (contract baseURI)")
    ap.add_argument("--images-suburi", type=str, default=None, help="Optional base URI specifically for images (e.g., ipfs://IMAGES_CID/)")
    ap.add_argument("--seed", type=int, default=None, help="PRNG seed for reproducibility")
    ap.add_argument("--max-retries", type=int, default=100000, help="Max attempts to find unique combos")
    args = ap.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    def vprint(*a, **k):
        if args.verbose:
            print(*a, **k)

    # Check if sample images exist
    for sample in SAMPLE_IMAGES:
        if not Path(sample["file"]).exists():
            print(f"Error: Sample image not found: {sample['file']}")
            return 1

    out_images = Path(args.outdir) / "images"
    out_meta = Path(args.outdir) / "metadata"
    out_images.mkdir(parents=True, exist_ok=True)
    out_meta.mkdir(parents=True, exist_ok=True)

    used_signatures = set()
    manifest_rows = []
    edition = 1
    attempts = 0

    while edition <= args.supply and attempts < args.max_retries:
        attempts += 1
        
        try:
            # Choose a sample image
            sample_data = choose_sample_image()
            sample_file = sample_data["file"]
            base_traits = sample_data["traits"]
            
            # Generate attributes for this edition
            attributes = generate_random_traits(base_traits)
            
            # Create signature to check for uniqueness
            sig = combo_signature(sample_file, attributes)
            if sig in used_signatures:
                continue  # Duplicate, retry

            # Copy the sample image to output directory
            source_image = Path(sample_file)
            dest_image = out_images / f"{edition}.png"
            shutil.copy2(source_image, dest_image)

            # Build metadata
            image_ref = (args.images_suburi.rstrip('/') + '/' + f"{edition}.png") if args.images_suburi else (args.base_uri.rstrip('/') + '/' + f"images/{edition}.png")
            meta = {
                "name": f"{args.name_prefix}{edition}",
                "description": args.description,
                "image": image_ref,
                "attributes": attributes
            }
            
            # Save metadata
            meta_path = out_meta / f"{edition}.json"
            with open(meta_path, 'w', encoding='utf-8') as mf:
                json.dump(meta, mf, indent=2)

            # Build manifest row
            row = {
                'edition': edition,
                'signature': sig,
                'sample_image': sample_file,
                'rarity_tier': sample_data["rarity_tier"],
                'image': str(dest_image),
                'metadata': str(meta_path)
            }
            
            # Add trait columns to manifest
            for attr in attributes:
                trait_key = f"trait_{attr['trait_type'].lower().replace(' ', '_')}"
                row[trait_key] = attr['value']
            
            manifest_rows.append(row)
            used_signatures.add(sig)
            
            if args.verbose:
                print(f"Created edition {edition} using {sample_file} (sig={sig[:8]}...)")
            
            edition += 1

        except Exception as e:
            print(f"Error during generation: {e}")
            raise

    if edition <= args.supply:
        print(f"Stopped after {attempts} attempts; produced {edition-1} unique editions.")
    else:
        print(f"Successfully generated {args.supply} editions using sample images.")

    # Write manifest CSV
    import csv
    manifest_path = Path(args.outdir) / 'manifest.csv'
    
    if manifest_rows:
        # Get all fieldnames from the first row and any additional keys
        base_fields = ['edition', 'signature', 'sample_image', 'rarity_tier', 'image', 'metadata']
        all_keys = set()
        for row in manifest_rows:
            all_keys.update(row.keys())
        
        # Sort trait fields for consistent ordering
        trait_fields = sorted([k for k in all_keys if k.startswith('trait_')])
        fieldnames = base_fields + trait_fields
        
        with open(manifest_path, 'w', newline='', encoding='utf-8') as mf:
            writer = csv.DictWriter(mf, fieldnames=fieldnames)
            writer.writeheader()
            for row in manifest_rows:
                writer.writerow(row)
        
        print(f"Manifest written to: {manifest_path}")

    return 0

if __name__ == '__main__':
    exit(main())

 