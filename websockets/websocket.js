// const {WebSocket, WebSocketServer} = require('ws');

function websocketServerConfig(io) {
    //when maxPayLoad is reached, the connection is closed, 1mb
    io.on('connection', (socket) => {
        console.log(`user id:${socket.id} connected`);
        console.log(socket.handshake.headers['public-key'])

        socket.on('message', (data) => {
            console.log(`id:${socket.id.substring(0, 5)} message: ${data}`)

            //same as ws.send()
            io.emit('message',`id:${socket.id.substring(0, 5)} message: ${data}`)
        })
        socket.on('disconnect', () => {
            console.log(`user id:${socket.id} disconnected`);
        });
        socket.on('activity', (data) => {
            console.log(`id:${data} is active`)

            //same as ws.send()
            io.emit('activity',`${data}`)
        })


    });

}

module.exports = {websocketServerConfig}

