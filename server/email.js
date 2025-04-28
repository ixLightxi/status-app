const nodemailer = require('nodemailer');

// Create a test account for development
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'ethereal.user@ethereal.email', // We'll get these credentials dynamically
        pass: 'ethereal.pass'
    }
});

// Store verification codes
const verificationCodes = new Map();
const passwordResetCodes = new Map();

// Generate a random 6-digit code
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
async function sendVerificationEmail(email) {
    const code = generateCode();
    verificationCodes.set(email, code);

    // Create test account
    const testAccount = await nodemailer.createTestAccount();

    // Update transporter with test credentials
    transporter.auth = {
        user: testAccount.user,
        pass: testAccount.pass
    };

    const info = await transporter.sendMail({
        from: '"Status App" <noreply@statusapp.com>',
        to: email,
        subject: "Email Verification",
        html: `
            <h1>Welcome to Status App!</h1>
            <p>Your verification code is: <strong>${code}</strong></p>
            <p>Please enter this code in the app to verify your email address.</p>
        `
    });

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info);
}

// Send password reset email
async function sendPasswordResetEmail(email) {
    const code = generateCode();
    passwordResetCodes.set(email, code);

    // Create test account
    const testAccount = await nodemailer.createTestAccount();

    // Update transporter with test credentials
    transporter.auth = {
        user: testAccount.user,
        pass: testAccount.pass
    };

    const info = await transporter.sendMail({
        from: '"Status App" <noreply@statusapp.com>',
        to: email,
        subject: "Password Reset Request",
        html: `
            <h1>Password Reset</h1>
            <p>Your password reset code is: <strong>${code}</strong></p>
            <p>Please enter this code in the app to reset your password.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
        `
    });

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info);
}

// Verify code
function verifyCode(email, code, type = 'verification') {
    const codes = type === 'verification' ? verificationCodes : passwordResetCodes;
    const storedCode = codes.get(email);
    
    if (storedCode && storedCode === code) {
        codes.delete(email); // Remove used code
        return true;
    }
    return false;
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    verifyCode
};
