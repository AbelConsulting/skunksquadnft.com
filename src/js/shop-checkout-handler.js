/**
 * SkunkSquad Shop Checkout Handler
 * Handles Stripe checkout for merchandise only
 */

// Initialize Stripe with your publishable key
// This will need to be set from your Stripe dashboard
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_key_here'; // Replace with actual key
let stripe;

// Server endpoints
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api'
    : 'https://skunksquadnftcom-production.up.railway.app/api';

// Initialize
async function initCheckout() {
    try {
        // Load cart from localStorage
        const cart = JSON.parse(localStorage.getItem('skunkSquadCart') || '[]');
        
        if (cart.length === 0) {
            showError('Your cart is empty');
            return;
        }
        
        // Check if NFT holder
        const isNFTHolder = await checkNFTOwnership();
        
        // Display order summary
        displayOrderSummary(cart, isNFTHolder);
        
        // Initialize Stripe
        if (STRIPE_PUBLISHABLE_KEY && STRIPE_PUBLISHABLE_KEY !== 'pk_test_your_key_here') {
            stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        } else {
            console.warn('Stripe not configured - using demo mode');
        }
        
        // Show checkout content
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('checkoutContent').style.display = 'grid';
        
        // Setup checkout button
        document.getElementById('checkoutButton').addEventListener('click', () => {
            handleCheckout(cart, isNFTHolder);
        });
        
    } catch (error) {
        console.error('Checkout initialization error:', error);
        showError('Failed to initialize checkout. Please try again.');
    }
}

/**
 * Display order summary
 */
function displayOrderSummary(cart, isNFTHolder) {
    const orderItemsContainer = document.getElementById('orderItems');
    
    // Calculate totals
    let subtotal = 0;
    let originalSubtotal = 0;
    
    const itemsHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        const originalItemTotal = item.originalPrice * item.quantity;
        subtotal += itemTotal;
        originalSubtotal += originalItemTotal;
        
        return `
            <div class="summary-item">
                <div style="display: flex; align-items: center; flex: 1;">
                    <img src="${item.image}" alt="${item.name}" class="item-image">
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-meta">
                            ${item.size} | ${item.color} | Qty: ${item.quantity}
                        </div>
                    </div>
                </div>
                <div style="font-weight: 600;">
                    $${itemTotal.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
    
    orderItemsContainer.innerHTML = itemsHTML;
    
    // Update totals
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `$${subtotal.toFixed(2)}`;
    
    // Show discount if NFT holder
    if (isNFTHolder) {
        const discount = originalSubtotal - subtotal;
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
    }
}

/**
 * Check if user owns SkunkSquad NFT
 */
async function checkNFTOwnership() {
    try {
        if (typeof window.ethereum === 'undefined') {
            return false;
        }
        
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
            return false;
        }
        
        const web3 = new Web3(window.ethereum);
        const contractAddress = '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF';
        
        // Minimal ABI for balanceOf
        const minimalABI = [{
            "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }];
        
        const contract = new web3.eth.Contract(minimalABI, contractAddress);
        const balance = await contract.methods.balanceOf(accounts[0]).call();
        
        return parseInt(balance) > 0;
    } catch (error) {
        console.error('Error checking NFT ownership:', error);
        return false;
    }
}

/**
 * Handle checkout process
 */
async function handleCheckout(cart, isNFTHolder) {
    try {
        const button = document.getElementById('checkoutButton');
        button.disabled = true;
        button.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; margin: 0 auto;"></div>';
        
        // Check if Stripe is configured
        if (!stripe) {
            alert('Payment processing is not configured yet.\n\nPlease add your Stripe publishable key to complete setup.');
            button.disabled = false;
            button.innerHTML = '🔒 Proceed to Payment';
            return;
        }
        
        // Get customer email if available
        let customerEmail = '';
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                // In production, you might want to get email from a form
                customerEmail = prompt('Please enter your email address:') || '';
            }
        }
        
        // Create Stripe checkout session
        const response = await fetch(`${API_BASE}/stripe/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: cart,
                customerEmail,
                isNFTHolder,
                successUrl: `${window.location.origin}/shop-success.html?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${window.location.origin}/shop.html`,
            }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }
        
        const { sessionId, url } = await response.json();
        
        // Redirect to Stripe Checkout
        if (url) {
            window.location.href = url;
        } else {
            const result = await stripe.redirectToCheckout({ sessionId });
            
            if (result.error) {
                throw new Error(result.error.message);
            }
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Failed to process checkout. Please try again.');
        
        const button = document.getElementById('checkoutButton');
        button.disabled = false;
        button.innerHTML = '🔒 Proceed to Payment';
    }
}

/**
 * Show error message
 */
function showError(message) {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('checkoutContent').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('errorText').textContent = message;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckout);
} else {
    initCheckout();
}
