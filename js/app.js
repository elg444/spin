// Main Application Controller
class MENANG888App {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('menang888_users')) || [];
        this.deposits = JSON.parse(localStorage.getItem('menang888_deposits')) || [];
        this.withdraws = JSON.parse(localStorage.getItem('menang888_withdraws')) || [];
        this.gameSettings = JSON.parse(localStorage.getItem('menang888_settings')) || {
            winChance: 30,
            payoutMultiplier: 2,
            minBet: 10,
            maxBet: 100
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadGames();
        this.checkAutoLogin();
        
        // Show login modal if no user is logged in
        if (!this.currentUser) {
            this.showModal('login-modal');
        }
    }

    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget);
            });
        });

        // Mobile menu
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            document.querySelector('.nav-tabs').classList.toggle('active');
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Admin panel
        document.getElementById('admin-btn').addEventListener('click', () => {
            this.toggleAdminPanel();
        });
    }

    switchTab(tabElement) {
        // Remove active class from all tabs and sections
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

        // Add active class to clicked tab and corresponding section
        tabElement.classList.add('active');
        const targetSection = document.getElementById(tabElement.dataset.target);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Close mobile menu after selection
        document.querySelector('.nav-tabs').classList.remove('active');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    loadGames() {
        const games = [
            {
                id: 'slot',
                title: 'Slot Machine',
                icon: 'fas fa-sliders-h',
                description: 'Putar gulungan dan menangkan jackpot besar!',
                color: '#ff0080'
            },
            {
                id: 'wheel',
                title: 'Spin Wheel',
                icon: 'fas fa-redo',
                description: 'Putar roda keberuntungan dan raih hadiah!',
                color: '#00ffff'
            },
            {
                id: 'poker',
                title: 'Poker Online',
                icon: 'fas fa-spade',
                description: 'Tantang pemain lain dalam permainan poker seru!',
                color: '#ffcc00'
            },
            {
                id: 'blackjack',
                title: 'Blackjack',
                icon: 'fas fa-dice',
                description: 'Kalahkan dealer dengan nilai 21!',
                color: '#00ff88'
            },
            {
                id: 'roulette',
                title: 'Roulette',
                icon: 'fas fa-circle',
                description: 'Pasang taruhan dan saksikan bola berputar!',
                color: '#ff4444'
            },
            {
                id: 'baccarat',
                title: 'Baccarat',
                icon: 'fas fa-gem',
                description: 'Permainan kartu klasik dengan peluang menang tinggi!',
                color: '#0099ff'
            }
        ];

        const gamesGrid = document.querySelector('.games-grid');
        gamesGrid.innerHTML = games.map(game => `
            <div class="game-card" data-game="${game.id}">
                <div class="game-icon" style="background: linear-gradient(135deg, ${game.color}, ${this.lightenColor(game.color, 20)})">
                    <i class="${game.icon}"></i>
                </div>
                <div class="game-title">${game.title}</div>
                <div class="game-description">${game.description}</div>
            </div>
        `).join('');

        // Add event listeners to game cards
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameId = card.dataset.game;
                this.openGame(gameId);
            });
        });
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }

    openGame(gameId) {
        // Show loading animation
        this.showLoading(`Membuka ${gameId}...`);
        
        // Simulate game loading
        setTimeout(() => {
            this.hideLoading();
            
            // In a real application, this would redirect to the actual game
            // For now, show a message
            this.showNotification(`Game ${gameId} akan segera dimulai!`, 'info');
            
            // You can add actual game logic here
            if (gameId === 'wheel') {
                // Initialize wheel game
                if (typeof window.wheelGame !== 'undefined') {
                    window.wheelGame.init();
                }
            }
        }, 1500);
    }

    showLoading(message = 'Memuat...') {
        // Create loading overlay if it doesn't exist
        let loadingOverlay = document.getElementById('loading-overlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 3000;
                color: white;
            `;
            document.body.appendChild(loadingOverlay);
        }

        loadingOverlay.innerHTML = `
            <div class="spinner" style="
                width: 50px;
                height: 50px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            "></div>
            <p style="font-size: 1.1rem;">${message}</p>
        `;

        loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
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
            z-index: 4000;
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

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
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

    checkAutoLogin() {
        const savedUser = localStorage.getItem('menang888_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUserDisplay();
            document.getElementById('main-app').style.display = 'block';
        }
    }

    updateUserDisplay() {
        if (!this.currentUser) return;

        document.getElementById('balance').textContent = this.currentUser.balance.toLocaleString();
        document.getElementById('user-id-display').textContent = this.currentUser.id;

        // Update account section
        document.getElementById('account-username').textContent = this.currentUser.username;
        document.getElementById('account-email').textContent = this.currentUser.email;
        document.getElementById('account-phone').textContent = this.currentUser.phone;
        document.getElementById('account-bank-account').textContent = this.currentUser.bankAccount;
        document.getElementById('account-bank-name').textContent = this.currentUser.bankName;

        // Update withdraw section
        document.getElementById('withdraw-account').textContent = this.currentUser.bankAccount;
        document.getElementById('withdraw-name').textContent = this.currentUser.bankName;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('menang888_current_user');
        document.getElementById('main-app').style.display = 'none';
        this.showModal('login-modal');
        this.showNotification('Anda telah logout', 'info');
    }

    toggleAdminPanel() {
        const adminPanel = document.getElementById('admin-panel');
        if (this.currentUser && this.currentUser.isAdmin) {
            adminPanel.classList.toggle('active');
            if (adminPanel.classList.contains('active')) {
                this.showNotification('Panel Admin dibuka', 'info');
            }
        } else {
            this.showNotification('Akses ditolak. Hanya admin yang dapat mengakses panel ini.', 'error');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MENANG888App();
});

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
