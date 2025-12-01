# SkunkSquad Networking Portal - Backend API

Complete backend system for the SkunkSquad networking portal with NFT-based authentication.

## 📁 Project Structure

```
backend/
├── config/
│   └── db-config.js          # PostgreSQL connection
├── db/
│   └── schema.sql            # Complete database schema
├── middleware/
│   └── auth-middleware.js    # JWT authentication
├── routes/
│   ├── auth-routes.js        # Login/logout endpoints
│   ├── members-routes.js     # Member CRUD operations
│   └── connections-routes.js # Connection management
├── scripts/
│   └── seed.js               # Sample data seeder
├── networking-server.js      # Express app (main entry)
├── networking-api-client.js  # Frontend API client
├── package.json              # Dependencies
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## 🚀 Features

- **NFT-Based Authentication** - Verify ownership via Web3
- **Member Profiles** - Customizable profiles with interests & social links
- **Connection System** - Send/accept/decline connection requests
- **Search & Filters** - Advanced member discovery
- **Real-time Stats** - Network analytics and insights
- **Activity Logging** - Track all member actions
- **Secure Sessions** - JWT-based authentication
- **Rate Limiting** - API protection

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Ethereum RPC endpoint (using public nodes or Infura)
- Domain/hosting for production deployment

## 🔧 SkunkSquad Configuration

The backend is pre-configured for SkunkSquad NFT collection:

- **Contract Address**: `0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF`
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **RPC**: Public Ethereum nodes + Infura backup
- **Collection**: 10,000 NFTs
- **Server Port**: 3001 (separate from payment server on 3002)

## 🛠️ Installation

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Setup Database**
```bash
# Create PostgreSQL database
createdb skunksquad_networking

# Run migrations
psql -d skunksquad_networking -f db/schema.sql
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your actual settings:
# - Generate a secure JWT_SECRET
# - Set your PostgreSQL credentials
# - Update CORS_ORIGIN with your domain
# - Keep the SkunkSquad contract settings as-is
```

4. **Seed Sample Data** (optional)
```bash
npm run seed
```

5. **Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on port **3001** (default) - different from the payment server (port 3002)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/wallet` - Login with wallet
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify session

### Members
- `GET /api/members` - List members (with filters)
- `GET /api/members/stats` - Network statistics
- `GET /api/members/:id` - Get member profile
- `PUT /api/members/profile` - Update own profile
- `PUT /api/members/interests` - Update interests
- `PUT /api/members/socials` - Update social links
- `PUT /api/members/online-status` - Update online status

### Connections
- `GET /api/connections` - Get connections
- `GET /api/connections/pending` - Get pending requests
- `GET /api/connections/suggestions` - Get suggestions
- `POST /api/connections/request` - Send request
- `POST /api/connections/accept/:id` - Accept request
- `POST /api/connections/decline/:id` - Decline request
- `DELETE /api/connections/:id` - Remove connection

## 📊 Database Schema

### Tables
- `members` - Core user profiles
- `member_nfts` - NFT ownership tracking
- `member_interests` - User interests/tags
- `member_socials` - Social media links
- `connections` - Member relationships
- `messages` - DM system (future)
- `member_sessions` - Active sessions
- `activity_log` - Audit trail

## 🔐 Security

- JWT token authentication
- Rate limiting (100 req/15min)
- CORS protection
- Helmet security headers
- SQL injection prevention
- Session expiration (24h default)

## 🌐 Environment Variables

### Required Configuration

```env
# Server
PORT=3001                                              # API server port (3002 = payment server)
NODE_ENV=production                                    # or 'development'

# Database
DB_HOST=localhost                                      # PostgreSQL host
DB_PORT=5432                                           # PostgreSQL port
DB_NAME=skunksquad_networking                         # Database name
DB_USER=postgres                                       # Database user
DB_PASSWORD=your_secure_password                       # Database password

# JWT Authentication
JWT_SECRET=your_long_random_secret_key                # MUST be secure in production

# SkunkSquad Ethereum Configuration (Pre-configured)
ETH_RPC_URL=https://ethereum.publicnode.com           # Public Ethereum RPC
INFURA_PROJECT_ID=a2c6c1df8f4e4003bdd98abdec26ad64  # Backup Infura endpoint
CONTRACT_ADDRESS=0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF
NETWORK_ID=1                                          # Ethereum Mainnet
NETWORK_NAME=Ethereum Mainnet

# CORS (Update with your domain)
CORS_ORIGIN=https://skunksquadnft.com,https://www.skunksquadnft.com

# Session
SESSION_DURATION_HOURS=24                             # Session expiry
```

## 📝 Example Requests

### Login with Wallet
```bash
curl -X POST http://localhost:3001/api/auth/wallet \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x..."}'
```

### Get Members (with filters)
```bash
curl "http://localhost:3001/api/members?region=north-america&industry=tech&sort=nfts"
```

### Send Connection Request
```bash
curl -X POST http://localhost:3001/api/connections/request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetMemberId":2}'
```

## 🔄 Integration with Frontend

Include the API client in your HTML:
```html
<script src="./backend/networking-api-client.js"></script>
```

See `networking-api-client.js` for complete integration code and usage examples.

## 📈 Performance

- Database connection pooling
- Query optimization with indexes
- Response compression
- Efficient pagination

## 🐛 Debugging

```bash
# Enable debug logs
NODE_ENV=development npm run dev

# Check database
psql -d skunksquad_networking -c "SELECT * FROM members LIMIT 5;"
```

## 📄 License

MIT
