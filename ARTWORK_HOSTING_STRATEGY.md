# NFT Artwork & Metadata Hosting Strategy

## Current Situation
The smart contract is ready for deployment, but the NFT artwork and metadata are not yet hosted online. This is actually **standard practice** for NFT projects.

## Deployment Strategy

### Phase 1: Deploy Contract (Now)
- Deploy smart contract with placeholder URIs
- Contract will be in "unrevealed" state
- Minting can begin, but tokens show placeholder metadata

### Phase 2: Prepare & Upload Artwork (Later)
- Generate final NFT collection (1000+ tokens)
- Create metadata JSON files for each token
- Upload to IPFS or web hosting
- Update contract URIs

## URI Configuration

### Current Deployment URIs (Placeholders)
```
Base URI: https://api.skunksquadnft.com/metadata/
Contract URI: https://api.skunksquadnft.com/contract.json
Unrevealed URI: https://api.skunksquadnft.com/unrevealed.json
```

### Hosting Options

#### Option 1: IPFS (Recommended)
**Pros:** Decentralized, permanent, industry standard
**Cons:** Requires IPFS setup knowledge

```bash
# Example IPFS workflow
1. Upload images folder → ipfs://QmImageHash/
2. Upload metadata folder → ipfs://QmMetadataHash/
3. Update contract: setBaseURI("ipfs://QmMetadataHash/")
```

#### Option 2: Your Website
**Pros:** Full control, easy to update
**Cons:** Centralized, requires server maintenance

```bash
# Example web hosting
1. Upload to: https://skunksquadnft.com/api/metadata/
2. Ensure CORS headers for marketplace compatibility
3. Update contract: setBaseURI("https://skunksquadnft.com/api/metadata/")
```

#### Option 3: Hybrid Approach
- Images on IPFS (permanent)
- Metadata on your server (updatable)

## Metadata Structure

Each token needs a JSON file following ERC-721 standard:

```json
{
  "name": "Skunk Squad #1",
  "description": "Skunk Squad #1 is a unique NFT...",
  "image": "ipfs://QmImageHash/1.png",
  "external_url": "https://skunksquadnft.com/token/1",
  "attributes": [
    {
      "trait_type": "Background", 
      "value": "Forest"
    },
    {
      "trait_type": "Body",
      "value": "Default"
    }
  ]
}
```

## Smart Contract Functions for Updates

The contract has built-in functions to update URIs after deployment:

```solidity
// Update base URI for revealed metadata
function setBaseURI(string calldata newBaseURI) external onlyOwner

// Reveal collection (one-time action)
function reveal(string calldata newBaseURI) external onlyOwner

// Update contract metadata
function setContractURI(string calldata newContractURI) external onlyOwner
```

## Recommended Timeline

1. **Deploy to testnet now** with placeholder URIs
2. **Generate final NFT collection** (run generator for full supply)
3. **Prepare metadata** using `scripts/prepare-metadata.py`
4. **Upload to IPFS** or your hosting solution
5. **Update contract URIs** using admin functions
6. **Call reveal()** to make collection visible

## Benefits of This Approach

- ✅ Can deploy and test contract immediately
- ✅ Standard practice in NFT industry
- ✅ Creates anticipation with "unrevealed" state
- ✅ Allows time to perfect artwork without delaying contract
- ✅ Can update URIs multiple times if needed

## Next Steps

1. Deploy contract to testnet with current configuration
2. Test all minting functions
3. Prepare final artwork and metadata
4. Upload to chosen hosting solution
5. Update URIs and reveal collection

This strategy lets us move forward with testing while you prepare the final artwork hosting solution.