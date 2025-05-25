import { WebSocketServer, WebSocket } from 'ws'

interface User {
    socket: WebSocket,
    room : string
}
const wss =  new WebSocketServer({ port: 8080 })

let allSockets: User[] = []
wss.on('connection', function(socket) {
    socket.on("error", console.error)

    socket.on("message", function(message) {

    const parsedMessage = JSON.parse(message as any)

    if (parsedMessage.type == 'join') {
        allSockets.push({
            socket,
            room: parsedMessage.payload.roomId
        })
    }

    if (parsedMessage.type == 'chat') {
        const currentRoom: any= allSockets.find(x => x.socket == socket)

        allSockets.forEach((user) => {
            if (currentRoom.room == user.room) {
                user.socket.send(parsedMessage.payload.message)
            }
        })
    }
    })
})