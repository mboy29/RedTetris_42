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
                console.log(`[GAME] Player ${player.username} is game creator`);
                io.to(roomName).emit('gameCreator', { creator: player });
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
        const sprint = game.getSprint();
        io.to(roomName).emit('gameStarted', { sprint });

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
    
       
        console.log(`[GAME] Player ${playerName} left game ${roomName}`);
        if (game.getStatus() === 'in progress') {
            if (game.isGameLoser(player)) {
                if (game.isGameCreator(player)) {
                    const players = await game.getPlayers();
                    const otherPlayers = players.filter(p => p.username !== player.getUsername());
                    if (otherPlayers.length === 0) {
                        await game.remove(roomName);
                        console.log(`[GAME] Game ${roomName} deleted as creator left`);
                        io.to(roomName).emit('gameDeleted', {});
                    } else {
                        const randomPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                        await game.updateCreator(randomPlayer);
                        io.to(roomName).emit('gameCreator', { creator: randomPlayer });
                        io.to(roomName).emit('gamePlayers', ( players ));
                        console.log("[GAME] Creator left, new creator is", randomPlayer.username);
                    }
                }
            } else {
                await lostGame(io, socket, { roomName, playerName, surrendered: true });
            }
        } else if (game.getStatus() === 'pending') {
            await game.removePlayers(socket, 0, player);
            if (game.isGameCreator(player)) {
                const players = await game.getPlayers();
                const otherPlayers = players.filter(p => p.username !== player.getUsername());
                if (otherPlayers.length === 0) {
                    await game.remove(roomName);
                    console.log(`[GAME] Game ${roomName} deleted as creator left`);
                    io.to(roomName).emit('gameDeleted', {});
                    const parentGame = game.getParent();
                    if (parentGame) {
                        const parentPlayers = await parentGame.getPlayers();
                        const otherParentPlayers = parentPlayers.filter(p => p.username !== player.getUsername());
                        const randomParentPlayer = otherParentPlayers[Math.floor(Math.random() * otherParentPlayers.length)];
                        await parentGame.updateRematcher(randomParentPlayer);
                        io.to(parentGame.getName()).emit('gameRematcher', { rematcher: randomParentPlayer });
                        io.to(parentGame.getName()).emit('gameRematched', { creator: randomParentPlayer, roomName: null });
                    }
                } else {
                    const randomPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                    await game.updateCreator(randomPlayer);
                    io.to(roomName).emit('gameCreator', { creator: randomPlayer });
                    io.to(roomName).emit('gamePlayers', ( players ));
                    console.log("[GAME] Creator left, new creator is", randomPlayer.username);
                }
            } else {
                const players = await game.getPlayers();
                io.to(roomName).emit('gamePlayers', ( players ));
                io.to(roomName).emit('gameFull', ( game.isGameFull() ));
            }
        } else {
            if (game.getMode() === 'multiplayer') {
                const players = await game.getPlayers();
                const otherPlayers = players.filter(p => p.username !== player.getUsername());
                if (game.isGameRematcher(player)) {
                    const randomPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                    await game.updateRematcher(randomPlayer);
                    io.to(roomName).emit('gameRematcher', { rematcher: randomPlayer });
                    console.log("[GAME] Rematcher left, new rematcher is", randomPlayer.username);
                }
            }
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

const updateGame = async (io, socket, { roomName, playerName, grid }) => {
    try {
        if (!roomName || !playerName || !grid) {
            throw new Error('Invalid input');
        }
        const game = await Game.getByName(roomName);
        if (!game) {
            throw new Error('Game not found');
        } else if (game.getStatus() !== 'in progress') {
            throw new Error('Game is not in progress');
        }
        
        const player = await Player.getByUsername(playerName);
        if (!player) {
            throw new Error('Player not found');
        } else if (!await game.isGamePlayer(player)) {
            throw new Error('Player not in game');
        }
        console.log(`[GAME] Player ${playerName} updated game ${roomName}`);
        const score = await game.getPlayerScore(player);
        io.to(roomName).emit('gameUpdated', { playerName, grid, score });
    } catch (error) {
        console.log('[GAME] Error updating game:', error.message);
    }
}

const scoreGame = async (io, socket, { roomName, playerName, lines, level }) => {
    try {
        if (!roomName || !playerName || !lines) {
            throw new Error('Invalid input');
        }
        const game = await Game.getByName(roomName);
        if (!game) {
            throw new Error('Game not found');
        } else if (game.getStatus() !== 'in progress') {
            throw new Error('Game is not in progress');
        }
        const player = await Player.getByUsername(playerName);
        if (!player) {
            throw new Error('Player not found');
        } else if (!await game.isGamePlayer(player)) {
            throw new Error('Player not in game');
        }
        await game.updateScore(player, 0, lines, level);
        io.to(roomName).emit('gameScored', { scoredPlayerGame: playerName, lines: lines });
    } catch (error) {
        console.log('[GAME] Error scoring game:', error.message);
    }
}

const lostGame = async (io, socket, { roomName, playerName, surrendered = false }) => {

    const formatScores = async (game) => {
        const scoresObj = {};
        const scores = await game.getScores();
    
        for (const playerId in scores) {
            const player = await Player.getById(playerId);
            scoresObj[player.username] = scores[playerId];
        }
        const sortedScoresArray = Object.entries(scoresObj).sort((a, b) => b[1] - a[1]);
        const sortedScoresObj = Object.fromEntries(sortedScoresArray);
        return sortedScoresObj;
    };
    
    try {
        if (!roomName || !playerName) {
            throw new Error('Invalid input');
        }
        const game = await Game.getByName(roomName);
        if (!game) {
            throw new Error('Game not found');
        } else if (game.getStatus() !== 'in progress') {
            throw new Error('Game is not in progress');
        }
        const player = await Player.getByUsername(playerName);
        if (!player) {
            throw new Error('Player not found');
        } else if (!await game.isGamePlayer(player)) {
            throw new Error('Player not in game');
        }
        await game.updateLosers(player, surrendered);
        const scores = await formatScores(game);
        console.log(`[GAME] Player ${playerName} lost game ${roomName}`);
        io.to(roomName).emit('gameLost', { playerName, scores });
        if (game.isEndGame()) {
            await game.endGame();
            const winner = game.getWinner()
            const rematcher = game.getRematcher();
            console.log('[GAME] Game ended with player', winner.username, 'as winner');
            io.to(roomName).emit('gameEnded', { winner, scores, rematcher });
        }
    } catch (error) {
        console.log('[GAME] Error ending game:', error.message);
    }
}

const rematchGame = async (io, socket, { roomName, playerName }) => {

    const generateRematchGameName = (gameName) => {
        const match = gameName.match(/\.(\d+)$/);
        
        let newSuffix;
        if (match) {
            const currentSuffix = parseInt(match[1], 10);
            newSuffix = `.${currentSuffix + 1}`;
        } else {
            newSuffix = '.2';
        }
        return gameName.replace(/\.\d*$/, '') + newSuffix;
    };
    try {
        console.log(`[GAME] Player ${playerName} requested rematch for game ${roomName}`);
        const game = await Game.getByName(roomName);
        if (!game) {
            throw new Error('Game not found');
        } else if (game.getStatus() !== 'finished') {
            throw new Error('Game is not ended');
        }
        const player = await Player.getByUsername(playerName); 
        if (!player) {
            throw new Error('Player not found');
        } else if (!await game.isGamePlayer(player)) {
            throw new Error('Player not in game');
        } else if (!game.isGameRematcher(player)) {
            throw new Error('Player not allowed to rematch');
        }
        const rematchGame = await Game.create(generateRematchGameName(game.getName()), game.getMode(), player, game.getSprint(), game);
        
        console.log(`[GAME] Rematch game ${rematchGame.getName()} created by ${rematchGame.getCreator().username}`);   
        io.to(roomName).emit('gameRematched', { creator: player, roomName: rematchGame.getName() });

    } catch (error) {
        console.log('[GAME] Error rematching game:', error.message);
    }
}

const disconnect = async (io, socket) => {
    try {
        if (socketRooms.has(socket.id)) {
            const { roomName, playerName } = socketRooms.get(socket.id);
            const player = await Player.getByUsername(playerName);
            if (player) {
                await leaveGame(io, socket, { roomName, playerName });
            }
            console.log(`[GAME] Player ${playerName} disconnected from game ${roomName}`);
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
    updateGame,
    scoreGame,
    lostGame,
    rematchGame,
    disconnect
};