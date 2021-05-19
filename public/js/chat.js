const socket = io()

socket.on('messageToClient', (message) => {
    console.log(message);
})

document.querySelector('#messageForm').addEventListener('submit', (e) => {
    e.preventDefault()
    const userMessage = e.target.elements.message.value
    socket.emit('sendMessage', userMessage)
})

socket.on('messageToAll', (message) => {
    console.log(message);
})

document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', location)
    })
})
