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

const db = require('./database').connect()

// +------------------- FUNCTIONS ------------------+


function init() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL CHECK(length(username) >= 4 AND length(username) <= 12) UNIQUE,
            socket TEXT,
            connect BOOLEAN NOT NULL,
            password TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('[DATABASE] Error creating table:', err.message);
            } else {
                console.log('[DATABASE] Table created or already exists.');
            }
        });
    });
}

// +-------------------- EXPORTS -------------------+ 

module.exports = {
    init
}