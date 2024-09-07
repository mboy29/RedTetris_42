// +------------------------------------------------+
// |       REDTETRIS GAME QUERY DATABASE JS         |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This test suite verifies the functionality of the
    game-related queries in the RedTetris project. 
    It includes tests for creating, retrieving, updating, 
    and deleting games in the SQLite database.

    Test Suites:

    1. Create Game:
       - Tests the ability to create a new game, including validation 
         for game mode and status.

    2. Delete Game:
       - Verifies that a game can be deleted by its ID, and handles 
         cases where the game does not exist.

    3. Update Game:
       - Ensures that a game's name, mode, and status can be updated correctly.

    4. Get Game By ID:
       - Verifies that a game can be retrieved by its ID and handles 
         cases where the game does not exist.

    5. Get Game By Name:
       - Ensures that a game can be retrieved by its name and handles 
         cases where the game does not exist.

    6. Get Game Players:
       - Validates that players associated with a game can be retrieved.

    7. Check Game Player:
       - Ensures that the system can check if a player is in a game.

    8. Add/Remove Player From Game:
       - Tests the ability to add and remove players from a game, 
         including handling cases where the player is already or not 
         in the game.
*/

// +----------------- REQUIREMENTS -----------------+

const dbModule = require('@database/database'); 
const queries = require('@queries/gameQueries');
const playerQueries = require('@queries/playerQueries');
const { init } = require('@database/initDatabase');

// +-------------------- TESTS --------------------+

describe('Player Queries', () => {
    let db;

    beforeAll(async () => {
        db = await dbModule.connect();
        await init();
    });

    afterEach(async () => {
        await db.exec('DELETE FROM games');
        await db.exec('DELETE FROM game_players');
        await db.exec('DELETE FROM players');
    });

    afterAll(async () => {
        await dbModule.close();
    });

    describe('createGame', () => {
        it('should create a new game', async () => {
            const gameId = await queries.createGame('Game 1', 'multiplayer', 1, 'pending');
            expect(gameId).toBeGreaterThan(0); 
        });

        it('should throw an error for an invalid mode', async () => {
            await expect(queries.createGame('Game 2', 'invalid', 1, 'pending')).rejects.toThrow();
        });

        it('should throw an error for an invalid status', async () => {
            await expect(queries.createGame('Game 3', 'multiplayer', 1, 'invalid')).rejects.toThrow();
        });
    });

    describe('deleteGameById', () => {
        it('should delete a game by ID', async () => {
            const gameId = await queries.createGame('Game 4', 'multiplayer', 1, 'pending');
            const result = await queries.deleteGameById(gameId); // Use the actual ID returned
            expect(result).toBe(1);
        });

        it('should throw an error for a non-existent game', async () => {
            await expect(queries.deleteGameById(999)).rejects.toThrow();
        });
    });

    describe('Updates', () => {
        describe('updateGameName', () => {
            it('should update a game\'s name successfully', async () => {
                const gameId = await queries.createGame('Old Game Name', 'multiplayer', 1, 'pending');
                expect(gameId).toBeGreaterThan(0);

                const changes = await queries.updateGameName(gameId, 'New Game Name');
                expect(changes).toBe(1); 

                const updatedGame = await queries.getGameById(gameId);
                expect(updatedGame).toEqual(expect.objectContaining({ name: 'New Game Name' }));
            });

            it('should throw an error if the game ID does not exist', async () => {
                await expect(queries.updateGameName(999, 'Non-Existent Game'))
                    .rejects.toThrow('Error updating game name');
            });
        });

        describe('updateGameMode', () => {
            it('should update a game\'s mode successfully', async () => {
                const gameId = await queries.createGame('Game 5', 'multiplayer', 1, 'pending');
                expect(gameId).toBeGreaterThan(0);

                const changes = await queries.updateGameMode(gameId, 'solo');
                expect(changes).toBe(1); 

                const updatedGame = await queries.getGameById(gameId);
                expect(updatedGame).toEqual(expect.objectContaining({ mode: 'solo' }));
            });

            it('should throw an error for an invalid mode', async () => {
                const gameId = await queries.createGame('Game 6', 'multiplayer', 1, 'pending');
                expect(gameId).toBeGreaterThan(0);

                await expect(queries.updateGameMode(gameId, 'invalid'))
                    .rejects.toThrow('Error updating game mode');
            });

            it('should throw an error if the game ID does not exist', async () => {
                await expect(queries.updateGameMode(999, 'singleplayer'))
                    .rejects.toThrow('Error updating game mode');
            });
        });

        describe('updateGameStatus', () => {
            it('should update a game\'s status successfully', async () => {
                const gameId = await queries.createGame('Game 7', 'multiplayer', 1, 'pending');
                expect(gameId).toBeGreaterThan(0);

                const changes = await queries.updateGameStatus(gameId, 'in progress');
                expect(changes).toBe(1); 

                const updatedGame = await queries.getGameById(gameId);
                expect(updatedGame).toEqual(expect.objectContaining({ status: 'in progress' }));
            });

            it('should throw an error for an invalid status', async () => {
                const gameId = await queries.createGame('Game 8', 'multiplayer', 1, 'pending');
                expect(gameId).toBeGreaterThan(0);

                await expect(queries.updateGameStatus(gameId, 'invalid'))
                    .rejects.toThrow('Error updating game status');
            });

            it('should throw an error if the game ID does not exist', async () => {
                await expect(queries.updateGameStatus(999, 'active'))
                    .rejects.toThrow('Error updating game status');
            });
        });
    });

    describe('Getters', () => {

        describe('getGameById', () => {
            it('should get a game by ID', async () => {
                const gameId = await queries.createGame('Game 9', 'multiplayer', 1, 'pending');
                const game = await queries.getGameById(gameId);
                expect(game).toEqual(expect.objectContaining({ id: gameId }));
            });

            it('should return null for a non-existent game', async () => {
                const game = await queries.getGameById(999);
                expect(game).toBeNull();
            });
        });

        describe('getGameByName', () => {
            it('should get a game by name', async () => {
                const gameId = await queries.createGame('Game 10', 'multiplayer', 1, 'pending');
                const game = await queries.getGameByName('Game 10');
                expect(game).toEqual(expect.objectContaining({ id: gameId }));
            });

            it('should return null for a non-existent game', async () => {
                const game = await queries.getGameByName('Non-Existent Game');
                expect(game).toBeNull();
            });
        });

    });

    describe('Game Players', () => {
        let gameId;
        let playerId1;
        let playerId2;
    
        beforeAll(async () => {
            gameId = await queries.createGame('Test Game', 'multiplayer', 1, 'pending');
            playerId1 = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
            playerId2 = await playerQueries.createPlayer('testuser2', true, 'testuser2password');
        });
    
        afterEach(async () => {
            await db.exec('DELETE FROM game_players');
        });
    
        describe('getGamePlayers', () => {
            it('should get players associated with a game', async () => {
                await queries.addPlayerToGame(gameId, playerId1);
                await queries.addPlayerToGame(gameId, playerId2);
    
                const players = await queries.getGamePlayers(gameId);
                expect(players).toEqual(expect.arrayContaining([
                    expect.objectContaining({ id: playerId1 }),
                    expect.objectContaining({ id: playerId2 })
                ]));
            });
    
            it('should return an empty array if no players are associated with a game', async () => {
                const players = await queries.getGamePlayers(gameId);
                expect(players).toEqual([]);
            });
        });
    
        describe('isGamePlayer', () => {
            it('should return true if the player is in the game', async () => {
                await queries.addPlayerToGame(gameId, playerId1);
    
                const result = await queries.isGamePlayer(gameId, playerId1);
                expect(result).toBe(true);
            });
    
            it('should return false if the player is not in the game', async () => {
                const result = await queries.isGamePlayer(gameId, playerId2);
                expect(result).toBe(false);
            });
        });
    
        describe('addPlayerToGame', () => {
            it('should add a player to a game', async () => {
                const result = await queries.addPlayerToGame(gameId, playerId1);
                expect(result).toBeGreaterThan(0);
            } );

            it('should throw an error if the player is already in the game', async () => {
                await queries.addPlayerToGame(gameId, playerId1);
                await expect(queries.addPlayerToGame(gameId, playerId1)).rejects.toThrow('Player is already in the game');
            });
        });

        describe('removePlayerFromGame', () => {
            it('should remove a player from a game', async () => {
                await queries.addPlayerToGame(gameId, playerId1);
                const result = await queries.removePlayerFromGame(gameId, playerId1);
                expect(result).toBe(1);
            });

            it('should throw an error if the player is not in the game', async () => {
                await expect(queries.removePlayerFromGame(gameId, playerId2)).rejects.toThrow('Player is not in the game');
            });

        });
    });
    
});
