// Admin System
class AdminSystem {
    constructor(app) {
        this.app = app;
        this.setupAdminEvents();
    }

    setupAdminEvents() {
        // Admin navigation
        document.querySelectorAll('#admin-panel .nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAdminTab(e.currentTarget);
            });
        });

        // Admin settings
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveGameSettings();
        });

        document.getElementById('reset-game').addEventListener('click', () => {
            this.resetGameData();
        });
    }

    switchAdminTab(tabElement) {
        // Remove active class from all admin tabs and sections
        document.querySelectorAll('#admin-panel .nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#admin-panel .content-section').forEach(s => s.classList.remove('active'));

        // Add active class to clicked tab and corresponding section
        tabElement.classList.add('active');
        const targetSection = document.getElementById(tabElement.dataset.target);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Load data for the selected section
        this.loadAdminSection(tabElement.dataset.target);
    }

    loadAdminSection(section) {
        switch(section) {
            case 'admin-users':
                this.loadUsersTable();
                break;
            case 'admin-deposits':
                this.loadDepositsTable();
                break;
            case 'admin-withdraws':
                this.loadWithdrawsTable();
                break;
            case 'admin-settings':
                this.loadGameSettings();
                break;
        }
    }

    loadUsersTable() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.app.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.balance.toLocaleString()}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="adminSystem.editUser('${user.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="adminSystem.deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </td>
            </tr>
        `).join('');
    }

    loadDepositsTable() {
        const tbody = document.getElementById('deposits-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.app.deposits.map(deposit => {
            const user = this.app.users.find(u => u.id === deposit.userId);
            const statusClass = this.getStatusClass(deposit.status);
            
            return `
                <tr>
                    <td>${deposit.userId}</td>
                    <td>${user ? user.username : 'Unknown'}</td>
                    <td>${deposit.amount.toLocaleString()}</td>
                    <td>${deposit.bank}</td>
                    <td><span class="${statusClass}">${deposit.status}</span></td>
                    <td>
                        ${deposit.status === 'pending' ? `
                            <button class="btn btn-success btn-sm" onclick="adminSystem.approveDeposit('${deposit.id}')">
                                <i class="fas fa-check"></i> Setujui
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="adminSystem.rejectDeposit('${deposit.id}')">
                                <i class="fas fa-times"></i> Tolak
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadWithdrawsTable() {
        const tbody = document.getElementById('withdraws-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.app.withdraws.map(withdraw => {
            const user = this.app.users.find(u => u.id === withdraw.userId);
            const statusClass = this.getStatusClass(withdraw.status);
            
            return `
                <tr>
                    <td>${withdraw.userId}</td>
                    <td>${user ? user.username : 'Unknown'}</td>
                    <td>${withdraw.amount.toLocaleString()}</td>
                    <td>${withdraw.bankAccount}</td>
                    <td><span class="${statusClass}">${withdraw.status}</span></td>
                    <td>
                        ${withdraw.status === 'pending' ? `
                            <button class="btn btn-success btn-sm" onclick="adminSystem.approveWithdraw('${withdraw.id}')">
                                <i class="fas fa-check"></i> Setujui
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="adminSystem.rejectWithdraw('${withdraw.id}')">
                                <i class="fas fa-times"></i> Tolak
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadGameSettings() {
        document.getElementById('win-chance').value = this.app.gameSettings.winChance;
        document.getElementById('payout-multiplier').value = this.app.gameSettings.payoutMultiplier;
        document.getElementById('min-bet').value = this.app.gameSettings.minBet;
        document.getElementById('max-bet').value = this.app.gameSettings.maxBet;
    }

    getStatusClass(status) {
        const classes = {
            pending: 'status-pending',
            approved: 'status-approved',
            rejected: 'status-rejected'
        };
        return classes[status] || 'status-pending';
    }

    saveGameSettings() {
        const winChance = parseInt(document.getElementById('win-chance').value);
        const payoutMultiplier = parseFloat(document.getElementById('payout-multiplier').value);
        const minBet = parseInt(document.getElementById('min-bet').value);
        const maxBet = parseInt(document.getElementById('max-bet').value);

        if (!this.validateSettings(winChance, payoutMultiplier, minBet, maxBet)) {
            return;
        }

        this.app.gameSettings.winChance = winChance;
        this.app.gameSettings.payoutMultiplier = payoutMultiplier;
        this.app.gameSettings.minBet = minBet;
        this.app.gameSettings.maxBet = maxBet;

        this.saveSettings();
        this.app.showNotification('Pengaturan game berhasil disimpan!', 'success');
    }

    validateSettings(winChance, payoutMultiplier, minBet, maxBet) {
        if (winChance < 1 || winChance > 100) {
            this.app.showNotification('Peluang menang harus antara 1-100%!', 'error');
            return false;
        }

        if (payoutMultiplier < 1 || payoutMultiplier > 10) {
            this.app.showNotification('Pengali kemenangan harus antara 1-10!', 'error');
            return false;
        }

        if (minBet < 1) {
            this.app.showNotification('Taruhan minimum minimal 1 koin!', 'error');
            return false;
        }

        if (maxBet <= minBet) {
            this.app.showNotification('Taruhan maksimum harus lebih besar dari minimum!', 'error');
            return false;
        }

        return true;
    }

    approveDeposit(depositId) {
        const deposit = this.app.deposits.find(d => d.id === depositId);
        if (!deposit) return;

        const user = this.app.users.find(u => u.id === deposit.userId);
        if (!user) return;

        // Update user balance
        user.balance += deposit.amount;
        deposit.status = 'approved';

        this.saveUsers();
        this.saveDeposits();
        this.loadDepositsTable();

        this.app.showNotification(`Deposit ${deposit.amount.toLocaleString()} koin disetujui!`, 'success');
    }

    rejectDeposit(depositId) {
        const deposit = this.app.deposits.find(d => d.id === depositId);
        if (!deposit) return;

        deposit.status = 'rejected';
        this.saveDeposits();
        this.loadDepositsTable();

        this.app.showNotification(`Deposit ${deposit.amount.toLocaleString()} koin ditolak!`, 'warning');
    }

    approveWithdraw(withdrawId) {
        const withdraw = this.app.withdraws.find(w => w.id === withdrawId);
        if (!withdraw) return;

        withdraw.status = 'approved';
        this.saveWithdraws();
        this.loadWithdrawsTable();

        this.app.showNotification(`Withdraw ${withdraw.amount.toLocaleString()} koin disetujui!`, 'success');
    }

    rejectWithdraw(withdrawId) {
        const withdraw = this.app.withdraws.find(w => w.id === withdrawId);
        if (!withdraw) return;

        // Return balance to user
        const user = this.app.users.find(u => u.id === withdraw.userId);
        if (user) {
            user.balance += withdraw.amount;
            this.saveUsers();
        }

        withdraw.status = 'rejected';
        this.saveWithdraws();
        this.loadWithdrawsTable();

        this.app.showNotification(`Withdraw ${withdraw.amount.toLocaleString()} koin ditolak!`, 'warning');
    }

    editUser(userId) {
        const user = this.app.users.find(u => u.id === userId);
        if (!user) return;

        // In a real application, this would open an edit modal
        this.app.showNotification(`Edit user ${user.username} - Fitur akan datang!`, 'info');
    }

    deleteUser(userId) {
        const user = this.app.users.find(u => u.id === userId);
        if (!user) return;

        if (confirm(`Hapus user ${user.username}? Tindakan ini tidak dapat dibatalkan!`)) {
            this.app.users = this.app.users.filter(u => u.id !== userId);
            this.saveUsers();
            this.loadUsersTable();
            this.app.showNotification(`User ${user.username} telah dihapus!`, 'success');
        }
    }

    resetGameData() {
        if (confirm('RESET SEMUA DATA GAME? Semua user, transaksi, dan pengaturan akan dihapus!')) {
            // Create default admin user
            const defaultAdmin = {
                id: 'ADMINREX',
                username: 'elga',
                password: 'elga21',
                email: 'admin@menang888.com',
                phone: '081234567890',
                bankAccount: '085179740807',
                bankName: 'ADMIN MENANG888',
                balance: 100000000,
                isAdmin: true,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };

            // Reset all data
            this.app.users = [defaultAdmin];
            this.app.deposits = [];
            this.app.withdraws = [];
            this.app.gameSettings = {
                winChance: 30,
                payoutMultiplier: 2,
                minBet: 10,
                maxBet: 100
            };

            // Save to localStorage
            this.saveUsers();
            this.saveDeposits();
            this.saveWithdraws();
            this.saveSettings();

            // Reload admin sections
            this.loadUsersTable();
            this.loadDepositsTable();
            this.loadWithdrawsTable();
            this.loadGameSettings();

            this.app.showNotification('Semua data game telah direset!', 'success');
        }
    }

    saveUsers() {
        localStorage.setItem('menang888_users', JSON.stringify(this.app.users));
    }

    saveDeposits() {
        localStorage.setItem('menang888_deposits', JSON.stringify(this.app.deposits));
    }

    saveWithdraws() {
        localStorage.setItem('menang888_withdraws', JSON.stringify(this.app.withdraws));
    }

    saveSettings() {
        localStorage.setItem('menang888_settings', JSON.stringify(this.app.gameSettings));
    }
}

// Initialize admin system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Admin system will be initialized by the main app
});
