#!/usr/bin/env python3
"""
Update Arweave Manifest with Real Transaction IDs
Run this after uploading files to Arweave to replace placeholder TXIDs.
"""

import json
import csv
from pathlib import Path

def update_manifest_with_txids(manifest_file, export_csv):
    """Update manifest with real transaction IDs from ArDrive export"""
    
    print("🔄 Updating manifest with real transaction IDs...")
    
    # Load manifest
    with open(manifest_file, 'r') as f:
        manifest = json.load(f)
    
    # Load transaction IDs from export CSV
    txid_map = {}
    with open(export_csv, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            filename = row['File Name']
            txid = row['Data Transaction ID']
            txid_map[filename] = txid
    
    print(f"📊 Loaded {len(txid_map)} transaction IDs from export")
    
    # Update manifest paths
    updated = 0
    for path, data in manifest["paths"].items():
        if path == "index.html":
            # Update if you have an index.html file
            continue
        elif path == "contract.json":
            if "contract.json" in txid_map:
                data["id"] = txid_map["contract.json"]
                updated += 1
        elif path == "unrevealed.json":
            if "unrevealed.json" in txid_map:
                data["id"] = txid_map["unrevealed.json"]
                updated += 1
        else:
            # NFT metadata files
            metadata_filename = f"{path}.json"
            if metadata_filename in txid_map:
                data["id"] = txid_map[metadata_filename]
                updated += 1
    
    # Save updated manifest
    output_file = "arweave_manifest_final.json"
    with open(output_file, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"✅ Updated {updated} transaction IDs")
    print(f"💾 Final manifest saved: {output_file}")
    print("🚀 Ready to upload to Arweave!")
    
    return output_file

if __name__ == "__main__":
    # Update this with your actual export CSV file
    export_csv = "arweave_export_final.csv"
    manifest_file = "arweave_manifest_complete.json"
    
    if Path(export_csv).exists() and Path(manifest_file).exists():
        update_manifest_with_txids(manifest_file, export_csv)
    else:
        print("❌ Required files not found:")
        print(f"   • Manifest: {manifest_file}")
        print(f"   • Export CSV: {export_csv}")
