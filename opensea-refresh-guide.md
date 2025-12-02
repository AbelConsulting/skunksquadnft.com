# 🔄 OpenSea Refresh Guide - SkunkSquad NFT

## Issue: NFTs Not Updating on OpenSea

### Possible Causes:
1. Metadata not accessible
2. Base URI not set on contract
3. Collection not revealed
4. OpenSea cache needs manual refresh
5. Incorrect contract address

---

## ✅ Your Contract Addresses (VERIFY WHICH IS CORRECT)

**From MAINNET_DEPLOYMENT_SUMMARY.md:**
- Contract: `0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF`
- Base URI: `ar://bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs/metadata/`

**From mainnet-production-final.json:**
- Contract: `0xf14F75aEDBbDE252616410649f4dd7C1963191c4`
- Base URI: `ar://0770a619-f2f1-4c59-9d1d-2fceb4a9294d/`

⚠️ **ACTION REQUIRED:** You need to determine which contract is the live one!

---

## 🔍 Step 1: Verify Your Contract

### Check on Etherscan:

1. **First Contract:**
   https://etherscan.io/address/0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF

2. **Second Contract:**
   https://etherscan.io/address/0xf14F75aEDBbDE252616410649f4dd7C1963191c4

**What to check:**
- Which one has NFTs minted?
- Which one is the contract owner (your wallet)?
- Which deployment is more recent?

---

## 🔍 Step 2: Check Metadata Accessibility

### Test if your metadata is accessible:

For **First Contract** (if using this one):
```
1. Open: https://viewblock.io/arweave/tx/bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs
2. Check if metadata loads
3. Try: ar://bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs/metadata/1.json
```

For **Second Contract** (if using this one):
```
1. Open: https://viewblock.io/arweave/tx/0770a619-f2f1-4c59-9d1d-2fceb4a9294d
2. Check if metadata loads
3. Try: ar://0770a619-f2f1-4c59-9d1d-2fceb4a9294d/1.json
```

---

## 🔍 Step 3: Check Contract State

### Use Etherscan Read Contract:

Go to your contract on Etherscan → **"Contract"** → **"Read Contract"**

Check these functions:

1. **`baseURI()`** or **`_baseURI()`**
   - Should return: `ar://[transaction-id]/metadata/` or similar
   - If empty or wrong, this is your problem!

2. **`revealed()`** (if your contract has this)
   - Should return: `true` to show real metadata
   - If `false`, NFTs show unrevealed metadata

3. **`tokenURI(1)`**
   - Test what URL token #1 returns
   - Should be: `ar://[tx-id]/metadata/1.json`

4. **`totalSupply()`**
   - How many NFTs have been minted?

---

## 🛠️ Step 4: Fix Base URI (If Needed)

If your contract's `baseURI` is not set or incorrect:

### Using Etherscan (Write Contract):

1. Go to: https://etherscan.io/address/[YOUR-CONTRACT]#writeContract
2. Click **"Connect to Web3"**
3. Connect with your deployer wallet
4. Find function **`setBaseURI`**
5. Enter the correct URI:
   ```
   ar://bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs/metadata/
   ```
   OR
   ```
   ar://0770a619-f2f1-4c59-9d1d-2fceb4a9294d/
   ```
   (Use whichever matches your Arweave upload)

6. Click **"Write"**
7. Approve transaction in MetaMask
8. Wait for confirmation

---

## 🛠️ Step 5: Reveal Collection (If Needed)

If your contract has a `reveal()` function and it's not revealed:

1. Go to: https://etherscan.io/address/[YOUR-CONTRACT]#writeContract
2. Connect wallet
3. Find **`reveal()`** function
4. Click **"Write"**
5. Approve transaction
6. Wait for confirmation

---

## 🔄 Step 6: Force OpenSea to Refresh

### Method 1: Individual NFT Refresh

For each NFT that needs updating:

1. Go to the NFT page on OpenSea:
   ```
   https://opensea.io/assets/ethereum/[CONTRACT-ADDRESS]/[TOKEN-ID]
   ```

2. Click the **"Refresh metadata"** button (circular arrow icon)
   - Usually in top right corner
   - May take 5-10 minutes to update

### Method 2: OpenSea API (Automated)

Use OpenSea's refresh endpoint:

```bash
# PowerShell script to refresh all NFTs
$CONTRACT = "0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF"  # Replace with your contract
$TOTAL_SUPPLY = 10  # How many are minted

for ($i = 0; $i -lt $TOTAL_SUPPLY; $i++) {
    $url = "https://api.opensea.io/api/v2/chain/ethereum/contract/$CONTRACT/nfts/$i/refresh"
    curl -X POST $url -H "accept: application/json"
    Write-Host "Refreshed NFT #$i"
    Start-Sleep -Seconds 2
}
```

Save as `refresh-opensea.ps1` and run:
```powershell
./refresh-opensea.ps1
```

### Method 3: Collection-Wide Refresh

Contact OpenSea support:
- Go to: https://support.opensea.io
- Submit a ticket
- Select "My NFT isn't showing up correctly"
- Provide your contract address
- They'll refresh the entire collection

---

## 🔄 Step 7: Wait for OpenSea Indexing

After refreshing metadata:

- **Initial indexing:** 5-10 minutes
- **Metadata updates:** Up to 30 minutes
- **Image updates:** Can take 1-2 hours
- **Collection stats:** May take 24 hours

**Be patient!** OpenSea caches heavily for performance.

---

## ✅ Verification Checklist

- [ ] Confirmed correct contract address
- [ ] Verified `baseURI` is set correctly on contract
- [ ] Checked `revealed` status (if applicable)
- [ ] Tested metadata loads from Arweave
- [ ] Refreshed NFTs on OpenSea
- [ ] Waited 30+ minutes for cache clear
- [ ] Images display correctly
- [ ] Traits show up properly

---

## 🚨 Common Issues & Fixes

### Issue: "This item is not available"
**Fix:** NFT hasn't been minted yet or contract address is wrong

### Issue: Shows placeholder/unrevealed image
**Fix:** Call `reveal()` function on contract

### Issue: Metadata shows but no image
**Fix:** Check image URL in metadata, ensure Arweave transaction is confirmed

### Issue: Old metadata still showing
**Fix:** Click "Refresh metadata" button, wait 30 mins, try again

### Issue: Traits not populating
**Fix:** Ensure metadata has proper "attributes" array, refresh on OpenSea

---

## 📝 Quick Test Script

Save as `test-metadata.js`:

```javascript
const fetch = require('node-fetch');

const CONTRACT = '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF'; // Your contract
const TOKEN_ID = 1;
const BASE_URI = 'ar://bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs/metadata/';

async function testMetadata() {
    const metadataUrl = `${BASE_URI}${TOKEN_ID}.json`;
    console.log('Testing metadata URL:', metadataUrl);
    
    // Convert ar:// to https://
    const httpUrl = metadataUrl.replace('ar://', 'https://arweave.net/');
    
    try {
        const response = await fetch(httpUrl);
        const data = await response.json();
        console.log('✅ Metadata loaded successfully:');
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Failed to load metadata:', error.message);
    }
}

testMetadata();
```

Run:
```powershell
node test-metadata.js
```

---

## 🎯 Next Steps

1. **Identify the correct contract** - Check both addresses on Etherscan
2. **Verify base URI** - Make sure it's set on the contract
3. **Test metadata** - Confirm it loads from Arweave
4. **Refresh on OpenSea** - Use the refresh button for each NFT
5. **Wait patiently** - Give it 30-60 minutes
6. **Check again** - Verify images and traits appear

---

## 📞 Need Help?

If still not working after trying all above:

1. Share which contract address is correct
2. Share what `tokenURI(1)` returns from Etherscan
3. Share screenshot of OpenSea NFT page
4. We can debug further from there

**Contract addresses to verify:**
- `0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF`
- `0xf14F75aEDBbDE252616410649f4dd7C1963191c4`
