require('dotenv').config();
const cors = require('cors');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
app.use(cors());
const server = http.createServer(app);
// TODO change the cors options
const io = socketio(server, {
    cors: {
        origin: '*',
    },
});

const formatMessage = require('./utils/messages.js');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getUsersInRoom,
} = require('./utils/users.js');

// when ever a client connects
io.on('connection', (socket) => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        // console.log(username);
        // console.log(room);
        // single client
        socket.emit(
            'message',
            formatMessage(
                'Server',
                `${user.username} connects to the room ${user.room}`
            )
        );

        // all client except sender
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(
                    'Server',
                    `${user.username} connects to the room ${user.room}`
                )
            );

        // users and room information
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getUsersInRoom(user.room),
        });
    });

    // listen for chatMessage
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id);

        // console.log(message);
        io.to(user.room).emit('message', formatMessage(user.username, message));
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(
                    'Server',
                    `${user.username} disconnects to the ${user.room}`
                )
            );

            // users and room information
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });
});

const PORT = process.env.CHAT_SERVER_PORT;

server.listen(PORT, () => {
    console.log(`Chat server running on ${PORT}`);
});
