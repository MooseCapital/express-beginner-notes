/*
    Rest api vs websocket - all request start as http, then get upgraded to websocket
        -> HTTP request -> bounce 4 times back n forth, TCP connection is established -> the client gets  response and connection is closed
            -> one off responses are better off with rest http request, responses are also cacheable, where websockets are not


      websockets make a single TCP connection, then once it's open, we send data back and forth, without opening/closing more conections
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

                });

            -> we want to check if the path url has been used before, and does our public key/id match those
            -> if it's a new room, we add our user to it.

      cluster pm2 - since we mostly use pm2 to run our rest api, this is great to use all threads and cpu resources, instead of only one
            -> since nodejs is single threaded. but now our app is running 4 different times on 4 threads, so a websocket
            -> could have a user connected to one ws process, and another user in another, where we want them in the same room to chat to each-other
            -> this is called websocket 'stickiness' we need a horizontal scaling solution, so users in different threads can communicate
            -> socket.io will do this and let us use something like redis to store the communication across all rooms, and direct them where we need


        Audio/Video - when data is not sent as text or strings, like our messages chat app, it's sent as files that are binary data
            -> it would be inefficient to convert these files to text, so we need binary, then we convert that binary to a file
            we need Buffer to do this, for example, sending an image, we might do this
                const fs = require('fs');
                const path = require('path');

                ws.on('message', (message) => {
                    if (Buffer.isBuffer(message)) {
                        const b = Buffer.from(message)
                        console.log(b.toString())
                    } else {
                        console.log(`Received: ${message}`);
                        ws.send(`Received: ${message}`);
                    }
                });





ws save:
wss.on('connection', (ws, req) => {

        ws.on('open', () => {
            // console.log(req)
            console.log('Client connected');
        });
        ws.on('message', (message) => {
             wss.clients.forEach(client => {
                if (client.readyState === ws.OPEN) {
                    console.log(`Received: ${message}`);
                    client.send(`Received: ${message}`);
                }
            });
            console.log(`Received: ${message}`);
            ws.send(`Received: ${message}`);
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            //the user can leave the room and come back, but we need separate code if they decide to
            //destroy the specific chatroom
        });
    });






 */



















