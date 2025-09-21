# 🦨 SkunkSquad NFT Collection

**The World's First Ultra-Smart NFT Collection with AI-Powered Features**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://solidity.readthedocs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow.svg)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-Contracts-blue.svg)](https://openzeppelin.com/)
[![Security](https://img.shields.io/badge/Security-Policy-red.svg)](./SECURITY.md)

## 🚀 **Revolutionary Smart Contract Technology**

SkunkSquad isn't just another NFT collection—it's a **complete intelligent ecosystem** that learns, adapts, and grows with its community. Our Ultra Smart Contract represents the next evolution of blockchain technology.

### 🧠 **Ultra Smart Features**

| Feature | Description | Benefit |
|---------|-------------|---------|
| **🔥 Dynamic Pricing** | AI-powered pricing that adjusts based on demand and time | Fair market pricing, optimized revenue |
| **📊 Advanced Analytics** | Deep user behavior tracking and insights | Understand your community like never before |
| **🏆 Gamification System** | 10 achievements, XP points, loyalty scoring | Increased engagement and retention |
| **👥 Social Features** | Built-in referral system and NFT gifting | Viral organic growth |
| **🔮 Predictive Analytics** | Machine learning pattern recognition | Anticipate market trends |

## 🎨 **Collection Details**

- **Total Supply**: 10,000 unique SkunkSquad NFTs
- **Blockchain**: Ethereum (ERC-721A)
- **Traits**: 67 unique traits across 8 layers
- **Rarity System**: Common, Rare, Epic, Ultra tiers
- **Metadata**: Fully decentralized with IPFS integration

### 🎭 **Trait Categories**
- **Backgrounds** (8 variants)
- **Bodies** (6 variants) 
- **Heads** (9 variants)
- **Eyes** (8 variants)
- **Mouths** (7 variants)
- **Left Arms** (11 variants including rare staffs)
- **Right Arms** (10 variants)
- **Accessories** (8 variants)

## 🏗️ **Technical Architecture**

### **Smart Contract Stack**
```
SkunkSquadNFTUltraSmart.sol (715+ lines)
├── ERC-721A Base (Azuki's gas-optimized standard)
├── OpenZeppelin Security Extensions
├── Dynamic Pricing Engine
├── User Analytics System
├── Achievement & XP Framework
├── Social Features Module
└── Predictive Analytics Engine
```

### **Key Contracts**
- **Main Contract**: `0x7649366eeb2F996513C4A929d9A980779Cf2364C` (Sepolia)
- **Royalties**: EIP-2981 standard (5% to creator)
- **Operator Filtering**: Enforced marketplace royalties

## 💰 **Smart Pricing System**

Our revolutionary pricing adapts to market conditions:

- **Base Price**: 0.01 ETH
- **Dynamic Range**: 0.005 - 0.05 ETH
- **Time Adjustments**: Lower prices during off-peak hours
- **Demand Multipliers**: Price increases with minting velocity
- **Fair Pricing**: Protects against extreme volatility

## 🎮 **Gamification & Rewards**

### **Achievement System**
1. **First Mint** - Mint your first NFT (50 XP)
2. **Collector** - Own 5 NFTs (200 XP)
3. **Whale** - Own 20 NFTs (1,000 XP)
4. **Early Bird** - Mint in first 100 (500 XP)
5. **Social Butterfly** - Refer 5 friends (300 XP)
6. **Speed Demon** - Mint within 1 minute (150 XP)
7. **Loyalty** - Hold for 30 days (400 XP)
8. **Big Spender** - Spend 1 ETH total (800 XP)
9. **Pattern Master** - Consistent minting (600 XP)
10. **Community Leader** - Refer 20 friends (1,500 XP)

### **XP Benefits**
- **Social Recognition**: Leaderboards and status
- **Future Utility**: Staking rewards, governance voting
- **Exclusive Access**: Special events and drops

## 👥 **Social Features**

- **Referral System**: Earn XP for bringing friends
- **NFT Gifting**: Send NFTs with social XP bonuses
- **Community Building**: Built-in viral growth mechanics
- **Shared Rewards**: Referrers get 10% XP bonus

## 📈 **Analytics Dashboard**

**Live Dashboard**: [http://localhost:3001](http://localhost:3001)

### **Real-time Metrics**
- Collection statistics and minting progress
- Dynamic pricing trends and demand analysis
- User behavior patterns and engagement
- Achievement unlocks and XP distribution
- Revenue analytics and forecasting

### **User Insights**
- Individual user lookup and analytics
- Minting patterns and preferences
- Loyalty scoring and whale identification
- Prediction confidence and next mint timing

## 🛠️ **Development Setup**

### **Prerequisites**
```bash
node >= 16.0.0
npm >= 8.0.0
```

### **Installation**
```bash
git clone https://github.com/AbelConsulting/skunksquadnft.com.git
cd skunksquadnft.com
npm install
```

### **Environment Setup**
Create `.env` file:
```env
ALCHEMY_API_KEY=your_alchemy_key
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### **Available Scripts**

#### **Smart Contract Deployment**
```bash
# Deploy Ultra Smart Contract
npm run deploy-ultra

# Test all smart features
npm run test-ultra

# Quick functionality test
npx hardhat run scripts/quick-test-ultra.js --network sepolia
```

#### **Analytics & Monitoring**
```bash
# Start real-time analytics dashboard
npm run analytics

# Start simplified dashboard
node scripts/simple-analytics.js
```

#### **NFT Generation**
```bash
# Generate 1000 NFTs
python generate.py --csv traits_catalog.mapped.fixed.csv --outdir output/large_test_1000 --supply 1000 --seed 12345 --verbose

# Generate test batch
python generate.py --csv traits_catalog.mapped.fixed.csv --outdir output/test_100 --supply 100 --seed 16000
```

#### **OpenSea Integration**
```bash
# Setup OpenSea metadata
npm run setup-opensea

# Start metadata server
npm run metadata-server
```

## 🌐 **Deployment Information**

### **Sepolia Testnet**
- **Contract**: `0x7649366eeb2F996513C4A929d9A980779Cf2364C`
- **Etherscan**: [View on Etherscan](https://sepolia.etherscan.io/address/0x7649366eeb2F996513C4A929d9A980779Cf2364C)
- **OpenSea**: Compatible with all major marketplaces
- **Status**: ✅ Deployed & Tested

### **Contract Features**
- ✅ Multi-phase minting (Closed, Presale, Whitelist, Public)
- ✅ Dynamic pricing with demand multipliers
- ✅ Comprehensive user analytics tracking
- ✅ Achievement system with XP rewards
- ✅ Social features (referrals, gifting)
- ✅ Predictive analytics and pattern recognition
- ✅ Emergency controls and admin functions
- ✅ Royalty enforcement (EIP-2981)
- ✅ Operator filtering for marketplace control

## 📊 **Project Statistics**

| Metric | Value |
|--------|-------|
| **Total Code Lines** | 1,500+ (Solidity + Scripts) |
| **Smart Contract Size** | 715+ lines |
| **Test Coverage** | 15+ comprehensive tests |
| **Gas Optimization** | ERC-721A (saves ~60% gas) |
| **Security Features** | OpenZeppelin + Custom |
| **Deployment Scripts** | 10+ automation scripts |

## 🔒 **Security Features**

- **Reentrancy Protection**: OpenZeppelin's ReentrancyGuard
- **Access Control**: Role-based permissions
- **Input Validation**: Comprehensive parameter checking
- **Emergency Controls**: Pause functionality and admin overrides
- **Operator Filtering**: Marketplace royalty enforcement
- **Custom Errors**: Gas-efficient error handling

## 🎯 **Roadmap & Future Features**

### **Phase 1: Foundation** ✅
- [x] Ultra Smart Contract deployment
- [x] Dynamic pricing system
- [x] Basic analytics and achievements
- [x] Social features integration

### **Phase 2: Intelligence** 🚧
- [ ] AI-powered recommendation engine
- [ ] Cross-chain analytics integration
- [ ] Advanced prediction algorithms
- [ ] Dynamic metadata evolution

### **Phase 3: Ecosystem** 📅
- [ ] Staking and yield farming
- [ ] Governance token integration
- [ ] Community marketplace
- [ ] Mobile app with AR features

### **Phase 4: Metaverse** 🔮
- [ ] 3D avatar integration
- [ ] Virtual world compatibility
- [ ] Augmented reality features
- [ ] Cross-platform interoperability

## 🎨 **NFT Generation System**

### **Algorithmic Rarity Engine**
Our NFT generation uses mathematical weighted rarity while maintaining artistic flair:

#### **Input CSV Format** (`traits_catalog.csv`):
```csv
layer, trait_name, file, weight, rarity_tier, notes
```

#### **Layer Composition Order**:
```
background → body → head → eyes → mouth → arm_left → arm_right → accessories
```

#### **Generation Commands**:
```bash
# Generate full collection
python generate.py \
  --csv traits_catalog.mapped.fixed.csv \
  --outdir output/collection \
  --supply 10000 \
  --name-prefix "Skunk Squad #" \
  --description "Ultra-Smart NFT with AI-powered features" \
  --base-uri "ipfs://METADATA_CID/" \
  --seed 420 \
  --verbose

# Test generation
python generate.py \
  --csv traits_catalog.mapped.fixed.csv \
  --outdir output/test \
  --supply 100 \
  --seed 16000
```

### **Rarity Distribution**
- **Common**: 60% (Base traits, widely available)
- **Rare**: 30% (Enhanced traits, moderate scarcity)
- **Epic**: 9% (Premium traits, high value)
- **Ultra**: 1% (Ultra-rare traits, maximum rarity)

## 👨‍💻 **Team**

- **Lead Developer**: Blockchain & Smart Contract Architecture
- **Frontend Developer**: Dashboard & User Experience
- **Data Scientist**: Analytics & Prediction Models
- **Community Manager**: Social Features & Growth

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔗 **Links**

- **Website**: [skunksquadnft.com](https://skunksquadnft.com)
- **Discord**: [Join Community](https://discord.gg/skunksquad)
- **Twitter**: [@SkunkSquadNFT](https://twitter.com/skunksquadnft)
- **OpenSea**: [View Collection](https://opensea.io/collection/skunksquad)
- **Documentation**: [Full Docs](https://docs.skunksquadnft.com)

## 📞 **Support**

- **Technical Issues**: Create an [Issue](https://github.com/AbelConsulting/skunksquadnft.com/issues)
- **Community Support**: Join our [Discord](https://discord.gg/skunksquad)
- **Business Inquiries**: contact@skunksquadnft.com

---

**🦨 SkunkSquad NFT - Where Intelligence Meets Art** 

*Built with ❤️ by the SkunkSquad Team*