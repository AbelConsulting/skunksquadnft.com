# 🌊 OpenSea Collection Setup Guide

## 📋 Your Contract Information

**Contract Address:** `0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF`  
**Network:** Ethereum Mainnet  
**Contract Standard:** ERC-721 with ERC-2981 (Royalties)

---

## 🚀 Step 1: Import Your Collection to OpenSea

### Method 1: Automatic Detection (Recommended)

OpenSea will automatically detect your contract once the first NFT is minted. Just:

1. **Mint at least 1 NFT** from your contract
2. Wait 5-10 minutes for OpenSea to index it
3. Visit: https://opensea.io/assets/ethereum/0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF/1
4. Your collection will appear automatically!

### Method 2: Manual Import via OpenSea Studio

1. Go to **OpenSea Studio**: https://opensea.io/studio
2. Click **"Import an existing smart contract"**
3. Enter your contract address: `0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF`
4. Select **Ethereum Mainnet**
5. Click **"Import"**

---

## 🎨 Step 2: Customize Your Collection Page

Once imported, enhance your collection:

1. **Go to OpenSea Studio** (while connected with wallet: `0x897f6d5A329d9481bEF2EE10fD0a5628d1934266`)
2. **Edit Collection Settings:**

### Collection Details to Add:

**Logo Image:**
- Upload a high-quality square logo (350x350px minimum)
- Your skunk character or brand logo

**Featured Image:**
- Banner for collection page (1400x400px recommended)
- Eye-catching header image

**Description:**
```
Skunk Squad NFT - A collection of 10,000 unique digital skunks living on the Ethereum blockchain.

Each Skunk Squad NFT is randomly generated from over 100+ unique traits across multiple categories including backgrounds, bodies, heads, eyes, mouths, and accessories.

Join the squad and own a piece of this exclusive collection stored permanently on Arweave!

🦨 Max Supply: 10,000
💎 Mint Price: 0.01 ETH
🔗 Website: https://skunksquadnft.com
```

**Category:** Art or Collectibles

**Links:**
- Website: `https://skunksquadnft.com`
- Discord: (if you have one)
- Twitter/X: (if you have one)
- Instagram: (if you have one)

**Royalties:**
- Already set via ERC-2981: 2.5% to `0x897f6d5A329d9481bEF2EE10fD0a5628d1934266`
- OpenSea will respect these automatically! ✅

---

## 💧 Step 3: Create an OpenSea Drop (Optional)

OpenSea Drops allow you to create a dedicated minting page on OpenSea.

### Requirements:
- Your contract must support the **ERC-721A** or **OpenSea Seaport** standards
- Your current contract uses standard ERC-721 ✅

### To Create a Drop:

1. **Visit**: https://opensea.io/studio
2. Click **"Create a Drop"** or **"Create"**
3. **Choose**: "Import existing contract" or "Create new drop"
4. **If using existing contract:**
   - Enter: `0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF`
   - Configure drop settings

### Drop Settings:
- **Public Sale Price:** 0.01 ETH
- **Max per wallet:** 10 (your contract limit)
- **Start Date:** Choose your launch date
- **End Date:** Optional (or until sold out)

**Note:** Your contract has its own `mintNFT()` function, so you can choose:
- **Option A:** Use OpenSea Drop (they handle UI, you keep full control)
- **Option B:** Use your website (full control, lower fees)
- **Option C:** Both! Offer minting on your site AND OpenSea

---

## 🔗 Your OpenSea URLs

**Collection Page (after first mint):**
```
https://opensea.io/collection/skunksquad-nft-1
```
*Note: OpenSea auto-generates the slug. You can customize it in settings.*

**Direct Asset Link (example for token #1):**
```
https://opensea.io/assets/ethereum/0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF/1
```

**View on OpenSea Button for Your Website:**
```html
<a href="https://opensea.io/collection/skunksquad-nft-1" target="_blank" class="opensea-btn">
    <img src="https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.svg" alt="OpenSea" width="20">
    View on OpenSea
</a>
```

---

## ✅ Current Contract Features (OpenSea Compatible)

Your contract already includes:

✅ **ERC-721** - Full NFT support  
✅ **ERC-2981** - Royalty standard (2.5% automatic)  
✅ **Contract Metadata** - Collection info stored on Arweave  
✅ **Token Metadata** - Individual NFT metadata on Arweave  
✅ **Verified Contract** - Source code visible on Etherscan  
✅ **Owner Functions** - Reveal, update URIs, royalties  

---

## 📊 What OpenSea Will Show

From your contract metadata (`contractURI`):

- **Name:** Skunk Squad NFT
- **Description:** A collection of 10,000 unique Skunk Squad NFTs...
- **Image:** Your collection logo from Arweave
- **External Link:** https://skunksquadnft.com
- **Royalties:** 2.5% to your wallet (automatic!)

---

## 🎯 Action Plan

### Immediate Steps:

1. ✅ Contract deployed and verified
2. ✅ Metadata on Arweave
3. ⏳ **Mint 1 NFT** (to trigger OpenSea indexing)
4. ⏳ Wait 5-10 minutes
5. ⏳ Visit OpenSea to see your collection
6. ⏳ Customize collection page in OpenSea Studio
7. ⏳ Add logo, banner, description
8. ⏳ Verify royalties display correctly

### Optional (For OpenSea Drop):

9. Create drop in OpenSea Studio
10. Set launch date and pricing
11. Promote on social media
12. Monitor sales on OpenSea dashboard

---

## 🔍 Verification Checklist

Before launching, verify:

- [ ] At least 1 NFT minted
- [ ] Collection appears on OpenSea
- [ ] Metadata displays correctly (name, image, traits)
- [ ] Collection logo and banner uploaded
- [ ] Description added
- [ ] Website link working
- [ ] Royalties set to 2.5% (verify in settings)
- [ ] Floor price appears after first sale

---

## 💡 Pro Tips

**1. Mint Before Launch:**
Mint 1-2 NFTs yourself to verify everything works before public launch.

**2. Reveal Strategy:**
- Keep NFTs unrevealed initially (mystery boxes)
- Build hype around reveal date
- Call `reveal()` function when ready
- OpenSea will update automatically

**3. Rarity Rankings:**
OpenSea will auto-calculate rarity based on your metadata traits!

**4. Verification Badge:**
Request OpenSea verification once you have:
- Active community (Discord/Twitter)
- Significant trading volume
- Unique branding

**5. Marketing:**
- Share OpenSea link on all social media
- Create hype around "View on OpenSea"
- Encourage holders to list/trade

---

## 🚨 Important Notes

**Royalties:**
- Your contract uses ERC-2981 (industry standard)
- OpenSea respects these by default
- Royalty recipient: `0x897f6d5A329d9481bEF2EE10fD0a5628d1934266`
- Rate: 2.5% on all secondary sales

**Minting Options:**
You have TWO ways to mint:
1. **Your Website:** Direct contract calls (no OpenSea fees)
2. **OpenSea Drop:** Convenience, discoverability (OpenSea UI)

**Recommendation:** Keep your website as primary, use OpenSea for visibility.

---

## 📞 Need Help?

**OpenSea Support:**
- https://support.opensea.io
- Help Center: https://support.opensea.io/hc/en-us

**Your Contract:**
- Etherscan: https://etherscan.io/address/0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF
- Contract verified and auditable ✅

---

## 🎉 Next Steps

**To get started RIGHT NOW:**

1. Mint your first NFT from your website
2. Wait 10 minutes
3. Visit: https://opensea.io/assets/ethereum/0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF/1
4. Claim your collection in OpenSea Studio
5. Customize and launch!

**Your collection is ready for OpenSea! 🚀**
