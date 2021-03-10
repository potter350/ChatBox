const path = require('path')
const express = require('express')
const http = require('http')
const socket = require('socket.io')
const formatMessage = require('./utils/messages')
const {joinRoom,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users')

const app = express()
let server = http.createServer(app) // creating http server
let io = socket(server);
let chatbot = 'chatbox Bot  '

//set static folder to access / view from borwser (loads frontend)
app.use(express.static(path.join( __dirname  ,'public')  ))

// run when client connects
io.on('connection', function(socket) {
    //receiving username room
    socket.on('joinroom',({username,room}) => {
    
    let user = joinRoom( socket.id, username ,room )
    
    socket.join(user.room)

    // welcome when new user connected
    socket.emit('message', formatMessage(chatbot, "welcome to chatBox!!") );

    //broadcast when a user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(chatbot,`${user.username + ''} joined in chat room`))

    // emits  user and room info
    io.to(user.room).emit('roomUsers',{room : user.room, users : getRoomUsers(user.room)})


    })

    //listening to chatmessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        // output message to DOM
        io.to(user.room).emit('message', formatMessage(user.username,msg) )// io.emit() - emits for all users
        
    })

    //broadcasting to all users that user disconnected.
    socket.on('disconnect', () =>{
        let user = userLeave(socket.id)
        
        if (user) {
            io.to(user.room).emit('message', formatMessage(chatbot, `${user.username} left the chat room`) )

            // emits  user and room info
            io.to(user.room).emit('roomUsers',{room : user.room, users : getRoomUsers(user.room)})
        }
        
    })
 
    
    
})

let PORT = 3000 || process.env.PORT()

server.listen(PORT , () => { console.log(`server is running on port ${PORT}`)  } )