# Etherscan Verification Guide - Standard JSON Method

## The Problem
Etherscan can't compile contracts with imports in "Single File" mode.

## The Solution
Use **"Solidity (Standard-Json-Input)"** verification method instead.

## Step-by-Step Instructions

### 1. Go to Etherscan
https://sepolia.etherscan.io/address/0x384062E20B046B738D5b4A158E0D9541437c7a9A#code

### 2. Click "Verify and Publish"

### 3. Select These Options:
- **Compiler Type:** Solidity (Standard-Json-Input)
- **Compiler Version:** v0.8.20+commit.a1b79de6
- **Open Source License:** MIT

### 4. Click Continue

### 5. Upload Standard JSON File
Run this command to generate the JSON file:
```powershell
npx hardhat run scripts/generate-standard-json.js
```

This will create `standard-input.json` - upload that file to Etherscan.

### 6. Paste Constructor Arguments
```
0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000b536b756e6b2053717561640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005534b554e4b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003161723a2f2f7a53495570486362674950484e397a7533386479582d636d372d39796f58657676515470796871684d715f54412f000000000000000000000000000000
```

### 7. Click "Verify and Publish"

Done! ✅
