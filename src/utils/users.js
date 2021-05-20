const users = []

const addUser = ({ id, username, room }) => {
    // sanitization of data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validation of data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // check for existing user and validating
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: 'Username with this name already exist in this room'
        }
    }

    // storing user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

// removing user
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}


const getUser = (id) => {
    return users.find((user) => user.id === id)
}


const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}