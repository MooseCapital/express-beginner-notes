const {WebSocket, WebSocketServer} = require('ws');

function websocketServerConfig(wss, req) {
    //when maxPayLoad is reached, the connection is closed, 1mb

    wss.on('connection', (ws, req) => {
        console.log('Client connected');
        // console.log(req.url)//'/test'

        ws.on('message', (message) => {
            // Broadcast the message to all connected clients
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
        });
    });


}

module.exports = {websocketServerConfig}

