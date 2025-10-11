#!/usr/bin/env python3
"""
Compare NFT collections between Arweave export CSV and local metadata files
to identify missing items.
"""

import os
import csv
import json
from pathlib import Path

def read_arweave_export():
    """Read the Arweave export CSV file and extract NFT numbers"""
    csv_path = Path("export_data.csv")
    if not csv_path.exists():
        print("Error: export_data.csv not found")
        return set()
    
    arweave_nfts = set()
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            filename = row.get('File Name', '')
            if filename.endswith('.png'):
                # Extract number from filename like "123.png"
                nft_number = filename.replace('.png', '')
                try:
                    arweave_nfts.add(int(nft_number))
                except ValueError:
                    print(f"Warning: Could not parse NFT number from '{filename}'")
    
    return arweave_nfts

def read_local_metadata():
    """Read local metadata files and extract NFT numbers"""
    metadata_dir = Path("metadata_arweave")
    if not metadata_dir.exists():
        print("Error: metadata_arweave directory not found")
        return set()
    
    local_nfts = set()
    
    for json_file in metadata_dir.glob("*.json"):
        filename = json_file.stem  # Gets filename without .json extension
        try:
            nft_number = int(filename)
            local_nfts.add(nft_number)
        except ValueError:
            print(f"Warning: Could not parse NFT number from '{json_file.name}'")
    
    return local_nfts

def main():
    print("🔍 Comparing NFT collections...")
    print("=" * 50)
    
    # Read both collections
    arweave_nfts = read_arweave_export()
    local_nfts = read_local_metadata()
    
    print(f"📊 Arweave export contains: {len(arweave_nfts)} NFTs")
    print(f"📁 Local metadata contains: {len(local_nfts)} NFTs")
    print()
    
    # Find missing NFTs
    missing_in_local = arweave_nfts - local_nfts
    missing_in_arweave = local_nfts - arweave_nfts
    
    # Report results
    if missing_in_local:
        print(f"❌ Missing from local metadata ({len(missing_in_local)} items):")
        missing_sorted = sorted(missing_in_local)
        for i, nft_num in enumerate(missing_sorted):
            if i < 20:  # Show first 20
                print(f"   • NFT #{nft_num}")
            elif i == 20:
                print(f"   ... and {len(missing_sorted) - 20} more")
                break
        print()
    else:
        print("✅ All Arweave NFTs are present in local metadata")
        print()
    
    if missing_in_arweave:
        print(f"⚠️  Extra in local metadata ({len(missing_in_arweave)} items):")
        extra_sorted = sorted(missing_in_arweave)
        for i, nft_num in enumerate(extra_sorted):
            if i < 20:  # Show first 20
                print(f"   • NFT #{nft_num}")
            elif i == 20:
                print(f"   ... and {len(extra_sorted) - 20} more")
                break
        print()
    else:
        print("✅ No extra items in local metadata")
        print()
    
    # Summary
    total_unique = len(arweave_nfts | local_nfts)
    print(f"📈 Summary:")
    print(f"   • Total unique NFTs across both: {total_unique}")
    print(f"   • Perfect match: {len(missing_in_local) == 0 and len(missing_in_arweave) == 0}")
    
    # Range analysis
    if arweave_nfts:
        arweave_min, arweave_max = min(arweave_nfts), max(arweave_nfts)
        print(f"   • Arweave range: #{arweave_min} to #{arweave_max}")
    
    if local_nfts:
        local_min, local_max = min(local_nfts), max(local_nfts)
        print(f"   • Local range: #{local_min} to #{local_max}")

if __name__ == "__main__":
    main()