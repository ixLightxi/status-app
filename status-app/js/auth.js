const API_URL = 'http://localhost:3000/api';

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('authenticated') === 'true';
}

// Handle registration form submission
async function handleRegister(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Show verification code input
            document.getElementById('registrationForm').style.display = 'none';
            document.getElementById('verificationForm').style.display = 'block';
            messageDiv.textContent = 'Please check your email for verification code';
            messageDiv.className = 'success-message';
            
            // For testing: Show email preview link
            if (data.previewUrl) {
                const previewLink = document.createElement('a');
                previewLink.href = data.previewUrl;
                previewLink.target = '_blank';
                previewLink.textContent = 'View Test Email';
                messageDiv.appendChild(document.createElement('br'));
                messageDiv.appendChild(previewLink);
            }
        } else {
            messageDiv.textContent = data.error;
            messageDiv.className = 'error-message';
        }
    } catch (error) {
        messageDiv.textContent = 'Registration failed. Please try again.';
        messageDiv.className = 'error-message';
    }
}

// Handle verification code submission
async function handleVerification(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const code = document.getElementById('verificationCode').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`${API_URL}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code }),
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.textContent = 'Email verified successfully! You can now login.';
            messageDiv.className = 'success-message';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            messageDiv.textContent = data.error;
            messageDiv.className = 'error-message';
        }
    } catch (error) {
        messageDiv.textContent = 'Verification failed. Please try again.';
        messageDiv.className = 'error-message';
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authenticated', 'true');
            localStorage.setItem('username', data.username);
            window.location.href = 'index.html';
        } else {
            messageDiv.textContent = data.error;
            messageDiv.className = 'error-message';
        }
    } catch (error) {
        messageDiv.textContent = 'Login failed. Please try again.';
        messageDiv.className = 'error-message';
    }
}

// Handle forgot password form submission
async function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('forgotPasswordForm').style.display = 'none';
            document.getElementById('resetPasswordForm').style.display = 'block';
            messageDiv.textContent = 'Please check your email for the reset code';
            messageDiv.className = 'success-message';
            
            // For testing: Show email preview link
            if (data.previewUrl) {
                const previewLink = document.createElement('a');
                previewLink.href = data.previewUrl;
                previewLink.target = '_blank';
                previewLink.textContent = 'View Test Email';
                messageDiv.appendChild(document.createElement('br'));
                messageDiv.appendChild(previewLink);
            }
        } else {
            messageDiv.textContent = data.error;
            messageDiv.className = 'error-message';
        }
    } catch (error) {
        messageDiv.textContent = 'Request failed. Please try again.';
        messageDiv.className = 'error-message';
    }
}

// Handle password reset form submission
async function handleResetPassword(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const code = document.getElementById('resetCode').value;
    const newPassword = document.getElementById('newPassword').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code, newPassword }),
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.textContent = 'Password reset successfully! You can now login.';
            messageDiv.className = 'success-message';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            messageDiv.textContent = data.error;
            messageDiv.className = 'error-message';
        }
    } catch (error) {
        messageDiv.textContent = 'Reset failed. Please try again.';
        messageDiv.className = 'error-message';
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('authenticated');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// Add event listeners if elements exist
document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const verificationForm = document.getElementById('verificationForm');
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegister);
    }
    if (verificationForm) {
        verificationForm.addEventListener('submit', handleVerification);
    }
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPassword);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});
