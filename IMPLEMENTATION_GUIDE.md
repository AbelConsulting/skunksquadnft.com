# SkunkSquad NFT - ABI Implementation Guide

## Overview
This guide shows you how to implement the extracted ABI into your website for full NFT functionality.

---

## 📋 What We Have

### ✅ Generated Files
- `abi_sepolia.json` - Compact ABI for web integration
- `abi_SkunkSquadNFT_sepolia.json` - Full formatted ABI
- Your contract address: `0xf14F75aEDBbDE252616410649f4dd7C1963191c4` (Sepolia)

### ✅ Contract Functions Available
- **mintNFT(quantity)** - Mint NFTs (payable: 0.01 ETH each)
- **totalSupply()** - Get current minted count
- **tokenURI(tokenId)** - Get metadata URI for token
- **reveal()** - Owner function to reveal metadata
- **setBaseURI(uri)** - Owner function to update base URI
- **withdraw()** - Owner function to withdraw funds
- Plus all standard ERC721 functions

---

## 🔧 Implementation Steps

### Step 1: Update Contract Configuration

Open `src/js/wallet.js` and update these values:

```javascript
// Contract configuration
contractAddress: '0xf14F75aEDBbDE252616410649f4dd7C1963191c4', // Sepolia testnet
```

### Step 2: Replace Contract ABI

Replace the `contractABI` array in `wallet.js` with the full ABI from `abi_sepolia.json`.

**Current (Limited ABI):**
```javascript
const contractABI = [
    // Only has publicMint, MINT_PRICE, totalMinted, publicMintActive
];
```

**New (Full ABI):**
```javascript
const contractABI = [
    // Full 32 functions from abi_sepolia.json
    // Includes: mintNFT, totalSupply, tokenURI, reveal, withdraw, etc.
];
```

### Step 3: Update Mint Function

Your contract uses `mintNFT()` not `publicMint()`. Update the method calls:

**Change from:**
```javascript
await this.contract.methods.publicMint(quantity).send({...})
```

**Change to:**
```javascript
await this.contract.methods.mintNFT(quantity).send({...})
```

### Step 4: Update Price Constant

Your contract has a fixed price of 0.01 ETH (not dynamic pricing).

**Change from:**
```javascript
const price = await this.contract.methods.getCurrentSmartPrice().call();
```

**Change to:**
```javascript
const price = this.web3.utils.toWei('0.01', 'ether'); // Fixed price from contract
```

---

## 💻 Quick Implementation Script

I've prepared an automated script to update your wallet.js:

```bash
node update_wallet_integration.js
```

This will:
1. ✅ Read the extracted ABI from `abi_sepolia.json`
2. ✅ Update `src/js/wallet.js` with correct contract address
3. ✅ Replace the ABI with full contract ABI
4. ✅ Fix function names (publicMint → mintNFT)
5. ✅ Update pricing logic (0.01 ETH fixed)
6. ✅ Create backup of original file

---

## 🧪 Testing Your Integration

### Test on Sepolia Testnet

1. **Get Sepolia ETH:**
   - Visit: https://sepoliafaucet.com/
   - Or: https://faucet.quicknode.com/ethereum/sepolia

2. **Connect MetaMask:**
   - Switch to Sepolia network
   - Connect wallet on your site

3. **Test Mint:**
   - Click "Connect Wallet & Mint"
   - Approve transaction (0.01 ETH + gas)
   - Verify on Etherscan: https://sepolia.etherscan.io/address/0xf14F75aEDBbDE252616410649f4dd7C1963191c4

4. **Check Your NFT:**
   - View in MetaMask (NFTs tab)
   - Check on OpenSea testnet
   - Verify metadata loads correctly

---

## 🔄 Network Switching

### Sepolia Testnet (Current)
```javascript
contractAddress: '0xf14F75aEDBbDE252616410649f4dd7C1963191c4'
chainId: 11155111
rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY'
```

### Mainnet (When Ready)
```javascript
contractAddress: '0x[YOUR_MAINNET_ADDRESS]'
chainId: 1
rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY'
```

---

## 📊 Available Contract Methods

### Read Functions (No gas cost)
- `totalSupply()` - Get total minted count
- `balanceOf(address)` - Get NFT balance of address
- `ownerOf(tokenId)` - Get owner of specific token
- `tokenURI(tokenId)` - Get metadata URI
- `revealed()` - Check if metadata is revealed
- `MAX_SUPPLY()` - Returns 10,000
- `PRICE()` - Returns 0.01 ETH (in wei)

### Write Functions (Requires gas)
- `mintNFT(quantity)` - Mint NFTs (payable: 0.01 ETH each)
- `approve(to, tokenId)` - Approve transfer
- `setApprovalForAll(operator, approved)` - Set operator approval
- `transferFrom(from, to, tokenId)` - Transfer NFT
- `safeTransferFrom(from, to, tokenId)` - Safe transfer NFT

### Owner Only Functions
- `reveal()` - Reveal metadata
- `setBaseURI(uri)` - Update base URI
- `setUnrevealedURI(uri)` - Update unrevealed URI
- `setContractURI(uri)` - Update contract metadata
- `setRoyaltyInfo(recipient, fee)` - Update royalties
- `withdraw()` - Withdraw contract balance

---

## 🎨 UI Integration Examples

### Display Total Minted
```javascript
async function updateMintedCount() {
    const totalSupply = await contract.methods.totalSupply().call();
    document.getElementById('minted-count').textContent = totalSupply;
    document.getElementById('remaining-count').textContent = 10000 - totalSupply;
}
```

### Check User's NFTs
```javascript
async function getUserNFTs(address) {
    const balance = await contract.methods.balanceOf(address).call();
    console.log(`User owns ${balance} NFTs`);
    return balance;
}
```

### Get NFT Metadata
```javascript
async function getNFTMetadata(tokenId) {
    const uri = await contract.methods.tokenURI(tokenId).call();
    const response = await fetch(uri);
    const metadata = await response.json();
    return metadata;
}
```

---

## 🐛 Troubleshooting

### Error: "Contract source code not verified"
- Your contract IS verified on Sepolia
- View at: https://sepolia.etherscan.io/address/0xf14F75aEDBbDE252616410649f4dd7C1963191c4#code
- Use the local ABI extraction method (already done!)

### Error: "Insufficient funds"
- Get Sepolia testnet ETH from faucets
- Need 0.01 ETH per NFT + gas fees (~0.001 ETH)

### Error: "Wrong network"
- Make sure MetaMask is on Sepolia testnet
- Network ID: 11155111
- Use the network switch functions in wallet.js

### Error: "Transaction failed"
- Check if contract has enough supply (10,000 max)
- Verify correct amount of ETH sent
- Check gas limits are sufficient

---

## 📝 Next Steps

1. ✅ Run the update script: `node update_wallet_integration.js`
2. ✅ Test on Sepolia testnet with test ETH
3. ✅ Verify all functions work correctly
4. ✅ Update UI to show real-time data
5. ✅ Deploy to mainnet when ready

---

## 🔗 Useful Links

### Sepolia Testnet
- **Contract:** https://sepolia.etherscan.io/address/0xf14F75aEDBbDE252616410649f4dd7C1963191c4
- **Faucet 1:** https://sepoliafaucet.com/
- **Faucet 2:** https://faucet.quicknode.com/ethereum/sepolia
- **OpenSea:** https://testnets.opensea.io/

### Mainnet (Future)
- **Etherscan:** https://etherscan.io/
- **OpenSea:** https://opensea.io/

---

## 💡 Pro Tips

1. **Always test on Sepolia first** before mainnet deployment
2. **Keep backups** of your wallet.js before modifications
3. **Monitor gas prices** for optimal minting costs
4. **Use event listeners** to update UI in real-time
5. **Cache contract data** to reduce RPC calls

---

## 🎯 Ready to Deploy?

Run this command to automatically update your integration:

```bash
node update_wallet_integration.js
```

Then test thoroughly on Sepolia before going live! 🚀
