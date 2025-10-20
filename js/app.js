class MENANG888App {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('menang888_users')) || [];
        
        // Create default admin if no users exist
        if (this.users.length === 0) {
            this.createDefaultAdmin();
        }
        
        this.init();
    }

    createDefaultAdmin() {
        const defaultAdmin = {
            id: 'ADMIN001',
            username: 'admin',
            password: 'admin123',
            email: 'admin@menang888.com',
            phone: '081234567890',
            bankAccount: '1234567890',
            bankName: 'Admin MENANG888',
            balance: 100000,
            isAdmin: true,
            createdAt: new Date().toISOString()
        };
        
        this.users.push(defaultAdmin);
        this.saveUsers();
        console.log('Default admin created:', defaultAdmin);
    }

    saveUsers() {
        localStorage.setItem('menang888_users', JSON.stringify(this.users));
    }

    init() {
        console.log('App initializing...');
        this.hideLoadingImmediately();
        this.setupEventListeners();
        this.checkAutoLogin();
        
        if (!this.currentUser) {
            setTimeout(() => this.showModal('login-modal'), 100);
        }
    }

    hideLoadingImmediately() {
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
        console.log('Setting up event listeners...');
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        const adminBtn = document.getElementById('admin-btn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                if (this.currentUser && this.currentUser.isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    this.showNotification('Akses ditolak. Hanya admin!', 'error');
                }
            });
        }

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
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    checkAutoLogin() {
        const savedUser = localStorage.getItem('menang888_current_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                const mainApp = document.getElementById('main-app');
                if (mainApp) {
                    mainApp.style.display = 'block';
                }
                this.updateUserDisplay();
                console.log('Auto login successful:', this.currentUser.username);
            } catch (error) {
                console.error('Auto login error:', error);
            }
        }
    }

    updateUserDisplay() {
        if (!this.currentUser) return;
        
        const balanceEl = document.getElementById('balance');
        const userIdEl = document.getElementById('user-id-display');
        
        if (balanceEl) balanceEl.textContent = this.currentUser.balance.toLocaleString();
        if (userIdEl) userIdEl.textContent = this.currentUser.id;
        
        // Show/hide admin button
        const adminBtn = document.getElementById('admin-btn');
        if (adminBtn) {
            adminBtn.style.display = this.currentUser.isAdmin ? 'block' : 'none';
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('menang888_current_user');
        
        const mainApp = document.getElementById('main-app');
        if (mainApp) {
            mainApp.style.display = 'none';
        }
        
        this.showModal('login-modal');
        this.showNotification('Anda telah logout', 'info');
    }

    showNotification(message, type = 'info') {
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
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 200);
        }, 3000);
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

// Add CSS animations
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
`;
document.head.appendChild(instantStyles);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    window.app = new MENANG888App();
    window.authSystem = new AuthSystem(window.app);
    console.log('App initialized successfully');
});
