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
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const config = require('./config');
const authRoutes = require('./routes/authRoutes');

require('./database/initDatabase').init();

// +------------------- GLOBALS --------------------+

const app = express();
const server = http.createServer(app);

// +------------------ CORS CONFIGURATION -------------------+

app.use(cors({
    origin: [config.react_url], 
    credentials: true 
}));

// +------------------ MIDDLEWARE -------------------+

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

// +------------------- ROUTES ---------------------+


app.use('/auth', authRoutes);


// +------------------- SERVER ---------------------+

server.listen(config.port, '0.0.0.0', () => {
    console.log(`Server is running on http://${config.hostname_local}:${config.port}`);
});
