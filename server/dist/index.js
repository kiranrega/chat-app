"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let allSockets = [];
wss.on('connection', function (socket) {
    socket.on("error", console.error);
    socket.on("message", function (message) {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type == 'join') {
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId
            });
        }
        if (parsedMessage.type == 'chat') {
            const currentRoom = allSockets.find(x => x.socket == socket);
            allSockets.forEach((user) => {
                if (currentRoom.room == user.room) {
                    user.socket.send(parsedMessage.payload.message);
                }
            });
        }
    });
});
