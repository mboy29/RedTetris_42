// +------------------------------------------------+
// |       REDTETRIS GAME QUERY DATABASE JS         |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+
/*
    This module is designed to handle operations on 
    the `games`, `game_players`, `game_scores`, and
    `game_losers` tables in the RedTetris database.
    
    It provides functions to create, update, and delete
    game records, as well as to manage game scores and
    player participation in games.
*/

// +----------------- REQUIREMENTS -----------------+ 

const dbModule = require('../database');
const playerQueries = require('./playerQueries');

// +------------------- CREATIONS ------------------+

function validateStatus(status) {
    const validStatuses = ['pending', 'in progress', 'finished'];
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
}

function validateMode(mode) {
    const validModes = ['solo', 'multiplayer', 'training'];
    if (!validModes.includes(mode)) {
        throw new Error(`Invalid mode. Must be one of: ${validModes.join(', ')}`);
    }
}

async function createGame(name, mode, creatorId, status, sprint, parent = null, size = 4) {
    try {
        validateMode(mode);
        validateStatus(status);

        const db = await dbModule.connect();
        const query = `
            INSERT INTO games (name, mode, creator_id, status, size, sprint, parent_id)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        const result = await dbModule.run(query, [name, mode, creatorId, status, size, sprint, parent]);

        return result.lastID;
    } catch (err) {
        throw new Error(`Error creating game: ${err.message}`);
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


// +------------------- DELETIONS ------------------+

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


// +------------------- GETTERS --------------------+

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

async function getGameSprint(id) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(id);
        if (!game) {
            throw new Error('Game not found');
        }
        const query = 'SELECT sprint FROM games WHERE id = ?';
        const row = await dbModule.get(query, [id]);
        return row ? row.sprint : null;
    } catch (err) {
        throw new Error(`Error getting game sprint mode: ${err.message}`);
    }
}

async function getGameParent(id) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(id);
        if (!game) {
            throw new Error('Game not found');
        }
        const query = 'SELECT parent_id FROM games WHERE id = ?';
        const row = await dbModule.get(query, [id]);
        return row ? getGameById(row.parent_id) : null;
    } catch (err) {
        throw new Error(`Error getting game parent: ${err.message}`);
    }
}

async function getWinner(id) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(id);
        if (!game) {
            throw new Error('Game not found');
        }
        const query = 'SELECT winner_id FROM games WHERE id = ?';
        const row = await dbModule.get(query, [id]);
        return row ? row.winner_id : null;
    } catch (err) {
        throw new Error(`Error getting game winner: ${err.message}`);
    }
}

async function getRematcher(id) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(id);
        if (!game) {
            throw new Error('Game not found');
        }
        const query = 'SELECT rematcher_id FROM games WHERE id = ?';
        const row = await dbModule.get(query, [id]);
        return row ? row.rematcher_id : null;
    } catch (err) {
        throw new Error(`Error getting game rematcher: ${err.message}`);
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

async function getGameScoreByGamePlayer(id, playerId) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(id);
        const player = await playerQueries.getPlayerById(playerId);
        if (!game) {
            throw new Error('Game not found');
        } else if (!player) {
            throw new Error('Player not found');
        }
        const query = 'SELECT * FROM game_scores WHERE game_id = ? AND player_id = ?;';
        const row = await dbModule.get(query, [id, playerId]);
        return row || null;
    } catch (err) {
        throw new Error(`Error getting score for player ${playerId} in game ${id}: ${err.message}`);
    }
}

// +------------------- UPDATORS -------------------+

async function updateGameName(id, name) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(id);
        if (!game) {
            throw new Error('Game not found');
        }
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
        const game = await getGameById(id);
        if (!game) {
            throw new Error('Game not found');
        }
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
        const game = await getGameById(id);
        if (!game) {
            throw new Error('Game not found');
        }
        const query = 'UPDATE games SET size = ? WHERE id = ?';
        const result = await dbModule.run(query, [size, id]);
        if (result.changes === 0) {
            throw new Error('Game not found');
        }
        return result.changes;
    } catch (err) {
        throw new Error(`Error updating game size: ${err.message}`);
    }
}

async function updateGameStatus(id, status) {
    try {
        validateStatus(status);
        const game = await getGameById(id);
        if (!game) {
            throw new Error('Game not found');
        }
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
        const game = await getGameById(id);
        const winner = await playerQueries.getPlayerById(winnerId);
        if (!game) {
            throw new Error('Game not found');
        } else if (!winner) {
            throw new Error('Winner not found');
        }
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

async function updateGameSprint(id, sprint) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(id);
        if (!game) {
            throw new Error('Game not found');
        }
        const query = `
            UPDATE games
            SET sprint = ?
            WHERE id = ?;
        `;
        const result = await dbModule.run(query, [sprint, id]);
        if (result.changes === 0) {
            throw new Error('Game not found or player is not the creator.');
        }
        return result.changes;
    } catch (err) {
        throw new Error(`Error updating game sprint mode: ${err.message}`);
    }
}

async function updateGameParent(id, parentId) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(id);
        const parent = await getGameById(parentId);
        if (!game) {
            throw new Error('Game not found');
        } else if (!parent) {
            throw new Error('Parent game not found');
        }
        const query = 'UPDATE games SET parent_id = ? WHERE id = ?';
        const result = await dbModule.run(query, [parentId, id]);
        if (result.changes === 0) {
            throw new Error('Game not found');
        }
        return result.changes;
    } catch (err) {
        throw new Error(`Error updating game parent: ${err.message}`);
    }
}

async function updateGameRematcher(id, rematcherId) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(id);
        const rematcher = await playerQueries.getPlayerById(rematcherId);
        if (!game) {
            throw new Error('Game not found');
        } else if (!rematcher) {
            throw new Error('Rematcher not found');
        }
        const query = 'UPDATE games SET rematcher_id = ? WHERE id = ?';
        const result = await dbModule.run(query, [rematcherId, id]);
        if (result.changes === 0) {
            throw new Error('Game not found');
        }
        return result.changes;
    } catch (err) {
        throw new Error(`Error updating game rematcher: ${err.message}`);
    }
}

async function updateGameCreator(id, creatorId) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(id);
        const creator = await playerQueries.getPlayerById(creatorId);
        if (!game) {
            throw new Error('Game not found');
        } else if (!creator) {
            throw new Error('Creator not found');
        }
        const query = 'UPDATE games SET creator_id = ? WHERE id = ?';
        const result = await dbModule.run(query, [creatorId, id]);
        if (result.changes === 0) {
            throw new Error('Game not found');
        }
        return result.changes;
    } catch (err) {
        throw new Error(`Error updating game creator: ${err.message}`);
    }
}

// +----------------- GAME SCORES ------------------+

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
        const player = await playerQueries.getPlayerById(playerId);
        if (!player) {
            throw new Error('Player not found');
        }
        const query = 'SELECT * FROM game_scores WHERE player_id = ? ORDER BY score DESC;';
        const rows = await dbModule.all(query, [playerId]);
        return rows || [];
    } catch (err) {
        throw new Error(`Error getting scores for player ${playerId}: ${err.message}`);
    }
}

async function getGameScoresByGame(id) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(id);
        if (!game) {
            throw new Error('Game not found');
        }
        const query = 'SELECT * FROM game_scores WHERE game_id = ? ORDER BY score DESC;';
        const rows = await dbModule.all(query, [id]);
        return rows || [];
    } catch (err) {
        throw new Error(`Error getting scores for game ${id}: ${err.message}`);
    }
}

async function updateGameScore(gameId, playerId, score) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(gameId);
        const winner = await playerQueries.getPlayerById(playerId);
        if (!game) {
            throw new Error('Game not found');
        } else if (!winner) {
            throw new Error('Player not found');
        }
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


// +----------------- GAME PLAYERS -----------------+

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

// +----------------- GAME LOSERS ------------------+

async function getGameLosers() {
    try {
        const db = await dbModule.connect();
        const query = 'SELECT * FROM game_losers;';
        const rows = await dbModule.all(query);
        return rows || [];
    } catch (err) {
        throw new Error(`Error getting all game losers: ${err.message}`);
    }
}

async function getGameLosersByGame(id) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(id);
        if (!game) {
            throw new Error('Game not found');
        }
        const query = 'SELECT * FROM game_losers WHERE game_id = ?;';
        const rows = await dbModule.all(query, [id]);
        return rows || [];
    } catch (err) {
        throw new Error(`Error getting losers for game ${id}: ${err.message}`);
    }
}

async function updateGameLosers(gameId, playerId) {
    try {
        const db = await dbModule.connect();
        const game = await getGameById(gameId);
        const winner = await playerQueries.getPlayerById(playerId);
        if (!game) {
            throw new Error('Game not found');
        } else if (!winner) {
            throw new Error('Player not found');
        }
        const result = await dbModule.run(`INSERT INTO game_losers (game_id, player_id) VALUES (?, ?)`, [gameId, playerId]);
        if (result.changes === 0) {
            throw new Error('Game not found');
        }
        return result.lastID;
    } catch (err) {
        throw new Error(`Error updating game losers: ${err.message}`);
    }
}

// +-------------------- EXPORTS -------------------+ 

module.exports = {
    createGame,
    createGameScore,
    deleteGameById,
    deleteGameScore,
    getGameById,
    getGameByName,
    getGamePlayers,
    getGameScores,
    getGameScoresByPlayer,
    getGameScoresByGame,
    getGameScoreByGamePlayer,
    getGameLosers,
    getGameLosersByGame,
    getGameSprint,
    getGameParent,
    getWinner,
    getRematcher,
    updateGameName,
    updateGameMode,
    updateGameStatus,
    updateGameSize,
    updateGameWinner,
    updateGameLosers,
    updateGameScore,
    updateGameSprint,
    updateGameParent,
    updateGameRematcher,
    updateGameCreator,
    isGamePlayer,
    addPlayerToGame,
    removePlayerFromGame
};
