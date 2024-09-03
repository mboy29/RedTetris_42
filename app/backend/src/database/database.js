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
    return new Promise((resolve, reject) => {
        if (!db) {
            db = new sqlite3.Database('./redtetris.db', (err) => {
                if (err) {
                    console.error('[DATABASE] Could not connect to database:', err.message);
                    reject(err);
                } else {
                    console.log('[DATABASE] Connected to SQLite database');
                    resolve(db);
                }
            });
        } else {
            resolve(db);
        }
    });
}

function close() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('[DATABASE] Error closing the database:', err.message);
                    reject(err);
                } else {
                    console.log('[DATABASE] Closed the database connection.');
                    resolve();
                }
            });
            db = null;
        } else {
            resolve();
        }
    });
}

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this); // Returns the statement object with lastID and changes
            }
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}


// +-------------------- EXPORTS -------------------+ 

module.exports = {
    connect,
    close,
    run,
    get,
    all
};
