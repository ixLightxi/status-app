const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors');
app.use(cors());
app.use(express.json());

const io = new Server(server, {
    cors: {
      origin: "*", // Autorise toutes les origines
      methods: ["GET", "POST"]
    }
  });


  
//gere cors server io


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('a user disconnected');
    })
    socket.on('msg', (msg) => {
        console.log('msg');
        try {
            console.log(msg);
            let room = msg.room;
            let message = msg.message;
            io.to(room).emit('msg', message);
        } catch (error) {
            console.log(error);
        }
    })
    socket.on('join', (room) => {
        console.log('join');
        try {
            socket.join(room);
        } catch (error) {
            console.log(error);
        }
    })
    
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});