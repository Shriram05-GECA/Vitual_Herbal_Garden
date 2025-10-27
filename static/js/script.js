// Enhanced Main JavaScript with All Features
class VirtualHerbalGarden {
    constructor() {
        this.currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        this.init();
    }

    init() {
        this.initTheme();
        this.initNavigation();
        this.initSearch();
        this.initBackToTop();
        this.initFloatingActionButton();
        this.initPlantCards();
        this.initForms();
        this.initNotifications();
        this.initPerformance();
    }

    // Theme Management
    initTheme() {
        // Load saved theme
        const savedTheme = sessionStorage.getItem('preferredTheme');
        if (savedTheme) {
            this.setTheme(savedTheme, false);
        }

        // Add theme toggle handler
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Watch for system theme changes
        this.watchSystemTheme();
    }

    setTheme(theme, savePreference = true) {
        if (['light', 'dark'].includes(theme)) {
            this.currentTheme = theme;
            document.documentElement.setAttribute('data-theme', theme);

            if (savePreference) {
                sessionStorage.setItem('preferredTheme', theme);
            }

            this.updateThemeToggle();
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        window.location.href = `/set-theme/${newTheme}`;
    }

    updateThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (!toggle) return;

        const icon = toggle.querySelector('.theme-icon');
        const text = toggle.querySelector('.theme-text');

        if (this.currentTheme === 'dark') {
            icon.className = 'theme-icon fas fa-sun';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'theme-icon fas fa-moon';
            text.textContent = 'Dark Mode';
        }
    }

    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't set a preference
            if (!sessionStorage.getItem('preferredTheme')) {
                this.setTheme(e.matches ? 'dark' : 'light', false);
            }
        });
    }

    // Navigation
    initNavigation() {
        this.highlightCurrentPage();
        this.initMobileNavigation();
        this.initSmoothScrolling();
    }

    highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath === currentPath || 
               (currentPath.includes(linkPath) && linkPath !== '/')) {
                link.classList.add('active');
            }
        });
    }

    initMobileNavigation() {
        // This would be expanded for mobile menu in responsive design
    }

    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    window.animationManager?.scrollToElement(target, 80);
                }
            });
        });
    }

    // Search functionality
    initSearch() {
        const searchForm = document.querySelector('.search-form');
        const searchInput = document.querySelector('input[name="q"]');

        if (searchForm && searchInput) {
            // Add debounced search
            let timeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });

            // Add search suggestions
            this.initSearchSuggestions(searchInput);
        }
    }

    performSearch(query) {
        if (query.length > 2) {
            // Implement live search results
            console.log('Searching for:', query);
            // This would typically make an API call
        }
    }

    initSearchSuggestions(input) {
        // This would be expanded to show search suggestions
    }

    // Back to top button
    initBackToTop() {
        const backToTop = document.getElementById('backToTop');
        if (!backToTop) return;

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Floating action button
    initFloatingActionButton() {
        const fab = document.getElementById('floatingActionBtn');
        if (!fab) return;

        fab.addEventListener('click', () => {
            this.showQuickActions();
        });
    }

    showQuickActions() {
        // Implement quick actions menu
        const actions = [
            { icon: 'fas fa-plus', label: 'Add Plant', action: () => window.location.href = '/add-plant' },
            { icon: 'fas fa-camera', label: 'Identify Plant', action: () => window.location.href = '/identify-plant' },
            { icon: 'fas fa-search', label: 'Search', action: () => document.querySelector('input[name="q"]')?.focus() }
        ];

        // Create and show action menu
        this.createActionMenu(actions);
    }

    createActionMenu(actions) {
        // Remove existing menu
        const existingMenu = document.querySelector('.fab-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.className = 'fab-menu';
        
        actions.forEach((action, index) => {
            const button = document.createElement('button');
            button.className = 'fab-menu-item';
            button.innerHTML = `<i class="${action.icon}"></i><span>${action.label}</span>`;
            button.style.animationDelay = `${index * 0.1}s`;
            
            button.addEventListener('click', action.action);
            menu.appendChild(button);
        });

        document.body.appendChild(menu);

        // Position menu
        const fab = document.getElementById('floatingActionBtn');
        const fabRect = fab.getBoundingClientRect();
        
        menu.style.bottom = `${window.innerHeight - fabRect.top + 10}px`;
        menu.style.right = `${window.innerWidth - fabRect.right}px`;

        // Add click outside to close
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.fab-menu') && !e.target.closest('.fab')) {
                    menu.remove();
                }
            }, { once: true });
        });
    }

    // Plant cards interactions
    initPlantCards() {
        const plantCards = document.querySelectorAll('.plant-card');
        
        plantCards.forEach(card => {
            // Add click handler
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button') && !e.target.closest('a')) {
                    const plantId = card.dataset.plantId;
                    if (plantId) {
                        window.location.href = `/plant/${plantId}`;
                    }
                }
            });

            // Add keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });

            // Add focus styles
            card.addEventListener('focus', () => {
                card.classList.add('focused');
            });

            card.addEventListener('blur', () => {
                card.classList.remove('focused');
            });
        });
    }

    // Form enhancements
    initForms() {
        this.initFormValidation();
        this.initFileUploads();
        this.initAutoSave();
    }

    initFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    this.showFormErrors(form);
                }
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Clear previous errors
        this.clearFieldError(field);

        // Required validation
        if (field.required && !value) {
            isValid = false;
            message = 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }

        // URL validation
        if (field.type === 'url' && value) {
            try {
                new URL(value);
            } catch {
                isValid = false;
                message = 'Please enter a valid URL';
            }
        }

        // File validation
        if (field.type === 'file' && field.files.length > 0) {
            const file = field.files[0];
            const maxSize = 16 * 1024 * 1024; // 16MB
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

            if (file.size > maxSize) {
                isValid = false;
                message = 'File size must be less than 16MB';
            } else if (!allowedTypes.includes(file.type)) {
                isValid = false;
                message = 'Please upload an image file (JPEG, PNG, GIF)';
            }
        }

        if (!isValid) {
            this.showFieldError(field, message);
        } else {
            this.showFieldSuccess(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        window.animationManager?.shakeElement(field);
    }

    showFieldSuccess(field) {
        field.classList.remove('error');
        field.classList.add('success');
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    clearFieldError(field) {
        field.classList.remove('error', 'success');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    showFormErrors(form) {
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.focus();
        }
    }

    initFileUploads() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleFileUpload(e.target);
            });
        });
    }

    handleFileUpload(input) {
        if (input.files.length > 0) {
            const file = input.files[0];
            this.previewImage(file, input);
        }
    }

    previewImage(file, input) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            // Remove existing preview
            const existingPreview = input.parentNode.querySelector('.image-preview');
            if (existingPreview) {
                existingPreview.remove();
            }

            // Create preview
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="preview-remove" aria-label="Remove image">
                    <i class="fas fa-times"></i>
                </button>
            `;

            // Add remove functionality
            const removeBtn = preview.querySelector('.preview-remove');
            removeBtn.addEventListener('click', () => {
                preview.remove();
                input.value = '';
            });

            input.parentNode.appendChild(preview);
        };

        reader.readAsDataURL(file);
    }

    initAutoSave() {
        const autoSaveForms = document.querySelectorAll('form[data-autosave]');
        
        autoSaveForms.forEach(form => {
            let timeout;
            
            form.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.autoSaveForm(form);
                }, 1000);
            });
        });
    }

    autoSaveForm(form) {
        const formData = new FormData(form);
        // Implement auto-save logic here
        console.log('Auto-saving form...', formData);
    }

    // Notification system
    initNotifications() {
        // This would handle showing toast notifications
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${this.getNotificationIcon(type)}"></i>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Add show animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        return notification;
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    // Performance optimizations
    initPerformance() {
        this.initLazyLoading();
        this.initPrefetching();
    }

    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[data-src]');
            
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    initPrefetching() {
        // Prefetch likely next pages
        const links = document.querySelectorAll('a[href^="/"]');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.prefetchPage(link.href);
            }, { once: true });
        });
    }

    prefetchPage(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
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
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.virtualHerbalGarden = new VirtualHerbalGarden();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VirtualHerbalGarden;
}