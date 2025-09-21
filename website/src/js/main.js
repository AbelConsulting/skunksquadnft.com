/**
 * SkunkSquad NFT Website - Main JavaScript
 * Handles navigation, interactions, and UI functionality
 */

class SkunkSquadWebsite {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.startAnimations();
    }

    init() {
        console.log('🦨 SkunkSquad NFT Website Initialized');
        
        // Mobile menu state
        this.mobileMenuOpen = false;
        
        // Smooth scrolling for navigation links
        this.setupSmoothScrolling();
        
        // Initialize counters
        this.initializeCounters();
        
        // Setup particles background
        this.setupParticles();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Buy now buttons
        const buyNowButtons = document.querySelectorAll('#buy-now, #buy-with-card, #buy-with-card-modal');
        buyNowButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.openPurchaseModal();
            });
        });

        // ETH purchase buttons
        const buyWithEthButtons = document.querySelectorAll('#buy-with-eth, #buy-with-eth-modal');
        buyWithEthButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleEthPurchase();
            });
        });

        // Connect wallet button
        const connectWalletButton = document.getElementById('connect-wallet');
        if (connectWalletButton) {
            connectWalletButton.addEventListener('click', () => {
                this.handleWalletConnection();
            });
        }

        // Modal functionality
        this.setupModal();

        // Navbar scroll effect
        this.setupNavbarScroll();

        // Keyboard navigation
        this.setupKeyboardNavigation();
    }

    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerHeight = 80;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (this.mobileMenuOpen) {
                        this.toggleMobileMenu();
                    }
                }
            });
        });
    }

    toggleMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        if (this.mobileMenuOpen) {
            navMenu.style.display = 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '100%';
            navMenu.style.left = '0';
            navMenu.style.right = '0';
            navMenu.style.background = 'rgba(0, 0, 0, 0.95)';
            navMenu.style.padding = '1rem';
            navMenu.style.borderTop = '1px solid #374151';
            navMenu.classList.add('animate-fade-in-down');
            
            hamburger.classList.add('active');
        } else {
            navMenu.style.display = 'none';
            navMenu.classList.remove('animate-fade-in-down');
            hamburger.classList.remove('active');
        }
    }

    openPurchaseModal() {
        const modal = document.getElementById('purchase-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus management for accessibility
            const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }

    closePurchaseModal() {
        const modal = document.getElementById('purchase-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    setupModal() {
        const modal = document.getElementById('purchase-modal');
        const closeButton = document.querySelector('.modal-close');
        
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.closePurchaseModal();
            });
        }
        
        if (modal) {
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closePurchaseModal();
                }
            });
            
            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.closePurchaseModal();
                }
            });
        }
    }

    setupNavbarScroll() {
        let lastScrollY = window.scrollY;
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (navbar) {
                if (currentScrollY > 100) {
                    navbar.style.background = 'rgba(0, 0, 0, 0.98)';
                    navbar.style.backdropFilter = 'blur(20px)';
                } else {
                    navbar.style.background = 'rgba(0, 0, 0, 0.95)';
                    navbar.style.backdropFilter = 'blur(20px)';
                }
                
                // Hide/show navbar on scroll
                if (currentScrollY > lastScrollY && currentScrollY > 200) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollY = currentScrollY;
        });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Trigger counter animations
                    if (entry.target.classList.contains('counter-animate')) {
                        this.animateCounter(entry.target);
                    }
                    
                    // Trigger progress bar animations
                    if (entry.target.classList.contains('progress-animated')) {
                        this.animateProgressBars(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        const animatedElements = document.querySelectorAll(
            '.fade-in-on-scroll, .slide-in-left-on-scroll, .slide-in-right-on-scroll, .scale-in-on-scroll'
        );
        
        animatedElements.forEach(el => observer.observe(el));

        // Observe specific sections
        const sections = document.querySelectorAll('section');
        sections.forEach(section => observer.observe(section));
    }

    initializeCounters() {
        const counterElements = document.querySelectorAll('.stat-number, .metric-value');
        
        counterElements.forEach(element => {
            element.classList.add('counter-animate');
            element.setAttribute('data-target', element.textContent.replace(/[^\d.]/g, ''));
            element.textContent = '0';
        });
    }

    animateCounter(element) {
        const target = parseFloat(element.getAttribute('data-target'));
        const originalText = element.parentElement.querySelector('.stat-number, .metric-value').textContent;
        const suffix = originalText.replace(/[\d.]/g, '').trim();
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60 FPS
        let current = 0;

        const updateCounter = () => {
            current += increment;
            
            if (current >= target) {
                element.textContent = target + suffix;
            } else {
                const displayValue = Math.floor(current * 100) / 100;
                element.textContent = displayValue + suffix;
                requestAnimationFrame(updateCounter);
            }
        };

        updateCounter();
    }

    animateProgressBars(container) {
        const progressBars = container.querySelectorAll('.progress-fill');
        
        progressBars.forEach((bar, index) => {
            setTimeout(() => {
                bar.style.width = bar.getAttribute('style').match(/width:\s*(\d+%)/)?.[1] || '0%';
            }, index * 200);
        });
    }

    setupParticles() {
        const particleContainer = document.querySelector('.particles-background');
        
        if (particleContainer) {
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 10 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
                particleContainer.appendChild(particle);
            }
        }
    }

    startAnimations() {
        // Add staggered animations to hero elements
        const heroElements = document.querySelectorAll('.hero-badges .badge');
        heroElements.forEach((element, index) => {
            element.classList.add('animate-fade-in-up');
            element.style.animationDelay = `${index * 0.1}s`;
        });

        // Add animations to feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            card.classList.add('fade-in-on-scroll');
            card.style.animationDelay = `${index * 0.1}s`;
        });

        // Add animations to stats
        const stats = document.querySelectorAll('.stat');
        stats.forEach((stat, index) => {
            stat.classList.add('scale-in-on-scroll');
            stat.style.animationDelay = `${index * 0.1}s`;
        });
    }

    setupKeyboardNavigation() {
        // Improved keyboard navigation
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        document.addEventListener('keydown', (e) => {
            // Tab trapping in modals
            const modal = document.querySelector('.modal.active');
            if (modal && (e.key === 'Tab' || e.keyCode === 9)) {
                const focusable = modal.querySelectorAll(focusableElements);
                const firstFocusable = focusable[0];
                const lastFocusable = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // Wallet connection handler
    async handleWalletConnection() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                console.log('🦨 Connecting to MetaMask...');
                
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                
                if (accounts.length > 0) {
                    console.log('✅ Wallet connected:', accounts[0]);
                    this.updateWalletUI(accounts[0]);
                    this.showNotification('Wallet connected successfully!', 'success');
                } else {
                    this.showNotification('No accounts found. Please check your wallet.', 'error');
                }
            } else {
                console.log('❌ MetaMask not detected');
                this.showNotification('MetaMask not detected. Please install MetaMask to continue.', 'error');
                
                // Redirect to MetaMask installation
                setTimeout(() => {
                    window.open('https://metamask.io/download/', '_blank');
                }, 2000);
            }
        } catch (error) {
            console.error('❌ Wallet connection error:', error);
            this.showNotification('Failed to connect wallet. Please try again.', 'error');
        }
    }

    updateWalletUI(address) {
        const connectWalletButton = document.getElementById('connect-wallet');
        if (connectWalletButton) {
            const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
            connectWalletButton.textContent = shortAddress;
            connectWalletButton.classList.add('connected');
        }
    }

    // ETH purchase handler
    async handleEthPurchase() {
        try {
            console.log('🦨 Initiating ETH purchase...');
            
            // Check if wallet is connected
            if (typeof window.ethereum === 'undefined') {
                this.showNotification('MetaMask not detected. Please install MetaMask.', 'error');
                return;
            }

            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length === 0) {
                this.showNotification('Please connect your wallet first.', 'error');
                return;
            }

            // For demo purposes - would integrate with actual smart contract
            this.showNotification('ETH purchase functionality coming soon!', 'info');
            
        } catch (error) {
            console.error('❌ ETH purchase error:', error);
            this.showNotification('Failed to process ETH purchase. Please try again.', 'error');
        }
    }

    // Notification system
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Manual close
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// CSS for notifications
const notificationStyles = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .notification {
        font-family: 'Inter', sans-serif;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.25rem;
        cursor: pointer;
        margin-left: auto;
        opacity: 0.8;
        transition: opacity 0.2s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.skunkSquadWebsite = new SkunkSquadWebsite();
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause heavy animations/computations
        console.log('🦨 Page hidden - pausing animations');
    } else {
        // Resume animations
        console.log('🦨 Page visible - resuming animations');
    }
});

// Service worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('🦨 SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('🦨 SW registration failed: ', registrationError);
            });
    });
}

// Export for module usage
export default SkunkSquadWebsite;