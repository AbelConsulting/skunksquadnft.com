/**
 * SkunkSquad NFT - Mobile Enhancement Module
 * Optimizes touch interactions and mobile UX
 */

class MobileEnhancer {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTouch = 'ontouchstart' in window;
        this.hamburger = null;
        this.navMenu = null;
        this.init();
    }

    /**
     * Detect mobile devices
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || window.innerWidth <= 768;
    }

    /**
     * Initialize mobile enhancements
     */
    init() {
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
        }

        if (this.isTouch) {
            document.body.classList.add('touch-device');
        }

        this.setupHamburgerMenu();
        this.setupTouchFeedback();
        this.setupViewportHeight();
        this.setupOrientationChange();
        this.preventPullToRefresh();
        this.optimizeScrolling();
        this.setupSafeAreas();
        
        console.log('✅ Mobile enhancements initialized', {
            isMobile: this.isMobile,
            isTouch: this.isTouch,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        });
    }

    /**
     * Setup hamburger menu functionality
     */
    setupHamburgerMenu() {
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('nav-menu');
        this.navSecondary = document.querySelector('.nav-secondary');

        if (!this.hamburger) {
            console.warn('⚠️ Hamburger menu element not found');
            return;
        }

        // Use nav-secondary for mobile overlay (as per main.css)
        const mobileMenu = this.navSecondary || this.navMenu;

        if (!mobileMenu) {
            console.warn('⚠️ Mobile menu element not found');
            return;
        }

        // Toggle menu
        this.hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Close menu on link click
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Close menu on outside click (only on the overlay area)
        if (this.navSecondary) {
            this.navSecondary.addEventListener('click', (e) => {
                // Close if clicking the overlay background, not the menu content
                if (e.target === this.navSecondary) {
                    this.closeMenu();
                }
            });
        }

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen()) {
                this.closeMenu();
            }
        });
    }

    /**
     * Check if menu is open
     */
    isMenuOpen() {
        if (this.navSecondary) {
            return this.navSecondary.classList.contains('active');
        }
        return this.navMenu && this.navMenu.classList.contains('active');
    }

    /**
     * Toggle mobile menu
     */
    toggleMenu() {
        this.hamburger.classList.toggle('active');
        
        // Toggle the correct menu element based on viewport
        if (this.navSecondary) {
            this.navSecondary.classList.toggle('active');
        } else if (this.navMenu) {
            this.navMenu.classList.toggle('active');
        }
        
        // Prevent body scroll when menu is open
        if (this.isMenuOpen()) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    /**
     * Close mobile menu
     */
    closeMenu() {
        this.hamburger.classList.remove('active');
        
        if (this.navSecondary) {
            this.navSecondary.classList.remove('active');
        }
        if (this.navMenu) {
            this.navMenu.classList.remove('active');
        }
        
        document.body.style.overflow = '';
    }

    /**
     * Setup touch feedback for buttons
     */
    setupTouchFeedback() {
        if (!this.isTouch) return;

        const touchables = document.querySelectorAll('.btn, button, .nav-link, .social-link');
        
        touchables.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.classList.add('touching');
            }, { passive: true });

            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.classList.remove('touching');
                }, 150);
            }, { passive: true });

            element.addEventListener('touchcancel', () => {
                element.classList.remove('touching');
            }, { passive: true });
        });
    }

    /**
     * Setup proper viewport height for mobile browsers
     * Fixes issues with address bar showing/hiding
     */
    setupViewportHeight() {
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);
    }

    /**
     * Handle orientation changes
     */
    setupOrientationChange() {
        const handleOrientation = () => {
            const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
            document.body.classList.remove('portrait', 'landscape');
            document.body.classList.add(orientation);

            // Close menu on orientation change
            if (this.isMenuOpen()) {
                this.closeMenu();
            }

            console.log(`📱 Orientation: ${orientation}`);
        };

        handleOrientation();
        window.addEventListener('orientationchange', handleOrientation);
        window.addEventListener('resize', handleOrientation);
    }

    /**
     * Prevent pull-to-refresh on iOS
     */
    preventPullToRefresh() {
        let lastTouchY = 0;
        let preventPullToRefresh = false;

        document.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            lastTouchY = e.touches[0].clientY;
            preventPullToRefresh = window.pageYOffset === 0;
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const touchYDelta = touchY - lastTouchY;
            lastTouchY = touchY;

            if (preventPullToRefresh) {
                // Prevent pull-to-refresh if trying to scroll up from the top
                if (touchYDelta > 0) {
                    e.preventDefault();
                }
            }
        }, { passive: false });
    }

    /**
     * Optimize scrolling performance
     */
    optimizeScrolling() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#home') return;

                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    if (window.mobileEnhancer) {
                        window.mobileEnhancer.closeMenu();
                    }
                }
            });
        });

        // Add scroll-based classes for header
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                document.body.classList.add('scrolled');
            } else {
                document.body.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (currentScroll > lastScroll && currentScroll > 200) {
                document.body.classList.add('scroll-down');
                document.body.classList.remove('scroll-up');
            } else {
                document.body.classList.add('scroll-up');
                document.body.classList.remove('scroll-down');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    /**
     * Setup safe areas for notch devices
     */
    setupSafeAreas() {
        // Detect if device has notch/safe areas
        const hasSafeAreas = CSS.supports('padding-top: env(safe-area-inset-top)');
        
        if (hasSafeAreas) {
            document.body.classList.add('has-safe-areas');
            console.log('✅ Safe area support detected');
        }
    }

    /**
     * Get device info for debugging
     */
    getDeviceInfo() {
        return {
            isMobile: this.isMobile,
            isTouch: this.isTouch,
            userAgent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            pixelRatio: window.devicePixelRatio,
            orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
            platform: navigator.platform,
            standalone: window.navigator.standalone,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }

    /**
     * Show device info (for debugging)
     */
    showDeviceInfo() {
        const info = this.getDeviceInfo();
        console.table(info);
        return info;
    }
}

/**
 * Mobile form optimization
 */
class MobileFormOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeInputs();
        this.setupNumberSteppers();
    }

    /**
     * Optimize input fields for mobile
     */
    optimizeInputs() {
        // Prevent zoom on input focus for iOS
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // Ensure font-size is at least 16px to prevent zoom
            const fontSize = window.getComputedStyle(input).fontSize;
            if (parseFloat(fontSize) < 16) {
                input.style.fontSize = '16px';
            }
        });
    }

    /**
     * Setup better number input steppers
     */
    setupNumberSteppers() {
        const qtyInput = document.getElementById('wmc-quantity');
        const decBtn = document.getElementById('wmc-qty-dec');
        const incBtn = document.getElementById('wmc-qty-inc');

        if (!qtyInput || !decBtn || !incBtn) return;

        // Prevent default behavior and use custom logic
        decBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const current = parseInt(qtyInput.value) || 1;
            const min = parseInt(qtyInput.min) || 1;
            if (current > min) {
                qtyInput.value = current - 1;
                qtyInput.dispatchEvent(new Event('change'));
                this.hapticFeedback('light');
            }
        });

        incBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const current = parseInt(qtyInput.value) || 1;
            const max = parseInt(qtyInput.max) || 10;
            if (current < max) {
                qtyInput.value = current + 1;
                qtyInput.dispatchEvent(new Event('change'));
                this.hapticFeedback('light');
            }
        });

        // Validate on input
        qtyInput.addEventListener('input', () => {
            let value = parseInt(qtyInput.value);
            const min = parseInt(qtyInput.min) || 1;
            const max = parseInt(qtyInput.max) || 10;

            if (isNaN(value) || value < min) {
                qtyInput.value = min;
            } else if (value > max) {
                qtyInput.value = max;
                this.hapticFeedback('warning');
            }
        });
    }

    /**
     * Haptic feedback (if supported)
     */
    hapticFeedback(type = 'light') {
        if (navigator.vibrate) {
            switch(type) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(20);
                    break;
                case 'heavy':
                    navigator.vibrate(30);
                    break;
                case 'warning':
                    navigator.vibrate([10, 50, 10]);
                    break;
                default:
                    navigator.vibrate(10);
            }
        }
    }
}

/**
 * Mobile performance optimizer
 */
class MobilePerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.optimizeAnimations();
        this.reduceMotionCheck();
    }

    /**
     * Lazy load images
     */
    lazyLoadImages() {
        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports lazy loading
            const images = document.querySelectorAll('img[loading="lazy"]');
            console.log(`✅ Lazy loading ${images.length} images natively`);
        } else {
            // Fallback for browsers that don't support lazy loading
            const images = document.querySelectorAll('img[loading="lazy"]');
            
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    /**
     * Optimize animations based on device capability
     */
    optimizeAnimations() {
        // Detect if device is low-end
        const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
        
        if (isLowEnd) {
            document.body.classList.add('reduce-animations');
            console.log('⚡ Reducing animations for low-end device');
        }
    }

    /**
     * Check for reduced motion preference
     */
    reduceMotionCheck() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduce-motion');
            console.log('♿ Reduced motion enabled');
        }

        // Listen for changes
        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('reduce-motion');
            } else {
                document.body.classList.remove('reduce-motion');
            }
        });
    }
}

/**
 * Initialize mobile enhancements when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileEnhancements);
} else {
    initMobileEnhancements();
}

function initMobileEnhancements() {
    window.mobileEnhancer = new MobileEnhancer();
    window.mobileFormOptimizer = new MobileFormOptimizer();
    window.mobilePerformanceOptimizer = new MobilePerformanceOptimizer();
    
    console.log('📱 Mobile optimization complete');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MobileEnhancer,
        MobileFormOptimizer,
        MobilePerformanceOptimizer
    };
}
