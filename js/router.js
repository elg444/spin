// INSTANT Router - No Delays
class Router {
    constructor() {
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.hideLoadingInstantly(); // Hide loading immediately
    }

    setupNavigation() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && link.href && !link.href.includes('javascript')) {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href !== '#' && !href.includes('mailto:') && !href.includes('tel:')) {
                    this.navigateInstant(href);
                }
            }
        });
    }

    navigateInstant(page) {
        if (this.isLoading) return;
        
        // Show progress bar briefly
        this.showProgress();
        
        // INSTANT navigation - no delay
        setTimeout(() => {
            window.location.href = page;
        }, 100); // Minimal delay for UX
    }

    showProgress() {
        const progressBar = document.querySelector('.progress-bar');
        const progressLoader = document.getElementById('progress-loader');
        
        if (progressLoader) progressLoader.style.display = 'block';
        if (progressBar) {
            progressBar.style.width = '50%';
            setTimeout(() => progressBar.style.width = '100%', 50);
        }
    }

    hideLoadingInstantly() {
        // Hide loading screen immediately when page loads
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            const progressLoader = document.getElementById('progress-loader');
            
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            if (progressLoader) {
                progressLoader.style.display = 'none';
            }
            
            document.body.classList.add('loaded');
        }, 300); // Very short delay
    }
}

// Initialize immediately
document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
});
