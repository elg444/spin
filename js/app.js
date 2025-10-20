class MENANG888App {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('menang888_users')) || [];
        this.deposits = JSON.parse(localStorage.getItem('menang888_deposits')) || [];
        this.withdraws = JSON.parse(localStorage.getItem('menang888_withdraws')) || [];
        this.gameSettings = JSON.parse(localStorage.getItem('menang888_settings')) || {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAutoLogin();
        
        if (!this.currentUser) {
            this.showModal('login-modal');
        }
    }

    setupEventListeners() {
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('admin-btn').addEventListener('click', () => {
            if (this.currentUser && this.currentUser.isAdmin) {
                window.location.href = 'admin.html';
            } else {
                this.showNotification('Akses ditolak. Hanya admin!', 'error');
            }
        });

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
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
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
        document.getElementById('balance').textContent = this.currentUser.balance.toLocaleString();
        document.getElementById('user-id-display').textContent = this.currentUser.id;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('menang888_current_user');
        document.getElementById('main-app').style.display = 'none';
        this.showModal('login-modal');
        this.showNotification('Anda telah logout', 'info');
    }

    showLoading(message = 'Memuat...') {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            const loadingText = loadingScreen.querySelector('.loading-text p');
            if (loadingText) {
                loadingText.textContent = message;
            }
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    getNotificationColor(type) {
        const colors = {
            info: 'linear-gradient(135deg, var(--info-color), #0066cc)',
            success: 'linear-gradient(135deg, var(--success-color), #00cc66)',
            warning: 'linear-gradient(135deg, var(--warning-color), #cc8800)',
            error: 'linear-gradient(135deg, var(--danger-color), #cc0000)'
        };
        return colors[type] || colors.info;
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle'
        };
        return icons[type] || icons.info;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new MENANG888App();
    window.authSystem = new AuthSystem(window.app);
});
