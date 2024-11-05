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
    hostname: process.env.HOSTNAME,
    hostname_local: process.env.HOSTNAME_LOCAL,
    port: process.env.BACKEND_PORT,
    session_secret: process.env.SESSION_SECRET,
    react_url: `http://${process.env.HOSTNAME_LOCAL}:${process.env.FRONTEND_PORT}`,

};


// +------------------- EXPORTS --------------------+

module.exports = config;
