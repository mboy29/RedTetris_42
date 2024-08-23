// +------------------------------------------------+
// |             REDTETRIS DATABASE JS              |
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

const sqlite3 = require('sqlite3').verbose();

// +------------------- FUNCTIONS ------------------+

let db = null;

function connect() {
    if (!db) {
        db = new sqlite3.Database('./redtetris.db', (err) => {
            if (err) {
                console.error('Could not connect to database:', err.message);
            } else {
                console.log('Connected to SQLite database');
                // Optionally, you can initialize tables here if needed
            }
        });
    }
    return db;
}

function close() {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err.message);
            } else {
                console.log('Closed the database connection.');
            }
        });
        db = null;
    }
}

// +-------------------- EXPORTS -------------------+ 

module.exports = {
    connect,
    close
}