# Mainnet Deployment Checklist

## ✅ Already Complete
- [x] Contract tested and working on Sepolia
- [x] All 10,000 metadata files uploaded to Arweave
- [x] All 10,000 images uploaded to Arweave
- [x] Manifest created and uploaded (TXID: zSIUpHcbgIPHN9zu38dyX-cm7-9yoXevvQTpyhMq_TA)
- [x] Test mints successful (4 NFTs minted)
- [x] Token URIs verified working

## 📋 Pre-Deployment Steps

### 1. Upload Missing Token #7538
- [ ] Upload metadata_arweave/7538.json to ArDrive
- [ ] Update manifest to include token #7538
- [ ] Upload new manifest to Arweave
- [ ] Update contract deployment script with new manifest TXID

### 2. Contract Configuration Review
Current settings in SkunkSquadNFTSimple.sol:
- Max Supply: 10,000 ✅
- Mint Price: 0.01 ETH (is this your final price?)
- Max Per Wallet: 20 (is this correct?)
- Max Per TX: 10 (is this correct?)

**Decide on:**
- [ ] Final mint price (0.01 ETH = ~$25-30 at current prices)
- [ ] Public mint start time/date
- [ ] Any whitelist/presale phase needed?

### 3. Financial Preparation
**ETH Needed:**
- Contract deployment: ~0.015-0.02 ETH ($40-60)
- Gas buffer for transactions: ~0.01 ETH
- **Total recommended: 0.03-0.05 ETH in deployer wallet**

**Current deployer balance:** Check your mainnet wallet
```
Address: 0x16Be43d7571Edf69cec8D6221044638d161aA994
```

### 4. Security Review
- [ ] Verify contract has withdraw function (✅ already included)
- [ ] Confirm owner address is correct
- [ ] Test that minting can be toggled on/off
- [ ] Verify price update function works
- [ ] Test owner mint function

### 5. Marketing/Community Prep
- [ ] Announce deployment date/time
- [ ] Prepare OpenSea collection metadata
- [ ] Set up Discord/Twitter announcements
- [ ] Prepare reveal strategy (if applicable)

## 🚀 Deployment Day Steps

### 1. Final Verification
```powershell
# Check mainnet RPC is configured
echo $env:MAINNET_RPC_URL

# Verify deployer has ETH
# Check on Etherscan: etherscan.io/address/0x16Be43d7571Edf69cec8D6221044638d161aA994
```

### 2. Deploy Contract
```powershell
# Deploy to mainnet
npx hardhat run scripts/deploy-simple.js --network mainnet

# Save the contract address from output
```

### 3. Verify on Etherscan
```powershell
# Verify the contract (makes it trusted)
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> "Skunk Squad" "SKUNK" "ar://zSIUpHcbgIPHN9zu38dyX-cm7-9yoXevvQTpyhMq_TA/"
```

### 4. Enable Minting
```powershell
# Turn on minting when ready
npx hardhat run scripts/enable-minting.js --network mainnet
```

### 5. Test Mint
```powershell
# Mint 1 NFT to verify everything works
npx hardhat run scripts/test-mint-simple.js --network mainnet
```

### 6. OpenSea Setup
- Go to opensea.io/account (connect wallet)
- Find your collection
- Click "Edit Collection"
- Add:
  - Collection banner
  - Collection avatar
  - Description
  - Social links (Twitter, Discord, Website)
  - Royalty percentage (suggested: 5-10%)
  - Payout address

## 📊 Post-Deployment

### Immediate
- [ ] Announce contract address to community
- [ ] Share Etherscan link
- [ ] Share OpenSea collection link
- [ ] Monitor first mints

### Within 24 Hours
- [ ] Verify metadata displays correctly on OpenSea
- [ ] Check that images load properly
- [ ] Respond to community questions
- [ ] Monitor contract for any issues

### Ongoing
- [ ] Track total mints
- [ ] Withdraw ETH from sales periodically
- [ ] Engage with community
- [ ] Monitor floor price/trading

## ⚠️ Important Notes

**GAS PRICES:** 
- Monitor gas prices on etherscan.io/gastracker
- Deploy during low gas times (weekends, late night UTC)
- Target: <30 gwei if possible

**NEVER:**
- Share your private key
- Deploy without testing on testnet first (✅ done)
- Enable minting before you're ready for public
- Forget to verify contract on Etherscan

**Contract Address Pattern:**
- Mainnet addresses start with 0x (same as testnet)
- Save it immediately after deployment
- Double-check you're on mainnet, not testnet

## 🔧 Quick Commands

### Deploy to Mainnet
```powershell
npx hardhat run scripts/deploy-simple.js --network mainnet
```

### Enable Minting
```powershell
npx hardhat run scripts/enable-minting.js --network mainnet
```

### Test Mint
```powershell
npx hardhat run scripts/test-mint-simple.js --network mainnet
```

### Check Contract State
Create a quick check script if needed.

## 💰 Revenue Calculation

If all 10,000 NFTs mint at 0.01 ETH:
- Total Revenue: 100 ETH
- At $3,000/ETH: $300,000
- At $2,500/ETH: $250,000

**Gas costs for minters:**
- ~70k gas per 2 NFTs
- At 30 gwei: ~0.002 ETH ($5-6)
- Very reasonable!

## 🎯 Recommended Timeline

**Week Before:**
- Upload token #7538
- Final contract review
- Announce deployment date

**Day Before:**
- Confirm ETH in wallet
- Test all scripts one more time on Sepolia
- Prepare announcements

**Deployment Day:**
1. Deploy contract (10 min)
2. Verify on Etherscan (5 min)
3. Test mint yourself (5 min)
4. Announce to community
5. Enable public minting

**Good luck! You've built something amazing! 🚀**
