// Connect to Socket.IO server
const socket = io('http://localhost:3000');

// Elements
const nameInput = document.getElementById('nameInput');
const teamInput = document.getElementById('teamInput');
const teamColorInput = document.getElementById('teamColorInput');
const teamSelect = document.getElementById('teamSelect');
const teamFilter = document.getElementById('teamFilter');
const teamStatusSelect = document.getElementById('teamStatusSelect');
const teamStatusInput = document.getElementById('teamStatusInput');
const teamStatusColor = document.getElementById('teamStatusColor');
const updateTeamStatusBtn = document.getElementById('updateTeamStatus');
const teamList = document.getElementById('teamList');
const teamStatusList = document.getElementById('teamStatusList');
const addDeviceBtn = document.getElementById('addDevice');
const addTeamBtn = document.getElementById('addTeam');
const deviceControls = document.getElementById('deviceControls');
const feedback = document.getElementById('updateFeedback');
const modal = document.getElementById('teamStatusModal');
const closeModal = document.querySelector('.close-modal');

// Data storage
let devices = {};
let teams = [];
let teamStatuses = {};

// Socket.IO event handlers
socket.on('init', (data) => {
    teams = data.teams;
    teamStatuses = data.teamStatuses;
    devices = data.people.reduce((acc, person) => {
        acc[person.id] = person;
        return acc;
    }, {});
    updateTeamSelects();
    updateTeamList();
    updateTeamStatusList();
    updateDeviceControls();
});

socket.on('teamCreated', (team) => {
    teams.push(team);
    updateTeamSelects();
    updateTeamList();
});

socket.on('teamStatusUpdated', (data) => {
    teamStatuses[data.teamId] = data.status;
    updateTeamStatusList();
});

socket.on('personAdded', (person) => {
    devices[person.id] = person;
    updateDeviceControls();
    updateTeamList();
});

socket.on('statusUpdated', (data) => {
    if (devices[data.personId]) {
        devices[data.personId].status = data.status;
        updateDeviceControls();
    }
});

// Add new team
addTeamBtn.addEventListener('click', function() {
    const teamName = teamInput.value.trim();
    if (teamName) {
        if (!teams.includes(teamName)) {
            const teamColor = teamColorInput.value || '#1a73e8';
            socket.emit('createTeam', teamName);
            teamInput.value = '';
            showFeedback('Team created successfully!', 'success');
        } else {
            showFeedback('Team already exists!', 'error');
        }
    } else {
        showFeedback('Please enter a team name', 'error');
    }
});

// Update team status
updateTeamStatusBtn.addEventListener('click', function() {
    const team = teamStatusSelect.value;
    const status = teamStatusInput.value.trim();
    const color = teamStatusColor.value;

    if (team && status) {
        socket.emit('updateTeamStatus', {
            teamId: team,
            status: {
                status: status,
                color: color,
                lastUpdated: new Date().toLocaleString()
            }
        });
        teamStatusInput.value = '';
        showFeedback('Team status updated successfully!', 'success');
    } else {
        showFeedback('Please select a team and enter a status', 'error');
    }
});

// Create team status card
function createTeamStatusCard(teamName, statusData) {
    const card = document.createElement('div');
    card.className = 'team-status-card';
    card.innerHTML = `
        <div class="team-status-header">
            <h3>${teamName}</h3>
        </div>
        <div class="team-status-content">
            <div class="status-display" style="background-color: ${statusData.color}">
                ${statusData.status}
            </div>
            <div class="last-updated">
                Last updated: ${statusData.lastUpdated}
            </div>
        </div>
    `;
    return card;
}

// Show full screen status
window.showFullScreenStatus = function(teamName) {
    const statusData = teamStatuses[teamName];
    const fullScreenStatus = document.getElementById('fullScreenStatus');
    fullScreenStatus.innerHTML = `
        <h1>${teamName}</h1>
        <div class="full-screen-status-content" style="background-color: ${statusData.color}">
            <div class="status-text">${statusData.status}</div>
            <div class="status-timestamp">Last updated: ${statusData.lastUpdated}</div>
        </div>
    `;
    modal.style.display = 'block';
};

// Close modal
closeModal.onclick = function() {
    modal.style.display = 'none';
};

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Update team status list
function updateTeamStatusList() {
    teamStatusList.innerHTML = '';
    teams.forEach(team => {
        const statusData = teamStatuses[team] || {
            status: 'No status set',
            color: '#808080',
            lastUpdated: '-'
        };
        teamStatusList.appendChild(createTeamStatusCard(team, statusData));
    });
}

// Create team list item
function createTeamItem(teamName) {
    const teamCount = Object.values(devices).filter(d => d.team === teamName).length;
    const teamStatus = teamStatuses[teamName] || { color: '#1a73e8' };
    const div = document.createElement('div');
    div.className = 'team-entry';
    div.style.setProperty('--team-color', teamStatus.color);
    div.innerHTML = `
        ${teamName} <span class="team-count">${teamCount} members</span>
        <button class="delete" onclick="deleteTeam('${teamName}')">Delete</button>
    `;
    return div;
}

// Update team selects
function updateTeamSelects() {
    const options = teams.map(team => 
        `<option value="${team}">${team}</option>`
    ).join('');
    
    teamSelect.innerHTML = '<option value="">Select Team</option>' + options;
    teamFilter.innerHTML = '<option value="">All Teams</option>' + options;
    teamStatusSelect.innerHTML = '<option value="">Select Team</option>' + options;
}

// Update team list
function updateTeamList() {
    teamList.innerHTML = '';
    teams.forEach(team => {
        teamList.appendChild(createTeamItem(team));
    });
}

// Add new person
addDeviceBtn.addEventListener('click', function() {
    const name = nameInput.value.trim();
    const team = teamSelect.value;
    if (name && team) {
        const person = {
            id: 'device_' + Date.now(),
            name: name,
            team: team,
            status: 'Available',
            color: '#1a73e8',
            lastUpdated: new Date().toLocaleString()
        };
        socket.emit('addPerson', person);
        nameInput.value = '';
        showFeedback('Person added successfully!', 'success');
    } else {
        showFeedback('Please enter a name and select a team', 'error');
    }
});

// Create device control card
function createDeviceCard(id, data) {
    const card = document.createElement('div');
    card.className = 'device-card';
    card.innerHTML = `
        <div class="device-header">
            <h3>${data.name}</h3>
            <button class="delete" onclick="deleteDevice('${id}')">Delete</button>
        </div>
        <div class="device-status">
            <input type="text" 
                   class="status-input" 
                   placeholder="Enter status" 
                   value="${data.status}"
                   onchange="updateStatus('${id}', this.value)">
            <input type="color" 
                   class="color-picker" 
                   value="${data.color}"
                   onchange="updateColor('${id}', this.value)">
        </div>
        <div class="status-display" style="background-color: ${data.color}">
            ${data.status}
        </div>
    `;
    return card;
}

// Update device controls display
function updateDeviceControls() {
    deviceControls.innerHTML = '';
    const selectedTeam = teamFilter.value;
    
    const filteredDevices = Object.entries(devices).filter(([_, data]) => 
        !selectedTeam || data.team === selectedTeam
    );
    
    if (filteredDevices.length === 0) {
        deviceControls.innerHTML = '<p>No people added yet.</p>';
        return;
    }

    // Group devices by team
    const devicesByTeam = {};
    filteredDevices.forEach(([id, data]) => {
        if (!devicesByTeam[data.team]) {
            devicesByTeam[data.team] = [];
        }
        devicesByTeam[data.team].push([id, data]);
    });

    // Create sections for each team
    Object.entries(devicesByTeam).forEach(([team, teamDevices]) => {
        const teamSection = document.createElement('div');
        teamSection.className = 'team-section';
        teamSection.innerHTML = `<h2 class="team-header">${team}</h2>`;
        
        const deviceGrid = document.createElement('div');
        deviceGrid.className = 'device-grid';
        
        teamDevices.forEach(([id, data]) => {
            deviceGrid.appendChild(createDeviceCard(id, data));
        });
        
        teamSection.appendChild(deviceGrid);
        deviceControls.appendChild(teamSection);
    });
}

// Delete team
window.deleteTeam = function(teamName) {
    if (confirm(`Are you sure you want to delete team "${teamName}" and remove all its members?`)) {
        socket.emit('deleteTeam', teamName);
        showFeedback('Team deleted successfully!', 'success');
    }
};

// Update device status
window.updateStatus = function(id, status) {
    socket.emit('updateStatus', {
        personId: id,
        status: {
            status: status,
            lastUpdated: new Date().toLocaleString()
        }
    });
    showFeedback('Status updated successfully!', 'success');
};

// Update status color
window.updateColor = function(id, color) {
    socket.emit('updateStatus', {
        personId: id,
        status: {
            color: color,
            lastUpdated: new Date().toLocaleString()
        }
    });
    showFeedback('Color updated successfully!', 'success');
};

// Delete device
window.deleteDevice = function(id) {
    if (confirm('Are you sure you want to remove this person?')) {
        socket.emit('deletePerson', id);
        showFeedback('Person removed successfully!', 'success');
    }
};

// Show feedback message
function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = 'feedback ' + type;
    setTimeout(() => {
        feedback.className = 'feedback';
    }, 3000);
}

// Filter by team
teamFilter.addEventListener('change', updateDeviceControls);
