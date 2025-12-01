/**
 * SkunkSquad NFT - Toast Notification System
 * Modern toast notifications replacing alert() calls
 */

console.log('🍞 Loading notification system...');

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.maxNotifications = 5;
        this.init();
    }

    init() {
        // Create container for notifications
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
        
        console.log('✅ Notification system initialized');
    }

    /**
     * Show a notification
     * @param {string} message - The message to display
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in ms (0 = permanent)
     * @param {object} options - Additional options
     */
    show(message, type = 'info', duration = 5000, options = {}) {
        const toast = this.createToast(message, type, options);
        
        // Add to container
        this.container.appendChild(toast);
        this.notifications.push(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove old notifications if too many
        if (this.notifications.length > this.maxNotifications) {
            this.remove(this.notifications[0]);
        }
        
        // Auto-remove after duration (if not permanent)
        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }
        
        return toast;
    }

    createToast(message, type, options) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '⏳'
        };
        
        const icon = options.icon || icons[type] || icons.info;
        
        // Build toast content
        let html = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                ${options.title ? `<div class="toast-title">${options.title}</div>` : ''}
                <div class="toast-message">${message}</div>
                ${options.link ? `<a href="${options.link.url}" target="_blank" class="toast-link">${options.link.text}</a>` : ''}
            </div>
        `;
        
        // Add close button if not loading
        if (type !== 'loading') {
            html += `<button class="toast-close" aria-label="Close">×</button>`;
        }
        
        toast.innerHTML = html;
        
        // Add close handler
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.remove(toast));
        }
        
        // Store type for later updates
        toast.dataset.type = type;
        
        return toast;
    }

    remove(toast) {
        if (!toast || !toast.parentElement) return;
        
        // Animate out
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        // Remove from array
        const index = this.notifications.indexOf(toast);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Update an existing toast (useful for loading states)
     */
    update(toast, message, type, options = {}) {
        if (!toast) return;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '⏳'
        };
        
        // Update class
        toast.className = `toast toast-${type} show`;
        toast.dataset.type = type;
        
        // Update icon
        const iconEl = toast.querySelector('.toast-icon');
        if (iconEl) {
            iconEl.textContent = options.icon || icons[type];
        }
        
        // Update message
        const messageEl = toast.querySelector('.toast-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        
        // Add close button if it doesn't exist and not loading
        if (type !== 'loading' && !toast.querySelector('.toast-close')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'toast-close';
            closeBtn.textContent = '×';
            closeBtn.setAttribute('aria-label', 'Close');
            closeBtn.addEventListener('click', () => this.remove(toast));
            toast.appendChild(closeBtn);
        }
        
        // Auto-remove after duration if specified
        if (options.duration && options.duration > 0) {
            setTimeout(() => this.remove(toast), options.duration);
        }
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show(message, 'success', options.duration || 5000, options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options.duration || 7000, options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options.duration || 5000, options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options.duration || 4000, options);
    }

    loading(message, options = {}) {
        return this.show(message, 'loading', 0, options); // Permanent until updated
    }

    // Clear all notifications
    clearAll() {
        this.notifications.forEach(toast => this.remove(toast));
    }

    // Notification for transactions
    transaction(txHash, config) {
        const explorerLink = config.utils.getTxLink(txHash);
        return this.loading('Transaction pending...', {
            title: '⏳ Processing',
            link: {
                url: explorerLink,
                text: 'View on Etherscan →'
            }
        });
    }

    // Update transaction notification
    transactionSuccess(toast, message = 'Transaction confirmed!') {
        if (toast) {
            this.update(toast, message, 'success', { duration: 7000 });
        } else {
            this.success(message);
        }
    }

    transactionError(toast, message = 'Transaction failed') {
        if (toast) {
            this.update(toast, message, 'error', { duration: 7000 });
        } else {
            this.error(message);
        }
    }
}

// Create global instance
window.notifications = new NotificationSystem();

// Also expose on window for backward compatibility
window.showNotification = (message, type, duration, options) => {
    return window.notifications.show(message, type, duration, options);
};

console.log('✅ Notification system ready');
