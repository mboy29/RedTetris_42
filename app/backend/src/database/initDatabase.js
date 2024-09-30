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
        - game_pieces (to store game pieces)
        - scores (to store player scores)
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
            password TEXT NOT NULL,
            score INTEGER DEFAULT 0
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
            size INTEGER NOT NULL CHECK(size >= 1 AND size <= 4),
            winner INTEGER DEFAULT NULL,
            losers INTEGER DEFAULT 0,
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

async function initGamePieces() {
    try {
        const db = await dbModule.connect();

        await dbModule.run(`CREATE TABLE IF NOT EXISTS game_pieces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('I', 'J', 'L', 'O', 'S', 'T', 'Z')),
            position INTEGER NOT NULL, 
            FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
        )`);

        console.log('[DATABASE] Game Pieces table created or already exists.');
    } catch (err) {
        console.error('[DATABASE] Error creating game_pieces table:', err.message);
    }
}

async function initGameScores() {
    try {
        const db = await dbModule.connect();

        await dbModule.run(`CREATE TABLE IF NOT EXISTS game_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER NOT NULL,
            player_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        )`);

        console.log('[DATABASE] Game Scores table created or already exists.');
    } catch (err) {
        console.error('[DATABASE] Error creating scores table:', err.message);
    }
}


async function init() {
    try {
        await initPlayer();
        await initGame();
        await initGamePlayers();
        await initGamePieces();
        await initGameScores();
    } catch (err) {
        console.error('[DATABASE] Error initializing database:', err.message);
    }
}

// +-------------------- EXPORTS -------------------+ 

module.exports = {
    init
};
