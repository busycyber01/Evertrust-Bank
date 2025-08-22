// Utility functions for the entire application

// Toast notification system
class Toast {
    static show(message, type = 'success', duration = 3000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Hide after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Form validation utilities
class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static validatePassword(password) {
        return password.length >= 8;
    }
    
    static validateAmount(amount) {
        return !isNaN(amount) && amount > 0;
    }
    
    static showFieldError(field, message) {
        // Remove existing error
        this.removeFieldError(field);
        
        // Add error class
        field.classList.add('input-error');
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert after field
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }
    
    static removeFieldError(field) {
        field.classList.remove('input-error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    static clearAllErrors(form) {
        const errorFields = form.querySelectorAll('.input-error');
        errorFields.forEach(field => this.removeFieldError(field));
    }
}

// API error handler
class APIErrorHandler {
    static handle(error, defaultMessage = 'An error occurred') {
        console.error('API Error:', error);
        
        let message = defaultMessage;
        
        if (error.message) {
            message = error.message;
        }
        
        if (error.response && error.response.data && error.response.data.message) {
            message = error.response.data.message;
        }
        
        Toast.show(message, 'error');
        return message;
    }
}

// Local storage utilities
class Storage {
    static set(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }
    
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }
    
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
    
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
}

// Currency formatting
class CurrencyFormatter {
    static format(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    
    static parse(currencyString) {
        return parseFloat(currencyString.replace(/[^\d.-]/g, ''));
    }
}

// Date formatting
class DateFormatter {
    static format(date, format = 'medium') {
        const dateObj = new Date(date);
        
        if (isNaN(dateObj.getTime())) {
            return 'Invalid date';
        }
        
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        if (format === 'long') {
            options.weekday = 'long';
        } else if (format === 'full') {
            options.weekday = 'long';
            options.month = 'long';
        }
        
        return dateObj.toLocaleDateString('en-US', options);
    }
    
    static formatDateTime(date) {
        const dateObj = new Date(date);
        
        if (isNaN(dateObj.getTime())) {
            return 'Invalid date';
        }
        
        return dateObj.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Authentication state management
class Auth {
    static isAuthenticated() {
        return !!Storage.get('token');
    }
    
    static isAdmin() {
        const user = Storage.get('user', {});
        return user.isAdmin === true;
    }
    
    static getUserId() {
        const user = Storage.get('user', {});
        return user.id;
    }
    
    static getUser() {
        return Storage.get('user', {});
    }
    
    static logout() {
        Storage.remove('token');
        Storage.remove('user');
        window.location.href = 'index.html';
    }
    
    static requireAuth(redirectTo = 'login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }
    
    static requireAdmin(redirectTo = 'dashboard.html') {
        if (!this.isAuthenticated() || !this.isAdmin()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }
}

// DOM utilities
class DOM {
    static ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }
    
    static on(event, selector, handler) {
        document.addEventListener(event, function(e) {
            if (e.target.matches(selector)) {
                handler(e);
            }
        });
    }
    
    static show(element) {
        element.classList.remove('hidden');
    }
    
    static hide(element) {
        element.classList.add('hidden');
    }
    
    static toggle(element) {
        element.classList.toggle('hidden');
    }
}

// Mobile navigation handler
class MobileNavigation {
    static init() {
        const menuBtn = document.getElementById('menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                }
            });
        }
    }
}

// Page load handler
class PageLoader {
    static init() {
        // Check authentication state on page load
        if (Auth.isAuthenticated()) {
            // Update UI for logged-in users
            const user = Auth.getUser();
            const userElements = document.querySelectorAll('[data-user]');
            
            userElements.forEach(element => {
                const property = element.getAttribute('data-user');
                if (user[property]) {
                    element.textContent = user[property];
                }
            });
            
            // Show/hide auth-dependent elements
            const authElements = document.querySelectorAll('[data-auth]');
            authElements.forEach(element => {
                const requiredAuth = element.getAttribute('data-auth');
                if (requiredAuth === 'true' && !Auth.isAuthenticated()) {
                    element.classList.add('hidden');
                } else if (requiredAuth === 'false' && Auth.isAuthenticated()) {
                    element.classList.add('hidden');
                } else {
                    element.classList.remove('hidden');
                }
            });
            
            // Show/hide admin elements
            const adminElements = document.querySelectorAll('[data-admin]');
            adminElements.forEach(element => {
                if (element.getAttribute('data-admin') === 'true' && !Auth.isAdmin()) {
                    element.classList.add('hidden');
                } else {
                    element.classList.remove('hidden');
                }
            });
        }
        
        // Initialize mobile navigation
        MobileNavigation.init();
        
        // Add fade-in animation to elements
        const animatedElements = document.querySelectorAll('.fade-in, .slide-in');
        animatedElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
        });
    }
}

// Initialize when DOM is ready
DOM.ready(() => {
    PageLoader.init();
    
    // Add event listener for logout buttons
    DOM.on('click', '[data-logout]', (e) => {
        e.preventDefault();
        Auth.logout();
    });
    
    // Add smooth scrolling for anchor links
    DOM.on('click', 'a[href^="#"]', (e) => {
        const href = e.target.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const targetElement = document.querySelector(href);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Toast,
        FormValidator,
        APIErrorHandler,
        Storage,
        CurrencyFormatter,
        DateFormatter,
        Auth,
        DOM
    };
}