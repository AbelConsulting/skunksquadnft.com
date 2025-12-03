/**
 * Printful API Integration
 * Handles all communication with Printful API
 */

class PrintfulAPI {
    constructor(apiToken = null) {
        this.apiToken = apiToken;
        // Use backend server instead of direct API access
        this.baseURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3001/api'
            : '/api'; // Use relative path in production
        this.storeId = null;
        this.useBackend = true; // Always use backend server
    }

    /**
     * Make request through backend server
     */
    async request(endpoint, options = {}) {
        // Remove leading slash if present since baseURL already has /api
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const url = `${this.baseURL}/${cleanEndpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `API Error: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Printful API Error:', error);
            throw error;
        }
    }

    /**
     * Get store information
     */
    async getStoreInfo() {
        try {
            const data = await this.request('store');
            this.storeId = data.id;
            return data;
        } catch (error) {
            console.error('Failed to get store info:', error);
            throw error;
        }
    }

    /**
     * Get all products from the store
     */
    async getProducts() {
        try {
            const products = await this.request('products');
            return products || [];
        } catch (error) {
            console.error('Failed to get products:', error);
            return [];
        }
    }

    /**
     * Get detailed product information including variants
     */
    async getProduct(productId) {
        try {
            const product = await this.request(`products/${productId}`);
            return product;
        } catch (error) {
            console.error(`Failed to get product ${productId}:`, error);
            throw error;
        }
    }

    /**
     * Get product variant information
     */
    async getVariant(variantId) {
        try {
            const variant = await this.request(`/store/variants/${variantId}`);
            return variant;
        } catch (error) {
            console.error(`Failed to get variant ${variantId}:`, error);
            throw error;
        }
    }

    /**
     * Calculate shipping rates for an order
     */
    async calculateShipping(recipient, items) {
        try {
            const shippingInfo = await this.request('/shipping/rates', {
                method: 'POST',
                body: JSON.stringify({
                    recipient,
                    items
                })
            });
            return shippingInfo;
        } catch (error) {
            console.error('Failed to calculate shipping:', error);
            throw error;
        }
    }

    /**
     * Create an order
     */
    async createOrder(orderData) {
        try {
            const order = await this.request('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            return order;
        } catch (error) {
            console.error('Failed to create order:', error);
            throw error;
        }
    }

    /**
     * Get order information
     */
    async getOrder(orderId) {
        try {
            const order = await this.request(`/orders/${orderId}`);
            return order;
        } catch (error) {
            console.error(`Failed to get order ${orderId}:`, error);
            throw error;
        }
    }

    /**
     * Estimate order costs
     */
    async estimateOrderCosts(orderData) {
        try {
            const estimate = await this.request('/orders/estimate-costs', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            return estimate;
        } catch (error) {
            console.error('Failed to estimate order costs:', error);
            throw error;
        }
    }

    /**
     * Get all countries
     */
    async getCountries() {
        try {
            const countries = await this.request('/countries');
            return countries;
        } catch (error) {
            console.error('Failed to get countries:', error);
            return [];
        }
    }

    /**
     * Get tax rate for a specific location
     */
    async getTaxRate(recipient) {
        try {
            const taxRate = await this.request('/tax/rates', {
                method: 'POST',
                body: JSON.stringify({ recipient })
            });
            return taxRate;
        } catch (error) {
            console.error('Failed to get tax rate:', error);
            return { rate: 0 };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrintfulAPI;
}
