class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupAuthForms();
        this.setupCaptcha();
    }

    setupAuthForms() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }

        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegister();
            });
        }
    }

    async handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        if (!username || !password) {
            window.app.showNotification('Harap isi semua field!', 'error');
            return;
        }

        const submitBtn = document.querySelector('#login-form .btn-auth');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        submitBtn.disabled = true;

        try {
            await window.app.login(username, password);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleRegister() {
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const captcha = document.getElementById('reg-captcha').value;
        const terms = document.getElementById('accept-terms').checked;

        if (!username || !password || !email || !phone || !captcha) {
            window.app.showNotification('Harap isi semua field!', 'error');
            return;
        }

        if (!terms) {
            window.app.showNotification('Anda harus menyetujui syarat & ketentuan!', 'error');
            return;
        }

        if (password.length < 6) {
            window.app.showNotification('Password minimal 6 karakter!', 'error');
            return;
        }

        const captchaText = document.getElementById('captcha-text').textContent;
        if (captcha !== captchaText) {
            window.app.showNotification('Kode CAPTCHA salah!', 'error');
            this.refreshCaptcha();
            return;
        }

        const submitBtn = document.querySelector('#register-form .btn-auth');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mendaftarkan...';
        submitBtn.disabled = true;

        try {
            const userData = {
                username,
                password,
                email,
                phone
            };

            await window.app.register(userData);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    setupCaptcha() {
        this.refreshCaptcha();
        
        const refreshBtn = document.getElementById('refresh-captcha');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshCaptcha();
            });
        }
    }

    refreshCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars[Math.floor(Math.random() * chars.length)];
        }
        
        const captchaEl = document.getElementById('captcha-text');
        if (captchaEl) {
            captchaEl.textContent = captcha;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.authSystem = new AuthSystem();
});
