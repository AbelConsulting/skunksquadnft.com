#!/usr/bin/env python3
"""
Prepare NFT metadata for upload to IPFS or web hosting.
This script converts the CSV manifest to individual JSON metadata files
following the ERC-721 metadata standard.
"""

import os
import json
import pandas as pd
import argparse
from pathlib import Path

def create_metadata_files(csv_path, images_dir, output_dir, base_image_uri=""):
    """
    Create individual JSON metadata files for each NFT.
    
    Args:
        csv_path: Path to the manifest CSV file
        images_dir: Directory containing the generated images
        output_dir: Directory to save JSON metadata files
        base_image_uri: Base URI where images will be hosted (e.g., "ipfs://QmHash/" or "https://api.skunksquadnft.com/images/")
    """
    
    # Read the manifest CSV
    print(f"📖 Reading manifest from: {csv_path}")
    df = pd.read_csv(csv_path)
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Contract-level metadata
    contract_metadata = {
        "name": "Skunk Squad NFT",
        "description": "A collection of 10,000 unique Skunk Squad NFTs with various traits and rarities.",
        "image": f"{base_image_uri}collection-image.png",
        "external_link": "https://skunksquadnft.com",
        "seller_fee_basis_points": 250,  # 2.5% royalty
        "fee_recipient": "0x16Be43d7571Edf69cec8D6221044638d161aA994"
    }
    
    # Save contract metadata
    with open(os.path.join(output_dir, "contract.json"), 'w') as f:
        json.dump(contract_metadata, f, indent=2)
    
    # Unrevealed metadata
    unrevealed_metadata = {
        "name": "Skunk Squad NFT",
        "description": "This Skunk Squad NFT has not been revealed yet. Stay tuned!",
        "image": f"{base_image_uri}unrevealed.png",
        "attributes": []
    }
    
    # Save unrevealed metadata
    with open(os.path.join(output_dir, "unrevealed.json"), 'w') as f:
        json.dump(unrevealed_metadata, f, indent=2)
    
    print(f"📁 Creating metadata files in: {output_dir}")
    print(f"🖼️  Base image URI: {base_image_uri}")
    
    # Process each NFT
    for index, row in df.iterrows():
        token_id = index + 1  # Token IDs start from 1
        
        # Extract attributes from CSV columns
        attributes = []
        
        # Map CSV columns to trait attributes
        trait_mapping = {
            'background_trait': 'Background',
            'body_trait': 'Body',
            'head_trait': 'Head',
            'eyes_trait': 'Eyes',
            'mouth_trait': 'Mouth',
            'arm_left_trait': 'Left Arm',
            'arm_right_trait': 'Right Arm',
            'accessory_trait': 'Accessory'
        }
        
        for csv_col, trait_name in trait_mapping.items():
            if csv_col in row and pd.notna(row[csv_col]) and row[csv_col] != 'None':
                attributes.append({
                    "trait_type": trait_name,
                    "value": row[csv_col]
                })
        
        # Add rarity score if available
        if 'rarity_score' in row and pd.notna(row['rarity_score']):
            attributes.append({
                "trait_type": "Rarity Score",
                "value": row['rarity_score']
            })
        
        # Create metadata for this token
        metadata = {
            "name": f"Skunk Squad #{token_id}",
            "description": f"Skunk Squad #{token_id} is a unique NFT with {len(attributes)} traits.",
            "image": f"{base_image_uri}{token_id}.png",
            "external_url": f"https://skunksquadnft.com/token/{token_id}",
            "attributes": attributes
        }
        
        # Save individual metadata file
        metadata_file = os.path.join(output_dir, f"{token_id}.json")
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        if token_id % 100 == 0:
            print(f"✅ Processed {token_id} metadata files...")
    
    print(f"🎉 Created {len(df)} metadata files successfully!")
    print(f"📄 Contract metadata: {output_dir}/contract.json")
    print(f"🎭 Unrevealed metadata: {output_dir}/unrevealed.json")
    print(f"🔢 Token metadata: {output_dir}/1.json to {output_dir}/{len(df)}.json")
    
    return {
        "total_files": len(df),
        "contract_metadata": contract_metadata,
        "unrevealed_metadata": unrevealed_metadata,
        "output_directory": output_dir
    }

def main():
    parser = argparse.ArgumentParser(description='Prepare NFT metadata for upload')
    parser.add_argument('--csv', required=True, help='Path to manifest CSV file')
    parser.add_argument('--images', required=True, help='Directory containing images')
    parser.add_argument('--output', required=True, help='Output directory for metadata')
    parser.add_argument('--base-uri', default='', help='Base URI for images (e.g., ipfs://QmHash/ or https://api.domain.com/images/)')
    
    args = parser.parse_args()
    
    # Validate inputs
    if not os.path.exists(args.csv):
        print(f"❌ CSV file not found: {args.csv}")
        return 1
    
    if not os.path.exists(args.images):
        print(f"❌ Images directory not found: {args.images}")
        return 1
    
    try:
        result = create_metadata_files(
            csv_path=args.csv,
            images_dir=args.images,
            output_dir=args.output,
            base_image_uri=args.base_uri
        )
        
        print("\n📋 Summary:")
        print(f"- Total NFTs: {result['total_files']}")
        print(f"- Output directory: {result['output_directory']}")
        print(f"- Contract metadata: ✅")
        print(f"- Unrevealed metadata: ✅")
        
        return 0
        
    except Exception as e:
        print(f"❌ Error creating metadata: {e}")
        return 1

if __name__ == "__main__":
    exit(main())