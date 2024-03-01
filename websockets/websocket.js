// const {WebSocket, WebSocketServer} = require('ws');

function websocketServerConfig(io) {
    //when maxPayLoad is reached, the connection is closed, 1mb
    io.on('connection', (socket) => {
        console.log(`user id:${socket.id} connected`);
        console.log(socket.handshake.headers['public-key'])

        // io.emit('message', `${socket.id.substring(0, 5)} connected`);
        socket.broadcast.emit('message', `${socket.id.substring(0, 5)} connected`)
        socket.emit('message', `you have connected`);

        socket.on('message', (data) => {
            console.log(`id:${socket.id.substring(0, 5)} message: ${data}`)

            //same as ws.send()
            io.emit('message',`id:${socket.id.substring(0, 5)} message: ${data}`)
        })
        socket.on('disconnect', () => {
            console.log(`user id:${socket.id} disconnected`);
            socket.broadcast.emit('message', `${socket.id.substring(0, 5)} disconnected`)
        });
        socket.on('activity', (data) => {
            console.log(`id:${data} is active`)
            //in production, socket.broadcast() because we don't need to know we're typing/active
            io.emit('activity',data)
        })
        socket.on('clearActivity', (data) => {
            console.log(`id:${data} cleared activity`)

            //same as ws.send()
            io.emit('clearActivity',data)
        })


    });

}

module.exports = {websocketServerConfig}

