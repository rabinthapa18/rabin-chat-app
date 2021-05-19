const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

let count = 0

io.on('connection', (socket) => {
    console.log('New web-socket connection');

    socket.emit('messageToClient', 'Welcome user')
    socket.broadcast.emit('messageToClient', 'A new user has joined!')

    socket.on('sendMessage', (message) => {
        io.emit('messageToAll', message)
    })

    socket.on('disconnect', () => {
        io.emit('messageToClient', 'A user has left!')
    })

    socket.on('sendLocation', (location) => {
        io.emit('messageToAll', `https://www.google.com/maps/@${location.latitude},${location.longitude}`)
    })
})

server.listen(port, () => {
    console.log("Server is up and running on port " + port);
})