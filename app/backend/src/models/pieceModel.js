// +------------------------------------------------+
// |              REDTETRIS PIECE MODEL             |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines a `Piece` class that models 
    game pieces and provides methods for interacting
    with game piece data. 

    Methods include:
        - `getPiece`: retrieves the piece
        - `getType`: retrieves the piece type
        - `getGamePieces`: retrieves all pieces for a game
        - `updateGamePieces`: updates a game piece
*/

// +----------------- REQUIREMENTS -----------------+

const queries = require('../database/queries/piecesQueries');

// +--------------------- CLASS ---------------------+

const tetrominos = {
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    O: [
        [1, 1],
        [1, 1],
    ]
};


class Piece {
    
    constructor(type = null) {
        if (type) {
            this.setPiece(tetrominos[type], type);
        } else {
            const [piece, type] = this.randomPiece();
            this.setPiece(piece, type);
        }
    }

    randomPiece() {
        const pieces = Object.keys(tetrominos);
        const type = pieces[Math.floor(Math.random() * pieces.length)];
        const piece = tetrominos[type];
        return [piece, type];
    }

    setPiece(piece, type) { 
        this.piece = piece;
        this.type = type;
    }

    getPiece() { return this.piece; }
    getType() { return this.type; }

    static async getPieces(gameId) {
        const rows = await queries.getGamePieces(gameId);
        return rows || [];
    }

    static async updatPieces(gameId, type, position) {
        const result = await queries.updateGamePieces(gameId, type, position);
        return result.lastID; 
    }
}

// +--------------------- EXPORT ---------------------+

module.exports = Piece;
