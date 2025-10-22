#!/usr/bin/env python3
"""
Create Arweave Manifest for ArDrive Folder Structure
Matches the actual folder organization: metadata folder + manifest folder
"""

import json
from pathlib import Path

def create_folder_based_manifest():
    """
    Create manifest that matches your ArDrive folder structure:
    - skunksquadnft/
      - images/ (1.png - 10000.png) 
      - metadata/ (1.json - 10000.json + contract.json)
      - manifest/ (this manifest file)
    """
    
    print("🔄 Creating Arweave Manifest for Folder-Based Structure...")
    print("=" * 60)
    
    # Initialize manifest structure
    manifest = {
        "manifest": "arweave/paths",
        "version": "0.1.0",
        "index": {
            "path": "metadata/1"
        },
        "paths": {}
    }
    
    # Add metadata files with folder path
    print("📝 Adding metadata files with folder paths...")
    for i in range(1, 10001):
        manifest["paths"][f"metadata/{i}"] = {
            "id": f"METADATA_{i}_TXID_TO_BE_REPLACED"
        }
        
        if i % 1000 == 0:
            print(f"   ✅ Added {i} metadata paths...")
    
    # Add contract metadata
    manifest["paths"]["metadata/contract"] = {
        "id": "CONTRACT_METADATA_TXID_TO_BE_REPLACED"
    }
    
    # Add image files with folder path (optional - if you want images accessible via manifest)
    print("📝 Adding image files with folder paths...")
    for i in range(1, 10001):
        manifest["paths"][f"images/{i}"] = {
            "id": f"IMAGE_{i}_TXID_TO_BE_REPLACED"
        }
        
        if i % 1000 == 0:
            print(f"   ✅ Added {i} image paths...")
    
    # Save manifest
    manifest_file = "folder_based_manifest.json"
    with open(manifest_file, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n✅ Folder-based manifest created: {manifest_file}")
    print(f"📊 Total paths: {len(manifest['paths'])}")
    print(f"   • Metadata files: 10,001 (including contract.json)")
    print(f"   • Image files: 10,000")
    
    return manifest_file

def create_folder_update_script():
    """Create script to update manifest with folder-based transaction IDs"""
    
    script_content = '''#!/usr/bin/env python3
"""
Update Folder-Based Manifest with Transaction IDs
Handles the actual ArDrive folder structure
"""

import json
import csv
from pathlib import Path

def update_folder_manifest(manifest_file="folder_based_manifest.json", 
                          metadata_export="metadata_export.csv",
                          images_export="arweave_export_final.csv"):
    """Update manifest with transaction IDs from both exports"""
    
    print("🔄 Updating folder-based manifest with transaction IDs...")
    
    # Check files exist
    if not Path(manifest_file).exists():
        print(f"❌ Manifest file not found: {manifest_file}")
        return None
    
    # Load manifest
    with open(manifest_file, 'r') as f:
        manifest = json.load(f)
    
    updated_metadata = 0
    updated_images = 0
    
    # Update metadata transaction IDs
    if Path(metadata_export).exists():
        print(f"📄 Loading metadata transaction IDs from {metadata_export}")
        metadata_txids = {}
        
        with open(metadata_export, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                filename = row['File Name']
                txid = row['Data Transaction ID']
                
                if filename.endswith('.json'):
                    if filename == 'contract.json':
                        metadata_txids['metadata/contract'] = txid
                    else:
                        # Extract number from filename (e.g., "1.json" -> "1")
                        file_number = filename[:-5]
                        if file_number.isdigit():
                            metadata_txids[f'metadata/{file_number}'] = txid
        
        # Update manifest with metadata TXIDs
        for path in metadata_txids:
            if path in manifest["paths"]:
                manifest["paths"][path]["id"] = metadata_txids[path]
                updated_metadata += 1
                
        print(f"✅ Updated {updated_metadata} metadata transaction IDs")
    else:
        print(f"⚠️  Metadata export not found: {metadata_export}")
    
    # Update image transaction IDs
    if Path(images_export).exists():
        print(f"🖼️  Loading image transaction IDs from {images_export}")
        image_txids = {}
        
        with open(images_export, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                filename = row['File Name']
                txid = row['Data Transaction ID']
                
                if filename.endswith('.png'):
                    # Extract number from filename (e.g., "1.png" -> "1")
                    file_number = filename[:-4]
                    if file_number.isdigit():
                        image_txids[f'images/{file_number}'] = txid
        
        # Update manifest with image TXIDs
        for path in image_txids:
            if path in manifest["paths"]:
                manifest["paths"][path]["id"] = image_txids[path]
                updated_images += 1
                
        print(f"✅ Updated {updated_images} image transaction IDs")
    else:
        print(f"⚠️  Images export not found: {images_export}")
    
    # Save updated manifest
    output_file = "folder_based_manifest_final.json"
    with open(output_file, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    total_updated = updated_metadata + updated_images
    print(f"\\n✅ Updated {total_updated} total transaction IDs")
    print(f"   • Metadata: {updated_metadata}")
    print(f"   • Images: {updated_images}")
    print(f"💾 Final manifest saved: {output_file}")
    
    print("\\n🚀 Next Steps:")
    print("1. Upload folder_based_manifest_final.json to your manifest/ folder in ArDrive")
    print("2. Get the manifest transaction ID (MANIFEST_TXID)")
    print("3. Set smart contract base URI to: ar://MANIFEST_TXID/")
    print("\\n📝 Token URI Examples:")
    print("   • NFT #1: ar://MANIFEST_TXID/metadata/1")
    print("   • NFT #100: ar://MANIFEST_TXID/metadata/100")
    print("   • Contract: ar://MANIFEST_TXID/metadata/contract")
    print("   • Image #1: ar://MANIFEST_TXID/images/1 (if needed)")
    
    return output_file

if __name__ == "__main__":
    update_folder_manifest()
'''
    
    with open("update_folder_manifest.py", 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    print("🔧 Folder update script created: update_folder_manifest.py")

def main():
    """Main function"""
    print("🦨 Skunk Squad NFT - Folder-Based Manifest Generator")
    print("=" * 55)
    print()
    print("📁 Your ArDrive Structure:")
    print("   skunksquadnft/")
    print("   ├── images/ (1.png - 10000.png)")
    print("   ├── metadata/ (1.json - 10000.json + contract.json)")
    print("   └── manifest/ (folder for this manifest)")
    print()
    
    manifest_file = create_folder_based_manifest()
    create_folder_update_script()
    
    print("\n🎯 Next Steps:")
    print("   1. ✅ Folder-based manifest template created!")
    print("   2. 🔄 Run: python update_folder_manifest.py")
    print("   3. 📤 Upload folder_based_manifest_final.json to manifest/ folder")
    print("   4. 🔗 Use manifest TXID as base URI")
    
    print("\n📝 Smart Contract Integration:")
    print('   baseURI = "ar://MANIFEST_TXID/"')
    print('   tokenURI(1) = "ar://MANIFEST_TXID/metadata/1"')
    print('   contractURI() = "ar://MANIFEST_TXID/metadata/contract"')

if __name__ == "__main__":
    main()