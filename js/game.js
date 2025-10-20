// Game System
class GameSystem {
    constructor(app) {
        this.app = app;
        this.currentGame = null;
        this.setupGameEvents();
    }

    setupGameEvents() {
        // Deposit events
        document.getElementById('submit-deposit').addEventListener('click', () => {
            this.handleDeposit();
        });

        // Withdraw events
        document.getElementById('submit-withdraw').addEventListener('click', () => {
            this.handleWithdraw();
        });

        // Social media events
        document.querySelectorAll('.social-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                this.openSocialLink(e.currentTarget.dataset.social);
            });
        });
    }

    handleDeposit() {
        const amount = parseInt(document.getElementById('deposit-amount').value);
        const bank = document.getElementById('deposit-bank').value;
        const proof = document.getElementById('deposit-proof').files[0];

        if (!this.validateDeposit(amount, bank, proof)) {
            return;
        }

        this.app.showLoading('Mengirim permintaan deposit...');

        // Simulate API call
        setTimeout(() => {
            const deposit = {
                id: this.generateTransactionId(),
                userId: this.app.currentUser.id,
                amount: amount,
                bank: bank,
                proof: proof ? proof.name : 'No file',
                status: 'pending',
                date: new Date().toISOString()
            };

            this.app.deposits.push(deposit);
            this.saveDeposits();

            this.app.showNotification('Permintaan deposit telah dikirim! Menunggu persetujuan admin.', 'success');
            this.clearDepositForm();
            this.app.hideLoading();
        }, 1000);
    }

    handleWithdraw() {
        const amount = parseInt(document.getElementById('withdraw-amount').value);

        if (!this.validateWithdraw(amount)) {
            return;
        }

        this.app.showLoading('Mengirim permintaan withdraw...');

        // Simulate API call
        setTimeout(() => {
            const withdraw = {
                id: this.generateTransactionId(),
                userId: this.app.currentUser.id,
                amount: amount,
                bankAccount: this.app.currentUser.bankAccount,
                bankName: this.app.currentUser.bankName,
                status: 'pending',
                date: new Date().toISOString()
            };

            this.app.withdraws.push(withdraw);
            this.saveWithdraws();

            // Deduct from balance immediately (will be reversed if rejected)
            this.app.currentUser.balance -= amount;
            this.app.updateUserDisplay();
            this.saveUsers();

            this.app.showNotification('Permintaan withdraw telah dikirim! Menunggu persetujuan admin.', 'success');
            this.clearWithdrawForm();
            this.app.hideLoading();
        }, 1000);
    }

    validateDeposit(amount, bank, proof) {
        if (!amount || amount <= 0) {
            this.app.showNotification('Masukkan nominal deposit yang valid!', 'error');
            return false;
        }

        if (amount < 10000) {
            this.app.showNotification('Minimum deposit adalah 10,000 koin!', 'error');
            return false;
        }

        if (!bank) {
            this.app.showNotification('Pilih bank untuk deposit!', 'error');
            return false;
        }

        if (!proof) {
            this.app.showNotification('Upload bukti transfer!', 'error');
            return false;
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(proof.type)) {
            this.app.showNotification('File harus berupa JPEG, PNG, atau PDF!', 'error');
            return false;
        }

        // Check file size (max 5MB)
        if (proof.size > 5 * 1024 * 1024) {
            this.app.showNotification('Ukuran file maksimal 5MB!', 'error');
            return false;
        }

        return true;
    }

    validateWithdraw(amount) {
        if (!amount || amount <= 0) {
            this.app.showNotification('Masukkan nominal withdraw yang valid!', 'error');
            return false;
        }

        if (amount < 50000) {
            this.app.showNotification('Minimum withdraw adalah 50,000 koin!', 'error');
            return false;
        }

        if (amount > this.app.currentUser.balance) {
            this.app.showNotification('Saldo tidak mencukupi!', 'error');
            return false;
        }

        return true;
    }

    generateTransactionId() {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `TXN${timestamp}${random}`;
    }

    clearDepositForm() {
        document.getElementById('deposit-amount').value = '';
        document.getElementById('deposit-bank').value = '';
        document.getElementById('deposit-proof').value = '';
    }

    clearWithdrawForm() {
        document.getElementById('withdraw-amount').value = '';
    }

    openSocialLink(platform) {
        const urls = {
            facebook: 'https://facebook.com/menang888',
            telegram: 'https://t.me/menang888',
            whatsapp: 'https://wa.me/6281234567890',
            website: 'https://menang888.com'
        };

        const url = urls[platform];
        if (url) {
            window.open(url, '_blank');
            this.app.showNotification(`Membuka ${platform}...`, 'info');
        }
    }

    saveDeposits() {
        localStorage.setItem('menang888_deposits', JSON.stringify(this.app.deposits));
    }

    saveWithdraws() {
        localStorage.setItem('menang888_withdraws', JSON.stringify(this.app.withdraws));
    }

    saveUsers() {
        localStorage.setItem('menang888_users', JSON.stringify(this.app.users));
        // Update current user in localStorage
        if (this.app.currentUser) {
            localStorage.setItem('menang888_current_user', JSON.stringify(this.app.currentUser));
        }
    }
}

// Wheel Game Implementation
class WheelGame {
    constructor() {
        this.isSpinning = false;
        this.wheel = null;
        this.resultDisplay = null;
    }

    init() {
        this.createWheelUI();
        this.setupWheelEvents();
    }

    createWheelUI() {
        const gameContainer = document.createElement('div');
        gameContainer.className = 'wheel-game-container';
        gameContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            color: white;
        `;

        gameContainer.innerHTML = `
            <div class="wheel-header" style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: var(--primary-color); margin-bottom: 10px;">Spin Wheel</h2>
                <p>Putar roda dan menangkan hadiah!</p>
            </div>
            
            <div class="wheel-container" style="position: relative; width: 300px; height: 300px;">
                <div class="wheel" style="
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: conic-gradient(
                        #ff0080 0deg 45deg,
                        #00ffff 45deg 90deg,
                        #ffcc00 90deg 135deg,
                        #00ff88 135deg 180deg,
                        #ff4444 180deg 225deg,
                        #0099ff 225deg 270deg,
                        #ffaa00 270deg 315deg,
                        #ff0080 315deg 360deg
                    );
                    position: relative;
                    transition: transform 3s cubic-bezier(0.2, 0.8, 0.3, 1);
                    box-shadow: 0 0 50px rgba(255, 0, 128, 0.5);
                "></div>
                <div class="wheel-pointer" style="
                    position: absolute;
                    top: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 40px;
                    height: 40px;
                    background: var(--primary-color);
                    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
                    z-index: 10;
                    filter: drop-shadow(0 0 10px var(--primary-color));
                "></div>
            </div>
            
            <div class="wheel-controls" style="margin-top: 30px; text-align: center;">
                <button class="spin-btn" style="
                    padding: 15px 40px;
                    font-size: 1.2rem;
                    background: linear-gradient(135deg, var(--primary-color), #ff3399);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    box-shadow: 0 5px 20px rgba(255, 0, 128, 0.5);
                    transition: all 0.3s ease;
                ">SPIN</button>
                
                <div class="result-display" style="
                    margin-top: 20px;
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    min-height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                "></div>
            </div>
            
            <button class="close-wheel" style="
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
            ">&times;</button>
        `;

        document.body.appendChild(gameContainer);
        
        this.wheel = gameContainer.querySelector('.wheel');
        this.resultDisplay = gameContainer.querySelector('.result-display');
        
        // Close button event
        gameContainer.querySelector('.close-wheel').addEventListener('click', () => {
            document.body.removeChild(gameContainer);
        });
    }

    setupWheelEvents() {
        const spinBtn = document.querySelector('.spin-btn');
        spinBtn.addEventListener('click', () => {
            this.spinWheel();
        });
    }

    spinWheel() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        const spinBtn = document.querySelector('.spin-btn');
        spinBtn.disabled = true;
        
        // Random spin with multiple rotations
        const spinDegrees = 1800 + Math.floor(Math.random() * 360);
        this.wheel.style.transform = `rotate(${spinDegrees}deg)`;
        
        // Determine result after animation
        setTimeout(() => {
            const isWin = Math.random() * 100 < window.app.gameSettings.winChance;
            this.showResult(isWin);
            this.isSpinning = false;
            spinBtn.disabled = false;
        }, 3000);
    }

    showResult(isWin) {
        if (isWin) {
            const winAmount = Math.round(100 * window.app.gameSettings.payoutMultiplier);
            this.resultDisplay.innerHTML = `
                <span style="color: var(--success-color);">
                    <i class="fas fa-trophy"></i> MENANG! +${winAmount} koin!
                </span>
            `;
            this.resultDisplay.style.animation = 'pulse 0.5s ease 3';
            
            // Update user balance
            if (window.app.currentUser) {
                window.app.currentUser.balance += winAmount;
                window.app.updateUserDisplay();
                window.app.saveUsers();
            }
        } else {
            this.resultDisplay.innerHTML = `
                <span style="color: var(--danger-color);">
                    <i class="fas fa-times"></i> Coba lagi!
                </span>
            `;
        }
    }
}

// Initialize game system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Game system will be initialized by the main app
    window.wheelGame = new WheelGame();
});
