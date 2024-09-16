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

const Game = require('../models/gameModel');
const Player = require('../models/playerModel');

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
                const allplayers = await game.getPlayers();
                console.log('DEBUG: allplayers', allplayers);
                if (!game) {
                    throw new Error('Game not found or does not exist');
                }
                if (await game.isGamePlayer(player)) {
                    throw new Error('Player already in game');
                }

                await game.addPlayers(socket, player);

                socketRooms.set(socket.id, { roomName, playerName });
                
                console.log(`[GAME] Player ${playerName} joined game ${roomName}`);
                const players = await game.getPlayers()

                if (game.getStatus() === 'pending') {
                    if (game.isGameFull()) {
                        io.to(roomName).emit('gameFull', { players: players });
                    } else {
                        io.to(roomName).emit('gameJoined', { players: players});
                    }
                } else {
                    console.log(`[DEBUG] Game reconnecting`);
                    io.to(roomName).emit('gameReconnected', { players: players });
                }
    
            } catch (error) {
                console.log('[GAME] Error joining game:', error.message);
            }
        });

        socket.on('readyGame', async ({ roomName, playerName }) => {
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
                if (!await game.isGamePlayer(player)) {
                    throw new Error('Player not in game');
                }
                if (!game.isGameFull()) {
                    throw new Error('Game is not full');
                }
                if (game.getStatus() !== 'pending') {
                    throw new Error('Game is not in pending status');
                }
                
                await game.increaseReadyPlayers();
                console.log(`[GAME] Player ${playerName} is ready in game ${roomName}`);
                io.to(roomName).emit('gamePlayerReady', { playerName });
                if (game.arePlayersReady()) {
                    await game.startGame();
                    console.log(`[GAME] Game ${roomName} started`);
                    io.to(roomName).emit('gameStarted', { roomName });
                }
            }
            catch (error) {
                console.log('[GAME] Error setting player ready:', error.message);
            }
        });
    

        socket.on('leaveGame', async ({ roomName, playerName }) => {
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
                if (!await game.isGamePlayer(player)) {
                    throw new Error('Player not in game');
                }
            
                await game.removePlayers(socket, player);
                console.log(`[GAME] Player ${playerName} left game ${roomName}`);
                
                if (game.getStatus() === 'pending') {
                    if (game.isGameCreator(player)) {
                        await game.remove(roomName);
                        console.log(`[GAME] Game ${roomName} deleted as creator left`);
                        io.to(roomName).emit('gameDeleted', {});
                    } else {
                        const players = await game.getPlayers();
                        io.to(roomName).emit('updatePlayers', players);
                    }
                } else {
                    await game.endGame(true);
                    io.to(roomName).emit('gameSurrendered', { playerName });
                }           
            } catch (error) {
                console.log('[GAME] Error handling player leaving game:', error.message);
            }
        });
        
        socket.on('disconnect', async () => {
            try {
                const socketInfo = socketRooms.get(socket.id);
                if (!socketInfo) {
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
                if (game.isGameCreator(player) && game.getStatus() === 'pending') {
                    await game.remove(roomName);
                    console.log(`[GAME] Game ${roomName} deleted as creator left`);
                    io.to(roomName).emit('gameDeleted');
                } else {
                    const players = await game.getPlayers();
                    io.to(roomName).emit('updatePlayers', { players: players });
                }       
            } catch (error) {
                console.log('[GAME] Error handling player leaving game:', error.message);
            }
        });
        
    });
}



module.exports = { setupSocket };
