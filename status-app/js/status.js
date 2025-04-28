import config from './config.js';

const { SOCKET_URL } = config;

// Connect to Socket.IO server
const socket = io(SOCKET_URL, {
    withCredentials: true
});

// Elements
const teamFilter = document.getElementById('teamFilter');
const myTeamView = document.getElementById('myTeamView');
const allTeamsView = document.getElementById('allTeamsView');
const myTeamSection = document.getElementById('myTeamSection');
const otherTeamsSection = document.getElementById('otherTeamsSection');

// State management
let selectedTeam = localStorage.getItem('selectedTeam') || '';
let viewMode = localStorage.getItem('viewMode') || 'myTeam';
let teams = [];
let teamStatuses = {};
let devices = {};

// Socket.IO event handlers
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.textContent = 'Connection error. Please check your internet connection.';
    document.querySelector('.container').prepend(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
});

socket.on('init', (data) => {
    teams = data.teams;
    teamStatuses = data.teamStatuses;
    devices = data.people.reduce((acc, person) => {
        acc[person.id] = person;
        return acc;
    }, {});
    initializeFilters();
    updateStatusDisplay();
});

socket.on('teamCreated', (team) => {
    teams.push(team);
    initializeFilters();
    updateStatusDisplay();
});

socket.on('teamStatusUpdated', (data) => {
    teamStatuses[data.teamId] = data.status;
    updateStatusDisplay();
    updateFullScreenStatus(data.teamId);
});

socket.on('personAdded', (person) => {
    devices[person.id] = person;
    updateStatusDisplay();
});

socket.on('statusUpdated', (data) => {
    if (devices[data.personId]) {
        Object.assign(devices[data.personId], data.status);
        updateStatusDisplay();
    }
});

// Initialize filters
function initializeFilters() {
    teamFilter.innerHTML = '<option value="">All Teams</option>' +
        teams.map(team => `<option value="${team}">${team}</option>`).join('');
    teamFilter.value = selectedTeam;

    if (viewMode === 'myTeam') {
        myTeamView.classList.add('active');
        allTeamsView.classList.remove('active');
    } else {
        allTeamsView.classList.add('active');
        myTeamView.classList.remove('active');
    }
}

// Function to create a team status banner
function createTeamStatusBanner(teamName, statusData) {
    return `
        <div class="team-status-banner" style="background-color: ${statusData.color}">
            <div class="team-status-info">
                <h2>${teamName}</h2>
                <div class="team-status-text">${statusData.status}</div>
                <div class="team-status-time">Updated: ${statusData.lastUpdated}</div>
            </div>
            <button class="expand-status" onclick="showFullScreenStatus('${teamName}')">
                Full Screen
            </button>
        </div>
    `;
}

// Function to create a status card
function createStatusCard(id, data) {
    return `
        <div class="status-card">
            <h3>${data.name}</h3>
            <div class="status-content">
                <div class="status-badge" style="background-color: ${data.color}">
                    ${data.status}
                </div>
                <div class="last-updated">
                    Updated: ${data.lastUpdated || '-'}
                </div>
            </div>
        </div>
    `;
}

// Function to create a team section
function createTeamSection(teamName, devices) {
    const teamStatus = teamStatuses[teamName] || {
        status: 'No status set',
        color: '#808080',
        lastUpdated: '-'
    };

    return `
        <div class="team-section" data-team="${teamName}">
            ${createTeamStatusBanner(teamName, teamStatus)}
            <div class="team-status-grid">
                ${devices.map(([id, data]) => createStatusCard(id, data)).join('')}
            </div>
        </div>
    `;
}

// Show full screen status
window.showFullScreenStatus = function(teamName) {
    const statusData = teamStatuses[teamName];
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = `modal-${teamName}`;
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeFullScreenStatus(this)">&times;</span>
            <div class="full-screen-status" style="background-color: ${statusData.color}">
                <h1>${teamName}</h1>
                <div class="status-text">${statusData.status}</div>
                <div class="status-timestamp">Updated: ${statusData.lastUpdated}</div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
};

// Close full screen status
window.closeFullScreenStatus = function(element) {
    const modal = element.closest('.modal');
    modal.remove();
};

// Update full screen status if open
function updateFullScreenStatus(teamName) {
    const modal = document.getElementById(`modal-${teamName}`);
    if (modal) {
        const statusData = teamStatuses[teamName];
        const fullScreenStatus = modal.querySelector('.full-screen-status');
        fullScreenStatus.style.backgroundColor = statusData.color;
        fullScreenStatus.querySelector('.status-text').textContent = statusData.status;
        fullScreenStatus.querySelector('.status-timestamp').textContent = `Updated: ${statusData.lastUpdated}`;
    }
}

// Function to update the status display
function updateStatusDisplay() {
    myTeamSection.innerHTML = '';
    otherTeamsSection.innerHTML = '';
    
    if (Object.keys(devices).length === 0) {
        myTeamSection.innerHTML = '<p class="no-devices">No people added yet.</p>';
        return;
    }

    // Group devices by team
    const devicesByTeam = {};
    Object.entries(devices).forEach(([id, data]) => {
        if (!devicesByTeam[data.team]) {
            devicesByTeam[data.team] = [];
        }
        devicesByTeam[data.team].push([id, data]);
    });

    // Sort devices by last updated time
    Object.values(devicesByTeam).forEach(teamDevices => {
        teamDevices.sort((a, b) => new Date(b[1].lastUpdated) - new Date(a[1].lastUpdated));
    });

    // Display teams
    teams.forEach(team => {
        if (devicesByTeam[team] && devicesByTeam[team].length > 0) {
            const teamSection = createTeamSection(team, devicesByTeam[team]);
            
            if (viewMode === 'myTeam') {
                if (team === selectedTeam) {
                    myTeamSection.innerHTML += teamSection;
                } else {
                    otherTeamsSection.innerHTML += teamSection;
                }
            } else {
                myTeamSection.innerHTML += teamSection;
            }
        }
    });
}

// Event Listeners
teamFilter.addEventListener('change', (e) => {
    selectedTeam = e.target.value;
    localStorage.setItem('selectedTeam', selectedTeam);
    updateStatusDisplay();
});

myTeamView.addEventListener('click', () => {
    viewMode = 'myTeam';
    localStorage.setItem('viewMode', viewMode);
    myTeamView.classList.add('active');
    allTeamsView.classList.remove('active');
    updateStatusDisplay();
});

allTeamsView.addEventListener('click', () => {
    viewMode = 'allTeams';
    localStorage.setItem('viewMode', viewMode);
    allTeamsView.classList.add('active');
    myTeamView.classList.remove('active');
    updateStatusDisplay();
});

export { updateStatusDisplay };
