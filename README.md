# skunksquadnft.com

The Skunk Squad are designed to be an artistic masterpiece 

skunk squad nft
and
Skunk Squad NFT Image & Metadata Generator
Generating Mathematical Wheighted rarity while keeping artistic Flare
Overview:
  - Composes layered PNGs into final NFT images using a trait catalog CSV.
  - Emits ERC-721 style metadata JSON files and a manifest of generated editions.

Input CSV columns (traits_catalog.csv):
  layer, trait_name, file, weight, rarity_tier, notes
    * 'file' is a path to a transparent PNG for that trait.
    * To make a layer optional, add a "None" trait pointing to a transparent PNG (e.g., transparent.png).
    * Weights are relative; they do NOT need to sum to 10000.

Layer order:
    - Default order (background → foreground): background, tail, body, head, arm_right, arm_left, emblem, badge, shoes
  
Usage:
  python generate.py \
    --csv traits_catalog.csv \
    --outdir output \
    --supply 10000 \
    --name-prefix "Skunk Squad #" \
    --description "Skunk Squad: community-first, generative rarity, and Skunk Works access." \
    --base-uri "ipfs://METADATA_CID/" \
    --seed 420

  After generation, uploading output/images to IPFS/ArDrive.