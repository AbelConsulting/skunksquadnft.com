#!/usr/bin/env python3
"""
Generate Arweave Manifest for Skunk Squad NFT Collection
Creates a manifest.json file that maps paths to Arweave transaction IDs
for use with ar:// URLs in the smart contract.
"""

import json
import csv
from pathlib import Path

def create_arweave_manifest():
    """
    Create an Arweave manifest file that maps NFT metadata paths to transaction IDs.
    The manifest allows accessing files via ar://MANIFEST_TXID/path structure.
    """
    
    print("🔄 Generating Arweave Manifest for Skunk Squad NFT Collection...")
    print("=" * 60)
    
    # Initialize manifest structure
    manifest = {
        "manifest": "arweave/paths",
        "version": "0.1.0",
        "index": {
            "path": "index.html"
        },
        "paths": {}
    }
    
    # Add index file (optional - collection homepage)
    manifest["paths"]["index.html"] = {
        "id": "INDEX_TXID_TO_BE_REPLACED"
    }
    
    # Add contract metadata
    manifest["paths"]["contract.json"] = {
        "id": "CONTRACT_METADATA_TXID_TO_BE_REPLACED"
    }
    
    # Add unrevealed metadata
    manifest["paths"]["unrevealed.json"] = {
        "id": "UNREVEALED_METADATA_TXID_TO_BE_REPLACED"
    }
    
    # Add all NFT metadata files (1-10000)
    print("📝 Adding metadata paths for NFTs 1-10000...")
    for i in range(1, 10001):
        manifest["paths"][str(i)] = {
            "id": f"METADATA_{i}_TXID_TO_BE_REPLACED"
        }
        
        if i % 1000 == 0:
            print(f"   ✅ Added {i} metadata paths...")
    
    # Save manifest
    manifest_file = "arweave_manifest_complete.json"
    with open(manifest_file, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n✅ Manifest created: {manifest_file}")
    print(f"📊 Total paths: {len(manifest['paths'])}")
    print(f"   • Collection metadata: 3 files")
    print(f"   • NFT metadata: 10,000 files")
    
    # Create usage instructions
    create_usage_instructions()
    
    return manifest_file

def create_usage_instructions():
    """Create instructions for using the manifest"""
    
    instructions = {
        "title": "Arweave Manifest Usage Instructions",
        "description": "How to use the Skunk Squad NFT Arweave manifest",
        "steps": [
            {
                "step": 1,
                "title": "Upload Metadata to Arweave",
                "description": "Upload all metadata files in metadata_arweave/ folder to Arweave using ArDrive",
                "files_to_upload": [
                    "metadata_arweave/1.json to 10000.json",
                    "metadata/contract.json",
                    "metadata/unrevealed.json",
                    "index.html (optional collection homepage)"
                ]
            },
            {
                "step": 2,
                "title": "Update Manifest with Transaction IDs",
                "description": "Replace placeholder TXIDs in manifest with actual Arweave transaction IDs",
                "action": "Use the exported CSV file to map file names to transaction IDs"
            },
            {
                "step": 3,
                "title": "Upload Manifest to Arweave",
                "description": "Upload the completed manifest.json to Arweave",
                "result": "You'll get a MANIFEST_TXID"
            },
            {
                "step": 4,
                "title": "Update Smart Contract",
                "description": "Set the base URI in your smart contract",
                "base_uri": "ar://MANIFEST_TXID/",
                "example": "ar://abc123.../1 will resolve to metadata for NFT #1"
            }
        ],
        "benefits": [
            "Permanent, decentralized storage",
            "Clean ar:// URLs for metadata",
            "Single manifest transaction ID for entire collection",
            "Cost-effective access to all metadata files"
        ],
        "smart_contract_integration": {
            "baseURI": "ar://MANIFEST_TXID/",
            "tokenURI_function": "Returns ar://MANIFEST_TXID/{tokenId}",
            "contractURI": "ar://MANIFEST_TXID/contract.json"
        }
    }
    
    with open("arweave_manifest_instructions.json", 'w') as f:
        json.dump(instructions, f, indent=2)
    
    print("📋 Usage instructions created: arweave_manifest_instructions.json")

def create_manifest_update_script():
    """Create a script to update the manifest with real transaction IDs"""
    
    script_content = '''#!/usr/bin/env python3
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
'''
    
    with open("update_manifest.py", 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    print("🔧 Manifest update script created: update_manifest.py")

def main():
    """Main function"""
    print("🦨 Skunk Squad NFT - Arweave Manifest Generator")
    print("=" * 50)
    print()
    
    manifest_file = create_arweave_manifest()
    create_manifest_update_script()
    
    print("\n🎯 Next Steps:")
    print("   1. ✅ Manifest template created!")
    print("   2. 📤 Upload all metadata files to Arweave")
    print("   3. 🔄 Run: python update_manifest.py")
    print("   4. 📤 Upload final manifest to Arweave")
    print("   5. 🔗 Use manifest TXID as base URI in smart contract")
    print()
    print("💡 Benefits of using a manifest:")
    print("   • Single transaction ID for entire collection")
    print("   • Clean ar://MANIFEST_TXID/1 URLs") 
    print("   • Cost-effective permanent storage")
    print("   • Decentralized metadata hosting")

if __name__ == "__main__":
    main()