/**
 * SkunkSquad Shop - Main Shop Functionality
 */

// Configuration - REPLACE WITH YOUR ACTUAL PRINTFUL API TOKEN
const PRINTFUL_API_TOKEN = '1sI7deTsmktuSt6G3KtAxq4ZahxKqX7GIuTMbcy0';

// Initialize Printful API
let printfulAPI;
let allProducts = [];
let filteredProducts = [];
let isNFTHolder = false;
let userAddress = null;

// NFT Holder Discount
const NFT_HOLDER_DISCOUNT = 0.15; // 15% discount

/**
 * Initialize shop
 */
async function initShop() {
    try {
        // Initialize Printful API
        printfulAPI = new PrintfulAPI(PRINTFUL_API_TOKEN);
        
        // Check if user is NFT holder
        await checkNFTOwnership();
        
        // Load products
        await loadProducts();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize filters
        applyFilters();
    } catch (error) {
        console.error('Failed to initialize shop:', error);
        showError('Failed to load shop. Please try again later.');
    }
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
async function loadProducts() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const productsGrid = document.getElementById('productsGrid');
    const errorMessage = document.getElementById('errorMessage');

    try {
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        productsGrid.innerHTML = '';

        // Get products from Printful
        allProducts = await printfulAPI.getProducts();
        
        if (!allProducts || allProducts.length === 0) {
            showEmptyState('No products available yet. Check back soon!');
            return;
        }

        // Get detailed info for each product
        const productsWithDetails = await Promise.all(
            allProducts.map(async (product) => {
                try {
                    const details = await printfulAPI.getProduct(product.id);
                    return details;
                } catch (error) {
                    console.error(`Failed to load product ${product.id}:`, error);
                    return null;
                }
            })
        );

        allProducts = productsWithDetails.filter(p => p !== null);
        filteredProducts = [...allProducts];
        
        displayProducts(filteredProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Unable to load products. Please try again later.');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Display products in grid
 */
function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');

    if (!products || products.length === 0) {
        productsGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    
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

    // Connect wallet button
    document.getElementById('connectWalletBtn')?.addEventListener('click', connectWallet);

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

    if (!size || !color) {
        alert('Please select size and color');
        return;
    }

    // Here you would implement actual cart functionality
    // For now, we'll show a success message
    alert(`Added ${quantity} item(s) to cart!\n\nThis is a demo. Actual cart functionality coming soon.`);
    closeProductModal();
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
