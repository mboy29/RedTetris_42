// +------------------------------------------------+
// |             REDTETRIS PIECES MODEL             |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Piece` class for managing
    tetromino pieces in the RedTetris game. The class
    provides methods to handle piece-related data and
    interactions, such as creation, retrieval, updating,
    and deletion of piece records.

    The `Piece` class includes:
        - constructor: initializes a new piece
        - `randomPiece`: generates a random tetromino piece
        - `setPiece`: sets the current piece
        - `getPiece`: gets the current piece
*/

// +----------------- REQUIREMENTS -----------------+ 

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
    
    constructor() {
        this.setPiece(this.randomPiece());
    }

    randomPiece() {
        const pieces = Object.keys(tetrominos);
        const piece = pieces[Math.floor(Math.random() * pieces.length)];
        return tetrominos[piece];
    }

    setPiece(piece) {
        this.piece = piece;
    }

    getPiece() {
        return this.piece;
    }
}