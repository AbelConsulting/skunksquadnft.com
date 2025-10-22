#!/usr/bin/env python3
"""
Skunk Squad NFT - ArDrive Helper
Helps validate and use Arweave transaction IDs from ArDrive
"""

import requests
import sys
import json

def validate_arweave_txid(txid):
    """Validate an Arweave transaction ID"""
    print(f"🦨 Skunk Squad NFT - Transaction Validator")
    print("=" * 50)
    
    # Clean the transaction ID
    clean_txid = txid.strip()
    print(f"🔍 Testing Transaction ID: {clean_txid}")
    
    # Check format
    if len(clean_txid) != 43:
        print(f"⚠️ Warning: Transaction ID length is {len(clean_txid)}, expected 43 characters")
    
    # Test transaction info endpoint
    tx_url = f"https://arweave.net/tx/{clean_txid}"
    print(f"📡 Checking transaction info: {tx_url}")
    
    try:
        response = requests.get(tx_url, timeout=10)
        if response.status_code == 200:
            print("✅ Transaction found in Arweave network!")
            tx_info = response.json()
            print(f"📊 Data size: {tx_info.get('data_size', 'Unknown')} bytes")
            print(f"🏷️  Content type: {tx_info.get('tags', {}).get('Content-Type', 'Unknown')}")
        else:
            print(f"❌ Transaction not found (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Error checking transaction: {e}")
        return False
    
    # Test data endpoint
    data_url = f"https://arweave.net/{clean_txid}"
    print(f"📡 Checking data availability: {data_url}")
    
    try:
        response = requests.get(data_url, timeout=10)
        if response.status_code == 200:
            print("✅ Data is accessible!")
            
            # Try to detect if it's JSON (manifest)
            try:
                data = response.json()
                if isinstance(data, dict) and 'manifest' in data:
                    print("🎯 This appears to be an Arweave manifest!")
                    print(f"📁 Manifest version: {data.get('manifest', 'unknown')}")
                    if 'paths' in data:
                        print(f"📄 Number of paths: {len(data['paths'])}")
                elif isinstance(data, dict):
                    print("📄 This appears to be JSON data")
                else:
                    print("📄 Data format: Unknown JSON structure")
            except:
                print("📄 Data format: Not JSON (possibly binary)")
                
            return True
        else:
            print(f"❌ Data not accessible (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Error accessing data: {e}")
        return False

def generate_contract_update_command(txid):
    """Generate the command to update the smart contract"""
    print("\n🚀 Contract Update Command")
    print("=" * 30)
    print("Run this command to update your smart contract base URI:")
    print(f"npx hardhat run scripts/update-contract-uri.js --network sepolia {txid}")
    print(f"\nThis will set the base URI to: ar://{txid}/metadata/")

def main():
    if len(sys.argv) != 2:
        print("🦨 Skunk Squad NFT - ArDrive Transaction Helper")
        print("=" * 50)
        print("Usage: python ardrive_helper.py <TRANSACTION_ID>")
        print("\nThis script will:")
        print("1. Validate the Arweave transaction ID")
        print("2. Check if the data is accessible")
        print("3. Generate the contract update command")
        print("\nExample:")
        print("python ardrive_helper.py CP7hoS7Dpke7RXxnTmosH6N3P3_-adXN2NFaIhw54do")
        sys.exit(1)
    
    txid = sys.argv[1]
    
    if validate_arweave_txid(txid):
        generate_contract_update_command(txid)
        print("\n✅ Transaction ID is valid and ready to use!")
    else:
        print("\n❌ Transaction ID validation failed!")
        print("\n💡 Tips:")
        print("1. Make sure the transaction has been confirmed on Arweave")
        print("2. Double-check the transaction ID from ArDrive")
        print("3. Wait a few minutes and try again (Arweave can be slow)")

if __name__ == "__main__":
    main()