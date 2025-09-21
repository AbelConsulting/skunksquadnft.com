import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import './PaymentCheckout.css';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
};

// Main Payment Component
const PaymentCheckout = ({ walletAddress, onSuccess, onError }) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setPricingLoading] = useState(true);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/pricing`);
      const data = await response.json();
      
      if (data.success) {
        setPricing(data.data);
      } else {
        onError('Failed to load pricing information');
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      onError('Failed to load pricing information');
    } finally {
      setPricingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="loading-spinner"></div>
        <p>Loading payment information...</p>
      </div>
    );
  }

  return (
    <div className="payment-checkout">
      <Elements stripe={stripePromise}>
        <CheckoutForm 
          walletAddress={walletAddress}
          pricing={pricing}
          onSuccess={onSuccess}
          onError={onError}
        />
      </Elements>
    </div>
  );
};

// Checkout Form Component
const CheckoutForm = ({ walletAddress, pricing, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  });

  useEffect(() => {
    if (quantity > 0) {
      calculateTotal();
    }
  }, [quantity]);

  const calculateTotal = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/calculate-total`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
      
      const data = await response.json();
      if (data.success) {
        setTotalCost(data.data);
      }
    } catch (error) {
      console.error('Error calculating total:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setPaymentStatus('Creating payment intent...');

    try {
      // Create payment intent
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity,
          walletAddress,
          metadata: {
            customerEmail: customerInfo.email,
            customerName: customerInfo.name
          }
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      const { clientSecret, paymentIntentId } = data.data;
      setPaymentStatus('Processing payment...');

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            address: customerInfo.address,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setPaymentStatus('Payment successful! Minting NFTs...');
      
      // Poll for NFT delivery
      await pollPaymentStatus(paymentIntentId);
      
    } catch (error) {
      console.error('Payment error:', error);
      onError(error.message);
      setPaymentStatus('');
    } finally {
      setProcessing(false);
    }
  };

  const pollPaymentStatus = async (paymentId) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payment-status/${paymentId}`);
        const data = await response.json();
        
        if (data.success) {
          const { status, tokenIds } = data.data;
          
          if (status === 'delivered') {
            onSuccess({
              paymentId,
              tokenIds,
              quantity,
              walletAddress
            });
            return;
          } else if (status === 'failed') {
            throw new Error('NFT minting failed. Please contact support.');
          }
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        } else {
          throw new Error('NFT delivery timeout. Please contact support with payment ID: ' + paymentId);
        }
        
      } catch (error) {
        onError(error.message);
      }
    };

    checkStatus();
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + delta));
    setQuantity(newQuantity);
  };

  const handleCustomerInfoChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCustomerInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCustomerInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="checkout-header">
        <h2>🦨 Purchase SkunkSquad NFTs</h2>
        <p>Pay with credit card and receive NFTs instantly</p>
      </div>

      {/* Quantity Selection */}
      <div className="quantity-section">
        <label>Quantity</label>
        <div className="quantity-selector">
          <button 
            type="button" 
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="quantity-btn"
          >
            -
          </button>
          <span className="quantity-display">{quantity}</span>
          <button 
            type="button" 
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= 10}
            className="quantity-btn"
          >
            +
          </button>
        </div>
      </div>

      {/* Pricing Display */}
      {totalCost && (
        <div className="pricing-display">
          <div className="price-line">
            <span>Price per NFT:</span>
            <span>${pricing?.pricePerNFTUSD}</span>
          </div>
          <div className="price-line">
            <span>Quantity:</span>
            <span>{quantity}</span>
          </div>
          <div className="price-line total">
            <span>Total:</span>
            <span>${totalCost.totalUSD}</span>
          </div>
        </div>
      )}

      {/* Customer Information */}
      <div className="customer-info">
        <h3>Billing Information</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={customerInfo.email}
              onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={customerInfo.address.line1}
              onChange={(e) => handleCustomerInfoChange('address.line1', e.target.value)}
              required
              placeholder="123 Main Street"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={customerInfo.address.city}
              onChange={(e) => handleCustomerInfoChange('address.city', e.target.value)}
              required
              placeholder="New York"
            />
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              value={customerInfo.address.state}
              onChange={(e) => handleCustomerInfoChange('address.state', e.target.value)}
              required
              placeholder="NY"
            />
          </div>
          <div className="form-group">
            <label>ZIP Code</label>
            <input
              type="text"
              value={customerInfo.address.postal_code}
              onChange={(e) => handleCustomerInfoChange('address.postal_code', e.target.value)}
              required
              placeholder="10001"
            />
          </div>
        </div>
      </div>

      {/* NFT Delivery Address */}
      <div className="wallet-info">
        <h3>NFT Delivery</h3>
        <div className="wallet-display">
          <label>Wallet Address:</label>
          <code>{walletAddress}</code>
        </div>
        <p className="wallet-note">
          Your NFTs will be delivered to this wallet address
        </p>
      </div>

      {/* Card Element */}
      <div className="card-section">
        <label>Credit Card Information</label>
        <div className="card-element-container">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Payment Status */}
      {paymentStatus && (
        <div className="payment-status">
          <div className="status-spinner"></div>
          <span>{paymentStatus}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || processing}
        className={`submit-button ${processing ? 'processing' : ''}`}
      >
        {processing ? (
          <>
            <div className="button-spinner"></div>
            Processing...
          </>
        ) : (
          `Pay $${totalCost?.totalUSD || '0.00'} - Buy ${quantity} NFT${quantity > 1 ? 's' : ''}`
        )}
      </button>

      {/* Security Notice */}
      <div className="security-notice">
        <p>🔒 Secured by Stripe. Your payment information is encrypted and secure.</p>
        <p>📄 By completing this purchase, you agree to our Terms of Service.</p>
      </div>
    </form>
  );
};

export default PaymentCheckout;