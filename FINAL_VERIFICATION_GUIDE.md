# 🔐 Final Etherscan Verification Guide

## Contract Details
- **Address**: `0xf14F75aEDBbDE252616410649f4dd7C1963191c4`
- **Network**: Sepolia Testnet
- **Contract Name**: SkunkSquadNFT

---

## 📝 Manual Verification Steps

### Option 1: Single File Method (RECOMMENDED)

1. **Go to Etherscan Verification Page**
   ```
   https://sepolia.etherscan.io/verifyContract
   ```

2. **Step 1: Enter Contract Details**
   - Contract Address: `0xf14F75aEDBbDE252616410649f4dd7C1963191c4`
   - Compiler Type: **Solidity (Single file)**
   - Compiler Version: **v0.8.20+commit.a1b79de6**
   - Open Source License Type: **MIT License (MIT)**

3. **Step 2: Paste Contract Code**
   - Click "Continue"
   - **CRITICAL**: Copy and paste the ENTIRE contents of `flattened-SkunkSquadNFT.sol` (1749 lines)
   - File location: `c:\Users\Jewel\Documents\GitHub\skunksquadnft.com\flattened-SkunkSquadNFT.sol`

4. **Step 3: Contract Name Selection**
   - After pasting the code, Etherscan will show a dropdown with all found contract names
   - **SELECT**: `SkunkSquadNFT` (NOT ERC721, NOT Ownable, NOT any helper contracts)

5. **Step 4: Optimization Settings**
   - Optimization: **Yes**
   - Runs: **200**

6. **Step 5: Constructor Arguments (ABI-encoded)**
   - Paste this hex string (NO 0x prefix):
   ```
   00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000022000000000000000000000000016be43d7571edf69cec8d6221044638d161aa99400000000000000000000000000000000000000000000000000000000000000fa000000000000000000000000000000000000000000000000000000000000000e536b756e6b5371756164204e46540000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005534b554e4b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003a61723a2f2f62414679525a43536b5a6f2d7569564976694d66713441664e3665563532594e6148574c64314c32355a732f6d657461646174612f000000000000000000000000000000000000000000000000000000000000000000000000003e61723a2f2f777075414357537377664d74436955703057765f6362707a64496d366b6b624148775f675a5f5a4a3354632f636f6e74726163742e6a736f6e0000000000000000000000000000000000000000000000000000000000000000004061723a2f2f6a35376962763251505655524d4444734a703237314c53556652645a74785f36333257793331664c5436452f756e72657665616c65642e6a736f6e
   ```

7. **Complete CAPTCHA and Submit**

---

## 🎯 What These Constructor Arguments Mean

The hex string above decodes to these 7 parameters:

1. **Name**: "SkunkSquad NFT"
2. **Symbol**: "SKUNK"
3. **Base URI**: "ar://bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs/metadata/"
4. **Contract URI**: "ar://wpuACWSswfMtCiUp0Wv_cbpzdIm6kkbAHw_gZ_ZJ3Tc/contract.json"
5. **Unrevealed URI**: "ar://j57ibv2QPVURMDTsJp271LSUfRdZtx_632Wy31fLT6E/unrevealed.json"
6. **Royalty Recipient**: 0x16Be43d7571Edf69cec8D6221044638d161aA994
7. **Royalty Fee**: 250 (2.5%)

---

## ⚠️ Common Issues & Solutions

### Issue: "Unable to find matching Contract Bytecode"
**Solution**: Make sure you selected `SkunkSquadNFT` from the contract name dropdown (not ERC721 or other helper contracts).

### Issue: "Invalid constructor arguments"
**Solution**: 
- Make sure you're NOT including the `0x` prefix in the constructor arguments hex
- Make sure you're pasting the EXACT hex string above (no extra spaces or line breaks)

### Issue: "ParserError: Source not found"
**Solution**: Make sure you're pasting the ENTIRE flattened contract file content (all 1749 lines).

---

## ✅ After Verification

Once verified, your contract will be viewable at:
```
https://sepolia.etherscan.io/address/0xf14F75aEDBbDE252616410649f4dd7C1963191c4#code
```

The contract source code, ABI, and all functions will be publicly visible and verified.

---

## 🚨 Why Automated Verification Failed

All automated verification methods (hardhat-etherscan plugin, hardhat-verify, API scripts) are currently failing because:

1. **Etherscan API V1 Deprecated**: The old API endpoint is no longer supported
2. **API V2 Not Fully Available**: The new V2 API is not yet fully functional for Sepolia testnet
3. **Plugin Transition Period**: Hardhat ecosystem is migrating from hardhat-etherscan to hardhat-verify

**Manual verification via web interface is currently the ONLY reliable method.**

---

## 📄 Files Reference

- **Flattened Contract**: `flattened-SkunkSquadNFT.sol` (1749 lines, all imports inlined)
- **Deployment Record**: `deployments/sepolia-deployment.json`
- **Original Contract**: `contracts/SkunkSquadNFT.sol`
