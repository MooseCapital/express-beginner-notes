/*
    Rest api vs websocket - all request start as http, then get upgraded to websocket

        -> A websockets request will look the same as standard http request, but one difference: Upgrade: websocket header in the request.
        -> All that is needed is a component on your web server that looks for this Upgrade header on all incoming HTTP connections and,
            ->if found, it takes over the connection and turns it into a webSocket connection.

    services - ably is the cheapest we have found, with $15 per 1k users.
        to save money we have different strategies for saving connections when we're paying for a service, and don't want to handle our own ws service
            connection timeout - set max duration for idle connections, close it if it's idle too long.
            connection pooling - like the db, make limited connections to the server
            rate limiting - limit the number of connections per user, or per ip
            session management - see if users switched tabs, and if they did, close their connection


    handshake process vs validation -
        1) handshake is initiated by the client, it starts as soon as the client sends http upgrade request to the server
        2) validation - implemented on server side to check wether the client is allowed to establish websocket connection
            -> this happens in server.on('upgrade') event listener, if validation fails, we call socket.destroy() to close the connection
            -> now the websocket is prevented from being established
        3) even though validation fails, and the socket is destroyed, the handshake process already started
        4) since socket.destroy() prevents the connection from being upgraded if validation fails, we don't need ws.terminate()
            -> to validate again, but we can call ws.terminate() for other errors or if user is inactive to save resources.


    Websocket.CONNECTING - 0. Websocket.OPEN - 1, Websocket.CLOSING - 2, Websocket.CLOSED - 3
    client.readyState === WebSocket.OPEN  -> means we check the state of the users websocket, against these built in values
        wss.clients.forEach(client => {
                    console.log(`client.readyState: ${client.readyState}`)
                    console.log(`WebSocket.OPEN: ${WebSocket.OPEN}`)
                    if (client.readyState === WebSocket.OPEN) {
                        console.log(`Received: ${message}`);
                        client.send(`Received: ${message}`);
                    }
                });

      ws.on('message') -> this listens for messages event on a specific websocket instance, so for each user, so a function runs for only
        -> a message received from that user, not all users, but NOW that function is calling wss.clients.forEach to send that users message
        -> to all users, but we want to not use wss.clients, and only loop over our chatroom of users



    WSS.clients - contains references to all connected clients,
        -> the above has us looping over EVERY client and send one to all users, so if we want a chat with 2 specific users, we need
        -> to store those 2 clients in some array/map and only loop over them
        -> when we store a reference to this in our own array, we're not storing a copy, we're storing an UP TO DATE reference
        -> this means an accurate to the second status of the users readyState and if they're connected
        using: 'ws' inside wss.on('connection'),(ws,req) =>
            -> ws is the same as the client in the wss.clients.forEach(client => {}) loop, this means we store individual clients
            -> then search those clients specific room, and if it matches, we send messages to each other, not looping over ALL clients currently connected
            if the user immediately disconnects because of failing validation, wss.on('connection') still runs, so our IMPORTANT code
            -> should be in the ws.on('open') event, to ensure it is open and accepted
            -> since it never opens, just closes the failing handshake, our 'client disconnected' still logs and ws.on('close') runs
        * wss.clients.forEach loops through ALL connected clients, regardless of who sent the message which we want to avoid for speed.


    bind() -  lets us take properties from one object and bind it as the arguments to another objects function call
            -> also bind, can bind 'this' to a function call, so it's argument values are not lost in a callback
                const person = {firstName:"John",
                  display: function () {
                    let x = document.getElementById("demo");
                    x.innerHTML = this.firstName;
                  }
                }
                setTimeout(person.display, 3000); //undefined -> unless we bind with person.display.bind(person)
    1) we need to save certain things in the chatRooms array, for each user, such as the users readyState, send() method,
        -> this is because


    rate limiting - even if we socket.destroy() the connection, someone can spam fake request they know will fail
        -> this will slow the entire server, even though the connections are destroyed
    *** we see, it is impossible to rate limit at this level, a user can do the same with false rest api request
        so we SHOULD always have a reverse proxy server like nginx, that rate limit request BEFORE it reaches our server
        remember we will likely have a load balancer between our many server, so we combine it with the rate limiter here

    Authentication -
            In the server 'upgrade' event, we can see request.url, and get headers sent from the users event
            URL - we can validate the url is not taken, so the chatroom is open to join
            headers - we can validate the user exist or hasn't been created etc.. is authenticated
            -> the clients request with headers
                const ws = new WebSocket('ws://www.example.com', {
                    headers: {
                        Authorization: 'Bearer ' + YOUR_TOKEN_HERE
                    }
                });

            -> we access it like this:
                server.on('upgrade', function upgrade(request, socket, head) {
                    const headers = request.headers;
                    const authorization = headers['authorization'];

                    // Verify the token here
                    // If the token is invalid, you can destroy the socket to prevent the connection
                    if (!isValidToken(authorization)) {
                        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                        socket.destroy();
                        return;
                    }

                    // If the token is valid, you can proceed with the connection upgrade
                    wss.handleUpgrade(request, socket, head, function done(ws) {
                        wss.emit('connection', ws, request);
                    });
                });

            -> we want to check if the path url has been used before, and does our public key/id match those
            -> if it's a new room, we add our user to it.

        With an HTTP REST request, you have to first establish a TCP connection which is several back and
        forth between client and server. Then, you send HTTP request, receive the response and close the TCP connection.
            -> one off responses are better off with rest http request, responses are also cacheable, where websockets are not

        websockets make a single TCP connection, then once it's open, we send data back and forth, without opening/closing more conections

=

i thought it's listening on every connected client, but then we search with a header the user who made the request sent. now we have the chatroom of the user with the header, and send it only to the other user. like we could even use wss.client.forEach to match these up and don't send to every user with this, how is ws binded different

In this example, the 'message' event is bound to the WebSocket instance (`ws`) for the currently connecting client. Therefore, the callback function will only be executed when a message is received from this client.



 // Broadcast the message to all connected clients
              wss.clients.forEach(client => {
                 console.log(`client.readyState: ${client.readyState}`)
                 console.log(`WebSocket.OPEN: ${WebSocket.OPEN}`)
                 if (client.readyState === WebSocket.OPEN) {
                     console.log(`Received: ${message}`);
                     client.send(`Received: ${message}`);
                 }
             });

//instead of storing ws for each client and binding send from that, we can search each client
    and just send to clients that match the requested key, and send to users in the room with matching key
wss.clients.forEach(client => {
    //find which room contains the user with, request api-key
    const currentRoom = chatRooms.find(room => room.user1.userID === req.headers['x-api-key'] || room.user2.userID === req.headers['x-api-key']);
    //match the client api-key to the room, so we only send to the rooms users
    client.forEach(client => {
        if (client['api-key'] === currentRoom.user1.userID || client['api-key'] === currentRoom.user2.userID) {
            console.log(`Received: ${message}`);
            client.send(`Received: ${message}`);
        }
    }













 */



















