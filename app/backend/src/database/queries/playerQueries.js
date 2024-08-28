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

const db = require('../database').connect();

// +------------------- FUNCTIONS ------------------+

async function createPlayer(username, socket, connect, password) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO players (username, socket, connect, password) VALUES (?, ?, ?, ?)';
        db.run(query, [username, socket, connect, password], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID); // Return the inserted ID
            }
        });
    });
}

async function getPlayerPassword(username) {
    return new Promise(async (resolve, reject) => {
        try {
            const player = await getPlayerByUsername(username);
            if (player && player.password) {
                resolve(player.password);
            } else {
                reject('Player not found or password missing');
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function getPlayerByUsername(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM players WHERE username = ?';
        db.get(query, [username], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function getPlayerBySocket(socket) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM players WHERE socket = ?';
        db.get(query, [socket], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function getAllPlayers() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM players';
        db.all(query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function updatePlayer(username, socket, connect) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE players SET socket = ?, connect = ? WHERE username = ?';
        db.run(query, [socket, connect, username], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

async function deletePlayerById(id) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM players WHERE id = ?';
        db.run(query, [id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
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
