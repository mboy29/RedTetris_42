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
let isLosing = false; // Global or module-level variable to track loss state
let pendingLossPromises = [];

const joinGame = async (io, socket, { roomName, playerName }) => {
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
    } else if (!game.isGameJoinable(player)) {
        throw new Error('Game is not joinable');
    } else if (await game.isGamePlayer(player)) {
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
            io.to(roomName).emit('gameTraining', { training: game.isGameTraining() });
        }
        io.to(roomName).emit('gameSprint', { sprint: game.isGameSprint() });
        if (players.length > 1 && game.getMode() === "solo") {
            await game.updateMode('multiplayer');
        }
    } else {
        io.to(roomName).emit('gameReconnected', { players: players });
    }
};

const startGame = async (io, socket, { roomName }) => {
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
    io.to(roomName).emit('gameStarted');
};


const leaveGame = async (io, socket, { roomName, playerName }) => {
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
};

const triggerGame = async (io, socket, { roomName }) => {
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
}

const updateGame = async (io, socket, { roomName, playerName, grid }) => {
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
    let firstNonEmptyRow = -1;
    for (let i = 0; i < grid.length; i++) {
        if (grid[i].some(cell => cell !== null)) {
            firstNonEmptyRow = i;
            break;
        }
    }
    grid = grid.map(row => row.map(cell => cell !== null ? 'H' : cell));
    for (let col = 0; col < grid[0].length; col++) {
        let foundH = false;
        for (let row = 0; row < grid.length; row++) {
            if (grid[row][col] === 'H') {
                foundH = true;
            }
            if (foundH) {
                grid[row][col] = 'H';
            }
        }
    }
    io.to(roomName).emit('gameUpdated', { playerName, grid, score });
}

const scoreGame = async (io, socket, { roomName, playerName, lines, level }) => {
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
    io.to(roomName).emit('gameScored', { scoredPlayerGame: playerName, lines: lines - 1 });
}

const lostGame = async (io, socket, { roomName, playerName, surrendered = false }) => {
    // Function to wait until isLosing becomes false
    const waitForLosing = () => new Promise(resolve => {
        const checkInterval = setInterval(() => {
            if (!isLosing) {
                clearInterval(checkInterval);
                resolve(); // Resolve the promise when isLosing is false
            }
        }, 50); // Check every 50 milliseconds
    });

    // Wait if currently losing is being processed
    if (isLosing) {
        console.log(`[GAME] Player ${playerName} is waiting for the previous loss to be processed.`);
        await waitForLosing(); // Wait until isLosing is false
    }

    isLosing = true; // Set the flag to indicate that we are processing a loss

    const formatScores = async (game) => {
        const scoresObj = {};
        const scores = await game.getScores();

        for (const playerId in scores) {
            const player = await Player.getById(playerId);
            scoresObj[player.username] = scores[playerId];
        }
        const sortedScoresArray = Object.entries(scoresObj).sort((a, b) => b[1] - a[1]);
        return Object.fromEntries(sortedScoresArray);
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

        // Check if the game should end
        if (game.isEndGame()) {
            await game.endGame();
            const winner = game.getWinner();
            const rematcher = game.getRematcher();
            console.log('[GAME] Game ended with player', winner.username, 'as winner');
            io.to(roomName).emit('gameEnded', { winner, scores, rematcher });
        }
    } catch (error) {
        throw new Error(error);
    } finally {
        isLosing = false; // Reset the flag once the processing is complete
    }
};

const rematchGame = async (io, socket, { roomName, playerName }) => {

    const generateRematchGameName = (gameName) => {
        const maxNameLength = 12; // maximum allowed length
        const suffixMatch = gameName.match(/\.(\d+)$/);
    
        let baseName = gameName.replace(/\.\d*$/, ''); // remove any existing suffix
        let newSuffix;
    
        if (suffixMatch) {
            const currentSuffix = parseInt(suffixMatch[1], 10);
            newSuffix = `.${currentSuffix + 1}`;
        } else {
            newSuffix = '.2';
        }
    
        const maxBaseNameLength = maxNameLength - newSuffix.length;
    
        // Truncate baseName to fit the new suffix if necessary
        if (baseName.length > maxBaseNameLength) {
            baseName = baseName.slice(0, maxBaseNameLength);
        }
    
        return baseName + newSuffix;
    };
    
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
}

const disconnect = async (io, socket) => {
    if (socketRooms.has(socket.id)) {
        const { roomName, playerName } = socketRooms.get(socket.id);
        const player = await Player.getByUsername(playerName);
        if (player) {
            await leaveGame(io, socket, { roomName, playerName });
        }
        console.log(`[GAME] Player ${playerName} disconnected from game ${roomName}`);
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