// +------------------------------------------------+
// |       REDTETRIS PIECES QUERY DATABASE JS       |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+
/*
    This module is designed to handle operations on 
    the `game_pieces` table in the SQLite database for 
    the RedTetris project. 

    This includes:
        - Adding a new game piece
        - Updating a game piece's position
        - Removing a game piece
*/

// +----------------- REQUIREMENTS -----------------+ 

const dbModule = require('../database');

// +------------------- FUNCTIONS ------------------+

async function updateGamePieces(gameId, type, position) {
    try {
        const db = await dbModule.connect();

        const queryCheckGame = 'SELECT 1 FROM games WHERE id = ?';
        const gameExists = await dbModule.get(queryCheckGame, [gameId]);
        if (!gameExists) {
            throw new Error(`Game with ID ${gameId} does not exist.`);
        }

        const queryCheckPosition = 'SELECT * FROM game_pieces WHERE game_id = ? AND position = ?';
        const existingPieceAtPosition = await dbModule.get(queryCheckPosition, [gameId, position]);
        if (existingPieceAtPosition) {
            throw new Error(`Piece already exists at position ${position}`);
        } else {
            const queryInsert = 'INSERT INTO game_pieces (game_id, type, position) VALUES (?, ?, ?)';
            const result = await dbModule.run(queryInsert, [gameId, type, position]);
            return result.lastID; 
        }
    } catch (err) {
        throw new Error(`Error updating game piece: ${err.message}`);
    }
}

async function getGamePieces(gameId) {
    try {
        const db = await dbModule.connect();
        const query = `
            SELECT *
            FROM game_pieces
            WHERE game_id = ?
            ORDER BY position;
        `;
        const rows = await dbModule.all(query, [gameId]);
        return rows || [];
    } catch (err) {
        throw new Error(`Error getting pieces for game ID ${gameId}: ${err.message}`);
    }
}

// +--------------------- EXPORT ---------------------+

module.exports = {
    updateGamePieces,
    getGamePieces
};