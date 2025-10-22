#!/usr/bin/env python3
"""
Get Arweave Transaction ID from ArDrive File
Extract the actual Arweave TXID from an ArDrive file ID
"""

import requests
import json

def get_ardrive_file_info(file_id):
    """Get file information from ArDrive API"""
    
    print(f"🔍 Looking up ArDrive file: {file_id}")
    print("=" * 60)
    
    try:
        # ArDrive API endpoint for file info
        api_url = f"https://ardrive.io/file/{file_id}"
        
        print(f"📡 Checking ArDrive API...")
        
        # Try to get file metadata from ArDrive
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(api_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print("✅ ArDrive file found!")
            
            # Try to extract transaction ID from the response
            # ArDrive typically stores the actual Arweave TXID
            try:
                # Look for common patterns in the response
                text = response.text
                
                # Look for Arweave transaction ID patterns (43 characters, base64url)
                import re
                txid_pattern = r'[A-Za-z0-9_-]{43}'
                potential_txids = re.findall(txid_pattern, text)
                
                if potential_txids:
                    print(f"🎯 Found potential transaction IDs:")
                    for i, txid in enumerate(set(potential_txids[:5])):  # Show up to 5 unique
                        print(f"   {i+1}. {txid}")
                    
                    # The data transaction ID is usually the most relevant
                    return potential_txids[0] if potential_txids else None
                else:
                    print("❌ No transaction IDs found in response")
                    
            except Exception as e:
                print(f"❌ Error parsing response: {e}")
                
        else:
            print(f"❌ ArDrive file not accessible (Status: {response.status_code})")
            
    except Exception as e:
        print(f"❌ Error accessing ArDrive: {e}")
    
    return None

def check_arweave_txid(txid):
    """Verify an Arweave transaction ID"""
    
    print(f"\n🔍 Verifying Arweave transaction: {txid}")
    
    try:
        # Check if accessible via Arweave
        arweave_url = f"https://arweave.net/{txid}"
        response = requests.get(arweave_url, timeout=10)
        
        if response.status_code == 200:
            print("✅ Transaction accessible on Arweave!")
            
            # Check if it's JSON (manifest)
            try:
                data = response.json()
                if isinstance(data, dict) and 'manifest' in data:
                    print("🎯 This is an Arweave manifest!")
                    paths = data.get('paths', {})
                    print(f"   Contains {len(paths)} paths")
                    
                    # Check for metadata paths
                    metadata_paths = [p for p in paths.keys() if 'metadata' in p]
                    if metadata_paths:
                        print(f"   ✅ Contains {len(metadata_paths)} metadata paths")
                        print(f"   💡 Use as base URI: ar://{txid}/")
                        return True
                    
            except:
                print("📄 Not a JSON manifest, might be other content")
                
        else:
            print(f"❌ Transaction not accessible (Status: {response.status_code})")
            
    except Exception as e:
        print(f"❌ Error checking Arweave: {e}")
    
    return False

def main():
    """Main function"""
    
    print("🦨 Skunk Squad NFT - ArDrive to Arweave Transaction Finder")
    print("=" * 60)
    print()
    
    # Extract file ID from the URL you provided
    file_id = "e93d706d-678e-4d3a-bb85-028ab83dee6c"
    
    print(f"🎯 Target ArDrive File ID: {file_id}")
    print("📍 From URL: https://app.ardrive.io/#/file/e93d706d-678e-4d3a-bb85-028ab83dee6c/view")
    print()
    
    # Try to get the transaction ID
    txid = get_ardrive_file_info(file_id)
    
    if txid:
        print(f"\n🎉 Found potential transaction ID: {txid}")
        
        # Verify it works on Arweave
        if check_arweave_txid(txid):
            print(f"\n✅ SUCCESS! Your manifest transaction ID is: {txid}")
            print(f"🔗 Direct link: https://arweave.net/{txid}")
            print(f"💡 Use as base URI in smart contract: ar://{txid}/")
            
            # Show how to update the contract
            print(f"\n📝 To update your smart contract:")
            print(f"   setBaseURI(\"ar://{txid}/metadata/\")")
            
        else:
            print(f"\n⚠️  Transaction ID found but not accessible or not a manifest")
            
    else:
        print("\n❌ Could not extract transaction ID from ArDrive")
        print("\n💡 Alternative methods:")
        print("1. Check your ArDrive export CSV for the manifest file")
        print("2. Look in ArDrive web interface for 'Data Transaction ID'")
        print("3. Check your upload confirmation emails")

if __name__ == "__main__":
    main()