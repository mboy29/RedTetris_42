// +------------------------------------------------+
// |           REDTETRIS INIT DATABASE JS           |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module is designed to initialize the SQLite 
    database for the RedTetris project with the
    necessary tables. 

    This includes :
        - players
*/

// +----------------- REQUIREMENTS -----------------+ 

const dbModule = require('./database');

// +------------------- FUNCTIONS ------------------+


async function init() {
    try {
        const db = await dbModule.connect(); // Connect to the database

        await dbModule.run(`CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL CHECK(length(username) >= 4 AND length(username) <= 12) UNIQUE,
            socket TEXT,
            connect BOOLEAN NOT NULL,
            password TEXT NOT NULL
        )`);

        console.log('[DATABASE] Table created or already exists.');
    } catch (err) {
        console.error('[DATABASE] Error creating table:', err.message);
    }
}

// +-------------------- EXPORTS -------------------+ 

module.exports = {
    init
}