// ===== this is server side config =====

const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))


// --- connection on
io.on('connection', (socket) => {
    console.log('New web-socket connection');


    // --- message to all clients when a user joins and welcome message to new client
    socket.emit('messageToAll', 'Welcome user')
    socket.broadcast.emit('messageToAll', 'A new user has joined!')


    // --- sending message to others
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Using of foul words are not allowed.')
        }

        io.emit('messageToAll', message)
        callback()
    })


    // --- sending message when a client disconnects
    socket.on('disconnect', () => {
        io.emit('messageToAll', 'A user has left!')
    })


    // --- sending location to others
    socket.on('sendLocation', (location, callback) => {
        io.emit('locationMessage', `https://www.google.com/maps/@${location.latitude},${location.longitude}`)
        callback()
    })
})

server.listen(port, () => {
    console.log("Server is up and running on port " + port);
})