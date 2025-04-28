// Elements
const teamFilter = document.getElementById('teamFilter');
const myTeamView = document.getElementById('myTeamView');
const allTeamsView = document.getElementById('allTeamsView');
const myTeamSection = document.getElementById('myTeamSection');
const otherTeamsSection = document.getElementById('otherTeamsSection');

// Get selected team from localStorage or set default
let selectedTeam = localStorage.getItem('selectedTeam') || '';
let viewMode = localStorage.getItem('viewMode') || 'myTeam';

// Initialize filters
function initializeFilters() {
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
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
    const teamStatuses = JSON.parse(localStorage.getItem('teamStatuses') || '{}');
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
    const teamStatuses = JSON.parse(localStorage.getItem('teamStatuses') || '{}');
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
        const teamStatuses = JSON.parse(localStorage.getItem('teamStatuses') || '{}');
        const statusData = teamStatuses[teamName];
        const fullScreenStatus = modal.querySelector('.full-screen-status');
        fullScreenStatus.style.backgroundColor = statusData.color;
        fullScreenStatus.querySelector('.status-text').textContent = statusData.status;
        fullScreenStatus.querySelector('.status-timestamp').textContent = `Updated: ${statusData.lastUpdated}`;
    }
}

// Function to update the status display
function updateStatusDisplay() {
    const devices = JSON.parse(localStorage.getItem('devices') || '{}');
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    
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

    // Update any open full-screen views
    teams.forEach(team => updateFullScreenStatus(team));
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

// Initialize and update display
initializeFilters();
updateStatusDisplay();

// Listen for storage and custom events
['storage', 'devicesUpdated', 'teamStatusesUpdated'].forEach(event => {
    window.addEventListener(event, () => {
        initializeFilters();
        updateStatusDisplay();
    });
});
