#!/usr/bin/env python3
"""
Test Metadata Generation with Sample Transaction IDs
"""

import csv
import json
from pathlib import Path

def create_test_mapping():
    """Create a test mapping with sample transaction IDs"""
    print("🧪 Creating test transaction ID mapping...")
    
    # Create a small test mapping for the first 5 NFTs
    test_data = [
        {"token_id": "1", "image_txid": "TEST_TXID_1_SAMPLE_FOR_METADATA_GENERATION"},
        {"token_id": "2", "image_txid": "TEST_TXID_2_SAMPLE_FOR_METADATA_GENERATION"},
        {"token_id": "3", "image_txid": "TEST_TXID_3_SAMPLE_FOR_METADATA_GENERATION"},
        {"token_id": "4", "image_txid": "TEST_TXID_4_SAMPLE_FOR_METADATA_GENERATION"},
        {"token_id": "5", "image_txid": "TEST_TXID_5_SAMPLE_FOR_METADATA_GENERATION"},
    ]
    
    with open("test_txid_mapping.csv", 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["token_id", "image_txid"])
        writer.writeheader()
        writer.writerows(test_data)
        
    print("✅ Created test_txid_mapping.csv")
    return True

def test_metadata_generation():
    """Test the metadata generation process"""
    
    print("🔄 Testing metadata generation process...")
    
    # Create test mapping
    create_test_mapping()
    
    # Load transaction ID mapping
    txid_map = {}
    with open("test_txid_mapping.csv", 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            token_id = int(row['token_id'])
            txid = row['image_txid'].strip()
            txid_map[token_id] = txid
    
    print(f"📊 Loaded {len(txid_map)} test transaction IDs")
    
    # Create test output directory
    output_dir = Path("test_metadata_arweave")
    output_dir.mkdir(exist_ok=True)
    
    # Process test metadata files
    metadata_dir = Path("output/metadata")
    updated_count = 0
    
    for i in range(1, 6):  # Just test first 5
        original_file = metadata_dir / f"{i}.json"
        
        if not original_file.exists():
            print(f"⚠️ Original metadata missing: {i}.json")
            continue
            
        # Load original metadata
        with open(original_file, 'r') as f:
            metadata = json.load(f)
            
        # Update image URL with test Arweave transaction ID
        if i in txid_map:
            txid = txid_map[i]
            original_image = metadata.get("image", "")
            metadata["image"] = f"ar://{txid}"
            
            print(f"   📝 NFT #{i}:")
            print(f"      Original: {original_image}")
            print(f"      Updated:  ar://{txid}")
            
            updated_count += 1
        
        # Save test metadata
        output_file = output_dir / f"{i}.json"
        with open(output_file, 'w') as f:
            json.dump(metadata, f, indent=2)
    
    print(f"\n✅ Generated {updated_count} test metadata files")
    print(f"📁 Output directory: {output_dir}")
    
    # Show sample output
    if updated_count > 0:
        sample_file = output_dir / "1.json"
        if sample_file.exists():
            print("\n📄 Sample metadata output:")
            with open(sample_file, 'r') as f:
                sample_data = json.load(f)
                print(json.dumps(sample_data, indent=2)[:500] + "...")
    
    print("\n✅ Test completed successfully!")
    print("📋 When you have real transaction IDs:")
    print("   1. Create txid_mapping.csv with real TXIDs")
    print("   2. Run: python generate_arweave_metadata.py")
    print("   3. Upload metadata_arweave/ folder to ArDrive")

if __name__ == "__main__":
    print("🦨 Skunk Squad NFT - Metadata Generation Test")
    print("=" * 50)
    test_metadata_generation()