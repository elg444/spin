class AdminDashboard {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('menang888_current_user'));
        this.users = JSON.parse(localStorage.getItem('menang888_users')) || [];
        this.deposits = JSON.parse(localStorage.getItem('menang888_deposits')) || [];
        this.withdraws = JSON.parse(localStorage.getItem('menang888_withdraws')) || [];
        this.gameSettings = JSON.parse(localStorage.getItem('menang888_settings')) || {};
        this.init();
    }

    init() {
        if (!this.currentUser || !this.currentUser.isAdmin) {
            window.location.href = 'index.html';
            return;
        }

        this.setupEventListeners();
        this.loadDashboard();
        this.updateAdminInfo();
    }

    setupEventListeners() {
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        document.getElementById('admin-logout').addEventListener('click', () => {
            this.logout();
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        const tabContent = document.getElementById(`${tabName}-tab`);
        if (tabContent) {
            tabContent.classList.add('active');
        }

        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch(tabName) {
            case 'dashboard':
                this.loadDashboardStats();
                break;
            case 'users':
                this.loadUsersTable();
                break;
            case 'games':
                this.loadGameSettings();
                break;
        }
    }

    loadDashboard() {
        this.loadDashboardStats();
    }

    loadDashboardStats() {
        const totalUsers = this.users.length;
        const totalBalance = this.users.reduce((sum, user) => sum + user.balance, 0);
        const pendingDeposits = this.deposits.filter(d => d.status === 'pending').length;
        const pendingWithdraws = this.withdraws.filter(w => w.status === 'pending').length;

        document.getElementById('total-users').textContent = totalUsers.toLocaleString();
        document.getElementById('total-balance').textContent = totalBalance.toLocaleString();
        document.getElementById('pending-deposits').textContent = pendingDeposits;
        document.getElementById('pending-withdraws').textContent = pendingWithdraws;
    }

    loadUsersTable() {
        const tbody = document.getElementById('users-table');
        if (!tbody) return;

        if (this.users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px;">
                        <i class="fas fa-users" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 10px; display: block;"></i>
                        <p>Belum ada user terdaftar</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.balance.toLocaleString()}</td>
                <td>
                    <span class="status-badge ${user.isAdmin ? 'status-approved' : 'status-pending'}">
                        ${user.isAdmin ? 'Admin' : 'User'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    loadGameSettings() {
        const settings = this.gameSettings;
        
        if (settings.slot) {
            document.getElementById('slot-win-chance').value = settings.slot.winChance || 30;
            document.getElementById('slot-payout').value = settings.slot.payoutMultiplier || 2;
        }
        
        if (settings.wheel) {
            document.getElementById('wheel-win-chance').value = settings.wheel.winChance || 25;
            document.getElementById('wheel-payout').value = settings.wheel.payoutMultiplier || 3;
        }
    }

    updateAdminInfo() {
        const adminName = document.getElementById('admin-name');
        if (adminName && this.currentUser) {
            adminName.textContent = this.currentUser.username;
        }
    }

    logout() {
        localStorage.removeItem('menang888_current_user');
        window.location.href = 'index.html';
    }

    saveData() {
        localStorage.setItem('menang888_users', JSON.stringify(this.users));
        localStorage.setItem('menang888_deposits', JSON.stringify(this.deposits));
        localStorage.setItem('menang888_withdraws', JSON.stringify(this.withdraws));
        localStorage.setItem('menang888_settings', JSON.stringify(this.gameSettings));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification notification-${type}`;
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
    window.adminDashboard = new AdminDashboard();
});

function saveGameSettings(gameType) {
    if (window.adminDashboard) {
        if (!window.adminDashboard.gameSettings[gameType]) {
            window.adminDashboard.gameSettings[gameType] = {};
        }

        window.adminDashboard.gameSettings[gameType].winChance = parseInt(document.getElementById(`${gameType}-win-chance`).value);
        window.adminDashboard.gameSettings[gameType].payoutMultiplier = parseFloat(document.getElementById(`${gameType}-payout`).value);

        window.adminDashboard.saveData();
        window.adminDashboard.showNotification(`${gameType} settings saved`, 'success');
    }
}
