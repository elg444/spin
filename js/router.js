class Router {
    constructor() {
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.createLoader();
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
        if (document.getElementById('page-loader')) return;

        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="loading-content">
                <div class="neon-loader">
                    <div class="loader-circle"></div>
                    <div class="loader-circle"></div>
                    <div class="loader-circle"></div>
                </div>
                <div class="loading-text">
                    <span class="neon-text">MENANG888</span>
                    <p>Loading...</p>
                </div>
            </div>
        `;
        document.body.appendChild(loader);

        const progressBar = document.createElement('div');
        progressBar.id = 'progress-loader';
        progressBar.className = 'progress-loader';
        progressBar.innerHTML = '<div class="progress-bar"></div>';
        document.body.appendChild(progressBar);
    }

    async navigateTo(page) {
        if (this.isLoading) return;
        await this.loadPage(page);
        window.history.pushState({}, '', page);
    }

    async loadPage(page, showLoading = true) {
        if (showLoading) {
            this.showLoading();
        }

        try {
            await this.simulateLoad();
            window.location.href = page;
        } catch (error) {
            console.error('Navigation error:', error);
            this.hideLoading();
        }
    }

    showLoading() {
        this.isLoading = true;
        const loader = document.getElementById('page-loader');
        const progressBar = document.querySelector('.progress-bar');
        
        if (loader) loader.classList.add('active');
        if (progressBar) progressBar.style.width = '30%';
    }

    hideLoading() {
        this.isLoading = false;
        const loader = document.getElementById('page-loader');
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressBar) {
            progressBar.style.width = '100%';
            setTimeout(() => {
                if (progressBar) progressBar.style.width = '0%';
            }, 300);
        }
        
        if (loader) {
            setTimeout(() => {
                loader.classList.remove('active');
            }, 500);
        }
    }

    simulateLoad() {
        return new Promise(resolve => {
            setTimeout(resolve, 1500);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
});
