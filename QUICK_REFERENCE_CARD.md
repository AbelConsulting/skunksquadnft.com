# 🎯 SkunkSquad Features - Quick Reference Card

## 🍞 Notifications
```javascript
window.notifications.success('Success!')
window.notifications.error('Error!')
window.notifications.warning('Warning!')
window.notifications.info('Info!')
```

## ⏳ Loading
```javascript
window.showLoading('Loading...', 'Please wait')
window.hideLoading()
window.loadingOverlay.minting(quantity)
```

## 📊 Supply
```html
<div data-supply-counter></div>
<span data-supply-counter data-supply-format="current">0</span>
<span data-supply-counter data-supply-format="remaining">10,000</span>
```
```javascript
window.supplyCounter.getSupplyData()
```

## 💰 Price
```html
<span data-eth-price data-eth-amount="0.01">0.01 ETH</span>
```
```javascript
window.ethPrice.ethToUsd(1.0)
```

## 💳 Balance
```html
<span data-eth-balance>0.0000 ETH</span>
<span data-nft-balance>0 NFTs</span>
```
```javascript
window.balanceChecker.canAffordMint(quantity)
```

## 📡 Transactions
```javascript
window.txTracker.track(txHash, { type: 'mint', quantity })
window.txTracker.getPendingTransactions()
```

---
**Demo**: Open `features-demo.html` 🧪
