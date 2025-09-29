#!/usr/bin/env python3
"""
Metadata Generator with Arweave Transaction IDs
For use after uploading images to ArDrive
"""

import json
import csv
from pathlib import Path

def generate_metadata_from_txids(txid_file="txid_mapping.csv"):
    """
    Generate metadata files with Arweave ar:// URLs
    
    Expected CSV format:
    token_id,image_txid
    1,ABC123...
    2,DEF456...
    """
    
    print("🔄 Generating metadata with Arweave transaction IDs...")
    
    # Check if TxID mapping file exists
    if not Path(txid_file).exists():
        print(f"❌ Transaction ID mapping file not found: {txid_file}")
        print("📋 Please create this file with format:")
        print("   token_id,image_txid")
        print("   1,YOUR_TRANSACTION_ID_1")
        print("   2,YOUR_TRANSACTION_ID_2")
        print("   ...")
        return False
        
    # Load transaction ID mapping
    txid_map = {}
    with open(txid_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            token_id = int(row['token_id'])
            txid = row['image_txid'].strip()
            txid_map[token_id] = txid
            
    print(f"📊 Loaded {len(txid_map)} transaction IDs")
    
    # Create output directory
    output_dir = Path("metadata_arweave")
    output_dir.mkdir(exist_ok=True)
    
    # Process each metadata file
    metadata_dir = Path("output/metadata")
    updated_count = 0
    
    for i in range(1, 10001):
        original_file = metadata_dir / f"{i}.json"
        
        if not original_file.exists():
            print(f"⚠️ Original metadata missing: {i}.json")
            continue
            
        # Load original metadata
        with open(original_file, 'r') as f:
            metadata = json.load(f)
            
        # Update image URL with Arweave transaction ID
        if i in txid_map:
            txid = txid_map[i]
            metadata["image"] = f"ar://{txid}"
            
            # Also update external_url if it exists
            if "external_url" in metadata:
                base_url = metadata["external_url"].split("/token/")[0]
                metadata["external_url"] = f"{base_url}/token/{i}"
                
            updated_count += 1
            
            if updated_count <= 5:  # Show first 5 as examples
                print(f"   📝 NFT #{i}: ar://{txid}")
        else:
            print(f"   ⚠️ NFT #{i}: No transaction ID found")
            
        # Save updated metadata
        output_file = output_dir / f"{i}.json"
        with open(output_file, 'w') as f:
            json.dump(metadata, f, indent=2)
            
    print(f"\n✅ Generated {updated_count} metadata files with Arweave URLs")
    print(f"📁 Output directory: {output_dir}")
    print("\n📋 Next steps:")
    print("   1. Upload metadata_arweave/ folder to ArDrive")
    print("   2. Get the manifest transaction ID")
    print("   3. Use ar://MANIFEST_TXID/ as your base URI")
    
    return True

def create_sample_txid_file():
    """Create a sample transaction ID mapping file"""
    sample_data = [
        {"token_id": "1", "image_txid": "SAMPLE_TXID_1_REPLACE_WITH_REAL"},
        {"token_id": "2", "image_txid": "SAMPLE_TXID_2_REPLACE_WITH_REAL"},
        {"token_id": "3", "image_txid": "SAMPLE_TXID_3_REPLACE_WITH_REAL"},
    ]
    
    with open("txid_mapping_sample.csv", 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["token_id", "image_txid"])
        writer.writeheader()
        writer.writerows(sample_data)
        
    print("📝 Created sample file: txid_mapping_sample.csv")
    print("📋 Edit this file with your real transaction IDs")

if __name__ == "__main__":
    print("🦨 Skunk Squad NFT - Arweave Metadata Generator")
    print("=" * 50)
    
    # Check if mapping file exists
    if Path("txid_mapping.csv").exists():
        generate_metadata_from_txids()
    else:
        print("📝 No transaction ID mapping found.")
        choice = input("Create sample file? (y/n): ")
        if choice.lower() == 'y':
            create_sample_txid_file()
        else:
            print("📋 Please create txid_mapping.csv with your transaction IDs")