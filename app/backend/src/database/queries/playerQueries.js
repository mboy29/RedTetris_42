// +------------------------------------------------+
// |       REDTETRIS PLAYER QUERY DATABASE JS       |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module is designed to handle operations on the `players` 
    table in the SQLite database for the RedTetris project. 

    This includes:
        - Creating a player
        - Finding a player by username
        - Finding a player by socket
        - Updating a player
        - Deleting a player by ID
*/

// +----------------- REQUIREMENTS -----------------+ 

const dbModule = require('../database');

// +------------------- FUNCTIONS ------------------+

async function createPlayer(username, socket, connect, password) {
    try {
        const db = await dbModule.connect();
        const query = 'INSERT INTO players (username, socket, connect, password) VALUES (?, ?, ?, ?)';
        const result = await dbModule.run(query, [username, socket, connect, password]);
        return result.lastID; // Return the inserted ID
    } catch (err) {
        throw new Error(`Error creating player: ${err.message}`);
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

async function getPlayerBySocket(socket) {
    try {
        const db = await dbModule.connect();
        const query = 'SELECT * FROM players WHERE socket = ?';
        const row = await dbModule.get(query, [socket]);
        return row || null;
    } catch (err) {
        throw new Error(`Error getting player by socket: ${err.message}`);
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

async function updatePlayer(username, socket, connect) {
    try {
        const db = await dbModule.connect();
        const player = await getPlayerByUsername(username);
        if (!player) {
            throw new Error('Player not found');
        }
        const query = 'UPDATE players SET socket = ?, connect = ? WHERE username = ?';
        const result = await dbModule.run(query, [socket, connect, username]);
        return result.changes; // Return the number of rows changed
    } catch (err) {
        throw new Error(`Error updating player: ${err.message}`);
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

// +-------------------- EXPORTS -------------------+ 

module.exports = {
    createPlayer,
    getPlayerPassword,
    getPlayerByUsername,
    getPlayerBySocket,
    getAllPlayers,
    updatePlayer,
    deletePlayerById
};
