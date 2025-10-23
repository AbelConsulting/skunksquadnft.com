# Deploying from a New Wallet

## Steps to Switch Deployer Wallet

### 1. Create/Get Your New Wallet
- Use MetaMask, Ledger, or any Ethereum wallet
- **SAVE YOUR PRIVATE KEY SECURELY**
- Never share it with anyone

### 2. Update .env File
Open your `.env` file and update the PRIVATE_KEY:

```env
# Old wallet (current)
# PRIVATE_KEY=0x... (old key)

# New wallet (new deployer)
PRIVATE_KEY=0x... (your new wallet's private key)

# Make sure these are set too
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

### 3. Fund the New Wallet
Send ETH to your new wallet address:
- **Minimum:** 0.03 ETH
- **Recommended:** 0.05-0.1 ETH (for buffer)

Check gas prices first: https://etherscan.io/gastracker

### 4. Test on Sepolia First (Recommended)
```powershell
# Deploy with new wallet on testnet first
npx hardhat run scripts/deploy-simple.js --network sepolia

# This verifies:
# - Private key works
# - Wallet has permissions
# - Everything deploys correctly
```

### 5. Deploy to Mainnet
```powershell
# When ready, deploy to mainnet
npx hardhat run scripts/deploy-simple.js --network mainnet
```

## Important Notes

### Current Deployer
```
Address: 0x16Be43d7571Edf69cec8D6221044638d161aA994
Network: Sepolia (testnet)
```

### New Deployer
```
Address: [Your new wallet address]
Network: Mainnet
```

### Security Best Practices
1. ✅ **Never commit .env file to git** (already in .gitignore)
2. ✅ **Store private key in password manager**
3. ✅ **Use hardware wallet for large amounts** (Ledger/Trezor)
4. ✅ **Test on Sepolia first with new wallet**
5. ✅ **Keep backup of private key in secure location**

### What About the Sepolia Contract?
- The Sepolia contract (`0x384062E20B046B738D5b4A158E0D9541437c7a9A`) stays as-is
- It's just for testing
- Mainnet will be a completely new contract with new address
- **They are separate and don't affect each other**

## Quick Start Commands

### Check New Wallet Address
```powershell
# This will show what address will deploy
node -e "const ethers = require('ethers'); const wallet = new ethers.Wallet(process.env.PRIVATE_KEY); console.log('Deployer:', wallet.address);"
```

### Check Balance
Go to: `https://etherscan.io/address/YOUR_NEW_ADDRESS`

### Deploy
```powershell
npx hardhat run scripts/deploy-simple.js --network mainnet
```

## Need a New Wallet?

### MetaMask (Easiest)
1. Open MetaMask
2. Click account icon → "Add account or hardware wallet"
3. Create new account
4. Click ⋮ → Account Details → Show private key
5. Copy private key to .env

### Or Generate Fresh Wallet (Advanced)
```javascript
// Run this in node console
const ethers = require('ethers');
const wallet = ethers.Wallet.createRandom();
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
// SAVE THESE SECURELY!
```

Ready to set up your new deployer wallet?
