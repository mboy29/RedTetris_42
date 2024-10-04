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

        socket.on('startGame', async ({ roomName, playerName }) => {
            gameService.startGame(io, socket, { roomName, playerName });
        });

        socket.on('triggerGame', async ({ roomName }) => {
            gameService.triggerGame(io, socket, { roomName });
        });
    
        socket.on('leaveGame', async ({ roomName, playerName }) => {
            gameService.leaveGame(io, socket, { roomName, playerName });
        });

        socket.on('updatedGame', async ({ roomName, playerName, grid }) => {
            gameService.updateGame(io, socket, { roomName, playerName, grid });
        });

        socket.on('scoreGame', async ({ roomName, playerName, lines, level }) => {
            gameService.scoreGame(io, socket, { roomName, playerName, lines, level });
        });

        socket.on('lostGame', async ({ roomName, playerName }) => {
            gameService.lostGame(io, socket, { roomName, playerName });
        });

        socket.on('rematchGame', async ({ roomName, playerName }) => {
            gameService.rematchGame(io, socket, { roomName, playerName });
        });
        
        socket.on('disconnect', async () => {
            gameService.disconnect(io, socket);
        });
        
    });
}


// +------------------- EXPORTS --------------------+

module.exports = { setupSocket };
