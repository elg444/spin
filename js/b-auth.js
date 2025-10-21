class AuthSystem {
    constructor(app) {
        this.app = app;
        this.captcha = '';
        this.init();
    }

    init() {
        this.setupAuthEvents();
        this.generateCaptcha();
        this.setupFormValidation();
    }

    setupAuthEvents() {
        console.log('🔐 Setting up authentication system...');

        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Captcha refresh
        const refreshCaptcha = document.getElementById('refresh-captcha');
        if (refreshCaptcha) {
            refreshCaptcha.addEventListener('click', () => {
                this.generateCaptcha();
            });
        }

        // Enter key support
        document.getElementById('login-password')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        document.getElementById('reg-captcha')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleRegister();
        });
    }

    setupFormValidation() {
        // Real-time username validation
        const usernameInput = document.getElementById('reg-username');
        if (usernameInput) {
            usernameInput.addEventListener('input', (e) => {
                this.validateUsername(e.target.value);
            });
        }

        // Password strength indicator
        const passwordInput = document.getElementById('reg-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.showPasswordStrength(e.target.value);
            });
        }
    }

    validateUsername(username) {
        if (username.length < 3) {
            this.showInputError('reg-username', 'Username minimal 3 karakter');
            return false;
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            this.showInputError('reg-username', 'Hanya boleh huruf, angka, dan underscore');
            return false;
        }

        const existingUser = this.app.users.find(u => u.username === username);
        if (existingUser) {
            this.showInputError('reg-username', 'Username sudah digunakan');
            return false;
        }

        this.clearInputError('reg-username');
        return true;
    }

    showPasswordStrength(password) {
        const strength = this.calculatePasswordStrength(password);
        const strengthBar = document.getElementById('password-strength') || this.createPasswordStrengthBar();
        
        strengthBar.innerHTML = `
            <div class="strength-indicator">
                <div class="strength-bar">
                    <div class="strength-fill" style="width: ${strength.percentage}%; background: ${strength.color}"></div>
                </div>
                <span class="strength-text" style="color: ${strength.color}">${strength.text}</span>
            </div>
        `;
    }

    createPasswordStrengthBar() {
        const passwordGroup = document.querySelector('#reg-password').closest('.form-group');
        const strengthBar = document.createElement('div');
        strengthBar.id = 'password-strength';
        strengthBar.className = 'password-strength';
        passwordGroup.appendChild(strengthBar);
        return strengthBar;
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 6) score += 25;
        if (password.length >= 8) score += 25;
        if (/[A-Z]/.test(password)) score += 25;
        if (/[0-9]/.test(password)) score += 25;
        if (/[^A-Za-z0-9]/.test(password)) score += 25;

        score = Math.min(score, 100);

        if (score < 40) return { percentage: score, color: '#ef476f', text: 'Lemah' };
        if (score < 70) return { percentage: score, color: '#ffd166', text: 'Sedang' };
        return { percentage: score, color: '#06d6a0', text: 'Kuat' };
    }

    handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        console.log('🔐 Login attempt:', username);

        if (!this.validateLoginInput(username, password)) {
            return;
        }

        this.showLoading('Memverifikasi...');

        // Simulate API call delay
        setTimeout(() => {
            const user = this.authenticateUser(username, password);
            
            if (user) {
                this.loginSuccess(user, rememberMe);
            } else {
                this.loginFailed();
            }
            
            this.hideLoading();
        }, 1000);
    }

    validateLoginInput(username, password) {
        if (!username || !password) {
            this.app.showNotification('Username dan password harus diisi!', 'error');
            return false;
        }

        if (username.length < 3) {
            this.app.showNotification('Username minimal 3 karakter!', 'error');
            return false;
        }

        return true;
    }

    authenticateUser(username, password) {
        return this.app.users.find(user => 
            user.username === username && 
            user.password === password &&
            !user.isSuspended
        );
    }

    loginSuccess(user, rememberMe) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        this.app.saveUsers();

        // Set current user
        this.app.currentUser = user;
        localStorage.setItem('menang888_current_user', JSON.stringify(user));
        localStorage.setItem('menang888_last_activity', Date.now().toString());

        if (rememberMe) {
            localStorage.setItem('menang888_remember_me', 'true');
        }

        // Log security event
        this.app.logSecurityEvent('user_login_success', `User ${user.username} logged in`);

        // Update UI
        this.app.hideModal('login-modal');
        this.app.showMainApp();
        this.app.updateUserDisplay();
        
        // Show welcome notification
        this.app.showNotification(`Selamat datang kembali, ${user.username}! 🎮`, 'success');

        // Clear form
        document.getElementById('login-form').reset();
    }

    loginFailed() {
        this.app.logSecurityEvent('user_login_failed', 'Invalid login attempt');
        this.app.showNotification('Username atau password salah!', 'error');
        
        // Shake animation for error
        const loginForm = document.getElementById('login-form');
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 500);
    }

    handleRegister() {
        const formData = this.getRegisterFormData();
        
        console.log('📝 Registration attempt:', formData.username);

        if (!this.validateRegisterInput(formData)) {
            return;
        }

        this.showLoading('Membuat akun...');

        // Simulate API call delay
        setTimeout(() => {
            if (this.createUser(formData)) {
                this.registrationSuccess(formData);
            }
            this.hideLoading();
        }, 1500);
    }

    getRegisterFormData() {
        return {
            username: document.getElementById('reg-username').value.trim(),
            password: document.getElementById('reg-password').value,
            email: document.getElementById('reg-email').value.trim(),
            phone: document.getElementById('reg-phone').value.trim(),
            bank: document.getElementById('reg-bank').value,
            account: document.getElementById('reg-account').value.trim(),
            captcha: document.getElementById('reg-captcha').value.trim(),
            acceptTerms: document.getElementById('accept-terms').checked
        };
    }

    validateRegisterInput(data) {
        // Required fields check
        const required = ['username', 'password', 'email', 'phone', 'bank', 'account', 'captcha'];
        for (const field of required) {
            if (!data[field]) {
                this.app.showNotification(`Field ${field.replace('reg-', '')} harus diisi!`, 'error');
                return false;
            }
        }

        // Username validation
        if (!this.validateUsername(data.username)) {
            return false;
        }

        // Password strength
        if (data.password.length < 6) {
            this.app.showNotification('Password minimal 6 karakter!', 'error');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.app.showNotification('Format email tidak valid!', 'error');
            return false;
        }

        // Phone validation
        const phoneRegex = /^[0-9]{10,13}$/;
        if (!phoneRegex.test(data.phone)) {
            this.app.showNotification('Format nomor HP tidak valid!', 'error');
            return false;
        }

        // Captcha validation
        if (data.captcha !== this.captcha) {
            this.app.showNotification('Kode captcha tidak sesuai!', 'error');
            this.generateCaptcha();
            return false;
        }

        // Terms acceptance
        if (!data.acceptTerms) {
            this.app.showNotification('Anda harus menyetujui syarat dan ketentuan!', 'error');
            return false;
        }

        return true;
    }

    createUser(data) {
        const newUser = {
            id: this.app.generateId('USER'),
            username: data.username,
            password: data.password,
            email: data.email,
            phone: data.phone,
            bankAccount: data.account,
            bankName: data.bank,
            balance: 10000, // Starting bonus
            isAdmin: false,
            isVerified: false,
            isSuspended: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        this.app.users.push(newUser);
        this.app.saveUsers();
        
        console.log('✅ New user created:', newUser.username);
        return true;
    }

    registrationSuccess(formData) {
        this.app.logSecurityEvent('user_registration', `New user registered: ${formData.username}`);
        
        this.app.hideModal('register-modal');
        this.app.showModal('login-modal');
        
        this.app.showNotification(
            'Pendaftaran berhasil! Silakan login dengan akun Anda.', 
            'success', 
            6000
        );

        // Pre-fill login form
        document.getElementById('login-username').value = formData.username;
        document.getElementById('login-password').value = '';

        this.clearRegisterForm();
        this.generateCaptcha();
    }

    generateCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.captcha = captcha;
        
        const captchaEl = document.getElementById('captcha-text');
        if (captchaEl) {
            captchaEl.textContent = captcha;
        }
    }

    clearRegisterForm() {
        const form = document.getElementById('register-form');
        if (form) {
            form.reset();
        }
        this.clearInputErrors();
    }

    clearInputErrors() {
        document.querySelectorAll('.input-error').forEach(error => error.remove());
        document.querySelectorAll('.input-group').forEach(group => {
            group.classList.remove('error');
        });
    }

    showInputError(inputId, message) {
        this.clearInputError(inputId);
        
        const input = document.getElementById(inputId);
        const inputGroup = input.closest('.input-group');
        
        inputGroup.classList.add('error');
        
        const errorEl = document.createElement('div');
        errorEl.className = 'input-error';
        errorEl.textContent = message;
        errorEl.style.cssText = `
            color: var(--danger);
            font-size: 0.8rem;
            margin-top: 5px;
        `;
        
        inputGroup.appendChild(errorEl);
    }

    clearInputError(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            const inputGroup = input.closest('.input-group');
            inputGroup.classList.remove('error');
            
            const existingError = inputGroup.querySelector('.input-error');
            if (existingError) {
                existingError.remove();
            }
        }
    }

    showLoading(message = 'Loading...') {
        // Create or show loading overlay
        let loadingEl = document.getElementById('auth-loading');
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'auth-loading';
            loadingEl.className = 'auth-loading';
            loadingEl.innerHTML = `
                <div class="loading-spinner"></div>
                <p>${message}</p>
            `;
            document.body.appendChild(loadingEl);

            // Add styles
            const styles = document.createElement('style');
            styles.textContent = `
                .auth-loading {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 15, 35, 0.9);
                    backdrop-filter: blur(10px);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    color: white;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top: 3px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 15px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(styles);
        }
        loadingEl.style.display = 'flex';
    }

    hideLoading() {
        const loadingEl = document.getElementById('auth-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }
}

// Initialize auth system after app is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.app) {
        setTimeout(() => {
            window.authSystem = new AuthSystem(window.app);
        }, 100);
    }
});
