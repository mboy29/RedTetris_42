// +------------------------------------------------+
// |      REDTETRIS FRONTEND CONFIGURATION JS       |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module exports the configuration object for the RedTetris
    frontend server.
*/

// +----------------- CONFIGURATION ----------------+

const config = {
    hostname: process.env.REACT_APP_HOSTNAME,
    hostname_local: process.env.REACT_APP_HOSTNAME_LOCAL,
    port: process.env.REACT_APP_FRONTEND_PORT,
    api_url: `http://${process.env.REACT_APP_HOSTNAME_LOCAL}:${process.env.REACT_APP_BACKEND_PORT}`,
};

// +------------------- EXPORTS --------------------+

export default config;