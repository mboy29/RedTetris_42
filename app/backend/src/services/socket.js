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

const Game = require('./../models/gameModel');
const Player = require('./../models/playerModel');

// +------------------- FUNCTIONS -------------------+

const socketRooms = new Map(); 

function setupSocket(io) {
    io.on('connection', async (socket) => {

        socket.on('joinGame', async ({ roomName, playerName }) => {
            try {
                if (!roomName || !playerName) {
                    throw new Error('Invalid input');
                }
    
                const player = await Player.getByUsername(playerName);
                if (!player) {
                    throw new Error('Player not found');
                }
    
                const game = await Game.getByName(roomName);
                if (!game) {
                    throw new Error('Game not found');
                }
    
                if (await game.isGamePlayer(player)) {
                    socket.emit('gameJoined', { roomName, playerName });
                    return;
                }
    
                await game.addPlayers(socket, player);

                socketRooms.set(socket.id, { roomName, playerName });
    
                console.log(`[GAME] Player ${playerName} joined game ${roomName}`);
                const players = await game.getPlayers();
                io.to(roomName).emit('updatePlayers', players);
                socket.emit('gameJoined', { roomName, playerName });
    
            } catch (error) {
                socket.emit('error', { message: error.message });
                console.error('[GAME] Error joining game:', error.message);
            }
        });
    

        socket.on('leaveGame', async ({ roomName, playerName }) => {
            try {
                if (!roomName || !playerName) {
                    throw new Error('Invalid input');
                }
        
                const game = await Game.getByName(roomName);
                if (!game) {
                    throw new Error('Game not found');
                }
        
                const player = await Player.getByUsername(playerName);
                if (!player) {
                    throw new Error('Player not found');
                }
        
                if (!await game.isGamePlayer(player)) {
                    throw new Error('Player not in game');
                }
        
                await game.removePlayers(socket, player);
                console.log(`[GAME] Player ${playerName} left game ${roomName}`);
                if (game.isGameCreator(player)) {
                    await game.remove(roomName);
                    console.log(`[GAME] Game ${roomName} deleted as creator left`);
                    socket.emit('gameDeleted');
                    io.to(roomName).emit('gameDeleted');
                } else {
                    const players = await game.getPlayers();
                    io.to(roomName).emit('updatePlayers', players);
                }                 
            } catch (error) {
                console.error('[GAME] Error handling player leaving game:', error.message);
                socket.emit('error', { message: error.message });
            }
        });
        

        socket.on('disconnect', async () => {
            try {
                const socketInfo = socketRooms.get(socket.id);
                if (!socketInfo) {
                    console.error('[GAME] Socket information not found');
                    return;
                }
    
                const { roomName, playerName } = socketInfo;
    
                if (!roomName || !playerName) {
                    throw new Error('Room or player information not found');
                }
                const game = await Game.getByName(roomName);
                if (!game) {
                    throw new Error('Game not found');
                }
    
                const player = await Player.getByUsername(playerName);
                if (!player) {
                    throw new Error('Player not found');
                }
    
                if (!await game.isGamePlayer(player)) {
                    throw new Error('Player not in game');
                }
    
                await game.removePlayers(socket, player);
                console.log(`[GAME] Player ${playerName} left game ${roomName}`);
                if (game.isGameCreator(player)) {
                    await game.remove(roomName);
                    console.log(`[GAME] Game ${roomName} deleted as creator left`);
                    socket.emit('gameDeleted');
                    io.to(roomName).emit('gameDeleted');
                } else {
                    const players = await game.getPlayers();
                    io.to(roomName).emit('updatePlayers', players);
                }           
            } catch (error) {
                console.error('[GAME] Error handling player leaving game:', error.message);
            }
        });
    });
}



module.exports = { setupSocket };
