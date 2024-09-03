// +------------------------------------------------+
// |           REDTETRIS CONFIGURATION JS           |
// +------------------------------------------------+

// +------------------------------------------------+
// |       REDTETRIS BACKEND CONFIGURATION JS       |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module exports the configuration object for
    the RedTetris backend server.
*/

// +----------------- REQUIREMENTS -----------------+

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// +----------------- CONFIGURATION ----------------+

dotenv.config();

const config = {
    hostname: process.env.HOSTNAME || '127.0.0.1',
    hostname_local: process.env.HOSTNAME_LOCAL || 'localhost',
    port: process.env.BACKEND_PORT || 8080,
    session_secret: process.env.SESSION_SECRET || 'redtetris_secret',
    react_url: `http://${process.env.HOSTNAME_LOCAL}:${process.env.FRONTEND_PORT}` || 'http://localhost:3000',

};


// +------------------- EXPORTS --------------------+

module.exports = config;
