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

        // Refresh data button
        document.getElementById('refresh-data')?.addEventListener('click', () => {
            this.loadDashboard();
            this.showNotification('Data diperbarui!', 'success');
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
            case 'deposits':
                this.loadDepositsTable();
                break;
            case 'withdraws':
                this.loadWithdrawsTable();
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
        const totalBalance = this.users.reduce((sum, user) => sum + (user.balance || 0), 0);
        const pendingDeposits = this.deposits.filter(d => d.status === 'pending').length;
        const pendingWithdraws = this.withdraws.filter(w => w.status === 'pending').length;

        document.getElementById('total-users').textContent = totalUsers.toLocaleString();
        document.getElementById('total-balance').textContent = this.formatCurrency(totalBalance);
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
                        <i class="fas fa-users" style="font-size: 3rem; color: var(--primary); margin-bottom: 10px; display: block;"></i>
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
                <td>${user.email || '-'}</td>
                <td>${this.formatCurrency(user.balance || 0)}</td>
                <td>
                    <span class="status-badge ${user.isAdmin ? 'status-approved' : 'status-pending'}">
                        ${user.isAdmin ? 'Admin' : 'User'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    loadDepositsTable() {
        const tbody = document.getElementById('deposits-table');
        if (!tbody) return;

        // Reload deposits data
        this.deposits = JSON.parse(localStorage.getItem('menang888_deposits')) || [];

        if (this.deposits.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">
                        <i class="fas fa-money-bill-wave" style="font-size: 3rem; color: var(--primary); margin-bottom: 10px; display: block;"></i>
                        <p>Belum ada permintaan deposit</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.deposits.map(deposit => {
            const user = this.users.find(u => u.id === deposit.userId);
            return `
                <tr>
                    <td>${deposit.id}</td>
                    <td>${user ? user.username : 'Unknown'}</td>
                    <td>${this.formatCurrency(deposit.amount)}</td>
                    <td>${deposit.bank || '-'}</td>
                    <td>${deposit.proof || 'No file'}</td>
                    <td>
                        <span class="status-badge status-${deposit.status}">
                            ${this.getStatusText(deposit.status)}
                        </span>
                    </td>
                    <td>${new Date(deposit.createdAt).toLocaleDateString('id-ID')}</td>
                    <td>
                        ${deposit.status === 'pending' ? `
                            <button class="btn-success btn-sm" onclick="adminDashboard.approveDeposit('${deposit.id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn-danger btn-sm" onclick="adminDashboard.rejectDeposit('${deposit.id}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : 'Completed'}
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadWithdrawsTable() {
        const tbody = document.getElementById('withdraws-table');
        if (!tbody) return;

        // Reload withdraws data
        this.withdraws = JSON.parse(localStorage.getItem('menang888_withdraws')) || [];

        if (this.withdraws.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 20px;">
                        <i class="fas fa-wallet" style="font-size: 3rem; color: var(--primary); margin-bottom: 10px; display: block;"></i>
                        <p>Belum ada permintaan withdraw</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.withdraws.map(withdraw => {
            const user = this.users.find(u => u.id === withdraw.userId);
            return `
                <tr>
                    <td>${withdraw.id}</td>
                    <td>${user ? user.username : 'Unknown'}</td>
                    <td>${this.formatCurrency(withdraw.amount)}</td>
                    <td>${withdraw.bankName || '-'}</td>
                    <td>${withdraw.bankAccount || '-'}</td>
                    <td>
                        <span class="status-badge status-${withdraw.status}">
                            ${this.getStatusText(withdraw.status)}
                        </span>
                    </td>
                    <td>${new Date(withdraw.createdAt).toLocaleDateString('id-ID')}</td>
                    <td>
                        ${withdraw.status === 'pending' ? `
                            <button class="btn-success btn-sm" onclick="adminDashboard.approveWithdraw('${withdraw.id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn-danger btn-sm" onclick="adminDashboard.rejectWithdraw('${withdraw.id}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : 'Completed'}
                    </td>
                </tr>
            `;
        }).join('');
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

    // APPROVAL SYSTEM
    approveDeposit(depositId) {
        const deposit = this.deposits.find(d => d.id === depositId);
        if (!deposit) return;

        const user = this.users.find(u => u.id === deposit.userId);
        if (!user) return;

        // Update deposit status
        deposit.status = 'completed';
        deposit.approvedAt = new Date().toISOString();

        // Add bonus if any
        const bonus = deposit.amount >= 100000 ? Math.floor(deposit.amount * 0.10) : 0;
        const totalAmount = deposit.amount + bonus;

        // Update user balance
        user.balance = (user.balance || 0) + totalAmount;

        this.saveAllData();
        this.loadAllData();
        
        this.showNotification(`Deposit ${this.formatCurrency(deposit.amount)} approved for ${user.username}! Bonus: ${this.formatCurrency(bonus)}`, 'success');
    }

    rejectDeposit(depositId) {
        const deposit = this.deposits.find(d => d.id === depositId);
        if (!deposit) return;

        deposit.status = 'rejected';
        deposit.rejectedAt = new Date().toISOString();

        this.saveAllData();
        this.loadAllData();
        
        this.showNotification(`Deposit ${this.formatCurrency(deposit.amount)} rejected`, 'warning');
    }

    approveWithdraw(withdrawId) {
        const withdraw = this.withdraws.find(w => w.id === withdrawId);
        if (!withdraw) return;

        const user = this.users.find(u => u.id === withdraw.userId);
        if (!user) return;

        // Update withdraw status
        withdraw.status = 'completed';
        withdraw.processedAt = new Date().toISOString();

        this.saveAllData();
        this.loadAllData();
        
        this.showNotification(`Withdraw ${this.formatCurrency(withdraw.amount)} approved for ${user.username}`, 'success');
    }

    rejectWithdraw(withdrawId) {
        const withdraw = this.withdraws.find(w => w.id === withdrawId);
        if (!withdraw) return;

        const user = this.users.find(u => u.id === withdraw.userId);
        if (user) {
            // Return balance to user
            user.balance = (user.balance || 0) + withdraw.amount;
        }

        withdraw.status = 'rejected';
        withdraw.rejectedAt = new Date().toISOString();

        this.saveAllData();
        this.loadAllData();
        
        this.showNotification(`Withdraw ${this.formatCurrency(withdraw.amount)} rejected. Balance returned to user.`, 'warning');
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

    saveAllData() {
        localStorage.setItem('menang888_users', JSON.stringify(this.users));
        localStorage.setItem('menang888_deposits', JSON.stringify(this.deposits));
        localStorage.setItem('menang888_withdraws', JSON.stringify(this.withdraws));
        localStorage.setItem('menang888_settings', JSON.stringify(this.gameSettings));
        
        // Update current user in localStorage if it's the admin
        if (this.currentUser) {
            const currentUserIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (currentUserIndex !== -1) {
                this.currentUser = this.users[currentUserIndex];
                localStorage.setItem('menang888_current_user', JSON.stringify(this.currentUser));
            }
        }
    }

    loadAllData() {
        this.users = JSON.parse(localStorage.getItem('menang888_users')) || [];
        this.deposits = JSON.parse(localStorage.getItem('menang888_deposits')) || [];
        this.withdraws = JSON.parse(localStorage.getItem('menang888_withdraws')) || [];
        this.loadDashboardStats();
        this.loadUsersTable();
        this.loadDepositsTable();
        this.loadWithdrawsTable();
    }

    // UTILITY METHODS
    formatCurrency(amount) {
        return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Pending',
            'completed': 'Completed',
            'rejected': 'Rejected'
        };
        return statusMap[status] || status;
    }

    showNotification(message, type = 'info') {
        // Create simple notification
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

// Global function untuk save game settings
function saveGameSettings(gameType) {
    if (window.adminDashboard) {
        if (!window.adminDashboard.gameSettings[gameType]) {
            window.adminDashboard.gameSettings[gameType] = {};
        }

        window.adminDashboard.gameSettings[gameType].winChance = parseInt(document.getElementById(`${gameType}-win-chance`).value);
        window.adminDashboard.gameSettings[gameType].payoutMultiplier = parseFloat(document.getElementById(`${gameType}-payout`).value);

        window.adminDashboard.saveAllData();
        window.adminDashboard.showNotification(`${gameType} settings saved`, 'success');
    }
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();// ====== realtime update deposit & withdraw ======

// fungsi buat refresh ulang data di admin panel
function reloadAdminData() {
  if (window.adminDashboard) {
    adminDashboard.loadDepositsTable();
    adminDashboard.loadWithdrawsTable();
    adminDashboard.loadUsersTable();
    adminDashboard.loadDashboardStats();
  }
}

// auto refresh setiap 2 detik
setInterval(reloadAdminData, 2000);

// dengerin perubahan data di localStorage (kalau ada dari tab lain)
window.addEventListener('storage', function(e) {
  if (
    e.key === 'menang888_deposits' ||
    e.key === 'menang888_withdraws' ||
    e.key === 'menang888_users'
  ) {
    reloadAdminData();
  }
});
