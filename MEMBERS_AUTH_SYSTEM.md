# SkunkSquad Members-Only Authentication System

A comprehensive NFT-based authentication system that protects premium content and provides exclusive access to SkunkSquad NFT holders.

## 🔐 Overview

The members-only system verifies NFT ownership on Ethereum mainnet and grants access to exclusive features including:

- **Analytics Dashboard** - Real-time blockchain metrics
- **Member Portal** - Networking and exclusive content
- **Portfolio Tracking** - NFT value and rarity insights
- **Exclusive Events** - VIP access to member meetups

## 📁 File Structure

```
src/js/
├── members-auth.js          # Core authentication system
└── members.js               # Member portal features

dashboard/
├── dashboard-guard.js       # Dashboard access protection
├── dashboard.js            # Dashboard functionality
└── dashboard.css           # Dashboard styling

styles/
└── members.css             # Members portal styling
```

## 🚀 Features

### 1. **Wallet-Based Authentication**
- Connect MetaMask or Web3 wallet
- Automatic NFT ownership verification
- Direct smart contract interaction
- Supports multiple NFTs per wallet

### 2. **Token ID Verification**
- Manual token ID entry option
- Simplified access for users without wallet
- Token validation (0-9999)

### 3. **Session Management**
- 24-hour session duration
- Automatic session validation
- Secure localStorage persistence
- Session expiry handling

### 4. **Dashboard Protection**
- Automatic access verification
- Redirect non-members to portal
- Member info display
- Logout functionality

### 5. **Error Handling**
- User-friendly error messages
- Network detection
- Wallet installation checks
- NFT ownership validation

## 🔧 Implementation

### Authentication Flow

```
User visits Members Portal
    ↓
Check for existing session
    ↓
Session valid? → Show Dashboard
    ↓ No
Show Authentication Screen
    ↓
User chooses authentication method:
    ├── Wallet Connection
    │   ├── Connect MetaMask
    │   ├── Check network (Mainnet)
    │   ├── Verify NFT ownership
    │   └── Create session
    │
    └── Token ID Entry
        ├── Validate token ID
        ├── Verify range (0-9999)
        └── Create session
    ↓
Grant access to Members Portal
    ↓
Access Analytics Dashboard
```

### Key Functions

#### `members-auth.js`

**`initMembersAuth()`**
- Initializes authentication system
- Checks for existing sessions
- Sets up event listeners

**`handleWalletAuth()`**
- Connects Web3 wallet
- Verifies network
- Checks NFT balance
- Creates authenticated session

**`handleTokenVerification()`**
- Validates token ID input
- Creates session for token holders
- Simplified verification mode

**`loadMemberProfile()`**
- Updates member display info
- Calculates member level
- Sets reward points
- Updates avatar

#### `dashboard-guard.js`

**`checkDashboardAccess()`**
- Validates member session
- Checks session expiry
- Redirects unauthorized users

**`displayMemberInfo()`**
- Shows member badge
- Displays member name
- Adds logout button

## 📊 Smart Contract Integration

### Contract Details
- **Address**: `0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF`
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **Standard**: ERC-721

### ABI Methods Used

```javascript
balanceOf(address owner) → uint256
// Returns number of NFTs owned by address

tokenOfOwnerByIndex(address owner, uint256 index) → uint256
// Returns token ID at specific index
```

## 🎨 User Experience

### Authentication Screen
- Clean, modern design
- Two authentication options
- Clear error messages
- Helpful instructions

### Member Dashboard
- Personalized welcome
- Member stats display
- Quick action buttons
- Analytics access

### Dashboard Protection
- Automatic verification
- Smooth redirects
- Session indicators
- Easy logout

## 🔒 Security Features

1. **Session Validation**
   - 24-hour expiry
   - Timestamp verification
   - Automatic cleanup

2. **Network Verification**
   - Mainnet requirement
   - Chain ID checking
   - Wrong network alerts

3. **NFT Ownership**
   - Direct contract calls
   - Balance verification
   - Token enumeration

4. **Access Control**
   - Guard script protection
   - Redirect unauthorized
   - Session persistence

## 🎯 Configuration

Edit `MEMBERS_CONFIG` in `members-auth.js`:

```javascript
const MEMBERS_CONFIG = {
    CONTRACT_ADDRESS: '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF',
    NETWORK_ID: 1,
    STORAGE_KEY: 'skunksquad_member',
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
};
```

## 📱 Responsive Design

- Mobile-optimized layouts
- Touch-friendly buttons
- Adaptive modals
- Flexible grids

## 🔄 Session Management

### Storage Format
```javascript
{
    address: "0x1234...5678",
    displayName: "0x1234...5678",
    tokenIds: [123, 456, 789],
    nftCount: 3,
    authenticated: true,
    authMethod: "wallet",
    timestamp: 1700000000000,
    networkId: 1
}
```

### Session Lifecycle
1. **Creation** - After successful authentication
2. **Validation** - On each page load
3. **Expiry** - After 24 hours
4. **Cleanup** - On logout or expiry

## ⚡ Quick Start

### For Developers

1. **Include Scripts**
```html
<script src="https://unpkg.com/web3@latest/dist/web3.min.js"></script>
<script src="./src/js/members-auth.js"></script>
```

2. **Add Auth UI**
```html
<div id="authGuard">
    <button id="connectWalletAuth">Connect Wallet</button>
    <input id="tokenIdInput" type="text">
    <button id="verifyTokenBtn">Verify Token</button>
</div>
```

3. **Protect Pages**
```html
<script src="./dashboard/dashboard-guard.js"></script>
```

### For Users

1. Visit members portal
2. Choose authentication:
   - **Wallet**: Click "Connect Wallet"
   - **Token**: Enter NFT token ID
3. Complete verification
4. Access exclusive content

## 🐛 Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `NO_WALLET` | No Web3 wallet detected | Install MetaMask |
| `WRONG_NETWORK` | Not on Ethereum Mainnet | Switch network |
| `NO_NFT` | No SkunkSquad NFTs owned | Mint or buy NFT |
| `SESSION_EXPIRED` | Session older than 24h | Login again |

## 🚀 Future Enhancements

- [ ] Multi-chain support
- [ ] Social login integration
- [ ] Enhanced analytics per wallet
- [ ] Member tier system
- [ ] Achievement tracking
- [ ] Referral rewards
- [ ] Profile customization
- [ ] Direct messaging
- [ ] Event RSVP system
- [ ] Governance voting

## 📄 License

Part of SkunkSquad NFT project by MontanaDad

---

**Built with ❤️ for the SkunkSquad Community**
