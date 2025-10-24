# Etherscan Manual Verification Steps

## Contract Details
- **Contract Address:** `0xf14F75aEDBbDE252616410649f4dd7C1963191c4`
- **Network:** Sepolia Testnet
- **Compiler:** v0.8.20+commit.a1b79de6
- **Optimization:** Yes, 200 runs
- **License:** MIT

## Step-by-Step Instructions

### 1. Go to Contract Page
https://sepolia.etherscan.io/address/0xf14F75aEDBbDE252616410649f4dd7C1963191c4#code

### 2. Click "Verify and Publish"

### 3. Fill in Compiler Details
- **Compiler Type:** Select "Solidity (Single file)"
- **Compiler Version:** Select "v0.8.20+commit.a1b79de6"
- **Open Source License Type:** Select "3) MIT License (MIT)"

### 4. Click "Continue"

### 5. On the Verification Page:
- **Optimization:** Select "Yes"
- **Runs:** Enter `200`
- **Enter the Solidity Contract Code:** Paste the ENTIRE contents of `flattened-SkunkSquadNFT.sol`

### 6. **CRITICAL: Select the Contract Name**
After pasting the flattened code, Etherscan will show a dropdown with multiple contract names found:
- **You MUST select:** `SkunkSquadNFT` 
- (NOT Context, ERC721, Ownable, etc. - those are imported libraries)
- This is the actual contract that was deployed

### 7. **IMPORTANT: Constructor Arguments**

**Option A - Try AUTO-DETECT FIRST (Recommended):**
- **LEAVE THE CONSTRUCTOR ARGUMENTS FIELD EMPTY**
- Etherscan will try to auto-detect them from the deployment transaction
- This often works better than manual entry

**Option B - If Auto-detect Fails:**
Use the arguments from `verify-args.js` (enter them as shown in Etherscan's interface)

### 8. Complete the CAPTCHA and Click "Verify and Publish"

---

## If Verification Fails

### Alternative Method: Use Hardhat Verify Plugin

Install the new verification plugin:
```powershell
npm install --save-dev @nomicfoundation/hardhat-verify
```

Update `hardhat.config.js` to use the new plugin instead of the deprecated one.

Then run:
```powershell
npx hardhat verify --network sepolia --constructor-args verify-args.js 0xf14F75aEDBbDE252616410649f4dd7C1963191c4
```

---

## Constructor Parameters (for reference)
1. name: "SkunkSquad NFT"
2. symbol: "SKUNK"  
3. baseURI: "ar://bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs/metadata/"
4. contractURI: "ar://wpuACWSswfMtCiUp0Wv_cbpzdIm6kkbAHw_gZ_ZJ3Tc/contract.json"
5. unrevealedURI: "ar://j57ibv2QPVURMDTsJp271LSUfRdZtx_632Wy31fLT6E/unrevealed.json"
6. royaltyRecipient: "0x16Be43d7571Edf69cec8D6221044638d161aA994"
7. royaltyFee: 250
