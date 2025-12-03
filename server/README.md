# SkunkSquad Printful Server

Backend server for handling Printful API requests securely.

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Printful App

1. Go to https://www.printful.com/dashboard/app
2. Create a new app or select existing app
3. Get your API credentials:
   - **API Token** (for simple authentication)
   - OR **Client ID** and **Client Secret** (for OAuth)

### 3. Set Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```
PRINTFUL_API_TOKEN=your_actual_api_token
PRINTFUL_CLIENT_ID=your_client_id
PRINTFUL_CLIENT_SECRET=your_client_secret
PORT=3001
```

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product details
- `GET /api/variants/:id` - Get variant details

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/estimate` - Estimate order costs

### Shipping
- `POST /api/shipping/rates` - Calculate shipping rates

### Store
- `GET /api/store` - Get store information

### Webhooks
- `POST /api/webhooks/printful` - Receive Printful webhook events

## Webhook Setup

In your Printful dashboard:
1. Go to Settings > API
2. Add webhook URL: `http://your-domain.com/api/webhooks/printful`
3. Select events you want to receive

## Security Notes

- Never commit `.env` file to Git
- Keep your API token and secrets secure
- Use HTTPS in production
- Implement rate limiting for production use
- Add authentication for sensitive endpoints

## Deployment

### Option 1: Deploy to Heroku
```bash
heroku create skunksquad-printful
heroku config:set PRINTFUL_API_TOKEN=your_token
git push heroku main
```

### Option 2: Deploy to Railway
1. Connect your GitHub repo
2. Set environment variables in dashboard
3. Deploy automatically

### Option 3: Deploy to Vercel (Serverless)
```bash
vercel --prod
```

## Testing

Test the server is running:
```bash
curl http://localhost:3001/api/health
```

Test products endpoint:
```bash
curl http://localhost:3001/api/products
```
