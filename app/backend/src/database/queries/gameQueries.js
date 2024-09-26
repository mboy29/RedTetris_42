// +------------------------------------------------+
// |       REDTETRIS GAME QUERY DATABASE JS         |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+
/*
    This module is designed to handle operations on the `games` 
    and `game_players` tables in the SQLite database for the RedTetris project. 

    This includes:
        - Creating a new game
        - Deleting a game by ID
        - Updating a game's name, mode, or status
        - Getting a game by ID or name
        - Getting a game's players
        - Checking if a player is in a game
        - Adding or removing a player from a game
*/

// +----------------- REQUIREMENTS -----------------+ 

const dbModule = require('../database');

// +------------------- FUNCTIONS ------------------+

function validateStatus(status) {
    const validStatuses = ['pending', 'in progress', 'finished'];
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
}

function validateMode(mode) {
    const validModes = ['solo', 'multiplayer'];
    if (!validModes.includes(mode)) {
        throw new Error(`Invalid mode. Must be one of: ${validModes.join(', ')}`);
    }
}

async function createGame(name, mode, creatorId, status, size = 2) {
    try {
        validateMode(mode);
        validateStatus(status);

        const db = await dbModule.connect();
        const query = `
            INSERT INTO games (name, mode, creator_id, status, size)
            VALUES (?, ?, ?, ?, ?);
        `;
        const result = await dbModule.run(query, [name, mode, creatorId, status, size]);

        return result.lastID;
    } catch (err) {
        throw new Error(`Error creating game: ${err.message}`);
    }
}

async function deleteGameById(id) {
    try {
        const db = await dbModule.connect();
        const queryGet = 'SELECT * FROM games WHERE id = ?';
        if (!await dbModule.get(queryGet, [id])) {
            throw new Error('Game not found');
        }
        const query = 'DELETE FROM games WHERE id = ?';
        const result = await dbModule.run(query, [id]);
        return result.changes;
    } catch (err) {
        throw new Error(`Error deleting game by ID: ${err.message}`);
    }
}

async function createGameScore(gameId, playerId, score) {
    try {
        const db = await dbModule.connect();
        const query = `
            INSERT INTO game_scores (game_id, player_id, score)
            VALUES (?, ?, ?);
        `;
        const result = await dbModule.run(query, [gameId, playerId, score]);

        return result.lastID;
    } catch (err) {
        throw new Error(`Error creating game score: ${err.message}`);
    }
}

async function deleteGameScore(gameId, playerId) {
    try {
        const db = await dbModule.connect();
        const query = 'DELETE FROM game_scores WHERE game_id = ? AND player_id = ?;';
        const result = await dbModule.run(query, [gameId, playerId]);
        if (result.changes === 0) {
            throw new Error('Score not found for this player in the specified game.');
        }
        return result.changes;
    } catch (err) {
        throw new Error(`Error deleting game score: ${err.message}`);
    }
}


async function updateGameName(id, name) {
    try {
        const db = await dbModule.connect();
        const query = 'UPDATE games SET name = ? WHERE id = ?';
        const result = await dbModule.run(query, [name, id]);
        if (result.changes === 0) {
            throw new Error('Game not found');
        }
        return result.changes;
    } catch (err) {
        throw new Error(`Error updating game name: ${err.message}`);
    }
}

async function updateGameMode(id, mode) {
    try {
        validateMode(mode);
        const db = await dbModule.connect();
        const query = 'UPDATE games SET mode = ? WHERE id = ?';
        const result = await dbModule.run(query, [mode, id]);
        if (result.changes === 0) {
            throw new Error('Game not found');
        }
        return result.changes;
    } catch (err) {
        throw new Error(`Error updating game mode: ${err.message}`);
    }
}

async function updateGameSize(id, size) {
    try {
        const db = await dbModule.connect();
        const query = 'UPDATE games SET size = ? WHERE id = ?';
        const result = await dbModule.run(query, [size, id]);
        if (result.changes === 0) {
            throw new Error('Game not found');
        }
        return result.changes;
    } catch (err) {
        throw new Error(`Error updating game number of players: ${err.message}`);
    }
}

async function updateReadyPlayers(gameId, increment) {
    try {
        const db = await dbModule.connect();
        const query = `
            UPDATE games 
            SET ready_players = ready_players + ? 
            WHERE id = ? AND ready_players + ? <= size;
        `;
        const result = await dbModule.run(query, [increment, gameId, increment]);

        if (result.changes === 0) {
            throw new Error('Game not found or player count exceeded.');
        }

        return result.changes;
    } catch (err) {
        throw new Error(`Error updating game number of ready players: ${err.message}`);
    }
}

async function updateGameStatus(id, status) {
    try {
        validateStatus(status);
        const db = await dbModule.connect();
        const query = 'UPDATE games SET status = ? WHERE id = ?';
        const result = await dbModule.run(query, [status, id]);
        if (result.changes === 0) {
            throw new Error('Game not found');
        }
        return result.changes;
    } catch (err) {
        throw new Error(`Error updating game status: ${err.message}`);
    }
}

async function updateGameWinner(id, winnerId) {
    try {
        const db = await dbModule.connect();
        const query = 'UPDATE games SET winner_id = ? WHERE id = ?';
        const result = await dbModule.run(query, [winnerId, id]);
        if (result.changes === 0) {
            throw new Error('Game not found');
        }
        return result.changes;
    } catch (err) {
        throw new Error(`Error updating game winner: ${err.message}`);
    }
}

async function updateGameScore(gameId, playerId, score) {
    try {
        const db = await dbModule.connect();
        const query = `
            UPDATE game_scores 
            SET score = score + ? 
            WHERE game_id = ? AND player_id = ?;
        `;
        const result = await dbModule.run(query, [score, gameId, playerId]);

        if (result.changes === 0) {
            throw new Error('Score not found for this player in the specified game.');
        }
        return result.changes;
    } catch (err) {
        throw new Error(`Error updating game score: ${err.message}`);
    }
}

async function getGameById(id) {
    try {
        const db = await dbModule.connect();
        const query = 'SELECT * FROM games WHERE id = ?';
        const row = await dbModule.get(query, [id]);
        return row || null;
    } catch (err) {
        throw new Error(`Error getting game by ID: ${err.message}`);
    }
}

async function getGameByName(name) {
    try {
        const db = await dbModule.connect();
        const query = 'SELECT * FROM games WHERE name = ?';
        const row = await dbModule.get(query, [name]);
        return row || null;
    } catch (err) {
        throw new Error(`Error getting game by name: ${err.message}`);
    }
}

async function getGamePlayers(gameId) {
    try {
        const db = await dbModule.connect();
        const query = `
            SELECT p.*
            FROM players p
            JOIN game_players gp ON p.id = gp.player_id
            WHERE gp.game_id = ?;
        `;
        const rows = await dbModule.all(query, [gameId]);
        return rows || [];
    } catch (err) {
        throw new Error(`Error getting players for game ID ${gameId}: ${err.message}`);
    }
}

async function getGameScores() {
    try {
        const db = await dbModule.connect();
        const query = 'SELECT * FROM game_scores ORDER BY score DESC;';
        const rows = await dbModule.all(query);
        return rows || [];
    } catch (err) {
        throw new Error(`Error getting all game scores: ${err.message}`);
    }
}

async function getGameScoresByPlayer(playerId) {
    try {
        const db = await dbModule.connect();
        const query = 'SELECT * FROM game_scores WHERE player_id = ? ORDER BY score DESC;';
        const rows = await dbModule.all(query, [playerId]);
        return rows || [];
    } catch (err) {
        throw new Error(`Error getting scores for player ${playerId}: ${err.message}`);
    }
}

async function getGameScoresByGame(gameId) {
    try {
        const db = await dbModule.connect();
        const query = 'SELECT * FROM game_scores WHERE game_id = ? ORDER BY score DESC;';
        const rows = await dbModule.all(query, [gameId]);
        return rows || [];
    } catch (err) {
        throw new Error(`Error getting scores for game ${gameId}: ${err.message}`);
    }
}

async function getGameScoreByGamePlayer(gameId, playerId) {
    try {
        const db = await dbModule.connect();
        const query = 'SELECT * FROM game_scores WHERE game_id = ? AND player_id = ?;';
        const row = await dbModule.get(query, [gameId, playerId]);
        return row || null;
    } catch (err) {
        throw new Error(`Error getting score for player ${playerId} in game ${gameId}: ${err.message}`);
    }
}


async function isGamePlayer(gameId, playerId) {
    try {
        const db = await dbModule.connect();
        const query = 'SELECT 1 FROM game_players WHERE game_id = ? AND player_id = ?';
        const row = await dbModule.get(query, [gameId, playerId]);
        return row ? true : false;
    } catch (err) {
        throw new Error(`Error checking if player ${playerId} is in game ${gameId}: ${err.message}`);
    }
}

async function addPlayerToGame(gameId, playerId) {
    try {
        const db = await dbModule.connect();
        if (await isGamePlayer(gameId, playerId)) {
            throw new Error('Player is already in the game');
        }
        const query = 'INSERT INTO game_players (game_id, player_id) VALUES (?, ?)';
        const result = await dbModule.run(query, [gameId, playerId]);
        if (result.changes === 0) {
            throw new Error('Game not found');
        }
        return result.lastID;
    } catch (err) {
        throw new Error(`Error adding player ${playerId} to game ${gameId}: ${err.message}`);
    }
}

async function removePlayerFromGame(gameId, playerId) {
    try {
        const db = await dbModule.connect()
        if (!await isGamePlayer(gameId, playerId)) {
            throw new Error('Player is not in the game');
        }
        const query = 'DELETE FROM game_players WHERE game_id = ? AND player_id = ?';
        const result = await dbModule.run(query, [gameId, playerId]);
        if (result.changes === 0) {
            throw new Error('Game not found');
        }
        return result.changes;
    } catch (err) {
        throw new Error(`Error removing player ${playerId} from game ${gameId}: ${err.message}`);
    }
}

// +-------------------- EXPORTS -------------------+ 

module.exports = {
    createGame,
    deleteGameById,
    createGameScore,
    deleteGameScore,
    updateGameName,
    updateGameMode,
    updateGameStatus,
    updateGameSize,
    updateReadyPlayers,
    updateGameWinner,
    updateGameScore,
    getGameById,
    getGameByName,
    getGamePlayers,
    getGameScores,
    getGameScoresByPlayer,
    getGameScoresByGame,
    getGameScoreByGamePlayer,
    isGamePlayer,
    addPlayerToGame,
    removePlayerFromGame,
};
