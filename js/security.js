class SecuritySystem {
    constructor() {
        this.securityLogs = JSON.parse(localStorage.getItem('menang888_security_logs')) || [];
        this.init();
    }

    init() {
        this.setupActivityMonitoring();
        this.setupAutoLogout();
    }

    setupActivityMonitoring() {
        document.addEventListener('click', () => this.updateLastActivity());
        document.addEventListener('keypress', () => this.updateLastActivity());
        document.addEventListener('mousemove', () => this.updateLastActivity());
    }

    setupAutoLogout() {
        setInterval(() => {
            this.checkInactivity();
        }, 60000);
    }

    updateLastActivity() {
        localStorage.setItem('menang888_last_activity', Date.now().toString());
    }

    checkInactivity() {
        const lastActivity = localStorage.getItem('menang888_last_activity');
        if (!lastActivity) return;

        const inactiveTime = Date.now() - parseInt(lastActivity);
        const maxInactiveTime = 30 * 60 * 1000;

        if (inactiveTime > maxInactiveTime && window.app && window.app.currentUser) {
            this.logSecurityEvent('auto_logout', 'User automatically logged out due to inactivity');
            window.app.logout();
        }
    }

    logSecurityEvent(type, message) {
        const logEntry = {
            id: this.generateLogId(),
            type,
            message,
            timestamp: new Date().toISOString(),
            user: window.app?.currentUser?.username || 'unknown',
            ip: this.getClientIP(),
            userAgent: navigator.userAgent
        };

        this.securityLogs.unshift(logEntry);
        
        if (this.securityLogs.length > 1000) {
            this.securityLogs = this.securityLogs.slice(0, 1000);
        }

        localStorage.setItem('menang888_security_logs', JSON.stringify(this.securityLogs));
        
        console.log(`🔒 SECURITY: ${type} - ${message}`);
    }

    generateLogId() {
        return 'LOG_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getClientIP() {
        return 'unknown';
    }

    getSecurityLogs(limit = 50) {
        return this.securityLogs.slice(0, limit);
    }

    clearOldLogs() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        this.securityLogs = this.securityLogs.filter(log => 
            new Date(log.timestamp) > oneWeekAgo
        );
        
        localStorage.setItem('menang888_security_logs', JSON.stringify(this.securityLogs));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.securitySystem = new SecuritySystem();
});
