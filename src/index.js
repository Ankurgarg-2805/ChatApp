const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

let count = 0;

io.on('connection', (socket) => {
    console.log('New connection with WebSocket');

    socket.on('join', ({ username, room }, callback) => {

        const {error, user} = addUser({ id: socket.id, username, room });

        if(error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', `Welcome ${user.username}!`));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined the room!`));
        io.to(user.room).emit('play');

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })


    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id);

        io.to(user.room).emit('message', generateMessage(user.username, message));
        io.to(user.room).emit('play');
        callback();
    });


    socket.on('sendLocation', (coords, callback) => {

        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        io.to(user.room).emit('play');
        callback('delivered');
    })

    socket.on('bang', ()=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('play');
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the room!`));
            io.to(user.room).emit('play');
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})

server.listen(process.env.PORT, () => {
    console.log('Server is running at http://127.0.0.1:' + process.env.PORT);
})