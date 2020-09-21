const express = require('express');
const ejs = require('ejs');
const path = require("path");
const Nexmo = require('nexmo');
const socketio = require('socket.io');
const cors = require("cors");

const app = express();
const nexmo = new Nexmo({
    apiKey: 'bc2f2f00',
    apiSecret: 'RNeL0AwNcRvjomhR',
});
// Template engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Public folder setup
app.use(express.static(path.join(__dirname, '/public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Index route
app.get('/', (req, res) => {
    res.render('index');
});

app.post("/", (req, res) => {
    const { number, text } = req.body;
    nexmo.message.sendSms('wesamhamed', number, text, { type: 'unicode' }, (err, response) => {
        if (err) {
            console.log(err);
        } else {
            const { messages } = response;
            const {
                ['message-id']: id, ['to']: number, ['error-text']: error
            } = messages[0];
            console.dir(response);
            // Get data from response
            const data = {
                id,
                number,
                error
            };

            // Emit to the client
            io.emit('smsStatus', data);
        }
    })
});
// Define port
const port = 3000;

// Start server
const server = app.listen(port, () => console.log(`Server started on port ${port}`));
// Connect to socket.io
const io = socketio(server);
io.on('connection', (socket) => {
    console.log('Connected');
    io.on('disconnect', () => {
        console.log('Disconnected');
    })
});