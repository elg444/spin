/**
 * API Integration Bridge for MENANG888
 * Handles communication with backend while maintaining localStorage fallback
 */
class APIIntegration {
    constructor() {
        this.baseURL = window.location.origin + '/api';
        this.isOnline = false;
        this.checkConnection();
    }

    async checkConnection() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            const data = await response.json();
            this.isOnline = response.ok;
            console.log('🔗 Backend status:', this.isOnline ? 'ONLINE' : 'OFFLINE', data);
            
            this.showConnectionStatus();
        } catch (error) {
            this.isOnline = false;
            console.log('🔴 Backend OFFLINE, using localStorage fallback');
            this.showConnectionStatus();
        }
    }

    showConnectionStatus() {
        // Remove existing status indicator
        const existingStatus = document.getElementById('connection-status');
        if (existingStatus) existingStatus.remove();

        const status = document.createElement('div');
        status.id = 'connection-status';
        status.innerHTML = `
            <div style="
                position: fixed;
                bottom: 10px;
                right: 10px;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 10px;
                font-weight: bold;
                z-index: 9999;
                background: ${this.isOnline ? '#10b981' : '#ef4444'};
                color: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            ">
                ${this.isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
            </div>
        `;
        document.body.appendChild(status);
    }

    // ==================== AUTH METHODS ====================
    async register(userData) {
        if (!this.isOnline) {
            return this.localStorageRegister(userData);
        }

        try {
            const response = await fetch(`${this.baseURL}/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'register',
                    username: userData.username,
                    password: userData.password,
                    phone: userData.phone,
                    email: userData.email
                })
            });
            return await response.json();
        } catch (error) {
            console.error('API Register error:', error);
            return this.localStorageRegister(userData);
        }
    }

    async login(credentials) {
        if (!this.isOnline) {
            return this.localStorageLogin(credentials);
        }

        try {
            const response = await fetch(`${this.baseURL}/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'login',
                    username: credentials.username,
                    password: credentials.password
                })
            });
            return await response.json();
        } catch (error) {
            console.error('API Login error:', error);
            return this.localStorageLogin(credentials);
        }
    }

    // ==================== TRANSACTION METHODS ====================
    async deposit(depositData) {
        if (!this.isOnline) {
            return this.localStorageDeposit(depositData);
        }

        try {
            const response = await fetch(`${this.baseURL}/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deposit',
                    userId: depositData.userId,
                    username: depositData.username,
                    amount: depositData.amount,
                    method: depositData.method,
                    phone: depositData.phone
                })
            });
            return await response.json();
        } catch (error) {
            console.error('API Deposit error:', error);
            return this.localStorageDeposit(depositData);
        }
    }

    async withdraw(withdrawData) {
        if (!this.isOnline) {
            return this.localStorageWithdraw(withdrawData);
        }

        try {
            const response = await fetch(`${this.baseURL}/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'withdraw',
                    userId: withdrawData.userId,
                    username: withdrawData.username,
                    amount: withdrawData.amount,
                    method: withdrawData.method,
                    phone: withdrawData.phone
                })
            });
            return await response.json();
        } catch (error) {
            console.error('API Withdraw error:', error);
            return this.localStorageWithdraw(withdrawData);
        }
    }

    // ==================== GAME METHODS ====================
    async playGame(gameData) {
        if (!this.isOnline) {
            return this.localStoragePlayGame(gameData);
        }

        try {
            const response = await fetch(`${this.baseURL}/game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'play',
                    userId: gameData.userId,
                    gameId: gameData.gameId,
                    gameName: gameData.gameName,
                    betAmount: gameData.betAmount
                })
            });
            return await response.json();
        } catch (error) {
            console.error('API Game error:', error);
            return this.localStoragePlayGame(gameData);
        }
    }

    // ==================== LOCALSTORAGE FALLBACK METHODS ====================
    localStorageRegister(userData) {
        const existingUser = JSON.parse(localStorage.getItem('menang888_current_user'));
        if (existingUser && existingUser.username === userData.username) {
            return { success: false, message: 'Username sudah terdaftar' };
        }

        const newUser = {
            id: Date.now().toString(),
            username: userData.username,
            password: userData.password,
            phone: userData.phone,
            email: userData.email,
            balance: 0,
            totalDeposit: 0,
            totalWithdraw: 0,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('menang888_current_user', JSON.stringify(newUser));
        return { success: true, message: 'Registrasi berhasil!', user: newUser };
    }

    localStorageLogin(credentials) {
        const user = JSON.parse(localStorage.getItem('menang888_current_user'));
        if (user && user.username === credentials.username && user.password === credentials.password) {
            return { success: true, user };
        }
        return { success: false, message: 'Username atau password salah' };
    }

    localStorageDeposit(depositData) {
        const user = JSON.parse(localStorage.getItem('menang888_current_user'));
        if (!user) return { success: false, message: 'User tidak ditemukan' };

        user.balance += parseInt(depositData.amount);
        user.totalDeposit += parseInt(depositData.amount);
        localStorage.setItem('menang888_current_user', JSON.stringify(user));

        return { 
            success: true, 
            message: 'Deposit berhasil! Saldo bertambah.', 
            newBalance: user.balance 
        };
    }

    localStorageWithdraw(withdrawData) {
        const user = JSON.parse(localStorage.getItem('menang888_current_user'));
        if (!user) return { success: false, message: 'User tidak ditemukan' };

        const amount = parseInt(withdrawData.amount);
        if (user.balance < amount) {
            return { success: false, message: 'Saldo tidak cukup' };
        }

        user.balance -= amount;
        user.totalWithdraw += amount;
        localStorage.setItem('menang888_current_user', JSON.stringify(user));

        return { 
            success: true, 
            message: 'Withdraw berhasil! Menunggu verifikasi.', 
            newBalance: user.balance 
        };
    }

    localStoragePlayGame(gameData) {
        const user = JSON.parse(localStorage.getItem('menang888_current_user'));
        if (!user) return { success: false, message: 'User tidak ditemukan' };

        const betAmount = parseInt(gameData.betAmount);
        if (user.balance < betAmount) {
            return { success: false, message: 'Saldo tidak cukup' };
        }

        const isWin = Math.random() * 100 < 45;
        const winAmount = isWin ? Math.floor(betAmount * (1 + Math.random() * 4)) : 0;

        user.balance = user.balance - betAmount + winAmount;
        localStorage.setItem('menang888_current_user', JSON.stringify(user));

        return {
            success: true,
            result: {
                isWin,
                winAmount,
                newBalance: user.balance
            }
        };
    }
}

// Initialize API integration
window.api = new APIIntegration();
