/**
 * SkunkSquad Shop - Main Shop Functionality
 */

// Note: API token is now handled by the backend server for security
// The frontend no longer needs the token - it connects to /api endpoints

// Initialize Printful API
let printfulAPI;
let allProducts = [];
let filteredProducts = [];
let isNFTHolder = false;
let userAddress = null;
let cart = [];

// NFT Holder Discount
const NFT_HOLDER_DISCOUNT = 0.15; // 15% discount

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('skunkSquadCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartBadge();
        } catch (error) {
            console.error('Failed to load cart:', error);
            cart = [];
        }
    }
}

// Save cart to localStorage
function saveCart() {
    try {
        localStorage.setItem('skunkSquadCart', JSON.stringify(cart));
        updateCartBadge();
    } catch (error) {
        console.error('Failed to save cart:', error);
    }
}

/**
 * Initialize shop
 */
async function initShop() {
    try {
        // Load cart from localStorage
        loadCart();
        
        // Initialize Printful API (no token needed - uses backend)
        printfulAPI = new PrintfulAPI();
        
        // Check if backend server is available
        const serverAvailable = await checkServerAvailability();
        
        // Check if user is NFT holder
        await checkNFTOwnership();
        
        // Load products
        await loadProducts(serverAvailable);
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize filters
        applyFilters();
    } catch (error) {
        console.error('Failed to initialize shop:', error);
        // Load demo products as fallback
        allProducts = getMockProducts();
        filteredProducts = [...allProducts];
        displayProducts(filteredProducts);
        showDemoBanner();
    }
}

/**
 * Check if backend server is available
 */
async function checkServerAvailability() {
    // Try production API first (Railway deployment)
    try {
        const productionURL = 'https://skunksquadnftcom-production.up.railway.app/api';
        console.log('🔍 Checking production server:', productionURL);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${productionURL}/health`, {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Production server is running:', data);
            return true;
        } else {
            console.log('❌ Production server returned status:', response.status);
        }
    } catch (error) {
        console.log('❌ Production server not available:', error.message);
    }
    
    // Try localhost as fallback for development
    try {
        const baseURL = 'http://localhost:3001/api';
        console.log('🔍 Trying localhost for development:', baseURL);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout for localhost
        
        const response = await fetch(`${baseURL}/health`, { 
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Localhost server is running:', data);
            return true;
        }
    } catch (error) {
        console.log('❌ Localhost not available:', error.message);
    }
    
    console.log('⚠️ Using demo mode - no server available');
    return false;
}

/**
 * Check if connected wallet owns SkunkSquad NFT
 */
async function checkNFTOwnership() {
    try {
        if (typeof window.ethereum === 'undefined') {
            return;
        }

        // Try to get connected account
        const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
        });

        if (accounts.length === 0) {
            return;
        }

        userAddress = accounts[0];

        // Check NFT balance
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(
            window.CONTRACT_ABI,
            window.CONTRACT_ADDRESS
        );

        const balance = await contract.methods.balanceOf(userAddress).call();
        isNFTHolder = parseInt(balance) > 0;

        if (isNFTHolder) {
            showMemberBenefits();
        }
    } catch (error) {
        console.error('Error checking NFT ownership:', error);
    }
}

/**
 * Show member benefits banner
 */
function showMemberBenefits() {
    const banner = document.getElementById('memberBenefitBanner');
    if (banner) {
        banner.style.display = 'flex';
    }
}

/**
 * Load products from Printful
 */
async function loadProducts(serverAvailable = true) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const productsGrid = document.getElementById('productsGrid');
    const errorMessage = document.getElementById('errorMessage');

    try {
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        productsGrid.innerHTML = '';

        console.log('Loading products...');

        // If server is not available, use demo products immediately
        if (!serverAvailable) {
            console.log('Using demo products (server not running)');
            allProducts = getMockProducts();
            filteredProducts = [...allProducts];
            displayProducts(filteredProducts);
            showDemoBanner();
            return;
        }

        // Get products from backend/Printful
        let usingMockData = false;
        try {
            allProducts = await printfulAPI.getProducts();
            console.log('Products loaded:', allProducts);
        } catch (apiError) {
            console.error('Printful API Error:', apiError);
            
            // If CORS or API error, use mock data for demonstration
            console.log('Using mock product data for demonstration');
            allProducts = getMockProducts();
            usingMockData = true;
            showDemoBanner();
        }
        
        if (!allProducts || allProducts.length === 0) {
            console.log('No products found, using demo products');
            allProducts = getMockProducts();
            showDemoBanner();
        }

        // Get detailed info for each product (if using real API)
        if (allProducts[0] && !allProducts[0].retail_price && !usingMockData) {
            const productsWithDetails = await Promise.all(
                allProducts.map(async (product) => {
                    try {
                        const details = await printfulAPI.getProduct(product.id);
                        // Transform Printful V2 API response
                        const syncProduct = details.sync_product || details;
                        const syncVariants = details.sync_variants || [];
                        
                        // Extract first variant for pricing
                        const firstVariant = syncVariants[0] || {};
                        
                        return {
                            id: syncProduct.id,
                            name: syncProduct.name,
                            thumbnail_url: syncProduct.thumbnail_url,
                            retail_price: firstVariant.retail_price || '0.00',
                            currency: firstVariant.currency || 'USD',
                            variants: syncVariants.map(v => ({
                                id: v.id,
                                size: v.size || 'One Size',
                                color: v.color || v.product?.name?.match(/\(([^)]+)\)/)?.[1] || 'Default',
                                retail_price: v.retail_price,
                                sku: v.sku,
                                files: v.files
                            })),
                            sync_product: syncProduct,
                            sync_variants: syncVariants
                        };
                    } catch (error) {
                        console.error(`Failed to load product ${product.id}:`, error);
                        return null;
                    }
                })
            );
            allProducts = productsWithDetails.filter(p => p !== null);
        }

        filteredProducts = [...allProducts];
        console.log('Displaying', filteredProducts.length, 'products');
        
        displayProducts(filteredProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        
        // Fallback to mock data
        allProducts = getMockProducts();
        filteredProducts = [...allProducts];
        displayProducts(filteredProducts);
        showDemoBanner();
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Show demo banner
 */
function showDemoBanner() {
    const demoBanner = document.getElementById('demoBanner');
    if (demoBanner) {
        demoBanner.style.display = 'flex';
    }
}

/**
 * Get mock products for demonstration/testing
 */
function getMockProducts() {
    return [
        {
            id: 'demo-1',
            name: 'SkunkSquad Classic T-Shirt',
            description: 'Premium cotton t-shirt featuring the iconic SkunkSquad logo. Comfortable, stylish, and perfect for representing the squad.',
            retail_price: '29.99',
            thumbnail_url: './assets/charlesskunk.webp',
            variants: [
                { size: 'S', color: 'Black' },
                { size: 'M', color: 'Black' },
                { size: 'L', color: 'Black' },
                { size: 'XL', color: 'Black' },
                { size: 'S', color: 'White' },
                { size: 'M', color: 'White' },
                { size: 'L', color: 'White' },
                { size: 'XL', color: 'White' }
            ]
        },
        {
            id: 'demo-2',
            name: 'SkunkSquad Hoodie',
            description: 'Cozy premium hoodie with SkunkSquad artwork. Perfect for cool weather and showcasing your NFT pride.',
            retail_price: '54.99',
            thumbnail_url: './assets/skunksample1.png',
            variants: [
                { size: 'S', color: 'Black' },
                { size: 'M', color: 'Black' },
                { size: 'L', color: 'Black' },
                { size: 'XL', color: 'Black' },
                { size: 'S', color: 'Purple' },
                { size: 'M', color: 'Purple' },
                { size: 'L', color: 'Purple' },
                { size: 'XL', color: 'Purple' }
            ]
        },
        {
            id: 'demo-3',
            name: 'SkunkSquad Mug',
            description: 'Start your day with the squad! Ceramic mug featuring exclusive SkunkSquad designs.',
            retail_price: '14.99',
            thumbnail_url: './assets/skunksample2.png',
            variants: [
                { size: '11oz', color: 'White' },
                { size: '15oz', color: 'White' },
                { size: '11oz', color: 'Black' },
                { size: '15oz', color: 'Black' }
            ]
        },
        {
            id: 'demo-4',
            name: 'SkunkSquad Baseball Cap',
            description: 'Adjustable baseball cap with embroidered SkunkSquad logo. Stylish and practical.',
            retail_price: '24.99',
            thumbnail_url: './assets/skunksample3.png',
            variants: [
                { size: 'One Size', color: 'Black' },
                { size: 'One Size', color: 'White' },
                { size: 'One Size', color: 'Purple' }
            ]
        },
        {
            id: 'demo-5',
            name: 'SkunkSquad Sticker Pack',
            description: 'Set of 5 premium vinyl stickers featuring various SkunkSquad characters and logos.',
            retail_price: '9.99',
            thumbnail_url: './assets/skunksample4.png',
            variants: [
                { size: 'Standard', color: 'Full Color' }
            ]
        },
        {
            id: 'demo-6',
            name: 'SkunkSquad Tote Bag',
            description: 'Durable canvas tote bag with SkunkSquad artwork. Perfect for daily use.',
            retail_price: '19.99',
            thumbnail_url: './assets/skunksample5.png',
            variants: [
                { size: 'Standard', color: 'Natural' },
                { size: 'Standard', color: 'Black' }
            ]
        }
    ];
}

/**
 * Display products in grid
 */
function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    const productCount = document.getElementById('productCount');

    if (!products || products.length === 0) {
        productsGrid.innerHTML = '';
        emptyState.style.display = 'block';
        productCount.textContent = '';
        return;
    }

    emptyState.style.display = 'none';
    productCount.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
    
    productsGrid.innerHTML = products.map(product => {
        const price = parseFloat(product.retail_price || 0);
        const discountedPrice = isNFTHolder ? price * (1 - NFT_HOLDER_DISCOUNT) : price;
        const imageUrl = product.thumbnail_url || './assets/charlesskunk.webp';
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                    ${isNFTHolder ? '<span class="discount-badge">15% OFF</span>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        ${isNFTHolder ? `
                            <span class="price-original">$${price.toFixed(2)}</span>
                            <span class="price-discounted">$${discountedPrice.toFixed(2)}</span>
                        ` : `
                            <span class="price-current">$${price.toFixed(2)}</span>
                        `}
                    </div>
                    <button class="btn btn-secondary btn-view-product" data-product-id="${product.id}">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add click handlers to view buttons
    document.querySelectorAll('.btn-view-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            showProductModal(productId);
        });
    });
}

/**
 * Show product details modal
 */
async function showProductModal(productId) {
    const modal = document.getElementById('productModal');
    const product = allProducts.find(p => p.id == productId);
    
    if (!product) return;

    // Store product ID on modal
    modal.dataset.productId = productId;

    // Populate modal
    document.getElementById('modalProductImage').src = product.thumbnail_url || './assets/charlesskunk.webp';
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductDescription').textContent = product.description || 'Premium SkunkSquad merchandise.';
    document.getElementById('modalProductSku').textContent = product.id;
    
    const price = parseFloat(product.retail_price || 0);
    const discountedPrice = isNFTHolder ? price * (1 - NFT_HOLDER_DISCOUNT) : price;
    
    if (isNFTHolder) {
        document.getElementById('modalProductPrice').innerHTML = `
            <span style="text-decoration: line-through; color: #888;">$${price.toFixed(2)}</span>
            <span style="color: #10b981; font-size: 1.5rem; font-weight: bold;">$${discountedPrice.toFixed(2)}</span>
        `;
        document.getElementById('modalDiscountBadge').style.display = 'inline-block';
    } else {
        document.getElementById('modalProductPrice').innerHTML = `
            <span style="font-size: 1.5rem; font-weight: bold;">$${price.toFixed(2)}</span>
        `;
        document.getElementById('modalDiscountBadge').style.display = 'none';
    }

    // Populate size options
    const sizeSelect = document.getElementById('sizeSelect');
    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    if (product.variants && product.variants.length > 0) {
        const sizes = [...new Set(product.variants.map(v => v.size))].filter(s => s);
        sizes.forEach(size => {
            sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
        });
    }

    // Populate color options
    const colorSelect = document.getElementById('colorSelect');
    colorSelect.innerHTML = '<option value="">Select Color</option>';
    if (product.variants && product.variants.length > 0) {
        const colors = [...new Set(product.variants.map(v => v.color))].filter(c => c);
        colors.forEach(color => {
            colorSelect.innerHTML += `<option value="${color}">${color}</option>`;
        });
    }
    
    // Update mockup image when variant is selected
    const updateMockupImage = () => {
        const selectedSize = sizeSelect.value;
        const selectedColor = colorSelect.value;
        
        if (selectedSize && selectedColor && product.variants) {
            const variant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
            if (variant && variant.files) {
                // Find preview file
                const previewFile = variant.files.find(f => f.type === 'preview');
                if (previewFile && previewFile.preview_url) {
                    document.getElementById('modalProductImage').src = previewFile.preview_url;
                    return;
                }
            }
        }
        
        // Fallback to product thumbnail
        document.getElementById('modalProductImage').src = product.thumbnail_url || './assets/charlesskunk.webp';
    };
    
    sizeSelect.addEventListener('change', updateMockupImage);
    colorSelect.addEventListener('change', updateMockupImage);

    // Reset quantity
    document.getElementById('quantityInput').value = 1;

    // Show stock status
    document.getElementById('modalProductStock').innerHTML = 
        '<span style="color: #10b981;">✓ In Stock</span>';

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Close product modal
 */
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

/**
 * Apply filters to products
 */
function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    // Filter products
    filteredProducts = allProducts.filter(product => {
        // Category filter
        const categoryMatch = categoryFilter === 'all' || 
            (product.category && product.category.toLowerCase().includes(categoryFilter));
        
        // Search filter
        const searchMatch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm));
        
        return categoryMatch && searchMatch;
    });

    // Sort products
    switch (sortFilter) {
        case 'price-low':
            filteredProducts.sort((a, b) => 
                parseFloat(a.retail_price || 0) - parseFloat(b.retail_price || 0)
            );
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => 
                parseFloat(b.retail_price || 0) - parseFloat(a.retail_price || 0)
            );
            break;
        case 'newest':
            filteredProducts.sort((a, b) => 
                new Date(b.created || 0) - new Date(a.created || 0)
            );
            break;
        default: // featured
            break;
    }

    displayProducts(filteredProducts);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Filter listeners
    document.getElementById('categoryFilter')?.addEventListener('change', applyFilters);
    document.getElementById('sortFilter')?.addEventListener('change', applyFilters);
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);

    // Modal close listeners
    document.getElementById('modalClose')?.addEventListener('click', closeProductModal);
    document.getElementById('modalOverlay')?.addEventListener('click', closeProductModal);
    document.getElementById('cartClose')?.addEventListener('click', closeCartModal);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCartModal);

    // Connect wallet button
    document.getElementById('connectWalletBtn')?.addEventListener('click', connectWallet);

    // Cart button
    document.getElementById('cartBtn')?.addEventListener('click', showCartModal);

    // Add to cart button
    document.getElementById('addToCartBtn')?.addEventListener('click', addToCart);

    // Mobile menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu?.classList.toggle('active');
    });
}

/**
 * Connect wallet
 */
async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask to connect your wallet');
            return;
        }

        const accounts = await window.ethereum.request({ 
            method: 'eth_request_accounts' 
        });

        if (accounts.length > 0) {
            userAddress = accounts[0];
            await checkNFTOwnership();
            
            // Update button
            const btn = document.getElementById('connectWalletBtn');
            if (btn) {
                btn.innerHTML = `
                    <span class="btn-icon">✓</span>
                    <span class="btn-text">${userAddress.substring(0, 6)}...${userAddress.substring(38)}</span>
                `;
            }
        }
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet. Please try again.');
    }
}

/**
 * Add product to cart
 */
function addToCart() {
    const size = document.getElementById('sizeSelect').value;
    const color = document.getElementById('colorSelect').value;
    const quantity = parseInt(document.getElementById('quantityInput').value);
    const productId = document.querySelector('.modal[style*="flex"] .modal-body')?.closest('.modal').dataset.productId;
    
    if (!productId) {
        alert('Product information not found');
        return;
    }

    const product = allProducts.find(p => p.id == productId);
    if (!product) {
        alert('Product not found');
        return;
    }

    if (!size || !color) {
        alert('Please select size and color');
        return;
    }

    const price = parseFloat(product.retail_price || 0);
    const finalPrice = isNFTHolder ? price * (1 - NFT_HOLDER_DISCOUNT) : price;

    // Find matching variant for Printful order creation
    let variantId = null;
    if (product.variants) {
        const variant = product.variants.find(v => v.size === size && v.color === color);
        if (variant && variant.id) {
            variantId = variant.id;
        }
    }

    // Add to cart
    const cartItem = {
        id: `${product.id}-${size}-${color}`,
        productId: product.id,
        variantId: variantId, // Important for Printful order fulfillment
        name: product.name,
        size,
        color,
        quantity,
        price: finalPrice,
        originalPrice: price,
        image: product.thumbnail_url || './assets/charlesskunk.webp'
    };

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }

    saveCart();
    showNotification(`✓ Added to cart!`, 'success');
    closeProductModal();
}

/**
 * Update cart badge
 */
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

/**
 * Show cart modal
 */
function showCartModal() {
    const modal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    const cartItemCount = document.getElementById('cartItemCount');

    if (cart.length === 0) {
        cartItems.innerHTML = '';
        cartItems.style.display = 'none';
        emptyCart.style.display = 'block';
        cartSummary.style.display = 'none';
        cartItemCount.textContent = '0 items';
    } else {
        emptyCart.style.display = 'none';
        cartItems.style.display = 'block';
        cartSummary.style.display = 'block';
        
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.size} | Color: ${item.color}</p>
                    <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                </div>
                <div class="cart-item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">&times;</button>
            </div>
        `).join('');

        updateCartSummary();
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Close cart modal
 */
function closeCartModal() {
    const modal = document.getElementById('cartModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

/**
 * Update cart summary
 */
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const originalSubtotal = cart.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
    const discount = originalSubtotal - subtotal;

    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${subtotal.toFixed(2)}`;

    const discountRow = document.getElementById('discountRow');
    if (isNFTHolder && discount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('cartDiscount').textContent = `-$${discount.toFixed(2)}`;
    } else {
        discountRow.style.display = 'none';
    }
}

/**
 * Update cart item quantity
 */
function updateCartQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        showCartModal(); // Refresh cart display
    }
}

/**
 * Remove item from cart
 */
function removeFromCart(index) {
    if (cart[index]) {
        cart.splice(index, 1);
        saveCart();
        showCartModal(); // Refresh cart display
        showNotification('Item removed from cart', 'info');
    }
}

/**
 * Clear entire cart
 */
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        showCartModal(); // Refresh cart display
        showNotification('Cart cleared', 'info');
    }
}

/**
 * Proceed to checkout
 */
function proceedToCheckout() {
    // Redirect to checkout page
    window.location.href = './shop-checkout.html';
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#8b5cf6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Show error message
 */
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.querySelector('p').textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * Show empty state
 */
function showEmptyState(message) {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.querySelector('p').textContent = message;
        emptyState.style.display = 'block';
    }
}

// Initialize shop when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShop);
} else {
    initShop();
}
