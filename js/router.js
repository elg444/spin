// Adaptive Router and Loading System
class Router {
    constructor() {
        this.isLoading = false;
        this.connectionSpeed = 'medium'; // default
        this.init();
    }

    init() {
        this.detectConnectionSpeed();
        this.setupNavigation();
        this.createLoader();
    }

    detectConnectionSpeed() {
        // Simple connection speed detection
        const startTime = Date.now();
        const image = new Image();
        const testImage = "https://www.google.com/images/phd/px.gif"; // 1x1 pixel
        const downloadSize = 1; // 1KB
        
        image.onload = () => {
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            const speed = downloadSize / duration; // KB/s
            
            if (speed > 100) {
                this.connectionSpeed = 'fast';
            } else if (speed > 50) {
                this.connectionSpeed = 'medium';
            } else {
                this.connectionSpeed = 'slow';
            }
            
            console.log(`Connection speed: ${this.connectionSpeed} (${speed.toFixed(2)} KB/s)`);
            this.applySpeedClass();
        };

        image.onerror = () => {
            console.log('Speed test failed, using medium speed');
            this.connectionSpeed = 'medium';
            this.applySpeedClass();
        };

        image.src = testImage + "?t=" + startTime;
    }

    applySpeedClass() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.className = `loading-screen speed-${this.connectionSpeed}`;
        }
    }

    setupNavigation() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && link.href && !link.href.includes('javascript')) {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href !== '#' && !href.includes('mailto:') && !href.includes('tel:')) {
                    this.navigateTo(href);
                }
            }
        });

        window.addEventListener('popstate', () => {
            this.loadPage(window.location.pathname, false);
        });
    }

    createLoader() {
        // Remove existing loader
        const existingLoader = document.getElementById('page-loader');
        if (existingLoader) existingLoader.remove();

        // Create progress bar
        if (!document.getElementById('progress-loader')) {
            const progressBar = document.createElement('div');
            progressBar.id = 'progress-loader';
            progressBar.className = 'progress-loader';
            progressBar.innerHTML = '<div class="progress-bar"></div>';
            document.body.appendChild(progressBar);
        }
    }

    async navigateTo(page) {
        if (this.isLoading) return;
        
        const targetPage = page.startsWith('/') ? page.slice(1) : page;
        await this.loadPage(targetPage);
        window.history.pushState({}, '', targetPage);
    }

    async loadPage(page, showLoading = true) {
        if (showLoading) {
            this.showLoading();
        }

        try {
            // Calculate loading time based on connection speed
            const baseTime = this.getBaseLoadTime();
            await this.simulateLoad(baseTime);
            
            // Hide loading when page is ready
            this.hideLoading();

        } catch (error) {
            console.error('Navigation error:', error);
            this.hideLoading();
            this.showError('Gagal memuat halaman');
        }
    }

    getBaseLoadTime() {
        switch(this.connectionSpeed) {
            case 'fast': return 300;    // 0.3s
            case 'medium': return 800;  // 0.8s  
            case 'slow': return 1500;   // 1.5s
            default: return 800;
        }
    }

    showLoading() {
        this.isLoading = true;
        
        // Show progress bar
        const progressBar = document.querySelector('.progress-bar');
        const progressLoader = document.getElementById('progress-loader');
        
        if (progressLoader) progressLoader.style.display = 'block';
        if (progressBar) {
            progressBar.style.width = '30%';
            setTimeout(() => {
                if (progressBar) progressBar.style.width = '70%';
            }, this.getBaseLoadTime() * 0.3);
        }
    }

    hideLoading() {
        this.isLoading = false;
        
        const progressBar = document.querySelector('.progress-bar');
        const progressLoader = document.getElementById('progress-loader');
        
        // Complete progress bar
        if (progressBar) {
            progressBar.style.width = '100%';
            setTimeout(() => {
                if (progressBar) {
                    progressBar.style.width = '0%';
                    if (progressLoader) progressLoader.style.display = 'none';
                }
            }, 200);
        }
    }

    simulateLoad(time) {
        return new Promise(resolve => {
            setTimeout(resolve, time);
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--danger-color);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(255, 68, 68, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize router
document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
});
