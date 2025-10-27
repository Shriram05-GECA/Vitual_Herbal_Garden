// Advanced Animation System
class AnimationManager {
    constructor() {
        this.observer = null;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        this.initScrollAnimations();
        this.initPageTransitions();
        this.initHoverAnimations();
        this.initLoadingAnimations();
        this.initInteractiveAnimations();
    }

    // Scroll reveal animations
    initScrollAnimations() {
        if (this.isReducedMotion) return;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // Add staggered animation for child elements
                    if (entry.target.classList.contains('stagger-animate')) {
                        this.animateStaggeredChildren(entry.target);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all scroll-reveal elements
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            this.observer.observe(el);
        });
    }

    animateStaggeredChildren(parent) {
        const children = Array.from(parent.children);
        children.forEach((child, index) => {
            child.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Page transition animations
    initPageTransitions() {
        if (this.isReducedMotion) return;

        // Add page transition class to main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('page-transition-enter');
            
            setTimeout(() => {
                mainContent.classList.add('page-transition-enter-active');
            }, 50);
        }

        // Handle link clicks for smooth transitions
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.target && !link.href.includes('#')) {
                const href = link.href;
                if (href.startsWith(window.location.origin)) {
                    e.preventDefault();
                    this.animatePageOut(() => {
                        window.location.href = href;
                    });
                }
            }
        });
    }

    animatePageOut(callback) {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.remove('page-transition-enter-active');
            mainContent.classList.add('page-transition-exit-active');
            
            setTimeout(callback, 400);
        } else {
            callback();
        }
    }

    // Hover animations
    initHoverAnimations() {
        // Add ripple effect to buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn, .nav-link, .card');
            if (button) {
                this.createRipple(e, button);
            }
        });

        // Add hover effects to interactive elements
        this.initMagneticEffects();
        this.initTiltEffects();
    }

    createRipple(event, element) {
        if (this.isReducedMotion) return;

        const circle = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - element.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - element.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple-effect');

        // Remove existing ripples
        const existingRipples = element.querySelectorAll('.ripple-effect');
        existingRipples.forEach(ripple => ripple.remove());

        element.appendChild(circle);

        // Remove ripple after animation
        setTimeout(() => {
            circle.remove();
        }, 600);
    }

    initMagneticEffects() {
        if (this.isReducedMotion) return;

        const magneticElements = document.querySelectorAll('.btn, .nav-link, .plant-card');
        
        magneticElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                this.magneticEffect(e, element);
            });
            
            element.addEventListener('mouseleave', () => {
                this.resetMagneticEffect(element);
            });
        });
    }

    magneticEffect(event, element) {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;
        
        const strength = 5;
        
        element.style.transform = `translate(${deltaX * strength}px, ${deltaY * strength}px)`;
    }

    resetMagneticEffect(element) {
        element.style.transform = 'translate(0, 0)';
    }

    initTiltEffects() {
        if (this.isReducedMotion) return;

        const tiltElements = document.querySelectorAll('.plant-card, .category-card');
        
        tiltElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                this.tiltEffect(e, element);
            });
            
            element.addEventListener('mouseleave', () => {
                this.resetTiltEffect(element);
            });
        });
    }

    tiltEffect(event, element) {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;
        
        const tilt = 3;
        
        element.style.transform = `perspective(1000px) rotateY(${deltaX * tilt}deg) rotateX(${-deltaY * tilt}deg) scale3d(1.02, 1.02, 1.02)`;
    }

    resetTiltEffect(element) {
        element.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale3d(1, 1, 1)';
    }

    // Loading animations
    initLoadingAnimations() {
        // Simulate loading process
        this.simulateLoading();
        
        // Add loading bar
        this.createLoadingBar();
    }

    simulateLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;

        // Simulate loading time
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            document.body.classList.remove('page-loading');
            
            // Trigger initial animations
            this.triggerInitialAnimations();
        }, 2000);
    }

    createLoadingBar() {
        const loadingBar = document.createElement('div');
        loadingBar.className = 'loading-bar';
        document.body.appendChild(loadingBar);

        // Simulate loading progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            loadingBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                loadingBar.classList.add('complete');
                setTimeout(() => loadingBar.remove(), 300);
            }
        }, 200);
    }

    triggerInitialAnimations() {
        // Animate hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.classList.add('animate-fade-in-up');
        }

        // Animate plant cards with stagger
        const plantsGrid = document.querySelector('.plants-grid');
        if (plantsGrid) {
            plantsGrid.classList.add('stagger-animate');
        }

        // Animate other elements
        document.querySelectorAll('.animate-on-load').forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            el.classList.add('animate-fade-in-up');
        });
    }

    // Interactive animations
    initInteractiveAnimations() {
        this.initCounterAnimations();
        this.initTypewriterEffect();
        this.initFloatingElements();
        this.initProgressBars();
    }

    initCounterAnimations() {
        const counters = document.querySelectorAll('.count-up');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    updateCounter();
                    observer.unobserve(counter);
                }
            });
            
            observer.observe(counter);
        });
    }

    initTypewriterEffect() {
        const typewriterElements = document.querySelectorAll('.typewriter');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.width = '0';
            
            let i = 0;
            const type = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, 100);
                }
            };
            
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    type();
                    observer.unobserve(element);
                }
            });
            
            observer.observe(element);
        });
    }

    initFloatingElements() {
        const floatingElements = document.querySelectorAll('.floating, .floating-delayed');
        
        floatingElements.forEach(element => {
            element.style.animationDelay = Math.random() * 2 + 's';
        });
    }

    initProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        progressBars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-progress');
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    bar.style.width = targetWidth + '%';
                    observer.unobserve(bar);
                }
            });
            
            observer.observe(bar);
        });
    }

    // Utility methods
    animateElement(element, animationClass, duration = 1000) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, duration);
    }

    shakeElement(element) {
        this.animateElement(element, 'animate-shake', 500);
    }

    pulseElement(element) {
        this.animateElement(element, 'animate-pulse', 1000);
    }

    // Scroll to element with animation
    scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Initialize animation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.animationManager = new AnimationManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}