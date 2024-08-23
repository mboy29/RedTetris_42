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
            name TEXT NOT NULL,
            socket TEXT,
            game TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Table created or already exists.');
            }
        });
    });
}

// +-------------------- EXPORTS -------------------+ 

module.exports = {
    init
}