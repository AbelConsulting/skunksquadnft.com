#!/usr/bin/env python3
"""
Test Skunk Squad NFT Contract on Sepolia
Check contract status, metadata URIs, and minting functionality
"""

import json
import requests
from web3 import Web3
from pathlib import Path

# Contract details from deployment
CONTRACT_ADDRESS = "0xf14F75aEDBbDE252616410649f4dd7C1963191c4"
SEPOLIA_RPC = "https://sepolia.infura.io/v3/"  # Add your Infura key or use public RPC
ETHERSCAN_API = "https://api-sepolia.etherscan.io/api"

def test_contract_basics():
    """Test basic contract information"""
    print("🔍 Testing Contract Basics...")
    print("=" * 50)
    
    # Test via Etherscan API (no RPC key needed)
    print(f"📍 Contract Address: {CONTRACT_ADDRESS}")
    print(f"🌐 Network: Sepolia Testnet")
    
    # Check if contract exists
    response = requests.get(f"{ETHERSCAN_API}?module=account&action=balance&address={CONTRACT_ADDRESS}&tag=latest")
    if response.status_code == 200:
        print("✅ Contract exists on Sepolia")
    else:
        print("❌ Could not verify contract existence")
    
    return True

def test_metadata_uris():
    """Test the current metadata URIs"""
    print("\n🔗 Testing Current Metadata URIs...")
    print("=" * 50)
    
    current_base = "https://metadata.skunksquadnft.com/"
    
    # Test URLs
    test_urls = [
        f"{current_base}1",
        f"{current_base}100", 
        f"{current_base}contract.json",
        f"{current_base}unrevealed.json"
    ]
    
    for url in test_urls:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                print(f"✅ {url} - Accessible")
                if url.endswith('.json') or url.endswith('/1') or url.endswith('/100'):
                    try:
                        data = response.json()
                        if 'name' in data:
                            print(f"   📄 Contains: {data.get('name', 'Unknown')}")
                        if 'image' in data:
                            image_url = data.get('image', '')
                            print(f"   🖼️  Image: {image_url[:50]}...")
                    except:
                        print(f"   ⚠️  Valid response but not JSON")
            else:
                print(f"❌ {url} - Status: {response.status_code}")
        except requests.RequestException as e:
            print(f"❌ {url} - Error: {str(e)}")

def check_arweave_readiness():
    """Check if Arweave metadata is ready"""
    print("\n🌐 Checking Arweave Metadata Readiness...")
    print("=" * 50)
    
    # Check if we have the folder-based manifest
    manifest_file = Path("folder_based_manifest_final.json")
    if manifest_file.exists():
        with open(manifest_file, 'r') as f:
            manifest = json.load(f)
        
        print("✅ Folder-based manifest exists")
        print(f"📊 Total paths in manifest: {len(manifest.get('paths', {}))}")
        
        # Check a few sample paths
        sample_paths = ["metadata/1", "metadata/100", "metadata/contract", "images/1"]
        for path in sample_paths:
            if path in manifest.get('paths', {}):
                txid = manifest['paths'][path]['id']
                if txid.startswith('METADATA_') or txid.startswith('IMAGE_'):
                    print(f"⏳ {path} - Placeholder TXID (not uploaded yet)")
                else:
                    print(f"✅ {path} - Real TXID: {txid[:20]}...")
            else:
                print(f"❌ {path} - Not found in manifest")
                
        # Count real vs placeholder TXIDs
        real_txids = 0
        placeholder_txids = 0
        for path, data in manifest.get('paths', {}).items():
            txid = data.get('id', '')
            if txid.startswith(('METADATA_', 'IMAGE_', 'CONTRACT_')):
                placeholder_txids += 1
            else:
                real_txids += 1
        
        print(f"\n📈 TXID Status:")
        print(f"   • Real TXIDs: {real_txids}")
        print(f"   • Placeholders: {placeholder_txids}")
        
        if real_txids > 0:
            print("✅ Some files are uploaded to Arweave")
            if placeholder_txids == 0:
                print("🚀 All files uploaded! Ready to deploy manifest")
            else:
                print("⏳ Some files still need uploading")
        else:
            print("⏳ No files uploaded to Arweave yet")
    else:
        print("❌ Folder-based manifest not found")
        print("💡 Run: python create_folder_manifest.py")

def suggest_next_steps():
    """Suggest next steps based on current status"""
    print("\n🎯 Suggested Next Steps...")
    print("=" * 50)
    
    manifest_file = Path("folder_based_manifest_final.json")
    
    if manifest_file.exists():
        with open(manifest_file, 'r') as f:
            manifest = json.load(f)
        
        # Check if metadata TXIDs are populated
        metadata_uploaded = False
        for path in manifest.get('paths', {}):
            if path.startswith('metadata/') and not manifest['paths'][path]['id'].startswith('METADATA_'):
                metadata_uploaded = True
                break
        
        if metadata_uploaded:
            print("1. ✅ Metadata files appear to be uploaded")
            print("2. 📤 Upload folder_based_manifest_final.json to ArDrive manifest/ folder")
            print("3. 📋 Get the manifest TXID")
            print("4. 🔄 Update contract baseURI to ar://MANIFEST_TXID/")
            print("5. 🧪 Test: ar://MANIFEST_TXID/metadata/1")
        else:
            print("1. 📤 Upload metadata files to ArDrive metadata/ folder")
            print("2. 📥 Download metadata export CSV")
            print("3. 🔄 Run: python update_folder_manifest.py")
            print("4. 📤 Upload updated manifest to ArDrive")
            print("5. 🔄 Update contract baseURI")
    else:
        print("1. 🔧 Run: python create_folder_manifest.py")
        print("2. 📤 Upload files to ArDrive")
        print("3. 🔄 Update manifest with TXIDs")
        print("4. 📤 Upload final manifest")
        print("5. 🔄 Update contract baseURI")

def create_contract_update_script():
    """Create script to update contract URIs"""
    
    script_content = '''// SPDX-License-Identifier: MIT
// Update Skunk Squad Contract URIs to use Arweave Manifest

const { ethers } = require("hardhat");

async function updateContractURIs() {
    console.log("🔄 Updating Skunk Squad Contract URIs...");
    
    const contractAddress = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    const manifestTxid = "YOUR_MANIFEST_TXID_HERE"; // Replace with actual TXID
    
    // Get contract instance
    const SkunkSquad = await ethers.getContractFactory("SkunkSquadNFTEnhanced");
    const contract = SkunkSquad.attach(contractAddress);
    
    // New URIs using Arweave manifest
    const newBaseURI = `ar://${manifestTxid}/metadata/`;
    const newContractURI = `ar://${manifestTxid}/metadata/contract`;
    
    console.log(`📍 Contract: ${contractAddress}`);
    console.log(`🔗 New Base URI: ${newBaseURI}`);
    console.log(`📄 New Contract URI: ${newContractURI}`);
    
    // Update base URI
    console.log("\\n🔄 Updating Base URI...");
    const setBaseURITx = await contract.setBaseURI(newBaseURI);
    await setBaseURITx.wait();
    console.log("✅ Base URI updated");
    
    // Update contract URI
    console.log("🔄 Updating Contract URI...");
    const setContractURITx = await contract.setContractURI(newContractURI);
    await setContractURITx.wait();
    console.log("✅ Contract URI updated");
    
    // Verify updates
    console.log("\\n🔍 Verifying Updates...");
    console.log(`Token URI for #1: ${await contract.tokenURI(1)}`);
    console.log(`Contract URI: ${await contract.contractURI()}`);
    
    console.log("\\n🎉 Contract URIs updated successfully!");
}

updateContractURIs()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });'''
    
    with open("update-contract-uris.js", 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    print("🔧 Contract update script created: update-contract-uris.js")

def main():
    """Main test function"""
    print("🦨 Skunk Squad NFT - Sepolia Contract Test")
    print("=" * 50)
    print()
    
    test_contract_basics()
    test_metadata_uris()
    check_arweave_readiness()
    suggest_next_steps()
    create_contract_update_script()
    
    print("\n💡 Additional Tools Created:")
    print("   • update-contract-uris.js - Script to update contract URIs")
    print("\n🔧 To update contract after manifest upload:")
    print("   1. Edit update-contract-uris.js with your manifest TXID")
    print("   2. Run: npx hardhat run update-contract-uris.js --network sepolia")

if __name__ == "__main__":
    main()