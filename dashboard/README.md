# SkunkSquad Analytics Dashboard

A comprehensive real-time analytics dashboard for the SkunkSquad NFT collection.

## Features

### 📊 Real-Time Data
- **Total Minted**: Live count of minted NFTs with percentage of max supply
- **Total Revenue**: Calculated revenue in ETH and USD
- **Unique Holders**: Estimated number of unique NFT holders
- **Floor Price**: Current mint price

### 📈 Visual Analytics
- **Supply Progress Ring**: Animated circular progress indicator showing minting progress
- **Minting History Chart**: Line chart showing daily minting activity over the last 30 days
- **Recent Activity Feed**: Live feed of recent minting transactions

### 🔗 Blockchain Integration
- Direct connection to Ethereum mainnet
- Smart contract interaction using Web3.js
- Real-time event monitoring for Transfer events
- Automatic data refresh every 30 seconds

### 💎 Network Statistics
- **Gas Price**: Current network gas price in Gwei
- **ETH Price**: Live ETH/USD price with 24h change
- **Block Number**: Latest Ethereum block number
- **Last Update**: Timestamp of last data refresh

### 👥 Holder Analytics
- Top holders table with balance and ownership percentage
- Address formatting for easy reading
- Copy-to-clipboard functionality

### 🔧 Smart Contract Information
- Contract address with copy functionality
- Network identification
- Mint price display
- Max tokens per transaction
- Revealed status indicator
- Contract owner address

## Technical Stack

- **Web3.js**: Blockchain interaction
- **Chart.js**: Data visualization
- **CoinGecko API**: ETH price data
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern styling with gradients and animations

## Data Sources

1. **Blockchain Data**: Direct smart contract calls via Web3.js
2. **Events**: Transfer events from the NFT contract
3. **Price Data**: CoinGecko API for ETH/USD rates
4. **Network Data**: Ethereum mainnet RPC

## Auto-Refresh

The dashboard automatically refreshes all data every 30 seconds to ensure you're seeing the latest information. You can also manually refresh using the refresh button in the header.

## Quick Links

- **Etherscan**: View contract on Etherscan
- **OpenSea**: Browse the collection on OpenSea
- **Members Area**: Access member-exclusive features
- **Collection Gallery**: View sample artwork

## Files

- `index.html` - Main dashboard HTML structure
- `dashboard.css` - Comprehensive styling
- `dashboard.js` - All dashboard logic and blockchain integration

## Configuration

Edit the `CONFIG` object in `dashboard.js` to customize:

```javascript
const CONFIG = {
    CONTRACT_ADDRESS: '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF',
    MAX_SUPPLY: 10000,
    MINT_PRICE: 0.01,
    REFRESH_INTERVAL: 30000, // milliseconds
};
```

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any browser with Web3 support

## Future Enhancements

- [ ] Real holder data from blockchain events
- [ ] Advanced rarity analytics
- [ ] Trading volume tracking
- [ ] Price history charts
- [ ] Wallet connection for personalized stats
- [ ] Export data functionality
- [ ] Mobile app version

---

Built with ❤️ by MontanaDad
