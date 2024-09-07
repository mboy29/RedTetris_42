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
        - games
        - game_players (to link players to games)
*/

// +----------------- REQUIREMENTS -----------------+ 

const dbModule = require('./database');

// +------------------- FUNCTIONS ------------------+

async function initPlayer() {
    try {
        const db = await dbModule.connect();

        await dbModule.run(`CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL CHECK(length(username) >= 4 AND length(username) <= 12) UNIQUE,
            roomName TEXT,
            connect BOOLEAN NOT NULL,
            password TEXT NOT NULL
        )`);
        console.log('[DATABASE] Players table created or already exists.');
    } catch (err) {
        console.error('[DATABASE] Error creating players table:', err.message);
    }
}

async function initGame() {
    try {
        const db = await dbModule.connect();

        await dbModule.run(`CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL CHECK(length(name) >= 1),
            status TEXT NOT NULL CHECK(status IN ('pending', 'in progress', 'finished')),
            mode TEXT NOT NULL CHECK(mode IN ('solo', 'multiplayer')),
            creator_id INTEGER NOT NULL,
            FOREIGN KEY (creator_id) REFERENCES players(id)
        )`);

        console.log('[DATABASE] Games table created or already exists.');
    } catch (err) {
        console.error('[DATABASE] Error creating games table:', err.message);
    }
}


async function initGamePlayers() {
    try {
        const db = await dbModule.connect();

        await dbModule.run(`CREATE TABLE IF NOT EXISTS game_players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER NOT NULL,
            player_id INTEGER NOT NULL,
            FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        )`);

        console.log('[DATABASE] Game Players table created or already exists.');
    } catch (err) {
        console.error('[DATABASE] Error creating game_players table:', err.message);
    }
}

async function init() {
    try {
        await initPlayer();
        await initGame();
        await initGamePlayers();
    } catch (err) {
        console.error('[DATABASE] Error initializing database:', err.message);
    }
}

// +-------------------- EXPORTS -------------------+ 

module.exports = {
    init
};
