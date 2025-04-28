from flask import Flask, jsonify, request, render_template
from pyngrok import ngrok
import threading
from flask_socketio import SocketIO

app = Flask(__name__, static_folder='static', template_folder='templates')
socketio = SocketIO(app, async_mode='eventlet')

# Simulated GPIO setup
room_status = {
    'room1': {'status': 'closed', 'color': '#000000'},
    'room2': {'status': 'closed', 'color': '#000000'},
    'room3': {'status': 'closed', 'color': '#000000'}
}

@app.route('/')
def index():
    return render_template('control.html')

@app.route('/status', methods=['GET'])
def status():
    return jsonify(room_status)

@socketio.on('control')
def control(data):
    print("Received control event")
    print(data)
    command = data.get('command')
    room = data.get('room', 'room1')

    if command == 'open':
        room_status[room]['status'] = 'open'
    elif command == 'close':
        room_status[room]['status'] = 'closed'

    # Emit the updated status back to the client
    socketio.emit('status_update', { 'room': room, 'status': room_status[room]['status'] })

if __name__ == '__main__':
    # Start ngrok tunnel
    public_url = ngrok.connect(5000).public_url
    print(f' * Public URL: {public_url}')
    
    # Start Flask app with SocketIO
    socketio.run(app, host='0.0.0.0', port=5000)
