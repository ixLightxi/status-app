// Default admin credentials
const DEFAULT_ADMIN = {
    username: 'admin',
    password: '1234'
};

// Initialize local storage with default admin if not exists
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([DEFAULT_ADMIN]));
}

// Authentication functions
function login(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', username);
        return true;
    }
    return false;
}

function register(username, password, email) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
        return { success: false, error: 'Username already exists' };
    }
    
    // Check if email ends with @devinci.fr
    if (!email.endsWith('@devinci.fr')) {
        return { success: false, error: 'Email must be a @devinci.fr address' };
    }
    
    users.push({ username, password, email });
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true };
}

function resetPassword(email, newPassword) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
        return false;
    }
    
    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    return true;
}

function isAuthenticated() {
    return localStorage.getItem('currentUser') !== null;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../login.html';
}

// Protect routes
function checkAuth() {
    if (!isAuthenticated()) {
        window.location.href = '../login.html';
    }
}

// Add logout event listener to logout buttons
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
