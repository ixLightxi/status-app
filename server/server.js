const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { sendVerificationEmail, sendPasswordResetEmail, verifyCode } = require('./email');

const app = express();

// Configure CORS for both REST API and Socket.IO
const corsOptions = {
    // Replace with your frontend domain in production
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: corsOptions
});

// Store data in memory
let teams = [];
let teamStatuses = {};
let people = [];
let users = new Map();
let pendingVerifications = new Map();

// Auth endpoints
app.post('/api/register', async (req, res) => {
    const { email, password, username } = req.body;
    
    if (users.has(email)) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    try {
        const previewUrl = await sendVerificationEmail(email);
        pendingVerifications.set(email, { password, username });
        res.json({ 
            message: 'Verification email sent',
            previewUrl // For testing purposes
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send verification email' });
    }
});

app.post('/api/verify', (req, res) => {
    const { email, code } = req.body;
    
    if (verifyCode(email, code)) {
        const userData = pendingVerifications.get(email);
        if (userData) {
            users.set(email, userData);
            pendingVerifications.delete(email);
            res.json({ message: 'Email verified successfully' });
        } else {
            res.status(400).json({ error: 'Invalid verification attempt' });
        }
    } else {
        res.status(400).json({ error: 'Invalid verification code' });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    if (!users.has(email)) {
        return res.status(400).json({ error: 'Email not registered' });
    }

    try {
        const previewUrl = await sendPasswordResetEmail(email);
        res.json({ 
            message: 'Password reset email sent',
            previewUrl // For testing purposes
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send reset email' });
    }
});

app.post('/api/reset-password', (req, res) => {
    const { email, code, newPassword } = req.body;
    
    if (verifyCode(email, code, 'reset')) {
        const userData = users.get(email);
        if (userData) {
            userData.password = newPassword;
            users.set(email, userData);
            res.json({ message: 'Password reset successfully' });
        } else {
            res.status(400).json({ error: 'User not found' });
        }
    } else {
        res.status(400).json({ error: 'Invalid reset code' });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const userData = users.get(email);
    
    if (userData && userData.password === password) {
        res.json({ 
            message: 'Login successful',
            username: userData.username
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log('Client connected');

    socket.emit('init', { teams, teamStatuses, people });

    socket.on('createTeam', (team) => {
        teams.push(team);
        io.emit('teamCreated', team);
    });

    socket.on('updateTeamStatus', (data) => {
        teamStatuses[data.teamId] = data.status;
        io.emit('teamStatusUpdated', data);
    });

    socket.on('addPerson', (person) => {
        people.push(person);
        io.emit('personAdded', person);
    });

    socket.on('updateStatus', (data) => {
        const personIndex = people.findIndex(p => p.id === data.personId);
        if (personIndex !== -1) {
            people[personIndex].status = data.status;
            io.emit('statusUpdated', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
