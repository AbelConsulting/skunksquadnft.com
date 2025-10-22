#!/usr/bin/env python3
"""
Verify Arweave Transaction ID
Check if the provided TXID is valid and contains the expected manifest data
"""

import requests
import json
import sys

def check_arweave_transaction(txid):
    """Check an Arweave transaction ID and its contents"""
    
    print(f"🔍 Checking Arweave Transaction: {txid}")
    print("=" * 60)
    
    # Clean the TXID (remove spaces, convert to uppercase if needed)
    clean_txid = txid.replace(" ", "").strip()
    print(f"Cleaned TXID: {clean_txid}")
    
    try:
        # Check transaction info
        info_url = f"https://arweave.net/tx/{clean_txid}"
        print(f"📡 Fetching transaction info from: {info_url}")
        
        response = requests.get(info_url, timeout=10)
        if response.status_code == 200:
            tx_info = response.json()
            
            print("✅ Transaction found!")
            print(f"   Block Height: {tx_info.get('block_height', 'Pending')}")
            print(f"   Data Size: {tx_info.get('data_size', 0)} bytes")
            print(f"   Content Type: {tx_info.get('tags', {}).get('Content-Type', 'Unknown')}")
            
            # Check tags for more info
            tags = tx_info.get('tags', [])
            for tag in tags:
                if isinstance(tag, dict):
                    name = tag.get('name', '')
                    value = tag.get('value', '')
                    if name and value:
                        print(f"   Tag - {name}: {value}")
        else:
            print(f"❌ Transaction not found (Status: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ Error fetching transaction info: {e}")
        return False
    
    try:
        # Try to fetch the actual data
        data_url = f"https://arweave.net/{clean_txid}"
        print(f"\n📄 Fetching data from: {data_url}")
        
        data_response = requests.get(data_url, timeout=10)
        if data_response.status_code == 200:
            print("✅ Data accessible!")
            
            # Try to parse as JSON (for manifest files)
            try:
                data = data_response.json()
                print("📋 Content appears to be JSON")
                
                # Check if it looks like an Arweave manifest
                if isinstance(data, dict) and 'manifest' in data:
                    print("🎯 This appears to be an Arweave manifest!")
                    print(f"   Manifest Type: {data.get('manifest', 'Unknown')}")
                    print(f"   Version: {data.get('version', 'Unknown')}")
                    
                    paths = data.get('paths', {})
                    print(f"   Total Paths: {len(paths)}")
                    
                    # Show some example paths
                    if paths:
                        print("   Sample paths:")
                        count = 0
                        for path, info in paths.items():
                            if count < 5:
                                txid_ref = info.get('id', 'No ID')[:20] + "..." if len(info.get('id', '')) > 20 else info.get('id', 'No ID')
                                print(f"     {path} -> {txid_ref}")
                                count += 1
                        
                        if len(paths) > 5:
                            print(f"     ... and {len(paths) - 5} more paths")
                    
                    # Check for metadata paths specifically
                    metadata_paths = [p for p in paths.keys() if p.startswith('metadata/')]
                    image_paths = [p for p in paths.keys() if p.startswith('images/')]
                    
                    print(f"   Metadata paths: {len(metadata_paths)}")
                    print(f"   Image paths: {len(image_paths)}")
                    
                    if metadata_paths:
                        print("✅ Contains metadata paths - suitable for NFT base URI")
                        print(f"💡 Use as base URI: ar://{clean_txid}/")
                        print(f"💡 Token URI example: ar://{clean_txid}/metadata/1")
                    
                    return True
                    
                else:
                    print("📄 JSON data but not a manifest format")
                    # Show first few keys if it's a dict
                    if isinstance(data, dict):
                        keys = list(data.keys())[:5]
                        print(f"   Top-level keys: {keys}")
                    
            except json.JSONDecodeError:
                # Not JSON, check if it's other content
                content = data_response.text[:500]  # First 500 characters
                print("📄 Content is not JSON")
                print(f"   Content preview: {content[:100]}...")
                
                # Check if it might be an image or other file
                content_type = data_response.headers.get('content-type', '')
                if content_type:
                    print(f"   Content Type: {content_type}")
                
        else:
            print(f"❌ Could not fetch data (Status: {data_response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return False
    
    print("\n🎯 SUMMARY:")
    print(f"   TXID: {clean_txid}")
    print(f"   Accessible: ✅")
    print(f"   Type: {'Arweave Manifest' if 'manifest' in locals() else 'Other content'}")
    
    return True

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python check_arweave_tx.py <TRANSACTION_ID>")
        return
    
    txid = sys.argv[1]
    
    print("🦨 Skunk Squad NFT - Arweave Transaction Checker")
    print("=" * 50)
    print()
    
    result = check_arweave_transaction(txid)
    
    if result:
        print("\n🎉 Transaction verification complete!")
    else:
        print("\n❌ Transaction verification failed!")

if __name__ == "__main__":
    main()