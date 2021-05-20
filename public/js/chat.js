// ===== this is client side config =====

const socket = io()
//const Mustache = require('mustache')

//elements
const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $locationButton = document.querySelector('#send-location')

const $messages = document.querySelector('#messages')


//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML


// --- printing messages to all clients
socket.on('messageToAll', (message) => {
    console.log(message);

    const html = Mustache.render(messageTemplate, {
        message
    })
    if (message === 'A user has left!' || message === 'A new user has joined!') {
        $messages.insertAdjacentHTML('beforeend', `<i>${html}</i>`)
    }
    else {
        $messages.insertAdjacentHTML('beforeend', html)
    }
})


// --- printing location message
socket.on('locationMessage', (link) => {
    const html = Mustache.render(locationTemplate, {
        link
    })
    $messages.insertAdjacentHTML('beforeend', `<b>${html}</b>`)
})



// --- sending message to others
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disabling button
    $messageFormButton.setAttribute('disabled', 'disabled')

    const userMessage = $messageFormInput.value

    socket.emit('sendMessage', userMessage, (error) => {

        //enabling button again
        $messageFormButton.removeAttribute('disabled')

        //formating input box
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        //sending acknowledgement
        console.log('delivered! ')
    })
})


// --- sharing location
$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', location, () => {
            $locationButton.removeAttribute('disabled')
        })
    })
})
