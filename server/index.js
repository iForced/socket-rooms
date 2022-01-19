import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000'
    }
})
app.use(cors({
    origin: 'http://localhost:3000',
    credential: true,
}))
app.use(express.json())
const PORT = 5000

let users = []

const messages = {
    room1: [],
    room2: [],
    room3: [],
    room4: [],
}

io.on('connection', socket => {
    socket.on('join server', (username) => {
        const user = {
            id: socket.id,
            username,
        }
        users.push(user)
        io.emit('new user', users)
    })

    socket.on('join room', (roomName, cb) => {
        socket.join(roomName)
        cb(messages[roomName])
        socket.emit('joined', messages[roomName])
    })

    socket.on('send message', ({sender, receiver, chatName, text, isChannel}) => {
        if (isChannel) {
            const payload = {
                text,
                chatName,
                sender,
            }
            socket.to(receiver).emit('new message', payload)
        } else {
            const payload = {
                text,
                chatName: sender,
                sender,
            }
            socket.to(receiver).emit('new message', payload)
        }
        if (messages[chatName]) {
            messages[chatName].push({
                sender,
                text,
            })
        }
    })

    socket.on('disconnect', () => {
        users = users.filter(user => user.id !== socket.id)
        io.emit('new user', users)
    })
})


server.listen(PORT, () => {
    console.log(`Server starts on port ${PORT}`)
})