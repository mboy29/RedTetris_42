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
        [null, null, 'L'],
        ['L', 'L', 'L'],
        [null, null, null],
    ],
    I: [
        [null, null, null, null],
        ['I', 'I', 'I', 'I'],
        [null, null, null, null],
        [null, null, null, null],
    ],
    J: [
        ['J', null, null],
        ['J', 'J', 'J'],
        [null, null, null],
    ],
    S: [
        [null, 'S', 'S'],
        ['S', 'S', null],
        [null, null, null],
    ],
    Z: [
        ['Z', 'Z', null],
        [null, 'Z', 'Z'],
        [null, null, null],
    ],
    T: [
        [null, 'T', null],
        ['T', 'T', 'T'],
        [null, null, null],
    ],
    O: [
        ['O', 'O'],
        ['O', 'O'],
    ],
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
