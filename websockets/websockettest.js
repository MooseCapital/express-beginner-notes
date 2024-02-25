/*

//consider setting uuid locally or using users public key as their id, then we compare it to ones
//in connection array, so the users sent key, doesn't get their message back
//when users disconnect or leave, but want the same room id to remember, they need the same keys
//so if we generate new keys for the users each time, they could be blocked from their own room!
//the room that would say 2 users are already in it which is the max,

const WebSocket = require('ws');
const wss = new WebSocket.WebSocketServer({ noServer: true });

let connections = {};

wss.on('connection', (ws, req) => {
  const uuid = req.url.substring(1); // Remove the leading '/'

  if (!connections[uuid]) {
    connections[uuid] = [];
  }

  if (connections[uuid].length >= 2) {
    ws.close();
    return;
  }

  connections[uuid].push(ws);

  ws.on('message', (message) => {
    console.log(`Message received on ${uuid}: ${message}`);
    ws.send(`Message received: ${message}`);
  });

  ws.on('close', () => {
    connections[uuid] = connections[uuid].filter(client => client !== ws);
    if (connections[uuid].length === 0) {
      delete connections[uuid];
    }
    connectionCounts[uuid]--
  });
});

//send the message to the other user only, so we dont get back our own sent message
ws.on('message', (message) => {
  console.log(`Message received on ${uuid}: ${message}`);

  // Send the message to all other clients connected under the same uuid
  //we dont want to compare the entire ws object to both, so we try to find a unique property to a user in ws

  connections[uuid].forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(`Message received: ${message}`);
    }
  });
});


server.listen(port);*/


// solution sets property in the users own ws object


// const { v4: uuidv4 } = require('uuid');

/* wss.on('connection', (ws, req) => {
  const roomUuid = req.url.substring(1); // Remove the leading '/'

  if (!connections[roomUuid]) {
    connections[roomUuid] = [];
  }

  if (connections[roomUuid].length >= 2) {
    ws.close();
    return;
  }

  // Assign a unique ID to the user and store it as a property of the WebSocket object
  ws.id = uuidv4();

  connections[roomUuid].push(ws);

  ws.on('message', (message) => {
    console.log(`Message received on ${roomUuid}: ${message}`);

    // Send the message to all other clients connected under the same roomUuid
    connections[roomUuid].forEach(client => {
      if (client.id !== ws.id && client.readyState === WebSocket.OPEN) {
        client.send(`Message received: ${message}`);
      }
    });
  });

  ws.on('close', () => {
    connections[roomUuid] = connections[roomUuid].filter(client => client !== ws);
    if (connections[roomUuid].length === 0) {
      delete connections[roomUuid];
    }
  });
}); */



