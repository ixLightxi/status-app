const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { sendVerificationEmail, sendPasswordResetEmail, verifyCode } = require('./email');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store data in memory
let teams = [];
let teamStatuses = {};
let people = [];
let users = new Map(); // Store user data
let pendingVerifications = new Map(); // Store pending registrations

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

// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log('Client connected');

    // Send current data to new clients
    socket.emit('init', { teams, teamStatuses, people });

    // Handle team creation
    socket.on('createTeam', (team) => {
        teams.push(team);
        io.emit('teamCreated', team);
    });

    // Handle team status updates
    socket.on('updateTeamStatus', (data) => {
        teamStatuses[data.teamId] = data.status;
        io.emit('teamStatusUpdated', data);
    });

    // Handle adding new person
    socket.on('addPerson', (person) => {
        people.push(person);
        io.emit('personAdded', person);
    });

    // Handle status updates
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
});
