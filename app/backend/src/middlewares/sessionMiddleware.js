// +------------------------------------------------+
// |         REDTETRIS SESSION MIDDLEWARE           |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    Middleware that creates a session for the user
    using the express-session library.
*/

// +----------------- REQUIREMENTS -----------------+ 

const session = require('express-session');
const config = require('./../config');

// +------------------- FUNCTIONS ------------------+

const sessionMiddleware = session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }  
});

// +-------------------- EXPORTS -------------------+ 

module.exports = sessionMiddleware;
