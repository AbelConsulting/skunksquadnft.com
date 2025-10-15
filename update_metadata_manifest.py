#!/usr/bin/env python3
"""
Update Metadata Manifest with Transaction IDs
Run this after uploading metadata files to ArDrive
"""

import json
import csv
from pathlib import Path

def update_metadata_manifest(manifest_file="metadata_manifest.json", export_csv="metadata_export.csv"):
    """Update manifest with real transaction IDs from metadata upload"""
    
    print("🔄 Updating metadata manifest with transaction IDs...")
    
    # Check files exist
    if not Path(manifest_file).exists():
        print(f"❌ Manifest file not found: {manifest_file}")
        return None
        
    if not Path(export_csv).exists():
        print(f"❌ Export CSV not found: {export_csv}")
        print("Please download the CSV export from ArDrive after uploading metadata")
        return None
    
    # Load manifest
    with open(manifest_file, 'r') as f:
        manifest = json.load(f)
    
    # Load transaction IDs from metadata export CSV
    txid_map = {}
    with open(export_csv, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            filename = row['File Name']
            txid = row['Data Transaction ID']
            
            # Extract number from filename (e.g., "1.json" -> "1")
            if filename.endswith('.json'):
                file_number = filename[:-5]  # Remove .json extension
                txid_map[file_number] = txid
            elif filename in ['contract.json', 'unrevealed.json']:
                key = filename.split('.')[0]  # contract.json -> contract
                txid_map[key] = txid
    
    print(f"📊 Loaded {len(txid_map)} transaction IDs from metadata export")
    
    # Update manifest paths
    updated = 0
    for path, data in manifest["paths"].items():
        if path in txid_map:
            data["id"] = txid_map[path]
            updated += 1
            
            if updated <= 5:  # Show first few updates
                print(f"   ✅ Updated {path}: {txid_map[path][:20]}...")
    
    # Save updated manifest
    output_file = "metadata_manifest_final.json"
    with open(output_file, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n✅ Updated {updated} transaction IDs")
    print(f"💾 Final manifest saved: {output_file}")
    print("\n🚀 Next: Upload this manifest to Arweave!")
    print(f"📁 File to upload: {output_file}")
    print("🔗 Use the resulting TXID as your base URI: ar://MANIFEST_TXID/")
    
    return output_file

if __name__ == "__main__":
    import sys
    
    # Allow custom file names as arguments
    manifest_file = sys.argv[1] if len(sys.argv) > 1 else "metadata_manifest.json"
    export_csv = sys.argv[2] if len(sys.argv) > 2 else "metadata_export.csv"
    
    result = update_metadata_manifest(manifest_file, export_csv)
    
    if result:
        print("\n📋 Final Steps:")
        print("1. Upload metadata_manifest_final.json to ArDrive")
        print("2. Copy the transaction ID (MANIFEST_TXID)")
        print("3. Set smart contract base URI to: ar://MANIFEST_TXID/")
        print("4. Test: ar://MANIFEST_TXID/1 should return metadata for NFT #1")
