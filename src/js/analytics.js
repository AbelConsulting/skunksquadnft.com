/**
 * Google Analytics 4 Integration for SkunkSquad NFT
 * Track user behavior, conversions, and mint events
 */

class Analytics {
    constructor() {
        this.GA_MEASUREMENT_ID = 'G-4KN6SRZBP4'; // SkunkSquad NFT GA4 Tracking
        this.initialized = false;
        this.enabled = true; // Set to false to disable tracking
    }

    /**
     * Initialize Google Analytics
     */
    init(measurementId = null) {
        if (measurementId) {
            this.GA_MEASUREMENT_ID = measurementId;
        }

        // Check if already loaded
        if (window.gtag) {
            this.initialized = true;
            return;
        }

        // Load GA4 script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', this.GA_MEASUREMENT_ID, {
            page_path: window.location.pathname,
            send_page_view: true
        });

        this.initialized = true;
        console.log('✅ Google Analytics initialized');
    }

    /**
     * Track page views
     */
    trackPageView(pagePath = null) {
        if (!this.initialized || !window.gtag) return;

        gtag('event', 'page_view', {
            page_path: pagePath || window.location.pathname,
            page_title: document.title,
            page_location: window.location.href
        });
    }

    /**
     * Track wallet connection
     */
    trackWalletConnect(walletType, address) {
        if (!this.initialized || !window.gtag) return;

        gtag('event', 'wallet_connect', {
            event_category: 'Engagement',
            event_label: walletType,
            wallet_address: address.substring(0, 10) + '...', // Privacy
            value: 1
        });
    }

    /**
     * Track mint attempts
     */
    trackMintAttempt(quantity, totalCost) {
        if (!this.initialized || !window.gtag) return;

        gtag('event', 'begin_checkout', {
            event_category: 'Ecommerce',
            currency: 'ETH',
            value: parseFloat(totalCost),
            items: [{
                item_id: 'skunk_squad_nft',
                item_name: 'SkunkSquad NFT',
                price: parseFloat(totalCost) / quantity,
                quantity: quantity
            }]
        });
    }

    /**
     * Track successful mint (conversion!)
     */
    trackMintSuccess(quantity, totalCost, txHash, tokenIds = []) {
        if (!this.initialized || !window.gtag) return;

        // Purchase event (conversion)
        gtag('event', 'purchase', {
            event_category: 'Ecommerce',
            transaction_id: txHash,
            currency: 'ETH',
            value: parseFloat(totalCost),
            items: [{
                item_id: 'skunk_squad_nft',
                item_name: 'SkunkSquad NFT',
                price: parseFloat(totalCost) / quantity,
                quantity: quantity
            }]
        });

        // Custom mint success event
        gtag('event', 'mint_success', {
            event_category: 'Conversion',
            event_label: `${quantity} NFTs`,
            value: quantity,
            quantity: quantity,
            total_cost_eth: totalCost,
            transaction_hash: txHash
        });
    }

    /**
     * Track mint errors
     */
    trackMintError(errorType, errorMessage) {
        if (!this.initialized || !window.gtag) return;

        gtag('event', 'mint_error', {
            event_category: 'Error',
            event_label: errorType,
            error_message: errorMessage
        });
    }

    /**
     * Track button clicks
     */
    trackButtonClick(buttonName, location) {
        if (!this.initialized || !window.gtag) return;

        gtag('event', 'click', {
            event_category: 'Engagement',
            event_label: buttonName,
            button_location: location
        });
    }

    /**
     * Track social clicks
     */
    trackSocialClick(platform, action = 'click') {
        if (!this.initialized || !window.gtag) return;

        gtag('event', 'social_interaction', {
            event_category: 'Social',
            event_label: platform,
            social_network: platform,
            social_action: action
        });
    }

    /**
     * Track external link clicks
     */
    trackOutboundLink(url, destination) {
        if (!this.initialized || !window.gtag) return;

        gtag('event', 'click', {
            event_category: 'Outbound',
            event_label: destination,
            url: url
        });
    }

    /**
     * Track members portal access
     */
    trackMembersAccess(hasNFT, nftCount = 0) {
        if (!this.initialized || !window.gtag) return;

        gtag('event', 'members_access', {
            event_category: 'Engagement',
            event_label: hasNFT ? 'Authorized' : 'Unauthorized',
            has_nft: hasNFT,
            nft_count: nftCount
        });
    }

    /**
     * Track user engagement time
     */
    trackEngagement(section, duration) {
        if (!this.initialized || !window.gtag) return;

        gtag('event', 'user_engagement', {
            event_category: 'Engagement',
            event_label: section,
            engagement_time_msec: duration
        });
    }

    /**
     * Track scroll depth
     */
    trackScrollDepth(percentage) {
        if (!this.initialized || !window.gtag) return;

        gtag('event', 'scroll', {
            event_category: 'Engagement',
            event_label: `${percentage}%`,
            percent_scrolled: percentage
        });
    }

    /**
     * Set user properties
     */
    setUserProperties(properties) {
        if (!this.initialized || !window.gtag) return;

        gtag('set', 'user_properties', properties);
    }

    /**
     * Track custom events
     */
    trackCustomEvent(eventName, parameters = {}) {
        if (!this.initialized || !window.gtag) return;

        gtag('event', eventName, parameters);
    }
}

// Create global instance
window.analytics = new Analytics();

// Auto-initialize on page load (replace with your GA4 ID)
document.addEventListener('DOMContentLoaded', () => {
    // Uncomment and add your GA4 measurement ID to enable
    // window.analytics.init('G-XXXXXXXXXX');
    
    // Track initial page view
    // window.analytics.trackPageView();
    
    // Setup scroll tracking
    setupScrollTracking();
    
    // Setup link tracking
    setupLinkTracking();
});

/**
 * Setup scroll depth tracking
 */
function setupScrollTracking() {
    let scrollMarks = {25: false, 50: false, 75: false, 100: false};
    
    window.addEventListener('scroll', () => {
        const scrollPercentage = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        for (let mark in scrollMarks) {
            if (scrollPercentage >= mark && !scrollMarks[mark]) {
                scrollMarks[mark] = true;
                window.analytics.trackScrollDepth(mark);
            }
        }
    });
}

/**
 * Setup automatic link tracking
 */
function setupLinkTracking() {
    // Track social media clicks
    document.querySelectorAll('a[href*="twitter.com"], a[href*="x.com"], a[href*="discord"], a[href*="opensea"]').forEach(link => {
        link.addEventListener('click', () => {
            const href = link.href.toLowerCase();
            let platform = 'unknown';
            
            if (href.includes('twitter') || href.includes('x.com')) platform = 'twitter';
            else if (href.includes('discord')) platform = 'discord';
            else if (href.includes('opensea')) platform = 'opensea';
            
            window.analytics.trackSocialClick(platform);
        });
    });
    
    // Track external links
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', () => {
            window.analytics.trackOutboundLink(link.href, link.textContent || 'External Link');
        });
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
}
