const chatform = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')
const socket  = io();

//getting username and room using qs cdn
const {username, room } = Qs.parse(location.search, {ignoreQueryPrefix:true})

//emiting username,room to server
socket.emit('joinroom', {username , room})

// output users and room
socket.on('roomUsers', ({room,users}) => {
    outputRoomName(room)
    outputUsers(users)
})

// message from server
socket.on('message', message => {
    console.log(message)
    outputmessage(message) 

  // adding auto scrollbar to chat messages
  chatMessages.scrollTop = chatMessages.scrollHeight  
})

//eventlistner for message submit 
 chatform.addEventListener('submit', (e) => {
    e.preventDefault(); // when form is submit it is to store in a file to prevent used this line

    // getting message text from chatform
    const msg = e.target.elements.msg.value;

    // emiting msg to server
    socket.emit('chatMessage',msg)

    //clearing input and adding focus
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus()

 })

// output message from server to Dom
function outputmessage (message) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div)
}   

// outputRoomName
function outputRoomName(room) {
    roomName.innerText = room;
}

// outputUsers
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}`  // join() - converts array into string
}