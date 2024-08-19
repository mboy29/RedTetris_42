// +------------------------------------------------+
// |           REDTETRIS CONFIGURATION JS           |
// +------------------------------------------------+

// +----------------- REQUIREMENTS -----------------+

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// +----------------- CONFIGURATION ----------------+

dotenv.config();

const config = {
    hostname: process.env.HOSTNAME || '127.0.0.1',
    hostname_local: process.env.HOSTNAME_LOCAL || 'localhost',
    port: process.env.BACKEND_PORT || 8080
};

// +------------------- EXPORTS --------------------+

module.exports = config;
