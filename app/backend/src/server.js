// +------------------------------------------------+
// |               REDTETRIS SERVER JS              |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module is the entry point for the RedTetris
    server. It creates an HTTP server that listens on 
    the port specified in the configuration file.
*/

// +----------------- REQUIREMENTS -----------------+

const http = require('http');
const config = require('./config');

require('./database/init').init()

// +----------------- SERVER CONFIG -----------------+

const requestListener = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World!\n');
};

// +------------------- SERVER ---------------------+

const server = http.createServer(requestListener);

server.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
