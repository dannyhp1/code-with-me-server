const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');

const port = process.env.PORT || 8080;

app.use(cors());

app.get('/', function (req, res) {
   res.send('Hello world!');
});

app.get('/ping', function (req, res) {
   res.send('pong');
});

http.listen(port, () => {
    console.log('Listening on *:' + port);
});

const io = require('socket.io')(http);
io.on('connection', (socket) => {
    console.log('User connected.');

    socket.on('message', (message) => {
        console.log('User sent a message: ' + message);
        
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected.')
    });
});
