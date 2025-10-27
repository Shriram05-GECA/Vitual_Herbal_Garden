// Language Switcher with Advanced Features
class LanguageManager {
    constructor() {
        this.currentLanguage = document.documentElement.lang || 'en';
        this.init();
    }

    init() {
        this.loadLanguagePreference();
        this.initLanguageSwitcher();
        this.initDynamicTranslations();
    }

    loadLanguagePreference() {
        // Try to get language from sessionStorage
        const savedLanguage = sessionStorage.getItem('preferredLanguage');
        if (savedLanguage) {
            this.setLanguage(savedLanguage, false);
        }
    }

    initLanguageSwitcher() {
        // Add click handlers to language buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.lang-btn')) {
                const lang = e.target.closest('.lang-btn').textContent.toLowerCase();
                this.setLanguage(lang);
            }
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.language-switcher')) {
                this.handleKeyboardNavigation(e);
            }
        });
    }

    handleKeyboardNavigation(e) {
        const buttons = Array.from(document.querySelectorAll('.lang-btn'));
        const currentIndex = buttons.findIndex(btn => btn === document.activeElement);
        
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % buttons.length;
                buttons[nextIndex].focus();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                buttons[prevIndex].focus();
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                document.activeElement.click();
                break;
        }
    }

    setLanguage(lang, savePreference = true) {
        if (['en', 'hi', 'es'].includes(lang)) {
            this.currentLanguage = lang;
            
            if (savePreference) {
                sessionStorage.setItem('preferredLanguage', lang);
            }

            // Update UI
            this.updateLanguageSwitcherUI();
            
            // Add animation to language change
            this.animateLanguageChange();
            
            // Reload page to apply language changes
            setTimeout(() => {
                window.location.href = `/set-language/${lang}`;
            }, 300);
        }
    }

    updateLanguageSwitcherUI() {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === this.currentLanguage) {
                btn.classList.add('active');
            }
        });

        // Update document language
        document.documentElement.lang = this.currentLanguage;
    }

    animateLanguageChange() {
        // Add transition animation
        document.body.style.opacity = '0.7';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 50);
    }

    initDynamicTranslations() {
        // This would be expanded to handle dynamic content updates
        // without page reload in a more advanced implementation
    }

    // Method to get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Method to format numbers, dates, etc. based on language
    formatNumber(number) {
        const formatter = new Intl.NumberFormat(this.currentLanguage);
        return formatter.format(number);
    }

    formatDate(date) {
        const formatter = new Intl.DateTimeFormat(this.currentLanguage, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return formatter.format(date);
    }
}

// Initialize language manager
document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
});