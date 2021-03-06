const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const port = process.env.PORT || 8181;

app.use(cors());
app.use(bodyParser.json());

const room1 = [];
const room2 = [];

app.get('/', function (req, res) {
    res.send('Hello world!');
});

app.get('/ping', function (req, res) {
    res.send({'status': 'healthy', 'service': 'code-with-me'});
});

app.get('/execute/ping', function (req, res) {
    axios.get('http://127.0.0.1:8282/ping')
        .then(response => {
            res.send(response.data);
        }).catch(error => {
            res.send({'status': 'unavailable', 'service': 'code-with-me-executor'});
        });
});

app.post('/execute', function (req, res) {
    // Todo: This code goes into a socket channel (do not keep as endpoint).
    // res.send({'success': false, 'error_message': 'The monkey is currently sleeping... no code can be executed right now'.});
    // return

    if (req.body.code === undefined || req.body.code === '') {
        res.send({ 'success': false, 'error_message': 'No code was provided... our monkey has nothing to work with...' });
    }

    axios.post('http://127.0.0.1:8282/v1/execute', {
        code: req.body.code
    }).then(response => {
        res.send(response.data);
    }).catch(error => {
        res.send({ 'success': false, 'error_message': 'The monkey factory is currently on fire. No code is being executed properly.' });
    });
});

http.listen(port, () => {
    console.log('Listening on *:' + port);
});

const io = require('socket.io')(http);
io.on('connection', (socket) => {
    let roomId, userId;
    socket.emit('connected', {});

    socket.on('message', (message) => {
        console.log('User sent a message: ' + message);
        io.emit('message', message);
    });

    socket.on('room', (data) => {
        roomId = data.roomId;
        userId = data.userId;

        addToRoom(roomId, userId);
        const length = roomId === 1 ? room1.length : room2.length;

        // Emit to all users that a new user connected.
        io.emit('user_connected', { roomId: roomId, total_users: length });
    });

    socket.on('code_change', (data) => {
        // Send code changes to specific room only to other users.
        const editorId = data.editorId;
        socket.broadcast.emit('code_change', { code: data.code, editorId: editorId, roomId: roomId });
    });

    socket.on('execute_code', (data) => {
        // Execute code and send results to everyone.
        console.log('Calling to execute code...');
        const editorId = data.editorId;

        if (data.code === undefined || data.code === '') {
            io.emit('execute_code', { roomId: roomId, userId: userId, editorId: editorId, 'success': false, 'error_message': 'No code was provided... our monkey has nothing to work with...' });
        }
    
        // If this is on AWS, change host to: http://127.0.0.1:8282/v1/execute since flask server will be ran locally.
        EXECUTE_ENDPOINT = 'https://code-with-me-executor-phamdann.herokuapp.com/v1/execute'
        axios.post(EXECUTE_ENDPOINT, {
            code: data.code
        }).then(response => {
            io.emit('execute_code', { ...response.data, roomId: roomId, userId: userId, editorId: editorId });
        }).catch(error => {
            io.emit('execute_code', { roomId: roomId, userId: userId, editorId: editorId, 'success': false, 'error_message': 'The monkey factory is currently on fire. No code is being executed properly.' });
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected.')
        removeFromRoom(roomId, userId);

        const length = roomId === 1 ? room1.length : room2.length;
        io.emit('user_connected', { roomId: roomId, total_users: length });
    });
});

const addToRoom = (roomId, userId) => {
    switch(roomId) {
    case 1:
        room1.push(userId);
        break;
    case 2:
        room2.push(userId);
        break;
    default:
        break;
    }

    return;
}

const removeFromRoom = (roomId, userId) => {
    switch(roomId) {
    case 1:
        room1.pop();
        break;
    case 2:
        room2.pop();
        break;
    default:
        break;
    }
    
    return;
}
