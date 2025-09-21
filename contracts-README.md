# Skunk Squad NFT Smart Contract

A gas-optimized ERC-721A NFT smart contract for the Skunk Squad collection, featuring whitelist minting, public minting, royalties, and comprehensive security features.

## 🚀 Features

- **ERC-721A Implementation** - Gas-optimized batch minting
- **Whitelist Minting** - Merkle tree-based whitelist with configurable limits
- **Public Minting** - Public sale with per-transaction and per-wallet limits
- **Owner Functions** - Team minting, batch minting, and configuration
- **EIP-2981 Royalties** - Standard royalty implementation
- **Metadata Management** - Unrevealed/revealed metadata handling
- **Security** - Reentrancy protection, contract call prevention
- **Comprehensive Testing** - Full test suite with edge cases

## 📋 Contract Specifications

- **Max Supply**: 10,000 NFTs
- **Mint Price**: 0.05 ETH
- **Max Per Transaction**: 10 NFTs
- **Max Per Wallet (Whitelist)**: 3 NFTs
- **Max Per Wallet (Public)**: 20 NFTs
- **Royalty Fee**: 2.5%
- **Starting Token ID**: 1

## 🛠️ Installation

```bash
npm install
```

## 📝 Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Fill in your environment variables:
```env
PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
REPORT_GAS=false

# Contract deployment parameters
CONTRACT_NAME=Skunk Squad
CONTRACT_SYMBOL=SKUNK
BASE_URI=https://metadata.skunksquadnft.com/
CONTRACT_URI=https://metadata.skunksquadnft.com/contract.json
UNREVEALED_URI=https://metadata.skunksquadnft.com/unrevealed.json
ROYALTY_RECIPIENT=0x0000000000000000000000000000000000000000
```

## 🔨 Compilation

```bash
npm run compile
```

## 🧪 Testing

Run the full test suite:
```bash
npm run test
```

Run tests with gas reporting:
```bash
REPORT_GAS=true npm run test
```

## 🚀 Deployment

### Local Development
```bash
# Start local Hardhat network
npm run node

# Deploy to local network
npm run deploy:localhost
```

### Sepolia Testnet
```bash
npm run deploy:sepolia
```

### Mainnet
```bash
npm run deploy:mainnet
```

### Contract Verification
```bash
# Sepolia
npm run verify:sepolia <contract_address> "Skunk Squad" "SKUNK" "https://metadata.skunksquadnft.com/" "https://metadata.skunksquadnft.com/contract.json" "https://metadata.skunksquadnft.com/unrevealed.json" "<royalty_recipient>"

# Mainnet
npm run verify:mainnet <contract_address> "Skunk Squad" "SKUNK" "https://metadata.skunksquadnft.com/" "https://metadata.skunksquadnft.com/contract.json" "https://metadata.skunksquadnft.com/unrevealed.json" "<royalty_recipient>"
```

## 📋 Whitelist Management

### Generate Whitelist Merkle Tree

1. Prepare your whitelist file in one of these formats:

**Text file (whitelist.txt):**
```
0x1234567890123456789012345678901234567890
0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef
# Comments are ignored
```

**JSON file (whitelist.json):**
```json
{
  "addresses": [
    "0x1234567890123456789012345678901234567890",
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef"
  ]
}
```

**CSV file (whitelist.csv):**
```
0x1234567890123456789012345678901234567890,optional_data
0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef,optional_data
```

2. Generate the Merkle tree:
```bash
node scripts/whitelist.js examples/whitelist.txt whitelist-data.json
```

3. Set the Merkle root in your contract:
```javascript
await contract.setMerkleRoot("0x_merkle_root_here");
```

## 🎮 Contract Interaction

### Owner Functions

```javascript
// Toggle minting phases
await contract.toggleWhitelistMint();
await contract.togglePublicMint();

// Set Merkle root for whitelist
await contract.setMerkleRoot("0x_merkle_root");

// Update metadata URIs
await contract.setBaseURI("https://newbaseuri.com/");
await contract.setContractURI("https://newcontracturi.com/");

// Reveal collection
await contract.reveal("https://revealed-metadata.com/");

// Owner/team minting
await contract.ownerMint("0x_recipient", quantity);
await contract.batchOwnerMint(["0x_addr1", "0x_addr2"], [10, 20]);

// Update royalties
await contract.setRoyaltyInfo("0x_recipient", 250); // 2.5%

// Withdraw funds
await contract.withdraw();
```

### Whitelist Minting

```javascript
// User needs their Merkle proof from whitelist-data.json
const proof = ["0x_proof1", "0x_proof2", ...];
const quantity = 2;
const value = ethers.parseEther("0.1"); // 0.05 ETH * 2

await contract.whitelistMint(quantity, proof, { value });
```

### Public Minting

```javascript
const quantity = 5;
const value = ethers.parseEther("0.25"); // 0.05 ETH * 5

await contract.publicMint(quantity, { value });
```

## 📊 Contract Analysis

### Gas Optimization Features

1. **ERC-721A**: Optimized for batch minting
2. **Packed Storage**: Efficient storage layout
3. **Minimal External Calls**: Reduced gas costs
4. **Optimized Loops**: Gas-efficient iteration

### Security Features

1. **Reentrancy Guard**: Prevents reentrancy attacks
2. **Contract Prevention**: Blocks contract-to-contract calls
3. **Access Control**: Owner-only sensitive functions
4. **Input Validation**: Comprehensive parameter checking
5. **Supply Enforcement**: Hard cap on total supply

### Compliance Standards

- **ERC-721A**: Advanced NFT standard with batch minting
- **EIP-2981**: NFT Royalty Standard
- **ERC-165**: Standard Interface Detection
- **OpenZeppelin**: Battle-tested security patterns

## 🗂️ Project Structure

```
contracts/
├── SkunkSquadNFT.sol          # Main NFT contract
└── TestMaliciousContract.sol   # Security testing contract

scripts/
├── deploy.js                   # Deployment script
└── whitelist.js               # Whitelist management utility

test/
└── SkunkSquadNFT.test.js      # Comprehensive test suite

examples/
├── whitelist.txt              # Example whitelist (text format)
└── whitelist.json             # Example whitelist (JSON format)

deployments/                   # Deployment records (auto-generated)
├── localhost.json
├── sepolia.json
└── mainnet.json
```

## 🔍 Testing Coverage

The test suite covers:

- ✅ Deployment and initialization
- ✅ Owner functions and access control
- ✅ Whitelist minting with Merkle proofs
- ✅ Public minting with limits
- ✅ Owner minting and batch minting
- ✅ Supply management and enforcement
- ✅ Metadata handling (revealed/unrevealed)
- ✅ Royalty implementation
- ✅ Withdrawal functions
- ✅ Security features
- ✅ Interface compliance

## 🚨 Security Considerations

1. **Private Key Management**: Never commit private keys to version control
2. **Merkle Root Updates**: Only update merkle root when necessary
3. **Mint Phase Management**: Carefully coordinate mint phase transitions
4. **Metadata Hosting**: Ensure reliable metadata hosting (IPFS recommended)
5. **Contract Verification**: Always verify contracts on Etherscan
6. **Testing**: Thoroughly test on testnets before mainnet deployment

## 📈 Deployment Checklist

### Pre-Deployment
- [ ] Complete smart contract testing
- [ ] Set up metadata hosting infrastructure
- [ ] Prepare whitelist addresses
- [ ] Configure environment variables
- [ ] Test on Sepolia testnet

### Deployment
- [ ] Deploy contract to mainnet
- [ ] Verify contract on Etherscan
- [ ] Generate and set Merkle root
- [ ] Configure metadata URIs
- [ ] Test all functions with small amounts

### Post-Deployment
- [ ] Update frontend with contract address
- [ ] Enable appropriate mint phases
- [ ] Monitor contract for any issues
- [ ] Set up monitoring and alerts

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add comprehensive tests
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For technical support or questions:
- Create an issue in this repository
- Review the test files for usage examples
- Check deployment logs in the `deployments/` directory

---

**⚠️ Important**: This smart contract handles real ETH and valuable NFTs. Always thoroughly test on testnets and have the code audited before mainnet deployment.