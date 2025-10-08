#!/usr/bin/env python3
"""
Automated ArDrive Transaction ID Extractor
"""

import subprocess
import json
import csv
import re
from pathlib import Path

def get_ardrive_drives():
    """Get list of available ArDrive drives"""
    try:
        result = subprocess.run(['ardrive', 'list-drives'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("📁 Available ArDrive drives:")
            print(result.stdout)
            return True
        else:
            print(f"❌ Error listing drives: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def extract_txids_from_drive(drive_id, folder_id=None):
    """Extract transaction IDs from a specific ArDrive"""
    print(f"🔍 Scanning ArDrive {drive_id} for uploaded images...")
    
    try:
        # Build command
        cmd = ['ardrive', 'list-files', '--drive-id', drive_id]
        if folder_id:
            cmd.extend(['--folder-id', folder_id])
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            # Parse the output to find image files and their transaction IDs
            output_lines = result.stdout.split('\n')
            
            txid_map = {}
            
            for line in output_lines:
                # Look for lines containing .png files
                if '.png' in line and any(char.isdigit() for char in line):
                    # Try to extract filename and transaction ID
                    # This regex looks for common patterns in ArDrive output
                    
                    # Look for files like "1.png", "2.png", etc.
                    filename_match = re.search(r'(\d+)\.png', line)
                    # Look for transaction IDs (43 character alphanumeric strings)
                    txid_match = re.search(r'\b[A-Za-z0-9_-]{43}\b', line)
                    
                    if filename_match and txid_match:
                        token_id = int(filename_match.group(1))
                        txid = txid_match.group(0)
                        txid_map[token_id] = txid
                        
                        if len(txid_map) <= 10:  # Show first 10 as examples
                            print(f"   📝 Found: NFT #{token_id} -> {txid[:20]}...")
            
            if txid_map:
                # Save the mapping
                output_file = "txid_mapping.csv"
                with open(output_file, 'w', newline='') as f:
                    writer = csv.writer(f)
                    writer.writerow(['token_id', 'image_txid'])
                    
                    for token_id in sorted(txid_map.keys()):
                        writer.writerow([token_id, txid_map[token_id]])
                
                print(f"\n✅ Found {len(txid_map)} transaction IDs!")
                print(f"💾 Saved to: {output_file}")
                
                if len(txid_map) == 10000:
                    print("🎉 All 10,000 NFT transaction IDs found!")
                else:
                    print(f"⚠️ Found {len(txid_map)}/10000 NFTs")
                    print("   You may need to check other folders or drives")
                
                return True
            else:
                print("❌ No transaction IDs found in the output")
                print("🔍 Raw output (first 10 lines):")
                for line in output_lines[:10]:
                    if line.strip():
                        print(f"   {line}")
                return False
        else:
            print(f"❌ Error listing files: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def interactive_scan():
    """Interactive process to find and extract transaction IDs"""
    print("🔍 Let's find your uploaded NFT images...")
    print()
    
    # First, list available drives
    if not get_ardrive_drives():
        return False
    
    print()
    drive_id = input("📝 Enter your ArDrive ID (the long string): ").strip()
    
    if not drive_id:
        print("❌ No drive ID provided")
        return False
    
    print()
    print("📁 Optional: If your images are in a specific folder, provide folder ID")
    folder_id = input("📝 Enter folder ID (or press Enter to scan entire drive): ").strip()
    
    if not folder_id:
        folder_id = None
    
    print()
    return extract_txids_from_drive(drive_id, folder_id)

def main():
    print("🦨 Skunk Squad NFT - ArDrive Transaction ID Extractor")
    print("=" * 60)
    print()
    
    success = interactive_scan()
    
    if success:
        print("\n🎯 Next Steps:")
        print("   1. ✅ Transaction IDs collected!")
        print("   2. 🔄 Run: python generate_arweave_metadata.py")
        print("   3. 📤 Upload metadata folder to ArDrive")
        print("   4. 🔗 Update smart contract with base URI")
    else:
        print("\n📋 Alternative Options:")
        print("   1. 📝 Use txid_mapping_template.csv for manual entry")
        print("   2. 🌐 Check ArDrive web interface for transaction IDs")
        print("   3. 📧 Contact support if you need help finding your uploads")

if __name__ == "__main__":
    main()