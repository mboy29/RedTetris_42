// +------------------------------------------------+
// |             REDTETRIS SOCKET SERVICE            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the socket service for the RedTetris
    game. The service handles socket connections and events
    for the game.
*/

// +----------------- REQUIREMENTS -----------------+

const gameService = require('./gameService');
const playService = require('./playService'); 

// +------------------- FUNCTIONS -------------------+

function setupSocket(io) {
    io.on('connection', async (socket) => {

        socket.on('joinGame', async ({ roomName, playerName }) => {
            gameService.joinGame(io, socket, { roomName, playerName });
        });

        socket.on('readyGame', async ({ roomName, playerName }) => {
            gameService.readyGame(io, socket, { roomName, playerName });
        });
    
        socket.on('leaveGame', async ({ roomName, playerName }) => {
            gameService.leaveGame(io, socket, { roomName, playerName });
        });
        
        socket.on('disconnect', async () => {
            gameService.disconnect(io, socket);
        });
        
    });
}


// +------------------- EXPORTS --------------------+

module.exports = { setupSocket };
