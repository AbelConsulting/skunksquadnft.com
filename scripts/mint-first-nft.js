// Mint First NFT to Trigger OpenSea Indexing
// This script will mint NFT #1 to get your collection on OpenSea

const { ethers } = require("hardhat");

async function main() {
    console.log('🦨 Minting First NFT for OpenSea Indexing...\n');
    
    const CONTRACT_ADDRESS = '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF';
    const MINT_PRICE = ethers.utils.parseEther('0.01');
    
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log('Minting from:', deployer.address);
    
    // Get contract
    const SkunkSquadNFT = await ethers.getContractFactory('SkunkSquadNFT');
    const contract = SkunkSquadNFT.attach(CONTRACT_ADDRESS);
    
    // Check current supply
    const currentSupply = await contract.totalSupply();
    console.log('Current supply:', currentSupply.toString());
    
    // Check balance
    const balance = await deployer.getBalance();
    console.log('Wallet balance:', ethers.utils.formatEther(balance), 'ETH\n');
    
    // Mint 1 NFT
    console.log('Minting 1 NFT...');
    const tx = await contract.mintNFT(1, {
        value: MINT_PRICE,
        gasLimit: 200000
    });
    
    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...\n');
    
    const receipt = await tx.wait();
    console.log('✅ Minted Successfully!');
    console.log('Block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    
    // Get new supply
    const newSupply = await contract.totalSupply();
    console.log('\nNew total supply:', newSupply.toString());
    console.log('Your token ID:', newSupply.toString());
    
    console.log('\n📊 Next Steps:');
    console.log('1. Wait 5-10 minutes for OpenSea to index');
    console.log('2. Visit: https://opensea.io/assets/ethereum/' + CONTRACT_ADDRESS + '/' + newSupply.toString());
    console.log('3. View collection: https://opensea.io/assets/ethereum/' + CONTRACT_ADDRESS);
    console.log('4. Claim and customize in OpenSea Studio: https://opensea.io/studio');
    console.log('\n🎉 Your collection will appear on OpenSea shortly!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
