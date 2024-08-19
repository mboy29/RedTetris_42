// +------------------------------------------------+
// |               REDTETRIS SERVER JS              |
// +------------------------------------------------+

// +----------------- REQUIREMENTS -----------------+

const http = require('http');
const config = require('./config');

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
