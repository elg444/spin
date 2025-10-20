class MENANG888App {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('menang888_users')) || [];
        this.gameSettings = JSON.parse(localStorage.getItem('menang888_settings')) || this.getDefaultSettings();
        this.transactions = JSON.parse(localStorage.getItem('menang888_transactions')) || [];
        
        // Create default admin if no users exist
        if (this.users.length === 0) {
            this.createDefaultAdmin();
        }
        
        this.init();
    }

    getDefaultSettings() {
        return {
            slot: { winChance: 30, payoutMultiplier: 2, minBet: 100, maxBet: 10000 },
            wheel: { winChance: 25, payoutMultiplier: 3, minBet: 50, maxBet: 5000 },
            general: { maintenance: false, depositBonus: 100 }
        };
    }

    createDefaultAdmin() {
        const defaultAdmin = {
            id: 'ADMIN001',
            username: 'admin',
            password: 'admin123',
            email: 'admin@menang888.com',
            phone: '081234567890',
            bankAccount: '1234567890',
            bankName: 'BCA',
            balance: 1000000,
            isAdmin: true,
            isVerified: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        this.users.push(defaultAdmin);
        this.saveUsers();
        console.log('🔐 Default admin created');
    }

    init() {
        console.log('🎮 MENANG888 App Initializing...');
        this.hideLoading();
        this.setupEventListeners();
        this.checkAutoLogin();
        this.loadUserData();
        this.setupNotifications();
    }

    hideLoading() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
            document.body.classList.add('loaded');
        }, 1500);
    }

    setupEventListeners() {
        // Auth modal toggles
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('register-modal');
            this.hideModal('login-modal');
        });

        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('login-modal');
            this.hideModal('register-modal');
        });

        // Modal close events
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });

        // Notification system
        document.getElementById('notification-btn')?.addEventListener('click', () => {
            this.toggleNotifications();
        });

        document.querySelector('.close-notifications')?.addEventListener('click', () => {
            this.hideNotifications();
        });

        // Quick actions
        document.querySelector('.btn-quick-deposit')?.addEventListener('click', () => {
            this.quickAction('deposit');
        });

        // Password visibility toggle
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        });
    }

    checkAutoLogin() {
        const savedUser = localStorage.getItem('menang888_current_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.showMainApp();
                this.updateUserDisplay();
                this.logSecurityEvent('auto_login_success', `User ${this.currentUser.username} auto-logged in`);
            } catch (error) {
                console.error('Auto login error:', error);
                this.showModal('login-modal');
            }
        } else {
            this.showModal('login-modal');
        }
    }

    showMainApp() {
        const mainApp = document.getElementById('main-app');
        if (mainApp) {
            mainApp.style.display = 'block';
        }
    }

    updateUserDisplay() {
        if (!this.currentUser) return;
        
        // Update balance
        const balanceEl = document.getElementById('balance-amount');
        if (balanceEl) {
            balanceEl.textContent = this.formatCurrency(this.currentUser.balance);
        }

        // Update user info
        const usernameEl = document.getElementById('username-display');
        const userIdEl = document.getElementById('user-id-display');
        const welcomeUserEl = document.getElementById('welcome-username');
        
        if (usernameEl) usernameEl.textContent = this.currentUser.username;
        if (userIdEl) userIdEl.textContent = `ID: ${this.currentUser.id}`;
        if (welcomeUserEl) welcomeUserEl.textContent = this.currentUser.username;

        // Update avatar
        const avatarEl = document.getElementById('user-avatar');
        if (avatarEl) {
            const colors = ['#6366f1', '#06d6a0', '#ff6b6b', '#ffd166'];
            const colorIndex = this.currentUser.username.length % colors.length;
            avatarEl.style.background = `linear-gradient(135deg, ${colors[colorIndex]}, ${colors[(colorIndex + 1) % colors.length]})`;
        }
    }

    loadUserData() {
        // Load online players count (simulated)
        const onlinePlayersEl = document.getElementById('online-players');
        if (onlinePlayersEl) {
            onlinePlayersEl.textContent = this.formatNumber(1234 + Math.floor(Math.random() * 100));
        }

        // Load today wins (simulated)
        const todayWinsEl = document.getElementById('today-wins');
        if (todayWinsEl) {
            todayWinsEl.textContent = this.formatCurrency(89000000 + Math.floor(Math.random() * 10000000));
        }
    }

    setupNotifications() {
        // Simulate some notifications
        const notifications = [
            { id: 1, type: 'info', message: 'Bonus deposit 100% sedang berlangsung!', time: '5 menit lalu' },
            { id: 2, type: 'success', message: 'Rp 50.000 telah ditambahkan ke saldo Anda', time: '1 jam lalu' },
            { id: 3, type: 'warning', message: 'Maintenance scheduled for tomorrow 02:00-04:00', time: '2 jam lalu' }
        ];

        const notificationList = document.querySelector('.notification-list');
        if (notificationList) {
            notificationList.innerHTML = notifications.map(notif => `
                <div class="notification-item ${notif.type}">
                    <div class="notification-icon">
                        <i class="fas fa-${this.getNotificationIcon(notif.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <p>${notif.message}</p>
                        <span>${notif.time}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle'
        };
        return icons[type] || 'bell';
    }

    toggleNotifications() {
        const notificationCenter = document.getElementById('notification-center');
        if (notificationCenter) {
            notificationCenter.classList.toggle('active');
        }
    }

    hideNotifications() {
        const notificationCenter = document.getElementById('notification-center');
        if (notificationCenter) {
            notificationCenter.classList.remove('active');
        }
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

    quickAction(action) {
        switch(action) {
            case 'deposit':
                window.location.href = 'deposit.html';
                break;
            case 'withdraw':
                window.location.href = 'withdraw.html';
                break;
            case 'support':
                this.openSupport();
                break;
        }
    }

    openSupport() {
        const message = `Customer Service MENANG888\n📞 24/7 Support\n💬 WhatsApp: 0812-3456-7890\n📧 Email: support@menang888.com`;
        alert(message);
    }

    logout() {
        this.logSecurityEvent('user_logout', `User ${this.currentUser.username} logged out`);
        
        this.currentUser = null;
        localStorage.removeItem('menang888_current_user');
        localStorage.removeItem('menang888_last_activity');
        
        const mainApp = document.getElementById('main-app');
        if (mainApp) {
            mainApp.style.display = 'none';
        }
        
        this.showModal('login-modal');
        this.showNotification('Anda telah logout', 'info');
    }

    // Utility methods
    formatCurrency(amount) {
        return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    generateId(prefix = 'USER') {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}${timestamp}${random}`;
    }

    // Security logging
    logSecurityEvent(type, message) {
        if (window.securitySystem) {
            window.securitySystem.logSecurityEvent(type, message);
        }
    }

    // Data persistence
    saveUsers() {
        localStorage.setItem('menang888_users', JSON.stringify(this.users));
    }

    saveSettings() {
        localStorage.setItem('menang888_settings', JSON.stringify(this.gameSettings));
    }

    saveTransactions() {
        localStorage.setItem('menang888_transactions', JSON.stringify(this.transactions));
    }

    // Notification system
    showNotification(message, type = 'info', duration = 5000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.app-notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `app-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="close-notification" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Add styles if not exists
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .app-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--bg-elevated);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: var(--border-radius);
                    padding: 15px 20px;
                    color: var(--text-primary);
                    box-shadow: var(--shadow-xl);
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    max-width: 400px;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 1;
                }
                .notification-info { border-left: 4px solid var(--primary); }
                .notification-success { border-left: 4px solid var(--success); }
                .notification-warning { border-left: 4px solid var(--warning); }
                .notification-error { border-left: 4px solid var(--danger); }
                .close-notification {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 4px;
                }
                .close-notification:hover {
                    background: rgba(255,255,255,0.1);
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);

        // Add slideOut animation
        if (!document.querySelector('#slideOut-animation')) {
            const slideOutStyle = document.createElement('style');
            slideOutStyle.id = 'slideOut-animation';
            slideOutStyle.textContent = `
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(slideOutStyle);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting MENANG888 Platform...');
    window.app = new MENANG888App();
});
