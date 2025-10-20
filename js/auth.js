class AuthSystem {
    constructor(app) {
        this.app = app;
        this.setupAuthEvents();
        this.generateCaptcha();
    }

    setupAuthEvents() {
        console.log('Setting up auth events...');
        
        // Login button
        const loginBtn = document.getElementById('confirm-login');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                console.log('Login button clicked');
                this.handleLogin();
            });
        } else {
            console.error('Login button not found!');
        }

        // Register button
        const registerBtn = document.getElementById('confirm-register');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                console.log('Register button clicked');
                this.handleRegister();
            });
        }

        // Navigation between modals
        const gotoRegister = document.getElementById('goto-register');
        if (gotoRegister) {
            gotoRegister.addEventListener('click', () => {
                this.app.hideModal('login-modal');
                this.app.showModal('register-modal');
                this.generateCaptcha();
            });
        }

        const gotoLogin = document.getElementById('goto-login');
        if (gotoLogin) {
            gotoLogin.addEventListener('click', () => {
                this.app.hideModal('register-modal');
                this.app.showModal('login-modal');
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
    }

    handleLogin() {
        console.log('Handle login called');
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        console.log('Username:', username, 'Password:', password);

        if (!username || !password) {
            this.app.showNotification('Username dan password harus diisi!', 'error');
            return;
        }

        const user = this.authenticateUser(username, password);
        console.log('User found:', user);
        
        if (user) {
            this.app.currentUser = user;
            localStorage.setItem('menang888_current_user', JSON.stringify(user));
            
            this.app.hideModal('login-modal');
            document.getElementById('main-app').style.display = 'block';
            this.app.updateUserDisplay();
            this.app.showNotification(`Selamat datang, ${user.username}!`, 'success');
            
            // Clear form
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';
        } else {
            this.app.showNotification('Username atau password salah!', 'error');
        }
    }

    handleRegister() {
        console.log('Handle register called');
        
        const formData = this.getRegisterFormData();
        console.log('Form data:', formData);
        
        if (!this.validateRegisterInput(formData)) return;

        if (this.createUser(formData)) {
            this.app.hideModal('register-modal');
            this.app.showModal('login-modal');
            this.app.showNotification('Pendaftaran berhasil! Silakan login.', 'success');
            this.clearRegisterForm();
        }
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
        console.log('Validating register input:', data);
        
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

        // Check if username already exists
        const existingUser = this.app.users.find(u => u.username === data.username);
        if (existingUser) {
            this.app.showNotification('Username sudah digunakan!', 'error');
            return false;
        }

        return true;
    }

    authenticateUser(username, password) {
        console.log('Authenticating user:', username);
        console.log('All users:', this.app.users);
        
        const user = this.app.users.find(user => {
            console.log('Checking user:', user.username, 'match:', user.username === username && user.password === password);
            return user.username === username && user.password === password;
        });
        
        return user;
    }

    createUser(data) {
        console.log('Creating new user:', data);
        
        const newUser = {
            id: this.generateUserId(),
            username: data.username,
            password: data.password,
            email: data.email,
            phone: data.phone,
            bankAccount: data.bankAccount,
            bankName: data.bankName,
            balance: 10000,
            isAdmin: this.app.users.length === 0, // First user becomes admin
            createdAt: new Date().toISOString()
        };

        console.log('New user created:', newUser);
        
        this.app.users.push(newUser);
        this.saveUsers();
        
        console.log('Users after creation:', this.app.users);
        return true;
    }

    generateUserId() {
        return 'USER' + Date.now().toString().slice(-6);
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
        console.log('Users saved to localStorage');
    }
}
