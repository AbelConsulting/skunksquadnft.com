# Printful Integration Setup Guide

## Getting Your Printful API Token

1. **Log in to your Printful account**
   - Go to https://www.printful.com/dashboard

2. **Navigate to Settings > Stores**
   - Click on your store name

3. **Generate API Token**
   - Go to "Add to Store" or "API" section
   - Click "Generate" or "Create new token"
   - Copy the API token (it will look like: `xxxxx:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

4. **Add Token to Your Site**
   - Open `src/js/shop.js`
   - Find line 7: `const PRINTFUL_API_TOKEN = 'YOUR_PRINTFUL_API_TOKEN_HERE';`
   - Replace `YOUR_PRINTFUL_API_TOKEN_HERE` with your actual token

## Security Note

⚠️ **IMPORTANT**: The API token shown in the browser-side JavaScript is for READ-ONLY operations (viewing products). 

For production:
- Never expose tokens with write permissions in client-side code
- Use a backend server to handle order creation and sensitive operations
- The current setup is safe for displaying products only

## Setting Up Products in Printful

1. **Create Products**
   - Go to your Printful dashboard
   - Click "Stores" > Your Store > "Add product"
   - Choose product type (t-shirt, hoodie, mug, etc.)
   - Upload your SkunkSquad designs
   - Set pricing

2. **Sync Products**
   - Make sure products are published to your store
   - The website will automatically fetch them via the API

## NFT Holder Discount

The shop automatically detects if a connected wallet owns a SkunkSquad NFT and applies a 15% discount!

## Features Included

✅ Product catalog display
✅ Search and filter functionality
✅ NFT holder detection and discounts
✅ Responsive design
✅ Product detail modals
✅ Size and color selection

## Next Steps (Optional)

For full e-commerce functionality, you'll need to:
1. Set up a backend server (Node.js, Python, etc.)
2. Implement checkout flow
3. Handle order creation via Printful API
4. Integrate payment processing (Stripe, PayPal, etc.)
5. Set up webhooks for order status updates

## Testing

1. Add your API token to `shop.js`
2. Open `shop.html` in your browser
3. Products should load automatically
4. Connect your wallet to see the NFT holder discount

## Support

Need help? Contact:
- Printful Support: https://www.printful.com/contacts
- SkunkSquad: skunksquad411@gmail.com
