// +------------------------------------------------+
// |            REDTETRIS PLAYER QUERIES TESTING    |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This test suite verifies the functionality of the
    player-related queries in the RedTetris project. 
    It includes tests for creating, retrieving, updating, 
    and deleting players in the SQLite database.

    Test Suites includes: Create, Delete, Getters
    & Updators.
*/

// +----------------- REQUIREMENTS -----------------+

const dbModule = require('@database/database'); 
const queries = require('@queries/playerQueries'); 
const { init } = require('@database/initDatabase'); 

// +-------------------- TESTS --------------------+

describe('Player Queries', () => {
    let db;

    beforeAll(async () => {
        db = await dbModule.connect();
        await init(); // Initialize the database schema
    });

    afterEach(async () => {
        await db.exec('DELETE FROM players');
    });

    afterAll(async () => {
        await dbModule.close();
    });


    describe('Initiation and Deletion', () => {
        describe('createPlayer', () => {
            it('should create a new player', async () => {
                const double = await queries.getPlayerByUsername('testuser');
                if (double) { 
                    await queries.deletePlayerById(double.id);
                }
                const playerId = await queries.createPlayer('testuser', true, 'hashedPassword');
                expect(playerId).toBeDefined();
                const player = await queries.getPlayerByUsername('testuser');
                expect(player).toEqual(expect.objectContaining({
                    username: 'testuser',
                    connect: 1,
                    password: 'hashedPassword'
                }));
                await queries.deletePlayerById(playerId);
            });
            it('should throw an error if player already exists', async () => {
                await queries.createPlayer('testuser', true, 'hashedPassword');
                await expect(queries.createPlayer('testuser', true, 'hashedPassword'))
                    .rejects.toThrow('Error creating player');
            });
    
            it('should throw an error if username is too short', async () => {
                await expect(queries.createPlayer('tes', true, 'hashedPassword'))
                    .rejects.toThrow('Error creating player');
            });
    
            it('should throw an error if username is too long', async () => {
                await expect(queries.createPlayer('test username', true, 'hashedPassword'))
                    .rejects.toThrow('Error creating player');
            });
        });

        describe('Delete', () => {
            describe('deletePlayerById', () => {
                it('should delete a player by ID', async () => {
                    const playerId = await queries.createPlayer('testuser', 'socket123', true, 'hashedPassword');
                    await queries.deletePlayerById(playerId);
                    const player = await queries.getPlayerByUsername('testuser');
                    expect(player).toBeNull();
                });

                it('should throw an error if player does not exist', async () => {
                    await expect(queries.deletePlayerById(999))
                        .rejects.toThrow('Error deleting player');
                });
            });
        });
    });

    describe('Getters', () => {
        describe('getPlayerPassword', () => {
            it('should get the password for a player', async () => {
                await queries.createPlayer('testuser', true, 'hashedPassword');
                const password = await queries.getPlayerPassword('testuser');
                expect(password).toBe('hashedPassword');
            });
    
            it('should throw an error if player not found', async () => {
                await expect(queries.getPlayerPassword('nonexistentuser'))
                    .rejects.toThrow('Player not found or password missing');
            });
        });
    
        describe('getPlayerByUsername', () => {
            it('should return a player by username', async () => {
                await queries.createPlayer('testuser', true, 'hashedPassword');
                const player = await queries.getPlayerByUsername('testuser');
                expect(player).toEqual(expect.objectContaining({
                    username: 'testuser',
                    connect: 1,
                    password: 'hashedPassword'
                }));
            });
    
            it('should return null if player does not exist', async () => {
                const player = await queries.getPlayerByUsername('nonexistentuser');
                expect(player).toBeNull();
            });
        });
    
        describe('getPlayerById', () => {
            it('should return a player by ID', async () => {
                const playerId = await queries.createPlayer('testuser', true, 'hashedPassword');
                const player = await queries.getPlayerById(playerId);
                expect(player).toEqual(expect.objectContaining({
                    id: playerId,
                    username: 'testuser',
                    connect: 1,
                    password: 'hashedPassword'
                }));
            });
    
            it('should return null if player does not exist', async () => {
                const player = await queries.getPlayerById('nonexistentSocket');
                expect(player).toBeNull();
            });
        });
    
        describe('getAllPlayers', () => {
            it('should return all players', async () => {
                await queries.createPlayer('testuser1', 'socket1', true, 'hashedPassword1');
                await queries.createPlayer('testuser2', 'socket2', false, 'hashedPassword2');
                const players = await queries.getAllPlayers();
                expect(players).toHaveLength(2);
                expect(players).toEqual(expect.arrayContaining([
                    expect.objectContaining({ username: 'testuser1' }),
                    expect.objectContaining({ username: 'testuser2' })
                ]));
            });
    
            it('should return an empty array if no players exist', async () => {
                const players = await queries.getAllPlayers();
                expect(players).toHaveLength(0);
            });
        });

        describe('getPlayersScore', () => {
            it('should return all players sorted by score', async () => {
                await queries.createPlayer('testuser1', 'socket1', true, 'hashedPassword1');
                await queries.createPlayer('testuser2', 'socket2', false, 'hashedPassword2');
                const players = await queries.getPlayersScore();
                expect(players).toHaveLength(2);
                expect(players).toEqual(expect.arrayContaining([
                    expect.objectContaining({ username: 'testuser1' }),
                    expect.objectContaining({ username: 'testuser2' })
                ]));
            });
    
            it('should return an empty array if no players exist', async () => {
                const players = await queries.getPlayersScore();
                expect(players).toHaveLength(0);
            });
        });
    });

    describe('Updators', () => {
        describe('updatePlayerUsername', () => {
            it('should update a player\'s username', async () => {
                const playerId = await queries.createPlayer('testuser', true, 'hashedPassword');
                await queries.updatePlayerUsername(playerId, 'newuser');
                const player = await queries.getPlayerById(playerId);
                expect(player).toEqual(expect.objectContaining({ username: 'newuser' }));
            });

            it('should throw an error if player does not exist', async () => {
                await expect(queries.updatePlayerUsername(999, 'newuser'))
                    .rejects.toThrow('Error updating player');
            });
        });

        describe('updatePlayerConnect', () => {
            it('should update a player\'s connect status', async () => {
                const playerId = await queries.createPlayer('testuser', true, 'hashedPassword');
                await queries.updatePlayerConnect(playerId, false);
                const player = await queries.getPlayerById(playerId);
                expect(player).toEqual(expect.objectContaining({ connect: 0 }));
            });

            it('should throw an error if player does not exist', async () => {
                await expect(queries.updatePlayerConnect(999, false))
                    .rejects.toThrow('Error updating player');
            });
        });

        describe('updatePlayerRoomName', () => {
            it('should update a player\'s room name', async () => {
                const playerId = await queries.createPlayer('testuser', true, 'hashedPassword');
                await queries.updatePlayerRoomName(playerId, 'room1');
                const player = await queries.getPlayerById(playerId);
                expect(player).toEqual(expect.objectContaining({ roomName: 'room1' }));
            });

            it('should throw an error if player does not exist', async () => {
                await expect(queries.updatePlayerRoomName(999, 'room1'))
                    .rejects.toThrow('Error updating player');
            });
        });

        describe('updatePlayerScore', () => {
            it('should update a player\'s score', async () => {
                const playerId = await queries.createPlayer('testuser', true, 'hashedPassword');
                await queries.updatePlayerScore(playerId, 100);
                const player = await queries.getPlayerById(playerId);
                expect(player).toEqual(expect.objectContaining({ score: 100 }));
            });

            it('should throw an error if player does not exist', async () => {
                await expect(queries.updatePlayerScore(999, 100))
                    .rejects.toThrow('Error updating player');
            });
        });
    });
});
