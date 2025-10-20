class AuthSystem {
    constructor(app) {
        this.app = app;
        this.setupAuthEvents();
        this.generateCaptcha();
    }

    setupAuthEvents() {
        document.getElementById('confirm-login').addEventListener('click', () => {
            this.handleLogin();
        });

        document.getElementById('confirm-register').addEventListener('click', () => {
            this.handleRegister();
        });

        document.getElementById('goto-register').addEventListener('click', () => {
            this.app.hideModal('login-modal');
            this.app.showModal('register-modal');
            this.generateCaptcha();
        });

        document.getElementById('goto-login').addEventListener('click', () => {
            this.app.hideModal('register-modal');
            this.app.showModal('login-modal');
        });

        document.getElementById('refresh-captcha').addEventListener('click', () => {
            this.generateCaptcha();
        });

        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        document.getElementById('reg-captcha').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleRegister();
        });
    }

    handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (!this.validateLoginInput(username, password)) return;

        this.app.showLoading('Memverifikasi login...');

        setTimeout(() => {
            const user = this.authenticateUser(username, password);
            
            if (user) {
                this.app.currentUser = user;
                localStorage.setItem('menang888_current_user', JSON.stringify(user));
                
                this.app.hideModal('login-modal');
                document.getElementById('main-app').style.display = 'block';
                this.app.updateUserDisplay();
                this.app.showNotification(`Selamat datang, ${user.username}!`, 'success');
                
                document.getElementById('login-username').value = '';
                document.getElementById('login-password').value = '';
            } else {
                this.app.showNotification('Username atau password salah!', 'error');
            }
            
            this.app.hideLoading();
        }, 1000);
    }

    handleRegister() {
        const formData = this.getRegisterFormData();
        
        if (!this.validateRegisterInput(formData)) return;

        this.app.showLoading('Membuat akun baru...');

        setTimeout(() => {
            if (this.createUser(formData)) {
                this.app.hideModal('register-modal');
                this.app.showModal('login-modal');
                this.app.showNotification('Pendaftaran berhasil! Silakan login.', 'success');
                this.clearRegisterForm();
            }
            
            this.app.hideLoading();
        }, 1500);
    }

    getRegisterFormData() {
        return {
            username: document.getElementById('reg-username').value.trim(),
            password: document.getElementById('reg-password').value,
            email: document.getElementById('reg-email').value.trim(),
            phone: document.getElementById('reg-phone').value.trim(),
            bankAccount: document.getElementById('reg-bank-account').value.trim(),
            bankName: document.getElementById('reg-bank-name').value.trim(),
            captcha: document.getElementById('reg-captcha').value.trim()
        };
    }

    validateLoginInput(username, password) {
        if (!username || !password) {
            this.app.showNotification('Username dan password harus diisi!', 'error');
            return false;
        }
        return true;
    }

    validateRegisterInput(data) {
        const required = ['username', 'password', 'email', 'phone', 'bankAccount', 'bankName', 'captcha'];
        for (const field of required) {
            if (!data[field]) {
                this.app.showNotification(`Field ${field} harus diisi!`, 'error');
                return false;
            }
        }

        if (data.username.length < 3) {
            this.app.showNotification('Username minimal 3 karakter!', 'error');
            return false;
        }

        if (data.password.length < 6) {
            this.app.showNotification('Password minimal 6 karakter!', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.app.showNotification('Format email tidak valid!', 'error');
            return false;
        }

        const captchaText = document.getElementById('captcha-text').textContent;
        if (data.captcha !== captchaText) {
            this.app.showNotification('Kode captcha tidak sesuai!', 'error');
            this.generateCaptcha();
            return false;
        }

        if (this.app.users.find(u => u.username === data.username)) {
            this.app.showNotification('Username sudah digunakan!', 'error');
            return false;
        }

        return true;
    }

    authenticateUser(username, password) {
        return this.app.users.find(user => 
            user.username === username && user.password === password
        );
    }

    createUser(data) {
        const newUser = {
            id: this.generateUserId(),
            username: data.username,
            password: data.password,
            email: data.email,
            phone: data.phone,
            bankAccount: data.bankAccount,
            bankName: data.bankName,
            balance: 10000,
            isAdmin: this.app.users.length === 0,
            createdAt: new Date().toISOString()
        };

        this.app.users.push(newUser);
        this.saveUsers();
        return true;
    }

    generateUserId() {
        return 'USER' + Math.floor(100000 + Math.random() * 900000);
    }

    generateCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        document.getElementById('captcha-text').textContent = captcha;
    }

    clearRegisterForm() {
        document.getElementById('reg-username').value = '';
        document.getElementById('reg-password').value = '';
        document.getElementById('reg-email').value = '';
        document.getElementById('reg-phone').value = '';
        document.getElementById('reg-bank-account').value = '';
        document.getElementById('reg-bank-name').value = '';
        document.getElementById('reg-captcha').value = '';
        this.generateCaptcha();
    }

    saveUsers() {
        localStorage.setItem('menang888_users', JSON.stringify(this.app.users));
    }
}
