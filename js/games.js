class GamesManager {
    constructor() {
        this.games = [];
        this.filteredGames = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.sortBy = 'popular';
        this.init();
    }

    init() {
        this.loadGames();
        this.setupEventListeners();
        this.renderGames();
    }

    loadGames() {
        // Simulated games data - in real app, this would come from API
        this.games = [
            {
                id: 'slot-1',
                name: 'Lucky Stars',
                provider: 'Pragmatic Play',
                category: 'slots',
                image: 'https://via.placeholder.com/300x180/6366f1/ffffff?text=Lucky+Stars',
                rtp: 96.5,
                volatility: 'Medium',
                players: 2400,
                features: ['Free Spins', 'Bonus Rounds', 'Wild Symbols'],
                isHot: true,
                isNew: false,
                minBet: 100,
                maxBet: 10000
            },
            {
                id: 'slot-2',
                name: 'Diamond Mine',
                provider: 'Playtech',
                category: 'slots',
                image: 'https://via.placeholder.com/300x180/06d6a0/ffffff?text=Diamond+Mine',
                rtp: 95.8,
                volatility: 'High',
                players: 1800,
                features: ['Progressive Jackpot', 'Multipliers', 'Scatter'],
                isHot: false,
                isNew: true,
                minBet: 200,
                maxBet: 5000
            },
            {
                id: 'live-1',
                name: 'Live Blackjack',
                provider: 'Evolution',
                category: 'live',
                image: 'https://via.placeholder.com/300x180/ff6b6b/ffffff?text=Live+Blackjack',
                rtp: 99.5,
                volatility: 'Low',
                players: 950,
                features: ['Live Dealer', 'Side Bets', 'Insurance'],
                isHot: true,
                isNew: false,
                minBet: 500,
                maxBet: 50000
            },
            {
                id: 'poker-1',
                name: 'Texas Holdem',
                provider: 'PokerStars',
                category: 'poker',
                image: 'https://via.placeholder.com/300x180/ffd166/000000?text=Texas+Holdem',
                rtp: 98.2,
                volatility: 'Medium',
                players: 3200,
                features: ['Tournaments', 'Cash Games', 'Sit & Go'],
                isHot: true,
                isNew: false,
                minBet: 1000,
                maxBet: 100000
            },
            {
                id: 'sports-1',
                name: 'Sports Betting',
                provider: 'SBOBET',
                category: 'sports',
                image: 'https://via.placeholder.com/300x180/8b5cf6/ffffff?text=Sports+Betting',
                rtp: 94.0,
                volatility: 'High',
                players: 4500,
                features: ['Live Betting', 'Multiple Sports', 'Cash Out'],
                isHot: false,
                isNew: true,
                minBet: 10000,
                maxBet: 5000000
            }
        ];

        this.filteredGames = [...this.games];
    }

    setupEventListeners() {
        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleFilterChange(e.currentTarget.dataset.category);
            });
        });

        // Search input
        document.getElementById('game-search').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Sort select
        document.getElementById('game-sort').addEventListener('change', (e) => {
            this.handleSort(e.target.value);
        });

        // Modal close
        document.querySelector('.game-modal .close-modal').addEventListener('click', () => {
            this.hideGameModal();
        });
    }

    handleFilterChange(category) {
        this.currentCategory = category;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.applyFilters();
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }

    handleSort(sortBy) {
        this.sortBy = sortBy;
        this.applyFilters();
    }

    applyFilters() {
        let filtered = this.games;

        // Category filter
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(game => game.category === this.currentCategory);
        }

        // Search filter
        if (this.searchQuery) {
            filtered = filtered.filter(game => 
                game.name.toLowerCase().includes(this.searchQuery) ||
                game.provider.toLowerCase().includes(this.searchQuery)
            );
        }

        // Sort
        filtered = this.sortGames(filtered, this.sortBy);

        this.filteredGames = filtered;
        this.renderGames();
    }

    sortGames(games, sortBy) {
        switch(sortBy) {
            case 'name':
                return games.sort((a, b) => a.name.localeCompare(b.name));
            case 'new':
                return games.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            case 'payout':
                return games.sort((a, b) => b.rtp - a.rtp);
            case 'popular':
            default:
                return games.sort((a, b) => b.players - a.players);
        }
    }

    renderGames() {
        const gamesGrid = document.getElementById('games-grid');
        const gamesLoading = document.getElementById('games-loading');

        if (gamesLoading) {
            gamesLoading.style.display = 'none';
        }

        if (this.filteredGames.length === 0) {
            gamesGrid.innerHTML = `
                <div class="no-games">
                    <i class="fas fa-gamepad"></i>
                    <h3>Tidak ada game yang ditemukan</h3>
                    <p>Coba ubah filter atau kata kunci pencarian</p>
                </div>
            `;
            return;
        }

        gamesGrid.innerHTML = this.filteredGames.map(game => `
            <div class="game-item" data-game-id="${game.id}">
                <div class="game-image">
                    <img src="${game.image}" alt="${game.name}" onerror="this.src='https://via.placeholder.com/300x180/1a1a2e/6366f1?text=${encodeURIComponent(game.name)}'">
                    <div class="game-badges">
                        ${game.isHot ? '<span class="game-badge hot">HOT</span>' : ''}
                        ${game.isNew ? '<span class="game-badge new">NEW</span>' : ''}
                    </div>
                </div>
                <div class="game-content">
                    <h3 class="game-title">${game.name}</h3>
                    <p class="game-provider">${game.provider}</p>
                    <div class="game-features">
                        <div class="game-feature">
                            <i class="fas fa-chart-line"></i>
                            <span>${game.rtp}%</span>
                        </div>
                        <div class="game-feature">
                            <i class="fas fa-users"></i>
                            <span>${this.formatNumber(game.players)}</span>
                        </div>
                    </div>
                    <div class="game-actions">
                        <button class="btn-play" onclick="gamesManager.playGame('${game.id}')">
                            <i class="fas fa-play"></i>
                            Main
                        </button>
                        <button class="btn-info" onclick="gamesManager.showGameDetail('${game.id}')">
                            <i class="fas fa-info"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add hover effects
        this.addGameHoverEffects();
    }

    addGameHoverEffects() {
        document.querySelectorAll('.game-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
                this.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            });

            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        });
    }

    showGameDetail(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        // Update modal content
        document.getElementById('game-modal-title').textContent = game.name;
        document.getElementById('game-modal-image').src = game.image;
        document.getElementById('game-rtp').textContent = `${game.rtp}%`;
        document.getElementById('game-players').textContent = this.formatNumber(game.players);
        document.getElementById('game-volatility').textContent = game.volatility;
        document.getElementById('game-description').textContent = 
            `${game.name} oleh ${game.provider}. Game ${game.category} dengan RTP ${game.rtp}% dan volatilitas ${game.volatility}.`;

        // Update badges
        const badge1 = document.getElementById('game-badge-1');
        const badge2 = document.getElementById('game-badge-2');
        
        badge1.textContent = game.isHot ? 'HOT' : 'POPULAR';
        badge1.className = `badge ${game.isHot ? 'hot' : 'popular'}`;
        badge1.style.display = game.isHot || game.players > 2000 ? 'inline-block' : 'none';
        
        badge2.textContent = game.isNew ? 'NEW' : 'TRENDING';
        badge2.className = `badge ${game.isNew ? 'new' : 'popular'}`;
        badge2.style.display = game.isNew ? 'inline-block' : 'none';

        // Update features
        const featuresList = document.getElementById('game-features-list');
        featuresList.innerHTML = game.features.map(feature => 
            `<li><i class="fas fa-check"></i> ${feature}</li>`
        ).join('');

        // Update play button
        const playBtn = document.getElementById('btn-play-game');
        playBtn.onclick = () => this.playGame(gameId);

        // Show modal
        this.showGameModal();
    }

    showGameModal() {
        document.getElementById('game-detail-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideGameModal() {
        document.getElementById('game-detail-modal').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    playGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        const currentUser = JSON.parse(localStorage.getItem('menang888_current_user'));
        
        if (!currentUser) {
            window.app.showNotification('Silakan login terlebih dahulu!', 'error');
            return;
        }

        if (currentUser.balance < game.minBet) {
            window.app.showNotification(`Saldo tidak cukup! Minimum bet: ${window.app.formatCurrency(game.minBet)}`, 'error');
            return;
        }

        // Log game access
        window.app.logSecurityEvent('game_accessed', `User played ${game.name}`);

        // Redirect to game page based on category
        switch(game.category) {
            case 'slots':
                if (gameId === 'slot-1') {
                    window.location.href = 'slot.html';
                } else {
                    this.startGameSession(game);
                }
                break;
            case 'live':
                window.app.showNotification('Live casino akan segera hadir!', 'info');
                break;
            case 'poker':
                window.app.showNotification('Poker room akan segera hadir!', 'info');
                break;
            case 'sports':
                window.app.showNotification('Sportsbook akan segera hadir!', 'info');
                break;
            default:
                this.startGameSession(game);
        }
    }

    startGameSession(game) {
        // In a real app, this would initialize the game session
        console.log('🎮 Starting game session:', game.name);
        
        window.app.showNotification(`Memulai ${game.name}...`, 'success');
        
        // Simulate game loading
        setTimeout(() => {
            window.app.showNotification(`${game.name} siap dimainkan!`, 'success');
        }, 2000);
    }

    playDemo() {
        window.app.showNotification('Mode demo akan segera hadir!', 'info');
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }
}

// Initialize games manager
document.addEventListener('DOMContentLoaded', function() {
    window.gamesManager = new GamesManager();
});
