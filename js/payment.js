/**
 * SkunkSquad NFT Website - Payment Integration
 * Handles credit card payments and blockchain interactions
 */

class PaymentSystem {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.cardElement = null;
        this.paymentIntent = null;
        this.init();
    }

    async init() {
        console.log('💳 Initializing Payment System...');
        
        try {
            // Initialize Stripe (using test key for demo)
            // In production, this would come from environment variables
            this.stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');
            
            // Setup payment form if exists
            this.setupPaymentForm();
            
            // Setup quantity selection
            this.setupQuantitySelection();
            
            // Setup pricing display
            this.updatePricing();
            
        } catch (error) {
            console.error('❌ Payment system initialization failed:', error);
            this.showPaymentError('Payment system unavailable. Please try again later.');
        }
    }

    setupPaymentForm() {
        const paymentFormContainer = document.getElementById('payment-form-container');
        
        if (!paymentFormContainer) {
            // Create payment form dynamically
            this.createPaymentForm();
        }
    }

    createPaymentForm() {
        const paymentSection = document.querySelector('.payment-section');
        
        if (paymentSection) {
            const formHTML = `
                <div id="payment-form-container" class="payment-form-container" style="display: none;">
                    <div class="payment-form-card">
                        <div class="payment-header">
                            <h3>💳 Complete Your Purchase</h3>
                            <p>Secure payment powered by Stripe</p>
                        </div>
                        
                        <form id="payment-form" class="payment-form">
                            <div class="form-group">
                                <label for="quantity">Quantity (1-10)</label>
                                <select id="quantity" name="quantity" required>
                                    <option value="1">1 NFT</option>
                                    <option value="2">2 NFTs</option>
                                    <option value="3">3 NFTs</option>
                                    <option value="4">4 NFTs</option>
                                    <option value="5">5 NFTs</option>
                                    <option value="6">6 NFTs</option>
                                    <option value="7">7 NFTs</option>
                                    <option value="8">8 NFTs</option>
                                    <option value="9">9 NFTs</option>
                                    <option value="10">10 NFTs</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="wallet-address">Your Ethereum Wallet Address</label>
                                <input 
                                    type="text" 
                                    id="wallet-address" 
                                    name="wallet-address" 
                                    placeholder="0x..." 
                                    required
                                    pattern="^0x[a-fA-F0-9]{40}$"
                                    title="Please enter a valid Ethereum address"
                                >
                                <small>NFTs will be delivered to this address</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="card-element">Credit Card Information</label>
                                <div id="card-element" class="card-element">
                                    <!-- Stripe Elements will create form elements here -->
                                </div>
                                <div id="card-errors" class="card-errors" role="alert"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="billing-name">Billing Name</label>
                                <input 
                                    type="text" 
                                    id="billing-name" 
                                    name="billing-name" 
                                    required
                                    placeholder="Full name on card"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="billing-email">Email Address</label>
                                <input 
                                    type="email" 
                                    id="billing-email" 
                                    name="billing-email" 
                                    required
                                    placeholder="your@email.com"
                                >
                            </div>
                            
                            <div class="pricing-summary">
                                <div class="price-row">
                                    <span>Price per NFT:</span>
                                    <span class="price-value">$50.00</span>
                                </div>
                                <div class="price-row">
                                    <span>Quantity:</span>
                                    <span id="quantity-display">1</span>
                                </div>
                                <div class="price-row total">
                                    <span>Total:</span>
                                    <span id="total-price">$50.00</span>
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                id="submit-payment" 
                                class="btn btn-primary btn-large btn-full"
                                disabled
                            >
                                <span class="btn-icon">💳</span>
                                <span id="button-text">Complete Purchase</span>
                                <div id="payment-spinner" class="loading-spinner" style="display: none;"></div>
                            </button>
                        </form>
                        
                        <div class="payment-security">
                            <div class="security-badges">
                                <span class="security-badge">🔒 SSL Encrypted</span>
                                <span class="security-badge">🛡️ PCI Compliant</span>
                                <span class="security-badge">💳 Stripe Secured</span>
                            </div>
                            <p>Your payment information is encrypted and secure</p>
                        </div>
                    </div>
                </div>
            `;
            
            paymentSection.insertAdjacentHTML('beforeend', formHTML);
            this.initializeStripeElements();
        }
    }

    async initializeStripeElements() {
        if (!this.stripe) return;

        try {
            // Create Stripe Elements
            this.elements = this.stripe.elements({
                appearance: {
                    theme: 'night',
                    variables: {
                        colorPrimary: '#6366f1',
                        colorBackground: '#111827',
                        colorText: '#ffffff',
                        colorDanger: '#ef4444',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '8px'
                    }
                }
            });

            // Create card element
            this.cardElement = this.elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#ffffff',
                        '::placeholder': {
                            color: '#9ca3af',
                        },
                    },
                },
            });

            // Mount card element
            this.cardElement.mount('#card-element');

            // Handle real-time validation errors from the card Element
            this.cardElement.on('change', ({error}) => {
                const displayError = document.getElementById('card-errors');
                if (error) {
                    displayError.textContent = error.message;
                    displayError.style.display = 'block';
                } else {
                    displayError.textContent = '';
                    displayError.style.display = 'none';
                }
            });

            // Setup form submission
            this.setupFormSubmission();
            
        } catch (error) {
            console.error('❌ Stripe elements initialization failed:', error);
            this.showPaymentError('Payment form initialization failed.');
        }
    }

    setupQuantitySelection() {
        const quantitySelect = document.getElementById('quantity');
        
        if (quantitySelect) {
            quantitySelect.addEventListener('change', (e) => {
                this.updatePricing(parseInt(e.target.value));
            });
        }
    }

    updatePricing(quantity = 1) {
        const basePrice = 50; // $50 per NFT
        const total = basePrice * quantity;
        
        const quantityDisplay = document.getElementById('quantity-display');
        const totalPrice = document.getElementById('total-price');
        
        if (quantityDisplay) quantityDisplay.textContent = quantity;
        if (totalPrice) totalPrice.textContent = `$${total.toFixed(2)}`;
    }

    setupFormSubmission() {
        const form = document.getElementById('payment-form');
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePaymentSubmission();
            });
        }
    }

    async handlePaymentSubmission() {
        const submitButton = document.getElementById('submit-payment');
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('payment-spinner');
        
        try {
            // Disable submit button and show loading
            submitButton.disabled = true;
            buttonText.textContent = 'Processing...';
            spinner.style.display = 'inline-block';

            // Get form data
            const form = document.getElementById('payment-form');
            const formData = new FormData(form);
            const quantity = parseInt(formData.get('quantity'));
            const walletAddress = formData.get('wallet-address');
            const billingName = formData.get('billing-name');
            const billingEmail = formData.get('billing-email');

            // Validate wallet address
            if (!this.isValidEthereumAddress(walletAddress)) {
                throw new Error('Please enter a valid Ethereum wallet address');
            }

            // Create payment intent
            const paymentIntentResponse = await this.createPaymentIntent(quantity, {
                walletAddress,
                billingName,
                billingEmail
            });

            if (!paymentIntentResponse.success) {
                throw new Error(paymentIntentResponse.error || 'Failed to create payment intent');
            }

            // Confirm payment with Stripe
            const {error, paymentIntent} = await this.stripe.confirmCardPayment(
                paymentIntentResponse.clientSecret,
                {
                    payment_method: {
                        card: this.cardElement,
                        billing_details: {
                            name: billingName,
                            email: billingEmail,
                        },
                    }
                }
            );

            if (error) {
                throw new Error(error.message);
            } else {
                // Payment successful!
                console.log('✅ Payment successful:', paymentIntent);
                this.handlePaymentSuccess(paymentIntent, quantity, walletAddress);
            }

        } catch (error) {
            console.error('❌ Payment error:', error);
            this.showPaymentError(error.message);
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            buttonText.textContent = 'Complete Purchase';
            spinner.style.display = 'none';
        }
    }

    async createPaymentIntent(quantity, metadata) {
        try {
            // In a real implementation, this would call your backend API
            // For demo purposes, we'll simulate the API call
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quantity,
                    metadata
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
            
        } catch (error) {
            console.error('❌ Create payment intent error:', error);
            
            // For demo purposes, return a mock response
            return {
                success: false,
                error: 'Demo mode: Payment processing unavailable. This would work with a live backend.'
            };
        }
    }

    handlePaymentSuccess(paymentIntent, quantity, walletAddress) {
        // Hide payment form
        const paymentForm = document.getElementById('payment-form-container');
        if (paymentForm) {
            paymentForm.style.display = 'none';
        }

        // Show success message
        this.showPaymentSuccess(paymentIntent.id, quantity, walletAddress);

        // Track conversion (analytics)
        this.trackPurchase(quantity, paymentIntent.amount);
    }

    showPaymentSuccess(paymentIntentId, quantity, walletAddress) {
        const successHTML = `
            <div class="payment-success">
                <div class="success-icon">🎉</div>
                <h2>Payment Successful!</h2>
                <p>Your SkunkSquad NFTs are being minted and will be delivered to your wallet shortly.</p>
                
                <div class="success-details">
                    <div class="detail-row">
                        <span>Quantity:</span>
                        <span>${quantity} NFT${quantity > 1 ? 's' : ''}</span>
                    </div>
                    <div class="detail-row">
                        <span>Delivery Address:</span>
                        <span class="wallet-address">${walletAddress}</span>
                    </div>
                    <div class="detail-row">
                        <span>Transaction ID:</span>
                        <span class="transaction-id">${paymentIntentId}</span>
                    </div>
                </div>
                
                <div class="success-actions">
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        Buy More NFTs
                    </button>
                    <a href="https://opensea.io" target="_blank" class="btn btn-outline">
                        View on OpenSea
                    </a>
                </div>
                
                <div class="delivery-info">
                    <h4>What happens next?</h4>
                    <ol>
                        <li>Our smart contract verifies your payment</li>
                        <li>Your NFTs are minted on the Ethereum blockchain</li>
                        <li>NFTs are automatically delivered to your wallet</li>
                        <li>You'll receive an email confirmation</li>
                    </ol>
                    <p><strong>Delivery time:</strong> Usually within 5-10 minutes</p>
                </div>
            </div>
        `;

        const paymentSection = document.querySelector('.payment-section .container');
        if (paymentSection) {
            paymentSection.innerHTML = successHTML;
        }
    }

    showPaymentError(message) {
        // Show error in the UI
        if (window.skunkSquadWebsite) {
            window.skunkSquadWebsite.showNotification(message, 'error');
        } else {
            alert('Payment Error: ' + message);
        }
    }

    isValidEthereumAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    trackPurchase(quantity, amount) {
        // Analytics tracking for successful purchases
        console.log('📊 Tracking purchase:', { quantity, amount });
        
        // Google Analytics 4 example
        if (typeof gtag !== 'undefined') {
            gtag('event', 'purchase', {
                transaction_id: Date.now().toString(),
                value: amount / 100, // Convert cents to dollars
                currency: 'USD',
                items: [{
                    item_id: 'skunksquad-nft',
                    item_name: 'SkunkSquad NFT',
                    category: 'NFT',
                    quantity: quantity,
                    price: 50.00
                }]
            });
        }
        
        // Custom analytics
        if (typeof analytics !== 'undefined') {
            analytics.track('NFT Purchase Completed', {
                quantity: quantity,
                amount: amount,
                paymentMethod: 'credit_card',
                timestamp: new Date().toISOString()
            });
        }
    }

    // Public methods for external integration
    showPaymentForm() {
        const paymentForm = document.getElementById('payment-form-container');
        if (paymentForm) {
            paymentForm.style.display = 'block';
            paymentForm.scrollIntoView({ behavior: 'smooth' });
        } else {
            this.createPaymentForm();
            setTimeout(() => this.showPaymentForm(), 100);
        }
    }

    hidePaymentForm() {
        const paymentForm = document.getElementById('payment-form-container');
        if (paymentForm) {
            paymentForm.style.display = 'none';
        }
    }

    async checkPaymentStatus(paymentIntentId) {
        try {
            const response = await fetch(`/api/payment-status/${paymentIntentId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Check payment status error:', error);
            return { success: false, error: error.message };
        }
    }
}

// CSS for payment form
const paymentStyles = `
    .payment-form-container {
        margin-top: 3rem;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }
    
    .payment-form-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1.5rem;
        padding: 2rem;
        backdrop-filter: blur(10px);
    }
    
    .payment-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .payment-header h3 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        color: white;
    }
    
    .payment-header p {
        color: #9ca3af;
        margin: 0;
    }
    
    .form-group {
        margin-bottom: 1.5rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: white;
    }
    
    .form-group input,
    .form-group select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #374151;
        border-radius: 0.5rem;
        background: #111827;
        color: white;
        font-size: 1rem;
    }
    
    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .form-group small {
        display: block;
        margin-top: 0.25rem;
        color: #9ca3af;
        font-size: 0.875rem;
    }
    
    .card-element {
        padding: 0.75rem;
        border: 1px solid #374151;
        border-radius: 0.5rem;
        background: #111827;
    }
    
    .card-errors {
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        display: none;
    }
    
    .pricing-summary {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.75rem;
        padding: 1.5rem;
        margin: 1.5rem 0;
    }
    
    .price-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        color: #9ca3af;
    }
    
    .price-row.total {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 0.75rem;
        margin-top: 0.75rem;
        font-size: 1.25rem;
        font-weight: 700;
        color: white;
    }
    
    .price-value {
        color: #6366f1;
        font-weight: 600;
    }
    
    .payment-security {
        text-align: center;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .security-badges {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }
    
    .security-badge {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .payment-success {
        text-align: center;
        padding: 3rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .success-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    
    .success-details {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0.75rem;
        padding: 1.5rem;
        margin: 2rem 0;
        text-align: left;
    }
    
    .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .detail-row:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }
    
    .wallet-address,
    .transaction-id {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
        color: #6366f1;
        word-break: break-all;
    }
    
    .success-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin: 2rem 0;
        flex-wrap: wrap;
    }
    
    .delivery-info {
        text-align: left;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0.75rem;
        padding: 1.5rem;
        margin-top: 2rem;
    }
    
    .delivery-info h4 {
        margin-bottom: 1rem;
        color: white;
    }
    
    .delivery-info ol {
        margin-bottom: 1rem;
        padding-left: 1.5rem;
    }
    
    .delivery-info li {
        margin-bottom: 0.5rem;
        color: #9ca3af;
    }
    
    @media (max-width: 768px) {
        .payment-form-card {
            padding: 1.5rem;
        }
        
        .security-badges {
            flex-direction: column;
            align-items: center;
        }
        
        .success-actions {
            flex-direction: column;
        }
        
        .detail-row {
            flex-direction: column;
            gap: 0.25rem;
        }
    }
`;

// Inject payment styles
const paymentStyleSheet = document.createElement('style');
paymentStyleSheet.textContent = paymentStyles;
document.head.appendChild(paymentStyleSheet);

// Initialize payment system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if Stripe is available
    if (typeof Stripe !== 'undefined') {
        window.paymentSystem = new PaymentSystem();
    } else {
        console.log('🦨 Stripe not loaded - payment features disabled');
    }
});

// Integrate with main website functionality
document.addEventListener('DOMContentLoaded', () => {
    // Override credit card purchase buttons to show payment form
    const creditCardButtons = document.querySelectorAll('#buy-with-card, #buy-with-card-modal');
    
    creditCardButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (window.paymentSystem) {
                // Close modal if open
                if (window.skunkSquadWebsite) {
                    window.skunkSquadWebsite.closePurchaseModal();
                }
                
                // Show payment form
                setTimeout(() => {
                    window.paymentSystem.showPaymentForm();
                }, 300);
            } else {
                if (window.skunkSquadWebsite) {
                    window.skunkSquadWebsite.showNotification(
                        'Payment system is loading. Please try again in a moment.',
                        'info'
                    );
                }
            }
        });
    });
});

export default PaymentSystem;