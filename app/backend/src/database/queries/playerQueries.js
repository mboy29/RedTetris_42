// +------------------------------------------------+
// |       REDTETRIS PLAYER QUERY DATABASE JS       |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module is designed to handle operations on the `players` 
    table in the SQLite database for the RedTetris project. 

    This includes:
        - Creating a new player
        - Getting a player by ID or username
        - Getting all players
        - Updating a player's username, connection status, 
          or room name
        - Deleting a player by ID
*/

// +----------------- REQUIREMENTS -----------------+ 

const dbModule = require('../database');

// +------------------- FUNCTIONS ------------------+

async function createPlayer(username, connect, password) {
    try {
        const db = await dbModule.connect();
        const query = 'INSERT INTO players (username, connect, password) VALUES (?, ?, ?)';
        const result = await dbModule.run(query, [username, connect, password]);
        return result.lastID;
    } catch (err) {
        throw new Error(`Error creating player: ${err.message}`);
    }
}

async function deletePlayerById(id) {
    try {
        const db = await dbModule.connect();
        const queryGet = 'SELECT * FROM players WHERE id = ?';
        if (!await dbModule.get(queryGet, [id])) {
            throw new Error('Player not found');
        }
        const query = 'DELETE FROM players WHERE id = ?';
        const result = await dbModule.run(query, [id]);
        return result.changes; 
    } catch (err) {
        throw new Error(`Error deleting player by ID: ${err.message}`);
    }
}


async function getPlayerPassword(username) {
    try {
        const player = await getPlayerByUsername(username);
        if (player && player.password) {
            return player.password || null;
        } else {
            throw new Error('Player not found or password missing');
        }
    } catch (error) {
        throw new Error(`Error getting player password: ${error.message}`);
    }
}

async function getPlayerByUsername(username) {
    try {
        const db = await dbModule.connect();
        const query = 'SELECT * FROM players WHERE username = ?';
        const row = await dbModule.get(query, [username]);
        return row || null;
    } catch (err) {
        throw new Error(`Error getting player by username: ${err.message}`);
    }
}

async function getPlayerById(id) {
    try {
        const db = await dbModule.connect();
        const query = 'SELECT * FROM players WHERE id = ?';
        const row = await dbModule.get(query, [id]);
        return row || null;
    } catch (err) {
        throw new Error(`Error getting player by ID: ${err.message}`);
    }
}

async function getAllPlayers() {
    try {
        const db = await dbModule.connect();
        const query = 'SELECT * FROM players';
        const rows = await dbModule.all(query);
        return rows || [];
    } catch (err) {
        throw new Error(`Error getting all players: ${err.message}`);
    }
}

async function getPlayersScore() {
    try {
        const db = await dbModule.connect();
        const query = 'SELECT * FROM players ORDER BY score DESC';
        const rows = await dbModule.all(query);
        return rows || [];
    } catch (err) {
        throw new Error(`Error getting all players: ${err.message}`);
    }
}

async function updatePlayerUsername(id, username) {
    try {
        const db = await dbModule.connect();
        const queryGet = 'SELECT * FROM players WHERE id = ?';
        if (!await dbModule.get(queryGet, [id])) {
            throw new Error('Player not found');
        }
        const query = 'UPDATE players SET username = ? WHERE id = ?';
        const result = await dbModule.run(query, [username, id]);
        return result.changes; 
    } catch (err) {
        throw new Error(`Error updating player username: ${err.message}`);
    }
}

async function updatePlayerConnect(id, connect) {
    try {
        const db = await dbModule.connect();
        const queryGet = 'SELECT * FROM players WHERE id = ?';
        if (!await dbModule.get(queryGet, [id])) {
            throw new Error('Player not found');
        }
        const query = 'UPDATE players SET connect = ? WHERE id = ?';
        const result = await dbModule.run(query, [connect, id]);
        return result.changes; 
    } catch (err) {
        throw new Error(`Error updating player connect: ${err.message}`);
    }
}

async function updatePlayerRoomName(id, roomName) {
    try {
        const db = await dbModule.connect();
        const queryGet = 'SELECT * FROM players WHERE id = ?';
        if (!await dbModule.get(queryGet, [id])) {
            throw new Error('Player not found');
        }
        const query = 'UPDATE players SET roomName = ? WHERE id = ?';
        const result = await dbModule.run(query, [roomName, id]);
        return result.changes; 
    } catch (err) {
        throw new Error(`Error updating player roomName: ${err.message}`);
    }
}

async function updatePlayerScore(id, score) {
    try {
        const db = await dbModule.connect();
        const queryGet = 'SELECT * FROM players WHERE id = ?';
        if (!await dbModule.get(queryGet, [id])) {
            throw new Error('Player not found');
        }
        const query = 'UPDATE players SET score = ? WHERE id = ?';
        const result = await dbModule.run(query, [score, id]);
        return result.changes; 
    } catch (err) {
        throw new Error(`Error updating player score: ${err.message}`);
    }
}

// +-------------------- EXPORTS -------------------+ 

module.exports = {
    createPlayer,
    getPlayerPassword,
    getPlayerByUsername,
    getPlayerById,
    getAllPlayers,
    getPlayersScore,
    updatePlayerUsername,
    updatePlayerConnect,
    updatePlayerRoomName,
    updatePlayerScore,
    deletePlayerById
};
