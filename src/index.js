// ===== this is server side config =====

const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser,
    removeUser,
    getUser,
    getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))


// --- connection on
io.on('connection', (socket) => {
    // --- joining room
    socket.on('join', (options, callback) => {

        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        // --- message to all clients when a user joins and welcome message to new client
        socket.emit('messageToAll', generateMessage(`Welcome ${user.username}`))
        socket.broadcast.to(user.room).emit('messageToAll', generateMessage(`${user.username} has joind the chat!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })


    // --- sending message to others
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Using of foul words are not allowed.')
        }

        io.to(user.room).emit('messageToAll', generateMessage(user.username, message))
        callback()
    })


    // --- sending message when a client disconnects
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('messageToAll', generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })


    // --- sending location to others
    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`))
        callback()
    })
})

server.listen(port, () => {
    console.log("Server is up and running on port " + port);
})