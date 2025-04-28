document.addEventListener('DOMContentLoaded', function() {
    const openBtn = document.getElementById('open-btn');
    const closeBtn = document.getElementById('close-btn');
    const setStatusBtn = document.getElementById('set-status-btn');
    const confirmStatusBtn = document.getElementById('confirm-status-btn');
    const setColorBtn = document.getElementById('set-color-btn');
    const confirmColorBtn = document.getElementById('confirm-color-btn');
    const confirmBtn = document.getElementById('confirm-btn');
    const confirmRoomBtn = document.getElementById('confirm-room-btn');
    const roomSelect = document.getElementById('room-select');
    const statusText = document.getElementById('status-text');
    const colorPicker = document.getElementById('color');
    const statusElement = document.getElementById('status');

    let selectedRoom = 'room1';
    let pendingCommand = null;
    let pendingData = {};

    function updateStatus(status, color) {
        statusElement.textContent = `Status: ${status}`;
        if (color) {
            statusElement.style.color = color;
        }
    }

    function sendCommand(command, data = {}) {
        data.room = selectedRoom;
        fetch('/control', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command, ...data }),
        })
        .then(response => response.json())
        .then(data => {
            updateStatus(data.status);
            // Trigger status display update
            fetch('/status')
                .then(response => response.json())
                .then(data => {
                    // Broadcast status update to all clients
                    // This will be handled by the status display
                });
        })
        .catch(error => {
            console.error('Error:', error);
            updateStatus('Error');
        });
    }

    function confirmRoomSelection() {
        selectedRoom = roomSelect.value;
        updateStatus(`Room ${selectedRoom.slice(-1)} selected`);
    }

    function confirmCommand() {
        if (pendingCommand) {
            sendCommand(pendingCommand, pendingData);
            pendingCommand = null;
            pendingData = {};
        }
    }

    function confirmStatus() {
        const customStatus = statusText.value;
        if (customStatus) {
            pendingCommand = 'custom';
            pendingData = { status: customStatus };
            confirmCommand();
        }
    }

    function confirmColor() {
        const color = colorPicker.value;
        pendingCommand = 'color';
        pendingData = { color };
        confirmCommand();
    }

    // Room selection confirmation
    confirmRoomBtn.addEventListener('click', confirmRoomSelection);

    // Command confirmation
    confirmBtn.addEventListener('click', confirmCommand);

    // Status confirmation
    confirmStatusBtn.addEventListener('click', confirmStatus);

    // Color confirmation
    confirmColorBtn.addEventListener('click', confirmColor);

    openBtn.addEventListener('click', () => {
        pendingCommand = 'open';
        updateStatus('Open command pending confirmation');
    });

    closeBtn.addEventListener('click', () => {
        pendingCommand = 'close';
        updateStatus('Close command pending confirmation');
    });

    setStatusBtn.addEventListener('click', () => {
        const customStatus = statusText.value;
        if (customStatus) {
            pendingCommand = 'custom';
            pendingData = { status: customStatus };
            updateStatus('Custom status pending confirmation');
        }
    });

    setColorBtn.addEventListener('click', () => {
        const color = colorPicker.value;
        pendingCommand = 'color';
        pendingData = { color };
        updateStatus('Color change pending confirmation');
    });

    // Initial status check
    fetch('/status')
        .then(response => response.json())
        .then(data => {
            updateStatus(data.status);
        })
        .catch(error => {
            console.error('Error:', error);
            updateStatus('Unknown');
        });
});
