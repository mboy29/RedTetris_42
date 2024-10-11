// +------------------------------------------------+
// |           REDTETRIS INIT DATABASE TESTING      |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+
/*
    This test suite verifies the functionality of the
    InitDatabase module in the RedTetris project. It
    specifically tests whether the necessary tables are
    correctly created if they do not already exist in
    the SQLite database.
*/

// +----------------- REQUIREMENTS -----------------+

const dbModule = require('@database/database');
const initDb = require('@database/initDatabase');

// +-------------------- TESTS --------------------+

describe('InitDatabase Module', () => {
    let db;

    // +----------------- SETUP & TEARDOWN -----------------+

    beforeAll(async () => {
        db = await dbModule.connect();
    });

    // +--------------------- TEST CASES ---------------------+

    describe('Players Table', () => {
        test('should create the players table if it does not exist', async () => {
            await initDb.init();

            const tableExists = await new Promise((resolve, reject) => {
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='players'", [], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row !== undefined);
                    }
                });
            });

            expect(tableExists).toBe(true);
        });
    });

    describe('Games Table', () => {
        test('should create the games table if it does not exist', async () => {
            await initDb.init();

            const tableExists = await new Promise((resolve, reject) => {
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='games'", [], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row !== undefined);
                    }
                });
            });

            expect(tableExists).toBe(true);
        });
    });

    describe('Game Players Table', () => {
        test('should create the game_players table if it does not exist', async () => {
            await initDb.init();

            const tableExists = await new Promise((resolve, reject) => {
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='game_players'", [], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row !== undefined);
                    }
                });
            });

            expect(tableExists).toBe(true);
        });
    });

    describe('Game Pieces Table', () => {
        test('should create the game_pieces table if it does not exist', async () => {
            await initDb.init();

            const tableExists = await new Promise((resolve, reject) => {
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='game_pieces'", [], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row !== undefined);
                    }
                });
            });

            expect(tableExists).toBe(true);
        });
    });

    describe('Game Scores Table', () => {
        test('should create the game_scores table if it does not exist', async () => {
            await initDb.init();

            const tableExists = await new Promise((resolve, reject) => {
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='game_scores'", [], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row !== undefined);
                    }
                });
            });

            expect(tableExists).toBe(true);
        });
    });

    describe('Game Losers Table', () => {
        test('should create the game_losers table if it does not exist', async () => {
            await initDb.init();

            const tableExists = await new Promise((resolve, reject) => {
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='game_losers'", [], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row !== undefined);
                    }
                });
            });

            expect(tableExists).toBe(true);
        });
    });
});
