document.addEventListener('DOMContentLoaded', function() {
    const roomSelect = document.getElementById('room-select');
    const roomStatusElements = {
        'room1': document.getElementById('room1-status'),
        'room2': document.getElementById('room2-status'),
        'room3': document.getElementById('room3-status')
    };

    // Initialize SocketIO connection
    const socket = io();

    // Hide all room statuses initially
    for (const roomId in roomStatusElements) {
        roomStatusElements[roomId].style.display = 'none';
    }

    function updateRoomDisplay(selectedRoom) {
        // Hide all rooms
        for (const roomId in roomStatusElements) {
            roomStatusElements[roomId].style.display = 'none';
        }
        // Show selected room
        roomStatusElements[selectedRoom].style.display = 'block';
    }

    function updateRoomStatus(roomId, status, color) {
        const statusElement = roomStatusElements[roomId].querySelector('.status-text');
        statusElement.textContent = status;
        if (color) {
            statusElement.style.color = color;
        }
    }

    // Listen for status updates from the server
    socket.on('status_update', (data) => {
        const roomId = Object.keys(data)[0];
        updateRoomStatus(roomId, data[roomId].status, data[roomId].color);
    });

    // Event listener for room selection change
    roomSelect.addEventListener('change', (event) => {
        updateRoomDisplay(event.target.value);
    });

    // Initial setup
    updateRoomDisplay(roomSelect.value);
    
    // Initial status check
    fetch('/status')
        .then(response => response.json())
        .then(data => {
            for (const roomId in data) {
                if (data.hasOwnProperty(roomId)) {
                    updateRoomStatus(roomId, data[roomId].status, data[roomId].color);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            for (const roomId in roomStatusElements) {
                updateRoomStatus(roomId, 'Unknown');
            }
        });
});
