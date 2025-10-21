class SecuritySystem {
    constructor() {
        this.securityKey = this.generateSecurityKey();
        this.failedAttempts = 0;
        this.maxAttempts = 3;
        this.blockedIPs = new Set();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.init();
    }

    init() {
        this.checkAdminAccess();
        this.setupSecurityMonitoring();
        this.startSessionTimer();
        this.setupRouteProtection();
    }

    setupRouteProtection() {
        // Protect all pages from direct access
        this.protectPages();
        
        // Intercept navigation
        this.interceptNavigation();
    }

    protectPages() {
        const currentPage = window.location.pathname.split('/').pop();
        const currentUser = JSON.parse(localStorage.getItem('menang888_current_user'));
        
        const publicPages = ['index.html', 'info.html', ''];
        const protectedPages = ['games.html', 'slot.html', 'deposit.html', 'withdraw.html', 'promo.html', 'profile.html'];
        const adminPages = ['admin.html'];

        // Redirect if accessing protected page without auth
        if (protectedPages.includes(currentPage) && !currentUser) {
            this.redirectToLogin();
            return;
        }

        // Redirect if accessing admin page without admin privileges
        if (adminPages.includes(currentPage) && (!currentUser || !currentUser.isAdmin)) {
            this.redirectToMain();
            return;
        }

        // Redirect to main app if already logged in and accessing login page
        if (currentPage === 'index.html' && currentUser) {
            this.showMainApp();
        }
    }

    redirectToLogin() {
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }

    redirectToMain() {
        window.location.href = 'index.html';
    }

    showMainApp() {
        const mainApp = document.getElementById('main-app');
        const loginModal = document.getElementById('login-modal');
        
        if (mainApp) mainApp.style.display = 'block';
        if (loginModal) loginModal.style.display = 'none';
    }

    interceptNavigation() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && link.href) {
                const href = link.getAttribute('href');
                if (!this.canNavigateTo(href)) {
                    e.preventDefault();
                    this.showAccessDenied();
                }
            }
        });
    }

    canNavigateTo(href) {
        const targetPage = href.split('/').pop();
        const currentUser = JSON.parse(localStorage.getItem('menang888_current_user'));
        
        const publicPages = ['index.html', 'info.html', ''];
        const protectedPages = ['games.html', 'slot.html', 'deposit.html', 'withdraw.html', 'promo.html', 'profile.html'];
        const adminPages = ['admin.html'];

        if (publicPages.includes(targetPage)) return true;
        if (protectedPages.includes(targetPage)) return !!currentUser;
        if (adminPages.includes(targetPage)) return !!(currentUser && currentUser.isAdmin);
        
        return false;
    }

    showAccessDenied() {
        const currentUser = JSON.parse(localStorage.getItem('menang888_current_user'));
        
        if (!currentUser) {
            this.showNotification('Silakan login terlebih dahulu!', 'error');
        } else {
            this.showNotification('Akses ditolak! Anda tidak memiliki izin.', 'error');
        }
    }

    // ... (rest of security methods from previous implementation)

    generateSecurityKey() {
        return 'MENANG888_SECURE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    checkAdminAccess() {
        const savedKey = localStorage.getItem('admin_security_key');
        const securityOverlay = document.getElementById('security-overlay');
        
        if (!savedKey || savedKey !== this.securityKey) {
            if (securityOverlay) securityOverlay.style.display = 'flex';
            this.setupSecurityAuth();
        } else {
            if (securityOverlay) securityOverlay.style.display = 'none';
            this.logSecurityEvent('admin_login_success', 'Admin authenticated successfully');
        }
    }

    setupSecurityAuth() {
        const verifyBtn = document.getElementById('verify-admin');
        const securityInput = document.getElementById('admin-security-key');
        
        if (verifyBtn && securityInput) {
            verifyBtn.addEventListener('click', () => {
                this.verifyAdminAccess(securityInput.value);
            });

            securityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.verifyAdminAccess(securityInput.value);
                }
            });
        }
    }

    verifyAdminAccess(inputKey) {
        const validKeys = ['MENANG888_ADMIN_2024', 'SUPER_ADMIN_ACCESS', this.generateDynamicKey()];
        
        if (validKeys.includes(inputKey)) {
            localStorage.setItem('admin_security_key', this.securityKey);
            document.getElementById('security-overlay').style.display = 'none';
            this.logSecurityEvent('admin_access_granted', 'Security key validated');
        } else {
            this.failedAttempts++;
            this.logSecurityEvent('admin_access_denied', `Failed attempt ${this.failedAttempts}`);
            
            if (this.failedAttempts >= this.maxAttempts) {
                this.blockCurrentIP();
                this.logSecurityEvent('ip_blocked', 'Too many failed attempts');
                alert('ACCESS DENIED: IP has been blocked due to suspicious activity');
                window.location.href = 'index.html';
            } else {
                alert(`Invalid security key! ${this.maxAttempts - this.failedAttempts} attempts remaining.`);
            }
        }
    }

    generateDynamicKey() {
        const date = new Date();
        return `ADMIN_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}`;
    }

    blockCurrentIP() {
        const userIP = this.getUserIP();
        this.blockedIPs.add(userIP);
        localStorage.setItem('blocked_ips', JSON.stringify([...this.blockedIPs]));
    }

    getUserIP() {
        // In real implementation, this would come from your server
        return 'user_ip_placeholder';
    }

    setupSecurityMonitoring() {
        setInterval(() => {
            this.checkSuspiciousActivities();
        }, 5000);

        this.interceptAdminActions();
    }

    interceptAdminActions() {
        const originalLog = console.log;
        console.log = (...args) => {
            this.logSecurityEvent('console_access', args.join(' '));
            originalLog.apply(console, args);
        };

        this.detectDevTools();
    }

    detectDevTools() {
        let devToolsOpen = false;
        
        setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            
            if ((widthThreshold || heightThreshold) && !devToolsOpen) {
                devToolsOpen = true;
                this.logSecurityEvent('devtools_detected', 'Developer tools opened');
                this.showNotification('Peringatan Keamanan: Developer tools terdeteksi!', 'warning');
            }
        }, 1000);
    }

    startSessionTimer() {
        let timeout = this.sessionTimeout;
        let warningTime = 5 * 60 * 1000; // 5 minutes warning
        
        const timer = setTimeout(() => {
            this.logoutDueToInactivity();
        }, timeout);

        const warningTimer = setTimeout(() => {
            this.showSessionWarning();
        }, timeout - warningTime);

        // Reset timer on user activity
        document.addEventListener('mousemove', this.resetTimer.bind(this));
        document.addEventListener('keypress', this.resetTimer.bind(this));
    }

    resetTimer() {
        // Reset session timer on user activity
        localStorage.setItem('menang888_last_activity', Date.now().toString());
    }

    showSessionWarning() {
        if (this.isUserActive()) return;
        
        const warning = document.createElement('div');
        warning.className = 'session-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <i class="fas fa-clock"></i>
                <span>Sesi Anda akan berakhir dalam 5 menit</span>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        document.body.appendChild(warning);
    }

    isUserActive() {
        const lastActivity = localStorage.getItem('menang888_last_activity');
        if (!lastActivity) return false;
        
        const inactiveTime = Date.now() - parseInt(lastActivity);
        return inactiveTime < (this.sessionTimeout - (5 * 60 * 1000));
    }

    logoutDueToInactivity() {
        const currentUser = JSON.parse(localStorage.getItem('menang888_current_user'));
        if (currentUser && !this.isUserActive()) {
            this.showNotification('Session expired due to inactivity', 'warning');
            this.logoutUser();
        }
    }

    logoutUser() {
        localStorage.removeItem('menang888_current_user');
        localStorage.removeItem('menang888_last_activity');
        localStorage.removeItem('admin_security_key');
        window.location.href = 'index.html';
    }

    logSecurityEvent(type, message) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: type,
            message: message,
            userAgent: navigator.userAgent,
            ip: this.getUserIP()
        };

        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        logs.unshift(logEntry);
        
        if (logs.length > 1000) {
            logs.pop();
        }
        
        localStorage.setItem('security_logs', JSON.stringify(logs));
        this.updateSecurityDisplay(logEntry);
    }

    updateSecurityDisplay(logEntry) {
        const activityFeed = document.getElementById('activity-feed');
        if (activityFeed) {
            const activityItem = document.createElement('div');
            activityItem.className = `activity-item ${logEntry.type.includes('denied') ? 'danger' : 'info'}`;
            activityItem.innerHTML = `
                <i class="fas fa-${this.getEventIcon(logEntry.type)}"></i>
                <div class="activity-content">
                    <span class="activity-message">${logEntry.message}</span>
                    <span class="activity-time">${new Date(logEntry.timestamp).toLocaleTimeString()}</span>
                </div>
            `;
            activityFeed.insertBefore(activityItem, activityFeed.firstChild);
            
            if (activityFeed.children.length > 10) {
                activityFeed.removeChild(activityFeed.lastChild);
            }
        }
    }

    getEventIcon(eventType) {
        const icons = {
            'admin_login_success': 'user-shield',
            'admin_access_denied': 'exclamation-triangle',
            'ip_blocked': 'ban',
            'devtools_detected': 'tools',
            'admin_session_expired': 'sign-out-alt'
        };
        return icons[eventType] || 'info-circle';
    }

    checkSuspiciousActivities() {
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        const recentDenials = logs.filter(log => 
            log.type === 'admin_access_denied' && 
            new Date() - new Date(log.timestamp) < 5 * 60 * 1000
        ).length;

        if (recentDenials > 5) {
            this.logSecurityEvent('suspicious_activity', `Multiple access denials detected: ${recentDenials}`);
        }
    }

    showNotification(message, type = 'info') {
        // Use existing app notification system or create simple one
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'error' ? '#ef476f' : type === 'warning' ? '#ffd166' : '#06d6a0'};
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
    }
}

// Initialize security system
document.addEventListener('DOMContentLoaded', () => {
    window.securitySystem = new SecuritySystem();
});
