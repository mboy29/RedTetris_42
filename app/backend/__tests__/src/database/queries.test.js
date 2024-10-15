// +------------------------------------------------+
// |         REDTETRIS PLAYER QUERIES TESTING       |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This test suite verifies the functionality of the
    queries related to players and games in the 
    RedTetris.

    Test Suites includes: Player Queries such as
    Initiation and Deletion, Getters, Updators,
    Game Queries such as Initiation and Deletion,
*/

// +----------------- REQUIREMENTS -----------------+

const dbModule = require('@database/database'); 
const gameQueries = require('@queries/gameQueries');
const playerQueries = require('@queries/playerQueries'); 
const { init } = require('@database/initDatabase'); 

// +-------------------- TESTS --------------------+

describe('Queries', () => {
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


    describe('Player Queries', () => {
        describe('Initiation and Deletion', () => {
            describe('createPlayer', () => {
                it('should create a new player', async () => {
                    const playerId = await playerQueries.createPlayer('testuser', true, 'hashedPassword');
                    const player = await playerQueries.getPlayerById(playerId);
                    expect(player).toEqual(expect.objectContaining({
                        id: playerId,
                        username: 'testuser',
                        connect: 1,
                        password: 'hashedPassword'
                    }));
                });
            });

            describe('deletePlayerById', () => {
                it('should delete a player by ID', async () => {
                    const playerId = await playerQueries.createPlayer('testuser', true, 'hashedPassword');
                    const result = await playerQueries.deletePlayerById(playerId);
                    expect(result).toBe(1);
                });
            });
        });

        describe('Getters', () => {
            describe('getPlayerPassword', () => {
                it('should get the password for a player', async () => {
                    await playerQueries.createPlayer('testuser', true, 'hashedPassword');
                    const password = await playerQueries.getPlayerPassword('testuser');
                    expect(password).toBe('hashedPassword');
                });
        
                it('should throw an error if player not found', async () => {
                    await expect(playerQueries.getPlayerPassword('nonexistentuser'))
                        .rejects.toThrow('Player not found or password missing');
                });
            });
        
            describe('getPlayerByUsername', () => {
                it('should return a player by username', async () => {
                    await playerQueries.createPlayer('testuser', true, 'hashedPassword');
                    const player = await playerQueries.getPlayerByUsername('testuser');
                    expect(player).toEqual(expect.objectContaining({
                        username: 'testuser',
                        connect: 1,
                        password: 'hashedPassword'
                    }));
                });
        
                it('should return null if player does not exist', async () => {
                    const player = await playerQueries.getPlayerByUsername('nonexistentuser');
                    expect(player).toBeNull();
                });
            });
        
            describe('getPlayerById', () => {
                it('should return a player by ID', async () => {
                    const playerId = await playerQueries.createPlayer('testuser', true, 'hashedPassword');
                    const player = await playerQueries.getPlayerById(playerId);
                    expect(player).toEqual(expect.objectContaining({
                        id: playerId,
                        username: 'testuser',
                        connect: 1,
                        password: 'hashedPassword'
                    }));
                });
        
                it('should return null if player does not exist', async () => {
                    const player = await playerQueries.getPlayerById('nonexistentSocket');
                    expect(player).toBeNull();
                });
            });
        
            describe('getAllPlayers', () => {
                it('should return all players', async () => {
                    await playerQueries.createPlayer('testuser1', 'socket1', true, 'hashedPassword1');
                    await playerQueries.createPlayer('testuser2', 'socket2', false, 'hashedPassword2');
                    const players = await playerQueries.getAllPlayers();
                    expect(players).toHaveLength(2);
                    expect(players).toEqual(expect.arrayContaining([
                        expect.objectContaining({ username: 'testuser1' }),
                        expect.objectContaining({ username: 'testuser2' })
                    ]));
                });
        
                it('should return an empty array if no players exist', async () => {
                    const players = await playerQueries.getAllPlayers();
                    expect(players).toHaveLength(0);
                });
            });

            describe('getPlayersScore', () => {
                it('should return all players sorted by score', async () => {
                    await playerQueries.createPlayer('testuser1', 'socket1', true, 'hashedPassword1');
                    await playerQueries.createPlayer('testuser2', 'socket2', false, 'hashedPassword2');
                    const players = await playerQueries.getPlayersScore();
                    expect(players).toHaveLength(2);
                    expect(players).toEqual(expect.arrayContaining([
                        expect.objectContaining({ username: 'testuser1' }),
                        expect.objectContaining({ username: 'testuser2' })
                    ]));
                });
        
                it('should return an empty array if no players exist', async () => {
                    const players = await playerQueries.getPlayersScore();
                    expect(players).toHaveLength(0);
                });
            });
        });

        describe('Updators', () => {
            describe('updatePlayerUsername', () => {
                it('should update a player\'s username', async () => {
                    const playerId = await playerQueries.createPlayer('testuser', true, 'hashedPassword');
                    await playerQueries.updatePlayerUsername(playerId, 'newuser');
                    const player = await playerQueries.getPlayerById(playerId);
                    expect(player).toEqual(expect.objectContaining({ username: 'newuser' }));
                });

                it('should throw an error if player does not exist', async () => {
                    await expect(playerQueries.updatePlayerUsername(999, 'newuser'))
                        .rejects.toThrow('Error updating player');
                });
            });

            describe('updatePlayerConnect', () => {
                it('should update a player\'s connect status', async () => {
                    const playerId = await playerQueries.createPlayer('testuser', true, 'hashedPassword');
                    await playerQueries.updatePlayerConnect(playerId, false);
                    const player = await playerQueries.getPlayerById(playerId);
                    expect(player).toEqual(expect.objectContaining({ connect: 0 }));
                });

                it('should throw an error if player does not exist', async () => {
                    await expect(playerQueries.updatePlayerConnect(999, false))
                        .rejects.toThrow('Error updating player');
                });
            });

            describe('updatePlayerRoomName', () => {
                it('should update a player\'s room name', async () => {
                    const playerId = await playerQueries.createPlayer('testuser', true, 'hashedPassword');
                    await playerQueries.updatePlayerRoomName(playerId, 'room1');
                    const player = await playerQueries.getPlayerById(playerId);
                    expect(player).toEqual(expect.objectContaining({ roomName: 'room1' }));
                });

                it('should throw an error if player does not exist', async () => {
                    await expect(playerQueries.updatePlayerRoomName(999, 'room1'))
                        .rejects.toThrow('Error updating player');
                });
            });

            describe('updatePlayerScore', () => {
                it('should update a player\'s score', async () => {
                    const playerId = await playerQueries.createPlayer('testuser', true, 'hashedPassword');
                    await playerQueries.updatePlayerScore(playerId, 100);
                    const player = await playerQueries.getPlayerById(playerId);
                    expect(player).toEqual(expect.objectContaining({ score: 100 }));
                });

                it('should throw an error if player does not exist', async () => {
                    await expect(playerQueries.updatePlayerScore(999, 100))
                        .rejects.toThrow('Error updating player');
                });
            });
        });
    });

    describe('Game Queries', () => {
        describe('Initiation and Deletion', () => {
            describe('createGame', () => {
                it('should create a new game with default size and no parent', async () => {
                    const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending', 1);
                    expect(gameId).toBeGreaterThan(0);
                });
            
                it('should create a new game with a specified parent and size', async () => {
                    const gameId = await gameQueries.createGame('Game 2', 'multiplayer', 1, 'pending', 2, 10, 1);
                    expect(gameId).toBeGreaterThan(0);
                });
            
                it('should throw an error for an invalid mode', async () => {
                    await expect(gameQueries.createGame('Game 3', 'invalid_mode', 1, 'pending', 1)).rejects.toThrow();
                });
            
                it('should throw an error for an invalid status', async () => {
                    await expect(gameQueries.createGame('Game 4', 'multiplayer', 1, 'invalid_status', 1)).rejects.toThrow();
                });
            
                it('should throw an error for a negative size value', async () => {
                    await expect(gameQueries.createGame('Game 6', 'multiplayer', 1, 'pending', 1, null, -5)).rejects.toThrow();
                });
            
                it('should create a game with a null parent ID', async () => {
                    const gameId = await gameQueries.createGame('Game 7', 'multiplayer', 1, 'pending', 1, null);
                    expect(gameId).toBeGreaterThan(0);
                });
            
                it('should create a game with a specific parent ID', async () => {
                    const parentGameId = await gameQueries.createGame('Parent Game', 'multiplayer', 1, 'pending', 1);
                    const childGameId = await gameQueries.createGame('Child Game', 'multiplayer', 1, 'pending', 2, parentGameId);
                    expect(childGameId).toBeGreaterThan(0);
                });
            });
            
            describe('deleteGameById', () => {
                it('should delete a game by ID', async () => {
                    const gameId = await gameQueries.createGame('Game 4', 'multiplayer', 1, 'pending');
                    const result = await gameQueries.deleteGameById(gameId); // Use the actual ID returned
                    expect(result).toBeGreaterThan(0);
                });
    
                it('should throw an error for a non-existent game', async () => {
                    await expect(gameQueries.deleteGameById(999)).rejects.toThrow();
                });
            });
        });
    
        describe('Getters', () => {
            describe('Games', () => {
                describe('getGameById', () => {
                    it('should get a game by ID', async () => {
                        const gameId = await gameQueries.createGame('Game 9', 'multiplayer', 1, 'pending');
                        const game = await gameQueries.getGameById(gameId);
                        expect(game).toEqual(expect.objectContaining({ id: gameId }));
                    });
    
                    it('should return null for a non-existent game', async () => {
                        const game = await gameQueries.getGameById(999);
                        expect(game).toBeNull();
                    });
                });
    
                describe('getGameByName', () => {
                    it('should get a game by name', async () => {
                        const gameId = await gameQueries.createGame('Game 10', 'multiplayer', 1, 'pending');
                        const game = await gameQueries.getGameByName('Game 10');
                        expect(game).toEqual(expect.objectContaining({ id: gameId }));
                    });
    
                    it('should return null for a non-existent game', async () => {
                        const game = await gameQueries.getGameByName('Non-Existent Game');
                        expect(game).toBeNull();
                    });
                });
    
                describe('getGameSprint', () => {
                    it('should get a game\'s sprint mode', async () => {
                        const gameId = await gameQueries.createGame('Game 11', 'multiplayer', 1, 'pending');
                        const sprint = await gameQueries.getGameSprint(gameId);
                        expect(sprint).toBe(null);
                    });
    
                    it('should throw an error if the game ID does not exist', async () => {
                        await expect(gameQueries.getGameSprint(999)).rejects.toThrow('Error getting game sprint');
                    });
                });
    
                describe('getGameParent', () => {
                    it('should get a game by parent ID', async () => {
                        const parentGameId = await gameQueries.createGame('Parent Game', 'multiplayer', 1, 'pending');
                        const gameId = await gameQueries.createGame('Child Game', 'multiplayer', 1, 'pending', 2, parentGameId);
                        const parentGame = await gameQueries.getGameParent(gameId);
                        expect(parentGame).toEqual(expect.objectContaining({ id: parentGameId }));
                    });
    
                    it('should return null if the game has no parent', async () => {
                        const gameId = await gameQueries.createGame('Game 12', 'multiplayer', 1, 'pending');
                        const parentGame = await gameQueries.getGameParent(gameId);
                        expect(parentGame).toBeNull();
                    });
                });
    
                describe('getWinner', () => {
                    it('should get the winner of a game', async () => {
                        const gameId = await gameQueries.createGame('Game 12', 'multiplayer', 1, 'pending');
                        const playerId = await playerQueries.createPlayer('testuser', true, 'testuserpassword');
                        await gameQueries.updateGameWinner(gameId, playerId);
                        const winner = await gameQueries.getWinner(gameId);
                        expect(winner).toEqual(playerId);
                    });
    
                    it('should return null if there is no winner', async () => {
                        const gameId = await gameQueries.createGame('Game 13', 'multiplayer', 1, 'pending');
                        const winner = await gameQueries.getWinner(gameId);
                        expect(winner).toBeNull();
                    });
                });
    
                describe('getRematcher', () => {
                    it('should get the rematcher of a game', async () => {
                        const gameId = await gameQueries.createGame('Game 12', 'multiplayer', 1, 'pending');
                        const playerId = await playerQueries.createPlayer('testuser', true, 'testuserpassword');
                        await gameQueries.updateGameRematcher(gameId, playerId);
                        const rematcher = await gameQueries.getRematcher(gameId);
                        expect(rematcher).toEqual(playerId);
                    });
    
                    it('should return null if there is no rematcher', async () => {
                        const gameId = await gameQueries.createGame('Game 13', 'multiplayer', 1, 'pending');
                        const rematcher = await gameQueries.getRematcher(gameId);
                        expect(rematcher).toBeNull();
                    });
                });
    
            });
    
            describe('Updators', () => {
                describe('updateGameName', () => {
                    it('should update a game\'s name successfully', async () => {
                        const gameId = await gameQueries.createGame('TestGame', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
        
                        const changes = await gameQueries.updateGameName(gameId, 'NewTestGame');
                        expect(changes).toBeGreaterThan(0);
        
                        const updatedGame = await gameQueries.getGameById(gameId);
                        expect(updatedGame).toEqual(expect.objectContaining({ name: 'NewTestGame' }));
                    });
        
                    it('should throw an error if the game ID does not exist', async () => {
                        await expect(gameQueries.updateGameName(999, 'Non-Existent Game'))
                            .rejects.toThrow('Error updating game name');
                    });
                });
        
                describe('updateGameMode', () => {
                    it('should update a game\'s mode successfully', async () => {
                        const gameId = await gameQueries.createGame('Game 5', 'training', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
        
                        const changes = await gameQueries.updateGameMode(gameId, 'solo');
                        expect(changes).toBeGreaterThan(0);
        
                        const updatedGame = await gameQueries.getGameById(gameId);
                        expect(updatedGame).toEqual(expect.objectContaining({ mode: 'solo' }));
                    });
        
                    it('should throw an error for an invalid mode', async () => {
                        const gameId = await gameQueries.createGame('Game 6', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
        
                        await expect(gameQueries.updateGameMode(gameId, 'invalid'))
                            .rejects.toThrow('Error updating game mode');
                    });
        
                    it('should throw an error if the game ID does not exist', async () => {
                        await expect(gameQueries.updateGameMode(999, 'multiplayer'))
                            .rejects.toThrow('Error updating game mode');
                    });
                });
        
                describe('updateGameSize', () => {
                    it('should update a game\'s size successfully', async () => {
                        const gameId = await gameQueries.createGame('Game 7', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
        
                        const changes = await gameQueries.updateGameSize(gameId, 3);
                        expect(changes).toBeGreaterThan(0);
                    });
        
                    it('should thrown error as size is negative', async () => {
                        const gameId = await gameQueries.createGame('Game 8', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
        
                        await expect(gameQueries.updateGameSize(gameId, -3))
                            .rejects.toThrow('Error updating game size');
                    });
        
                    it('should thrown error as supirior to 4', async () => {
                        const gameId = await gameQueries.createGame('Game 9', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
        
                        await expect(gameQueries.updateGameSize(gameId, 5))
                            .rejects.toThrow('Error updating game size');
                    });
                });
        
                describe('updateGameStatus', () => {
                    it('should update a game\'s status successfully', async () => {
                        const gameId = await gameQueries.createGame('Game 7', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
        
                        const changes = await gameQueries.updateGameStatus(gameId, 'in progress');
                        expect(changes).toBeGreaterThan(0);
        
                        const updatedGame = await gameQueries.getGameById(gameId);
                        expect(updatedGame).toEqual(expect.objectContaining({ status: 'in progress' }));
                    });
        
                    it('should throw an error for an invalid status', async () => {
                        const gameId = await gameQueries.createGame('Game 8', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
        
                        await expect(gameQueries.updateGameStatus(gameId, 'invalid'))
                            .rejects.toThrow('Error updating game status');
                    });
        
                    it('should throw an error if the game ID does not exist', async () => {
                        await expect(gameQueries.updateGameStatus(999, 'active'))
                            .rejects.toThrow('Error updating game status');
                    });
                });
        
                describe('updateGameWinner', () => {
                    it('should update a game\'s winner successfully', async () => {
                        const gameId = await gameQueries.createGame('Game 9', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
                
                        const playerId = await playerQueries.createPlayer('testuser', true, 'testuserpassword');
                        expect(playerId).toBeGreaterThan(0);
                
                        const changes = await gameQueries.updateGameWinner(gameId, playerId);
                        expect(changes).toBeGreaterThan(0); // Only one row should be updated
                
                        const updatedGame = await gameQueries.getGameById(gameId);
                        expect(updatedGame).toHaveProperty('winner_id', playerId); // Verify winner_id matches playerId
                    });
                
                    it('should throw an error if the game ID does not exist', async () => {
                        const playerId = await playerQueries.createPlayer('testuser', true, 'testuserpassword');
                        expect(playerId).toBeGreaterThan(0);
                
                        await expect(gameQueries.updateGameWinner(999, playerId))
                            .rejects.toThrow('Error updating game winner');
                    });
                });  
                
                describe('updateGameSprint', () => {
                    it('should update a game\'s sprint successfully', async () => {
                        const gameId = await gameQueries.createGame('Game 10', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
                
                        const changes = await gameQueries.updateGameSprint(gameId, true);
                        expect(changes).toBeGreaterThan(0);
                
                        const updatedGame = await gameQueries.getGameById(gameId);
                        
                        expect(updatedGame).toEqual(expect.objectContaining({ sprint: 1 }));
                    });
        
                    it('should throw an error if the game ID does not exist', async () => {
                        await expect(gameQueries.updateGameSprint(999, true)).rejects.toThrow('Error updating game sprint');
                    });
                });
        
                describe('updateGameParent', () => {
                    it('should update a game\'s parent successfully', async () => {
                        const parentGameId = await gameQueries.createGame('Parent Game', 'multiplayer', 1, 'pending');
                        const gameId = await gameQueries.createGame('Child Game', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
                        
                        const changes = await gameQueries.updateGameParent(gameId, parentGameId);
                        expect(changes).toBeGreaterThan(0);
        
                        const updatedGame = await gameQueries.getGameById(gameId);
                        expect(updatedGame).toEqual(expect.objectContaining({ parent_id: parentGameId }));
                    });
        
                    it('should throw an error if the game ID does not exist', async () => {
                        const parentGameId = await gameQueries.createGame('Parent Game', 'multiplayer', 1, 'pending');
                        await expect(gameQueries.updateGameParent(999, parentGameId)).rejects.toThrow('Error updating game parent');
                    });
        
                    it('should throw an error if the parent ID does not exist', async () => {
                        const gameId = await gameQueries.createGame('Child Game', 'multiplayer', 1, 'pending');
                        await expect(gameQueries.updateGameParent(gameId, 999)).rejects.toThrow('Error updating game parent');
                    });
                });
        
                describe('updateGameRematcher', () => {
                    it('should update a game\'s rematcher successfully', async () => {
                        const gameId = await gameQueries.createGame('Game 10', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
        
                        const playerId = await playerQueries.createPlayer('testuser', true, 'testuserpassword');
                        expect(playerId).toBeGreaterThan(0);
        
                        const changes = await gameQueries.updateGameRematcher(gameId, playerId);
                        expect(changes).toBeGreaterThan(0);
        
                        const updatedGame = await gameQueries.getGameById(gameId);
                        expect(updatedGame).toEqual(expect.objectContaining({ rematcher_id: playerId }));
                    });
        
                    it('should throw an error if the game ID does not exist', async () => {
                        const playerId = await playerQueries.createPlayer('testuser', true, 'testuserpassword');
                        expect(playerId).toBeGreaterThan(0);
        
                        await expect(gameQueries.updateGameRematcher(999, playerId)).rejects.toThrow('Error updating game rematcher');
                    });
        
                    it('should throw an error if the rematcher ID does not exist', async () => {
                        const gameId = await gameQueries.createGame('Game 11', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
        
                        await expect(gameQueries.updateGameRematcher(gameId, 999)).rejects.toThrow('Error updating game rematcher');
                    });
                });
        
                describe('updateGameCreator', () => {
                    it('should update a game\'s creator successfully', async () => {
                        const gameId = await gameQueries.createGame('Game 10', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
        
                        const playerId = await playerQueries.createPlayer('testuser', true, 'testuserpassword');
                        expect(playerId).toBeGreaterThan(0);
        
                        const changes = await gameQueries.updateGameCreator(gameId, playerId);
                        expect(changes).toBeGreaterThan(0);
                        
                        const updatedGame = await gameQueries.getGameById(gameId);
                        expect(updatedGame).toEqual(expect.objectContaining({ creator_id: playerId }));
                    });
        
                    it('should throw an error if the game ID does not exist', async () => {
                        const playerId = await playerQueries.createPlayer('testuser', true, 'testuserpassword');
                        expect(playerId).toBeGreaterThan(0);
                        
                        await expect(gameQueries.updateGameCreator(999, playerId)).rejects.toThrow('Error updating game creator');
                    });
        
                    it('should throw an error if the creator ID does not exist', async () => {
                        const gameId = await gameQueries.createGame('Game 11', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
        
                        await expect(gameQueries.updateGameCreator(gameId, 999)).rejects.toThrow('Error updating game creator');
                    });
                });
            });    
            
            describe('Game Players', () => {
                let gameId;
                let playerId1;
                let playerId2;
            
                beforeAll(async () => {
                    gameId = await gameQueries.createGame('Test Game', 'multiplayer', 1, 'pending');
                    playerId1 = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                    playerId2 = await playerQueries.createPlayer('testuser2', true, 'testuser2password');
                });
            
                afterEach(async () => {
                    await db.exec('DELETE FROM game_players');
                });
            
                describe('getGamePlayers', () => {
                    it('should get players associated with a game', async () => {
                        await gameQueries.addPlayerToGame(gameId, playerId1);
                        await gameQueries.addPlayerToGame(gameId, playerId2);
            
                        const players = await gameQueries.getGamePlayers(gameId);
                        expect(players).toEqual(expect.arrayContaining([
                            expect.objectContaining({ id: playerId1 }),
                            expect.objectContaining({ id: playerId2 })
                        ]));
                    });
            
                    it('should return an empty array if no players are associated with a game', async () => {
                        const players = await gameQueries.getGamePlayers(gameId);
                        expect(players).toEqual([]);
                    });
                });
            
                describe('isGamePlayer', () => {
                    it('should return true if the player is in the game', async () => {
                        await gameQueries.addPlayerToGame(gameId, playerId1);
            
                        const result = await gameQueries.isGamePlayer(gameId, playerId1);
                        expect(result).toBe(true);
                    });
            
                    it('should return false if the player is not in the game', async () => {
                        const result = await gameQueries.isGamePlayer(gameId, playerId2);
                        expect(result).toBe(false);
                    });
                });
            
                describe('addPlayerToGame', () => {
                    it('should add a player to a game', async () => {
                        const result = await gameQueries.addPlayerToGame(gameId, playerId1);
                        expect(result).toBeGreaterThan(0);
                    } );
        
                    it('should throw an error if the player is already in the game', async () => {
                        await gameQueries.addPlayerToGame(gameId, playerId1);
                        await expect(gameQueries.addPlayerToGame(gameId, playerId1)).rejects.toThrow('Player is already in the game');
                    });
                });
        
                describe('removePlayerFromGame', () => {
                    it('should remove a player from a game', async () => {
                        await gameQueries.addPlayerToGame(gameId, playerId1);
                        const result = await gameQueries.removePlayerFromGame(gameId, playerId1);
                        expect(result).toBe(1);
                    });
        
                    it('should throw an error if the player is not in the game', async () => {
                        await expect(gameQueries.removePlayerFromGame(gameId, playerId2)).rejects.toThrow('Player is not in the game');
                    });
        
                });
            });
    
            describe('Game Scores', () => {
                describe('createGameScore', () => {
                    it('should create a new game score entry', async () => {
                        const gameId = 1; // assuming a valid game ID
                        const playerId = 1; // assuming a valid player ID
                        const score = 100;
                        const scoreId = await gameQueries.createGameScore(gameId, playerId, score);
                        expect(scoreId).toBeGreaterThan(0);
                    });
        
                    it('should create a negative score successfully', async () => {
                        const gameId = 1;
                        const playerId = 1;
                        const score = -100;
                        const scoreId = await gameQueries.createGameScore(gameId, playerId, score);
                        expect(scoreId).toBeGreaterThan(0);
                    });
                
                    it('should create a score of zero successfully', async () => {
                        const gameId = 1;
                        const playerId = 1;
                        const score = 0;
                        const scoreId = await gameQueries.createGameScore(gameId, playerId, score);
                        expect(scoreId).toBeGreaterThan(0);
                    });
        
                    it('should throw an error if gameId is missing', async () => {
                        const playerId = 1;
                        const score = 100;
                
                        await expect(gameQueries.createGameScore(null, playerId, score)).rejects.toThrow();
                    });
                
                    it('should throw an error if playerId is missing', async () => {
                        const gameId = 1;
                        const score = 100;
                        await expect(gameQueries.createGameScore(gameId, null, score)).rejects.toThrow();
                    });
                
                    it('should throw an error if the score is missing', async () => {
                        const gameId = 1;
                        const playerId = 1;
                        await expect(gameQueries.createGameScore(gameId, playerId, null)).rejects.toThrow();
                    });
                });
    
                describe('deleteGameScore', () => {
                    it('should delete a game score by gameId and playerId', async () => {
                        const gameId = 1;
                        const playerId = 1;
                        const score = 100;
                        
                        const scoreId = await gameQueries.createGameScore(gameId, playerId, score);
                        expect(scoreId).toBeGreaterThan(0);
        
                        const result = await gameQueries.deleteGameScore(gameId, playerId);
                        expect(result).toBeGreaterThan(0);
                    });
                
                    it('should throw an error for a non-existent score', async () => {
                        const nonExistentGameId = 999; // arbitrary game ID that doesn't exist
                        const nonExistentPlayerId = 999; // arbitrary player ID that doesn't exist
                
                        await expect(gameQueries.deleteGameScore(nonExistentGameId, nonExistentPlayerId)).rejects.toThrow('Score not found for this player in the specified game.');
                    });
                });
    
                describe('getGameScores', () => {
                    it('should get scores for a game', async () => {
                        const game = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const player1 = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
    
                        await gameQueries.createGameScore(game, player1, 100);
                        await gameQueries.createGameScore(game, player1, 200);
    
                        const scores = await gameQueries.getGameScores(game);
                        expect(scores).toEqual(expect.arrayContaining([
                            expect.objectContaining({ player_id: player1, score: 100 }),
                            expect.objectContaining({ player_id: player1, score: 200 })
                        ]));
                    });
                });
    
                describe('getGameScoresByPlayer', () => {
                    it('should get scores for a player in a game', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const player1Id = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        const player2Id = await playerQueries.createPlayer('testuser2', true, 'testuser2password');
    
                        await gameQueries.createGameScore(gameId, player1Id, 100);
                        await gameQueries.createGameScore(gameId, player1Id, 200);
                        await gameQueries.createGameScore(gameId, player2Id, 300);
                
                        const scores = await gameQueries.getGameScoresByPlayer(player1Id); // Corrected here
                        expect(scores).toEqual(expect.arrayContaining([
                            expect.objectContaining({ player_id: player1Id, score: 100 }), // Ensure correct player ID is used
                            expect.objectContaining({ player_id: player1Id, score: 200 })
                        ]));
                    });
    
                    it('should return an empty array if the player has no scores in the game', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const player1Id = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        const player2Id = await playerQueries.createPlayer('testuser2', true, 'testuser2password');
    
                        await gameQueries.createGameScore(gameId, player2Id, 300);
                
                        const scores = await gameQueries.getGameScoresByPlayer(player1Id);
                        expect(scores).toEqual([]);
                    });
    
                    it('should throw an error if the player ID does not exist', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const playerId = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        await gameQueries.createGameScore(gameId, playerId, 100);
                
                        await expect(gameQueries.getGameScoresByPlayer(999)).rejects.toThrow('Error getting scores');
                    });
                });
    
                describe('getGameScoresByGame', () => {
                    it('should get scores for a game', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const player1Id = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        const player2Id = await playerQueries.createPlayer('testuser2', true, 'testuser2password');
    
                        await gameQueries.createGameScore(gameId, player1Id, 100);
                        await gameQueries.createGameScore(gameId, player2Id, 200);
    
                        const scores = await gameQueries.getGameScoresByGame(gameId);
                        expect(scores).toEqual(expect.arrayContaining([
                            expect.objectContaining({ player_id: player1Id, score: 100 }),
                            expect.objectContaining({ player_id: player2Id, score: 200 })
                        ]));
                    });
    
                    it('should return an empty array if there are no scores for the game', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const scores = await gameQueries.getGameScoresByGame(gameId);
                        expect(scores).toEqual(expect.arrayContaining([]));
                    });
    
                    it('should throw an error if the game ID does not exist', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const player1Id = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        const player2Id = await playerQueries.createPlayer('testuser2', true, 'testuser2password');
    
                        await gameQueries.createGameScore(gameId, player1Id, 100);
                        await gameQueries.createGameScore(gameId, player2Id, 200);
    
                        await expect(gameQueries.getGameScoresByGame(999)).rejects.toThrow('Error getting scores');
                    });
                });
    
                describe('getGameScoreByGamePlayer', () => {
                    it('should get a player\'s score for a game', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const player1Id = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        const player2Id = await playerQueries.createPlayer('testuser2', true, 'testuser2password');
    
                        await gameQueries.createGameScore(gameId, player1Id, 100);
                        await gameQueries.createGameScore(gameId, player2Id, 200);
    
                        const score = await gameQueries.getGameScoreByGamePlayer(gameId, player1Id);
                        expect(score).toEqual(expect.objectContaininlocalhostg({ player_id: player1Id, score: 100 }));
                    });
    
                    it('should return null if the player has no score for the game', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const player1Id = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        const player2Id = await playerQueries.createPlayer('testuser2', true, 'testuser2password');
    
                        await gameQueries.createGameScore(gameId, player2Id, 200);
    
                        const score = await gameQueries.getGameScoreByGamePlayer(gameId, player1Id);
                        expect(score).toBeNull();
                    });
    
                    it('should throw an error if the player ID does not exist', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const playerId = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        await gameQueries.createGameScore(gameId, playerId, 100);
                
                        await expect(gameQueries.getGameScoreByGamePlayer(gameId, 999)).rejects.toThrow('Error getting score');
                    });
                    localhost
                    it('should throw an error if the game ID does not exist', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const playerId = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        await gameQueries.createGameScore(gameId, playerId, 100);
                
                        await expect(gameQueries.getGameScoreByGamePlayer(999, playerId)).rejects.toThrow('Error getting score');
                    });
                });
    
                describe('updateGameScore', () => {
                    it('should update a player\'s score for a game', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const playerId = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        
                        await gameQueries.createGameScore(gameId, playerId, 100);
                        
                        const changes = await gameQueries.updateGameScore(gameId, playerId, 200); 
                        expect(changes).toBeGreaterThan(0);
                        
                        const score = await gameQueries.getGameScoreByGamePlayer(gameId, playerId);
                        expect(score).toEqual(expect.objectContaining({ "player_id": playerId, "score": 300 }));
                    });
                    
                    localhost
                    it('should throw an error if the player ID does not exist', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const playerId = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        await gameQueries.createGameScore(gameId, playerId, 100);
                
                        await expect(gameQueries.updateGameScore(gameId, 999, 200)).rejects.toThrow('Error updating game score');
                    });
    
                    it('should throw an error if the game ID does not exist', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const playerId = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        await gameQueries.createGameScore(gameId, playerId, 100);
                
                        await expect(gameQueries.updateGameScore(999, playerId, 200)).rejects.toThrow('Error updating game score');
                    });
                });
            });
            localhost
            describe('Game Losers', () => {
                describe('getGameLosers', () => {
                    it('should get the losers of a game', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const player1Id = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        const player2Id = await playerQueries.createPlayer('testuser2', true, 'testuser2password');
    
                        await gameQueries.updateGameLosers(gameId, player1Id);
                        await gameQueries.updateGameLosers(gameId, player2Id);
    
                        const losers = await gameQueries.getGameLosers(gameId);
                        expect(losers).toEqual(expect.arrayContaining([
                            expect.objectContaining({ player_id: player1Id }),
                            expect.objectContaining({ player_id: player2Id })
                        ]));
                    });localhost
                describe('getGameLosersByGame', () => {
                    it('should get the losers of a game', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const player1Id = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        const player2Id = await playerQueries.createPlayer('testuser2', true, 'testuser2password');
    
                        await gameQueries.updateGameLosers(gameId, player1Id);
                        await gameQueries.updateGameLosers(gameId, player2Id);
    
                        const losers = await gameQueries.getGameLosersByGame(gameId);
                        expect(losers).toEqual(expect.arrayContaining([
                            expect.objectContaining({ player_id: player1Id }),
                            expect.objectContaining({ player_id: player2Id })
                        ]));
                    });
    
                    it('should throw an error if the game ID does not exist', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        const player1Id = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        const player2Id = await playerQueries.createPlayer('testuser2', true, 'testuser2password');
    
                        await gameQueries.updateGameLosers(gameId, player1Id);
                        await gameQueries.updateGameLosers(gameId, player2Id);
                        localhost999)).rejects.toThrow('Error getting losers');
                    });
                });
    
                describe('updateGameLosers', () => {
                    it('should update a game\'s losers successfully', async () => {
                        const gameId = await gameQueries.createGame('Game 10', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
                
                        const playerId1 = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        expect(playerId1).toBeGreaterThan(0);
                
                        const playerId2 = await playerQueries.createPlayer('testuser2', true, 'testuser2password');
                        expect(playerId2).toBeGreaterThan(0);
                
                        const lastLoserId1 = await gameQueries.updateGameLosers(gameId, playerId1);
                        expect(lastLoserId1).toBeGreaterThan(0);
                
                        const lastLoserId2 = await gameQueries.updateGameLosers(gameId, playerId2);
                        expect(lastLoserId2).toBeGreaterThan(0);
                    });
        
                    it('should throw an error if the game ID does not exist', async () => {
                        const playerId1 = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        expect(playerId1).toBeGreaterThan(0);
                
                        const playerId2 = await playerQueries.createPlayer('testuser2', true, 'testuser2password');
                        expect(playerId2).toBeGreaterThan(0);
                
                        await expect(gameQueries.updateGameLosers(999, playerId1)).rejects.toThrow('Error updating game losers');
                    });
        
                    it('should throw an error if the player ID does not exist', async () => {
                        const gameId = await gameQueries.createGame('Game 11', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
                
                        const playerId1 = await playerQueries.createPlayer('testuser1', true, 'testuser1password');
                        expect(playerId1).toBeGreaterThan(0);
                
                        await expect(gameQueries.updateGameLosers(gameId, [playerId1, 999])).rejects.toThrow('Error updating game losers');
                    });
                });
            });
    
            describe('Game Pieces', () => {
        
                describe('getGamePieces', () => {
                    it('should retrieve all pieces for a specific game, ordered by position', async () => {
                        const gameId = await gameQueries.createGame('Game 1', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
                        
                        await gameQueries.updateGamePieces(gameId, 'I', 1);
                        await gameQueries.updateGamePieces(gameId, 'T', 2);
                        await gameQueries.updateGamePieces(gameId, 'L', 3);
            
                        const pieces = await gameQueries.getGamePieces(gameId);
                        expect(pieces).toEqual(expect.arrayContaining([
                            expect.objectContaining({ game_id: gameId, type: 'I', position: 1 }),
                            expect.objectContaining({ game_id: gameId, type: 'T', position: 2 }),
                            expect.objectContaining({ game_id: gameId, type: 'L', position: 3 })
                        ]));localhost
                    });
            
                    it('should return an empty array if there are no pieces for the game', async () => {
                        const gameId = await gameQueries.createGame('Game 2', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
            
                        const pieces = await gameQueries.getGamePieces(gameId);
                        expect(pieces).toEqual([]);
                    });
                });
            
                describe('updateGamePieces', () => {
                    it('should add a new piece to the game if position is available', async () => {
                        const gameId = await gameQueries.createGame('Game 3', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
            
                        const pieceId = await gameQueries.updateGamePieces(gameId, 'I', 4);
                        expect(pieceId).toBeGreaterThan(0);
            
                        const pieces = await gameQueries.getGamePieces(gameId);
                        expect(pieces).toEqual(expect.arrayContaining([
                            expect.objectContaining({ id: pieceId, game_id: gameId, type: 'I', position: 4 })
                        ]));
                    });
            
                    it('should throw an error if the game does not exist', async () => {
                        await expect(gameQueries.updateGamePieces(9999, 'King', 1)).rejects.toThrow('Game with ID 9999 does not exist.');
                    });
            
                    it('should throw an error if a piece already exists at the specified position', async () => {
                        const gameId = await gameQueries.createGame('Game 4', 'multiplayer', 1, 'pending');
                        expect(gameId).toBeGreaterThan(0);
            
                        await gameQueries.updateGamePieces(gameId, 'I', 1);
                        await expect(gameQueries.updateGamePieces(gameId, 'T', 1)).rejects.toThrow('Piece already exists at position 1');
                    });
                });
            });
        });
    });
});