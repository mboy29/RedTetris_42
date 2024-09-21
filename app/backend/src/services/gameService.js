// +------------------------------------------------+
// |         REDTETRIS GAME SOCKET SERVICE          |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the game socket service for
    the RedTetris game. The service handles socket 
    connections and events for the game.

    The service includes functions to join a game, 
    set a player as ready, leave a game, and handle
    disconnections.
*/

// +----------------- REQUIREMENTS -----------------+

const Game = require('../models/gameModel');
const Player = require('../models/playerModel');

// +------------------- FUNCTIONS -------------------+

const socketRooms = new Map(); 

const joinGame = async (io, socket, { roomName, playerName }) => {
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
            throw new Error('Game not found or does not exist');
        }

        if (await game.isGamePlayer(player)) {
            throw new Error('Player already in game');
        }

        await game.addPlayers(socket, player);

        socketRooms.set(socket.id, { roomName, playerName });
        
        console.log(`[GAME] Player ${playerName} joined game ${roomName}`);
        const players = await game.getPlayers();

        if (game.getStatus() === 'pending') {
            io.to(roomName).emit('gamePlayers', ( players ));
            io.to(roomName).emit('gameFull', ( game.isGameFull() ));
            if (game.isGameCreator(player)) {
                socket.emit('gameCreator', {});
            }
        } else {
            io.to(roomName).emit('gameReconnected', { players: players });
        }

    } catch (error) {
        console.log('[GAME] Error joining game:', error.message);
    }
};

const startGame = async (io, socket, { roomName }) => {
    try {
        if (!roomName) {
            throw new Error('Invalid input');
        }
        const game = await Game.getByName(roomName);
        if (!game) {
            throw new Error('Game not found');
        } else if (game.getStatus() !== 'pending') {
            throw new Error('Game is not in pending status');
        }
        await game.startGame();
        console.log(`[GAME] Game ${roomName} started`);
        io.to(roomName).emit('gameStarted', { roomName });
    } catch (error) {
        console.log('[GAME] Error starting game:', error.message);
    }
};


const leaveGame = async (io, socket, { roomName, playerName }) => {
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
                io.to(roomName).emit('gamePlayers', ( players ));
                io.to(roomName).emit('gameFull', ( game.isGameFull() ));
            }
        } else {
            await game.endGame(true);
            io.to(roomName).emit('gameSurrendered', { playerName });
        }
    } catch (error) {
        console.log('[GAME] Error handling player leaving game:', error.message);
    }
};

const triggerGame = async (io, socket, { roomName }) => {
    try {
        if (!roomName) {
            throw new Error('Invalid input');
        }
        const game = await Game.getByName(roomName);
        if (!game) {
            throw new Error('Game not found');
        } else if (game.getStatus() !== 'in progress') {
            throw new Error('Game is not in progress');
        }
        io.to(roomName).emit('gamePieces', ( game.getPieces() ));

    } catch (error) {
        console.log('[GAME] Error starting game:', error.message);
    }
}

const disconnect = async (io, socket) => {
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
};


// +------------------- EXPORTS --------------------+

module.exports = {
    joinGame,
    startGame,
    leaveGame,
    triggerGame,
    disconnect
};