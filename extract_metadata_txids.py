import csv
import json

print("🦨 Extracting Metadata Transaction IDs from ArDrive Export...")
print("="*60)

# Read the CSV export
metadata_txids = {}
with open('latest_export.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        filename = row.get('File Name', '')
        parent_folder_name = row.get('Parent Folder Name', '')
        data_txid = row.get('Data Transaction ID', '')
        
        # Check if this is a metadata JSON file
        if parent_folder_name == 'metadata' and filename.endswith('.json'):
            # Extract token ID from filename
            token_id = filename.replace('.json', '')
            if token_id.isdigit():
                metadata_txids[int(token_id)] = data_txid

print(f"✅ Found {len(metadata_txids)} metadata files")

if len(metadata_txids) > 0:
    print(f"   Range: {min(metadata_txids.keys())} to {max(metadata_txids.keys())}")
    print(f"\n📄 Sample mappings:")
    for i in sorted(metadata_txids.keys())[:5]:
        print(f"   {i}.json → {metadata_txids[i]}")
        print(f"   URL: https://arweave.net/{metadata_txids[i]}")
    
    # Build manifest
    manifest = {
        "manifest": "arweave/paths",
        "version": "0.2.0",
        "index": {
            "path": str(min(metadata_txids.keys()))
        },
        "paths": {}
    }
    
    for token_id in sorted(metadata_txids.keys()):
        manifest["paths"][str(token_id)] = {
            "id": metadata_txids[token_id]
        }
    
    # Save manifest
    output_file = 'nft_manifest_ready.json'
    with open(output_file, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n✅ Created manifest: {output_file}")
    print(f"   Total paths: {len(manifest['paths'])}")
    print(f"\n📋 NEXT STEPS:")
    print(f"   1. Upload {output_file} to Arweave/ArDrive")
    print(f"   2. Get the transaction ID of the uploaded manifest")
    print(f"   3. Use that TXID as your base URI: ar://MANIFEST_TXID/")
    print(f"   4. The contract will then access: ar://MANIFEST_TXID/1, ar://MANIFEST_TXID/2, etc.")
    
else:
    print("❌ No metadata files found in export!")
