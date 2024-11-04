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

// +------------------- FUNCTIONS -------------------+

function setupSocket(io) {
    io.on('connection', async (socket) => {

        socket.on('joinGame', async ({ roomName, playerName }) => {
            try {
                await gameService.joinGame(io, socket, { roomName, playerName });
            } catch (error) {
                console.log('[GAME] Error joining game:', error.message);
            }
        });

        socket.on('startGame', async ({ roomName, playerName }) => {
            try {
                await gameService.startGame(io, socket, { roomName, playerName });
            } catch {
                console.log('[GAME] Error starting game:', error.message);
            }
        });

        socket.on('triggerGame', async ({ roomName }) => {
            try {
                await gameService.triggerGame(io, socket, { roomName });
            } catch {
                console.log('[GAME] Error triggering game:', error.message);
            }
        });
    
        socket.on('leaveGame', async ({ roomName, playerName }) => {
            try {
                await gameService.leaveGame(io, socket, { roomName, playerName });
            } catch {
                console.log('[GAME] Error handling player leaving game:', error.message);
            }
        });

        socket.on('updatedGame', async ({ roomName, playerName, grid }) => {
            try {
                await gameService.updateGame(io, socket, { roomName, playerName, grid });
            } catch (error) {
                console.log('[GAME] Error updating game:', error.message);
            }
        });

        socket.on('scoreGame', async ({ roomName, playerName, lines, level }) => {
            try {
                await gameService.scoreGame(io, socket, { roomName, playerName, lines, level });
            } catch (error) {
                console.log('[GAME] Error scoring game:', error.message);
            }
        });

        socket.on('lostGame', async ({ roomName, playerName }) => {
            try {
                await gameService.lostGame(io, socket, { roomName, playerName });
            } catch (error) {
                console.log('[GAME] Error losing game:', error.message);
            }
        });

        socket.on('rematchGame', async ({ roomName, playerName }) => {
            try { 
                await gameService.rematchGame(io, socket, { roomName, playerName });
            } catch (error) {
                console.log('[GAME] Error rematching game:', error.message);
            }

        });
        
        socket.on('disconnect', async () => {
            try {
                await gameService.disconnect(io, socket);
            } catch (error) {
                console.log('[GAME] Error handling player disconnect:', error.message);
            }
        });
        
    });
}


// +------------------- EXPORTS --------------------+

module.exports = { setupSocket };
