const {WebSocket, WebSocketServer} = require('ws');

function websocketServerConfig(wss, chatRooms) {
    //when maxPayLoad is reached, the connection is closed, 1mb

    wss.on('connection', (ws, req) => {

        //if room doesn't exist, create it, if it's empty or has 1 person, add them to it
        ws.on('open', () => {
            // console.log(req)
            console.log('Client connected');
        });
        ws.on('message', (message) => {
             wss.clients.forEach(client => {
                 console.log(`client.readyState: ${client.readyState}`)
                 console.log(`WebSocket.OPEN: ${WebSocket.OPEN}`)
                 if (client.readyState === WebSocket.OPEN) {
                     console.log(`Received: ${message}`);
                     client.send(`Received: ${message}`);
                 }
             });
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            //the user can leave the room and come back, but we need separate code if they decide to
            //destroy the specific chatroom
        });
    });


}

module.exports = {websocketServerConfig}

