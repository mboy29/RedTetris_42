// +------------------------------------------------+
// |           REDTETRIS INIT DATABASE TESTING      |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This test suite verifies the functionality of the
    InitDatabase module in the RedTetris project. It
    specifically tests whether the `players` table is
    correctly created if it does not already exist in
    the SQLite database.

    1. Table Creation:
       - Verifies that the `players` table is created when 
         the `init` function is called, ensuring that it does 
         not already exist in the database.

    This suite is crucial for confirming that the database 
    initialization logic is working as expected and that 
    the required database schema is set up correctly.
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

    afterAll(async () => {
        await dbModule.close();
    });

    beforeEach(async () => {
        await new Promise((resolve, reject) => {
            db.run('DROP TABLE IF EXISTS players', [], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });

    // +--------------------- TEST CASE ---------------------+

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
