// +------------------------------------------------+
// |          REDTETRIS PIECE MODEL TESTING         |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This test suite is designed to test the `Piece`
    class methods and properties defined in the
    `pieceModel.js` module.

*/

// +----------------- REQUIREMENTS -----------------+

const Piece = require('@models/pieceModel'); // Adjust the path as necessary
const queries = require('@queries/gameQueries');

// +------------------- MOCKS ----------------------+

jest.mock('@queries/gameQueries');

// +-------------------- TESTS ----------------------+

describe('Piece Class', () => {
    let piece;

    beforeEach(() => {
        jest.clearAllMocks(); 
    });

    describe('Class Methods', () => {
        describe('Constructor', () => {
            it('should create a Piece with a specific type', () => {
                piece = new Piece('L');
                expect(piece.getType()).toBe('L');
                expect(piece.getPiece()).toEqual([
                    [null, null, 'L'],
                    ['L', 'L', 'L'],
                    [null, null, null],
                ]);
            });

            it('should create a random Piece when no type is provided', () => {
                piece = new Piece();
                expect(Object.keys(piece.getPiece())).toHaveLength(3); 
                expect(Object.values(piece.getPiece()).some(row => row.includes(null))).toBe(true); // Checks if some rows contain `null`
            });
        });

        describe('Setters and Getters', () => {
            it('should return the correct piece structure', () => {
                piece = new Piece('T');
                expect(piece.getPiece()).toEqual([
                    [null, 'T', null],
                    ['T', 'T', 'T'],
                    [null, null, null],
                ]);
            });

            it('should return the correct type', () => {
                piece = new Piece('Z');
                expect(piece.getType()).toBe('Z');
            });
        });

        describe('Static methods', () => {
            describe('getPieces', () => {
                it('should return an array of pieces for a given gameId', async () => {
                    const mockGameId = 1;
                    const mockRows = [
                        { id: 1, type: 'L', position: { x: 0, y: 0 } },
                        { id: 2, type: 'T', position: { x: 1, y: 1 } },
                    ];

                    queries.getGamePieces.mockResolvedValue(mockRows);

                    const pieces = await Piece.getPieces(mockGameId);
                    expect(pieces).toEqual(mockRows);
                    expect(queries.getGamePieces).toHaveBeenCalledWith(mockGameId);
                });

                it('should return an empty array if no pieces are found', async () => {
                    const mockGameId = 1;

                    queries.getGamePieces.mockResolvedValue(null); // Simulate no pieces found

                    const pieces = await Piece.getPieces(mockGameId);
                    expect(pieces).toEqual([]);
                    expect(queries.getGamePieces).toHaveBeenCalledWith(mockGameId);
                });
            });

            describe('updatePieces', () => {
                it('should update pieces and return the result', async () => {
                    const mockGameId = 1;
                    const mockType = 'L';
                    const mockPosition = { x: 0, y: 0 };

                    queries.updateGamePieces.mockResolvedValue(true); // Simulate successful update

                    const result = await Piece.updatPieces(mockGameId, mockType, mockPosition);
                    expect(result).toBe(true);
                    expect(queries.updateGamePieces).toHaveBeenCalledWith(mockGameId, mockType, mockPosition);
                });
            });
        });
    });
});