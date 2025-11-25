# Members-Only System Testing Guide

Quick guide to test the SkunkSquad members-only authentication system.

## 🧪 Testing Methods

### Method 1: Token ID Authentication (Easiest)
1. Visit `members.html`
2. Enter any number between 0-9999 in the Token ID field
3. Click "Verify Token"
4. ✅ Should grant access to members portal

### Method 2: Wallet Authentication (Full Test)
1. Install MetaMask browser extension
2. Switch to Ethereum Mainnet
3. Visit `members.html`
4. Click "Connect Wallet to Verify"
5. Approve the connection in MetaMask
6. System checks NFT balance on contract
7. ✅ If you own NFTs, access granted

### Method 3: Direct Dashboard Access
1. Without logging in, visit `dashboard/index.html`
2. ❌ Should redirect to members portal
3. Login via members portal
4. ✅ Can now access dashboard

## 🔍 What to Test

### ✅ Authentication Flow
- [ ] Auth screen shows on first visit
- [ ] Token ID verification works (0-9999)
- [ ] Wallet connection prompts MetaMask
- [ ] Invalid tokens show error
- [ ] Wrong network shows error message
- [ ] No NFT shows appropriate error

### ✅ Session Management
- [ ] Login persists after page refresh
- [ ] Member name displays correctly
- [ ] NFT count shows (if using wallet)
- [ ] Session expires after 24 hours
- [ ] Logout button works

### ✅ Dashboard Protection
- [ ] Cannot access without auth
- [ ] Redirects to members portal
- [ ] Shows member badge when authenticated
- [ ] Logout button appears
- [ ] Member info displays in header

### ✅ Member Features
- [ ] Quick action modals work
- [ ] Analytics dashboard link works
- [ ] Toast notifications display
- [ ] Portfolio chart renders (if Chart.js loaded)
- [ ] Member stats update

## 🐛 Common Issues

### Issue: "No wallet found"
**Solution**: Install MetaMask extension

### Issue: "Wrong network"
**Solution**: Switch MetaMask to Ethereum Mainnet

### Issue: "Session expired"
**Solution**: Normal behavior after 24 hours - just login again

### Issue: Dashboard immediately redirects
**Solution**: Expected - must login through members portal first

## 📊 Test Data

### Sample Token IDs (for testing)
- `123` - Valid
- `4567` - Valid
- `9999` - Valid (max)
- `0` - Valid (min)
- `10000` - Invalid (too high)
- `abc` - Invalid (not numeric)

## 🔒 Security Checks

### ✅ Verify These Work:
- [ ] localStorage session storage
- [ ] Session timestamp validation
- [ ] 24-hour expiry enforcement
- [ ] Dashboard guard script blocks access
- [ ] Network ID verification (mainnet only)
- [ ] NFT balance verification

## 📱 Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

## 🎯 User Flow Test

Complete end-to-end flow:

1. **Visit Homepage**
   - Click "Members Portal" in nav
   
2. **Authentication**
   - See auth screen
   - Enter token ID "123"
   - Click verify
   
3. **Members Portal**
   - See welcome message
   - See member stats
   - Click quick actions
   - See feature modals
   
4. **Analytics Dashboard**
   - Click analytics button
   - Dashboard loads
   - See member badge
   - Data loads correctly
   
5. **Logout**
   - Click logout
   - Confirm logout
   - Back to auth screen
   
6. **Re-login**
   - Use wallet this time
   - Connect MetaMask
   - See NFT verification
   - Access granted

## 🚀 Production Checklist

Before going live:

- [ ] Update contract address if needed
- [ ] Set correct network ID
- [ ] Test with real NFT holders
- [ ] Verify Infura/Alchemy endpoint
- [ ] Enable error reporting
- [ ] Add analytics tracking
- [ ] Test session expiry
- [ ] Mobile responsiveness check
- [ ] Cross-browser testing
- [ ] Performance optimization

## 📝 Notes

- Token ID mode is for testing/demo only
- Production should enforce actual NFT ownership
- Session duration can be adjusted in config
- Error messages are user-friendly
- All actions are logged to console

---

**Happy Testing! 🦨**
