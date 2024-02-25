const {WebSocket, WebSocketServer} = require('ws');

function websocketServerConfig(server, req) {
    const wss = new WebSocketServer({server});

    wss.on('connection', (ws, req) => {
        console.log('Client connected');
        console.log(req.url)//'/test'
        // console.log(`ws:`, ws)

        ws.on('message', (message) => {
            // Broadcast the message to all connected clients
            wss.clients.forEach(client => {
                console.log(client.readyState)
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

