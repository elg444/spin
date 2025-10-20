class MENANG888App {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('menang888_users')) || [];
        this.init();
    }

    init() {
        this.hideLoadingImmediately(); // Hide loading FIRST
        this.setupEventListeners();
        this.checkAutoLogin();
        
        if (!this.currentUser) {
            setTimeout(() => this.showModal('login-modal'), 100);
        }
    }

    hideLoadingImmediately() {
        // Force hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        const progressLoader = document.getElementById('progress-loader');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        if (progressLoader) {
            progressLoader.style.display = 'none';
        }
        
        document.body.classList.add('loaded');
    }

    setupEventListeners() {
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('admin-btn')?.addEventListener('click', () => {
            if (this.currentUser && this.currentUser.isAdmin) {
                window.location.href = 'admin.html';
            }
        });

        // Quick modal handlers
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    showModal(modalId) {
        document.getElementById(modalId)?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modalId) {
        document.getElementById(modalId)?.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    checkAutoLogin() {
        const savedUser = localStorage.getItem('menang888_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            document.getElementById('main-app').style.display = 'block';
            this.updateUserDisplay();
        }
    }

    updateUserDisplay() {
        if (!this.currentUser) return;
        const balanceEl = document.getElementById('balance');
        const userIdEl = document.getElementById('user-id-display');
        
        if (balanceEl) balanceEl.textContent = this.currentUser.balance.toLocaleString();
        if (userIdEl) userIdEl.textContent = this.currentUser.id;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('menang888_current_user');
        document.getElementById('main-app').style.display = 'none';
        this.showModal('login-modal');
    }

    showNotification(message, type = 'info') {
        // Ultra fast notification
        const notification = document.createElement('div');
        notification.className = `notification`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 10px 15px;
            border-radius: 6px;
            z-index: 10000;
            animation: slideInRight 0.2s ease;
            font-size: 0.85rem;
            max-width: 250px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px;">
                <i class="${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.2s ease';
            setTimeout(() => notification.remove(), 200);
        }, 2000);
    }

    getNotificationColor(type) {
        const colors = {
            info: '#0099ff',
            success: '#00ff88', 
            warning: '#ffaa00',
            error: '#ff4444'
        };
        return colors[type] || colors.info;
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'fas fa-info',
            success: 'fas fa-check',
            warning: 'fas fa-exclamation',
            error: 'fas fa-times'
        };
        return icons[type] || icons.info;
    }
}

// Add instant CSS animations
const instantStyles = document.createElement('style');
instantStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .instant { transition: all 0.2s ease !important; }
`;
document.head.appendChild(instantStyles);

// Start app immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new MENANG888App();
        window.authSystem = new AuthSystem(window.app);
    });
} else {
    window.app = new MENANG888App();
    window.authSystem = new AuthSystem(window.app);
}
