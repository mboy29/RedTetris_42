// +------------------------------------------------+
// |               REDTETRIS SERVER JS              |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module is the entry point for the RedTetris
    server. It creates an Express server that listens 
    on the port specified in the configuration file.
*/

// +----------------- REQUIREMENTS -----------------+

const express = require('express');
const http = require('http');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const sharedsession = require('express-socket.io-session');

const config = require('./config');
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const gameRoutes = require('./routes/gameRoutes');
const playerRoutes = require('./routes/playerRoutes');
const { setupSocket } = require('./services/socketService');

require('./database/initDatabase').init();

// +------------------- GLOBALS --------------------+

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: config.react_url,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }
});

// +------------------ CORS CONFIGURATION -------------------+

app.use(cors({
    origin: [config.react_url], 
    credentials: true 
}));

// +------------------ MIDDLEWARE -------------------+

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const sessionMiddleware = session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
});
app.use(sessionMiddleware);
io.use(sharedsession(sessionMiddleware, {
    autoSave: true
}));

setupSocket(io);

// +------------------- ROUTES ---------------------+

app.use('/auth', authRoutes);
app.use('/session', sessionRoutes);
app.use('/game', gameRoutes);
app.use('/player', playerRoutes);

// +------------------- SERVER ---------------------+

const startServer = () => {
    return new Promise((resolve) => {
        server.listen(config.port, '0.0.0.0', () => {
            console.log(`Server is running on http://${config.hostname_local}:${config.port}`);
            resolve();
        });
    });
};

const closeServer = () => {
    return new Promise((resolve) => {
        server.close(() => {
            console.log('Server closed');
            resolve();
        });
    });
};

if (require.main === module) {
    startServer();
}

// +------------------- EXPORTS --------------------+

module.exports = { app, startServer, closeServer };