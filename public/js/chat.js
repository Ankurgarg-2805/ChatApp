const socket = io();

var audio = new Audio('ghapshap.mp3');

const $messageForm = document.querySelector('#message-form');
const $messageInput = document.getElementById('messageInput');
const $messageButton = document.getElementById('sendMsg');
const $locationButton = document.getElementById('send-location');
const $messages = document.getElementById('messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild;

    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;

    const contianerHeight = $messages.scrollHeight;

    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(contianerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', (message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("HH:mm")
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format("HH:mm")
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('play', ()=> {
    audio.play();
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {room, users});
    document.querySelector('#sidebar').innerHTML = html;
})


$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    $messageButton.setAttribute('disabled', 'disabled');

    const message = $messageInput.value;
    socket.emit('sendMessage', message, ()=>{

        $messageButton.removeAttribute('disabled');
        $messageInput.value = '';
        $messageInput.focus();

        console.log('message was delivered')
    });
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation cannot be fetched.')
    }

    $locationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            longitude : position.coords.longitude,
            latitude : position.coords.latitude
        }, (res)=>{
            $locationButton.removeAttribute('disabled');
            console.log('Location', res);
        })
    })
})


socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error);
        location.href = '/'
    }
})