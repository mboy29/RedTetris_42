// +------------------------------------------------+
// |               REDTETRIS SERVER JS              |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module is the entry point for the RedTetris
    server. It creates an Express server that listens on 
    the port specified in the configuration file.
*/

// +----------------- REQUIREMENTS -----------------+

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const config = require('./config');
const socketManager = require('./sockets');

const sessionMiddleware = require('./middlewares/session');
const sessionRouter = require('./routes/session');

require('./database/init').init();

// +------------------- GLOBALS --------------------+

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    transports: ['websocket'], // Ensure WebSocket transport is enabled
    cors: {
        origin: config.react_url,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// +------------------ MIDDLEWARE -------------------+


app.use(cors({
    origin: config.react_url,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware);

// +------------------- ROUTES ---------------------+

app.use('', sessionRouter);

// +----------------- WEB SOCKET HANDLING -----------+

socketManager(io, sessionMiddleware);

// +------------------- SERVER ---------------------+

server.listen(config.port, '0.0.0.0', () => {
    console.log(`Server is running on http://${config.hostname_local}:${config.port}`);
});
