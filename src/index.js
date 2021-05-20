// ===== this is server side config =====

const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))


// --- connection on
io.on('connection', (socket) => {
    console.log('New web-socket connection');

    // --- joining room
    socket.on('join', ({ username, room }) => {
        socket.join(room)

        // --- message to all clients when a user joins and welcome message to new client
        socket.emit('messageToAll', generateMessage(`Welcome ${username}`))
        socket.broadcast.to(room).emit('messageToAll', generateMessage(`${username} has joind the chat!`))
    })


    // --- sending message to others
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Using of foul words are not allowed.')
        }

        io.emit('messageToAll', generateMessage(message))
        callback()
    })


    // --- sending message when a client disconnects
    socket.on('disconnect', ({ username }) => {
        io.emit('messageToAll', generateMessage(`${username} has left!`))
    })


    // --- sending location to others
    socket.on('sendLocation', (location, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://www.google.com/maps/@${location.latitude},${location.longitude}`))
        callback()
    })
})

server.listen(port, () => {
    console.log("Server is up and running on port " + port);
})