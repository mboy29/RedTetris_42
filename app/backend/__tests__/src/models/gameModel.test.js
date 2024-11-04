// +------------------------------------------------+
// |          REDTETRIS GAME MODEL TESTING          |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module contains tests for the RedTetris game 
    model. The tests cover the game model class and 
    its methods.

    Tests suite includes: Constructor, Setters and
    Getters, Booleans, Class Async Methods, Class
    Static Methods.
*/

// +----------------- REQUIREMENTS -----------------+

const Player = require('@models/playerModel');
const Game = require('@models/gameModel');
const Piece = require('@models/pieceModel');

const gameQueries = require('@queries/gameQueries');

// +------------------- MOCKS ----------------------+

jest.mock('bcrypt');
jest.mock('@queries/gameQueries');
jest.mock('@models/playerModel');

// +-------------------- TESTS ----------------------+

describe('Game Model', () => {

    beforeEach(() => {
        mockSocket = { id: 'mockSocketId', emit: jest.fn() };
        mockPlayer1 = new Player(1, 'player1');
        mockPlayer2 = new Player(2, 'player2');

        game = new Game(1, 'testgame', 'solo', { id: 1, username: 'creator' }, 'pending'); 
    });

    describe('Class Methods', () => {
        
        describe('Constructor', () => {
            it('should create a new game instance with default values', () => {
                const game = new Game(1, 'testgame', 'solo', 'testuser');
        
                expect(game.id).toBe(1);
                expect(game.name).toBe('testgame');
                expect(game.mode).toBe('solo');
                expect(game.creator).toBe('testuser');
                expect(game.status).toBe('pending');
                expect(game.sprint).toBe(false);
                expect(game.winner).toBe(null);
                expect(game.rematcher).toBe(null);
                expect(game.parent).toBe(null);
                expect(game.size).toBe(4);
        
                // Default empty arrays and objects
                expect(game.losers).toEqual([]);
                expect(game.scores).toEqual({});
                expect(game.players).toEqual([]);
                expect(game.pieces).toEqual([]);
            });
        
            it('should correctly initialize with all specified parameters', () => {
                const game = new Game(1, 'testgame', 'solo', 'testuser', true, 'pending', 10, 'player1', 'player2');
        
                expect(game.id).toBe(1);
                expect(game.name).toBe('testgame');
                expect(game.mode).toBe('solo');
                expect(game.creator).toBe('testuser');
                expect(game.status).toBe('pending');
                expect(game.sprint).toBe(true);
                expect(game.parent).toBe(10);
                expect(game.winner).toBe('player1');
                expect(game.rematcher).toBe('player2');
            });
    
            it('should throw an error if name is not right length', () => {
                expect(() => new Game(1, 'a', 'solo', 'testuser')).toThrow('Invalid name');
            });
    
            it('should throw an error if the mode is invalid', () => {
                expect(() => new Game(1, 'testgame', 'invalid', 'testuser')).toThrow('Invalid mode');
            });
    
            it('should throw an error if the status is invalid', () => {
                expect(() => new Game(1, 'testgame', 'solo', 'testuser', false, 'invalid')).toThrow('Invalid status');
            });
        });

        describe('Setters and Getters', () => {

            let game;
            let player;
            
            beforeEach(() => {
                game = new Game(1, 'testgame', 'solo', 'testuser');
                player = { id: 2, name: 'testPlayer' };
            });
        
            it('should set and get the ID', () => {
                game.setId(2);
                expect(game.getId()).toBe(2);
            });
        
            it('should set and get the name', () => {
                game.setName('newgame');
                expect(game.getName()).toBe('newgame');
            });
        
            it('should throw an error for invalid name length', () => {
                expect(() => game.setName('abc')).toThrow('Invalid name, must be between 4 and 14 characters.');
                expect(() => game.setName('aVeryLongGameName')).toThrow('Invalid name, must be between 4 and 14 characters.');
            });
        
            it('should set and get the status', () => {
                game.setStatus('in progress');
                expect(game.getStatus()).toBe('in progress');
            });
        
            it('should throw an error for invalid status', () => {
                expect(() => game.setStatus('not started')).toThrow('Invalid status, should be one of: pending, in progress, finished');
            });
        
            it('should set and get the mode', () => {
                game.setMode('multiplayer');
                expect(game.getMode()).toBe('multiplayer');
            });
        
            it('should throw an error for invalid mode', () => {
                expect(() => game.setMode('invalid')).toThrow('Invalid mode, should be one of: solo, multiplayer, training');
            });
        
            it('should set and get the creator', () => {
                game.setCreator('newcreator');
                expect(game.getCreator()).toBe('newcreator');
            });
        
            it('should set and get the size', () => {
                game.setSize(5);
                expect(game.getSize()).toBe(5);
            });
        
            it('should set and get the sprint', () => {
                game.setSprint(true);
                expect(game.getSprint()).toBe(true);
            });
        
            it('should set and get the winner', () => {
                game.setWinner('winner1');
                expect(game.getWinner()).toBe('winner1');
            });
        
            it('should set and get the parent', () => {
                game.setParent(42);
                expect(game.getParent()).toBe(42);
            });
        
            it('should set and get the rematcher', () => {
                game.setRematcher('rematcher1');
                expect(game.getRematcher()).toBe('rematcher1');
            });
        
            it('should get the players array', () => {
                expect(game.getPlayers()).toEqual([]);
            });
        
            it('should get the pieces array', () => {
                expect(game.getPieces()).toEqual([]);
            });
        
            it('should get the losers array', () => {
                expect(game.getLosers()).toEqual([]);
            });
        
            it('should get the scores object', () => {
                expect(game.getScores()).toEqual({});
            });
        
            it('should return the correct score for a player', () => {
                game.scores[player.id] = 150;  // Assign a score to the player
                expect(game.getPlayerScore(player)).toBe(150);
            });
        
            it('should return undefined if the player has no score', () => {
                const newPlayer = { id: 3, name: 'newPlayer' };
                expect(game.getPlayerScore(newPlayer)).toBeUndefined();
            });
        });        
    
        describe('Booleans', () => {
                
            let game, player1, player2, player3, creator, winner, rematcher;
        
            beforeEach(() => {
                creator = { id: 1, name: 'creator' };
                player1 = { id: 2, name: 'player1' };
                player2 = { id: 3, name: 'player2' };
                player3 = { id: 4, name: 'player3' };
                winner = { id: 5, name: 'winner' };
                rematcher = { id: 6, name: 'rematcher' };
        
                game = new Game(1, 'testgame', 'multiplayer', creator);
                game.players = [creator, player1, player2];
                game.winner = winner;
                game.rematcher = rematcher;
                game.losers = [player3.id];
                game.size = 3; // to test `isGameFull` with players list
            });
        
            it('should correctly identify a player as a game player', () => {
                expect(game.isGamePlayer(player1)).toBe(true);
                expect(game.isGamePlayer(player3)).toBe(false);
            });
        
            it('should correctly identify the game creator', () => {
                expect(game.isGameCreator(creator)).toBe(true);
                expect(game.isGameCreator(player1)).toBe(false);
            });
        
            it('should correctly identify a player as a game loser', () => {
                expect(game.isGameLoser(player3)).toBe(true);
                expect(game.isGameLoser(player1)).toBe(false);
            });
        
            it('should check if the game is full', () => {
                expect(game.isGameFull()).toBe(true); // game.players.length == game.size
                game.setSize(4); // updating size to 4
                expect(game.isGameFull()).toBe(false);
            });
        
            it('should correctly determine if a game is joinable', () => {
                game.setStatus('pending');
                expect(game.isGameJoinable(player1)).toBe(true);
        
                game.setStatus('in progress');
                expect(game.isGameJoinable(player1)).toBe(false);
        
                game.setMode('training');
                game.setStatus('pending');
                expect(game.isGameJoinable(creator)).toBe(true);  // Creator can join in training mode
                expect(game.isGameJoinable(player2)).toBe(false); // Other players cannot join in training mode
            });
        
            it('should correctly determine if the game mode is training', () => {
                game.setMode('training');
                expect(game.isGameTraining()).toBe(true);
        
                game.setMode('multiplayer');
                expect(game.isGameTraining()).toBe(false);
            });
        
            it('should correctly determine if the game is in sprint mode', () => {
                game.setSprint(true);
                expect(game.isGameSprint()).toBe(true);
        
                game.setSprint(false);
                expect(game.isGameSprint()).toBe(false);
            });
        
            it('should correctly identify the winner of the game', () => {
                expect(game.isGameWinner(winner)).toBe(true);
                expect(game.isGameWinner(player1)).toBe(false);
            });
        
            it('should correctly identify the rematcher of the game', () => {
                expect(game.isGameRematcher(rematcher)).toBe(true);
                expect(game.isGameRematcher(player1)).toBe(false);
            });
        
            it('should correctly identify if a player is a game loser', () => {
                expect(game.isGameLoser(player3)).toBe(true);
                expect(game.isGameLoser(player1)).toBe(false);
            });

            it('should end the game in solo mode when there is at least one loser', () => {
                game.setMode('solo');
                game.losers = [player1.id];
                expect(game.isEndGame()).toBe(true);
            });
        
            it('should end the game in training mode when there is at least one loser', () => {
                game.setMode('training');
                game.losers = [player1.id];
                expect(game.isEndGame()).toBe(true);
            });
        
            it('should not end the game in solo or training mode if there are no losers', () => {
                game.setMode('solo');
                game.losers = [];
                expect(game.isEndGame()).toBe(false);
        
                game.setMode('training');
                expect(game.isEndGame()).toBe(false);
            });
        
            it('should end the game in multiplayer mode when all players but one are losers', () => {
                game.setMode('multiplayer');
                game.losers = [player1.id, player2.id];
                expect(game.isEndGame()).toBe(true);
            });
        
            it('should not end the game in multiplayer mode if fewer than all players but one are losers', () => {
                game.setMode('multiplayer');
                game.losers = [player1.id];
                expect(game.isEndGame()).toBe(false);
            });
            
            it('should not end the game if there are no losers regardless of mode', () => {
                game.setMode('multiplayer');
                game.losers = [];
                expect(game.isEndGame()).toBe(false);
            });  
        });

        describe('Class Async Methods', () => {
            
            describe('Updators', () => {
                
                let game;
                
                beforeEach(() => {
                    game = new Game(1, 'testgame', 'solo', { id: 1, name: 'creator' });
                });
            
                it('should update the game name and call the correct query', async () => {
                    const newName = 'updatedName';
                    await game.updateName(newName);
                    expect(game.name).toBe(newName);
                    expect(gameQueries.updateGameName).toHaveBeenCalledWith(game.id, newName);
                });
            
                it('should update the game mode and call the correct query', async () => {
                    const newMode = 'multiplayer';
                    await game.updateMode(newMode);
                    expect(game.mode).toBe(newMode);
                    expect(gameQueries.updateGameMode).toHaveBeenCalledWith(game.id, newMode);
                });
            
                it('should update the game status and call the correct query', async () => {
                    const newStatus = 'in progress';
                    await game.updateStatus(newStatus);
                    expect(game.status).toBe(newStatus);
                    expect(gameQueries.updateGameStatus).toHaveBeenCalledWith(game.id, newStatus);
                });
            
                it('should update the game winner and call the correct query', async () => {
                    const player = { id: 2, name: 'player2' };
                    await game.updateWinner(player);
                    expect(game.winner).toEqual(player);
                    expect(gameQueries.updateGameWinner).toHaveBeenCalledWith(game.id, player.id);
                });
            
                it('should update the game sprint status and call the correct query', async () => {
                    const newSprint = true;
                    await game.updateSprint(newSprint);
                    expect(game.sprint).toBe(newSprint);
                    expect(gameQueries.updateGameSprint).toHaveBeenCalledWith(game.id, newSprint);
                });
            });
            
            describe('Adders and Removers', () => {
                
                let game;
                let socketMock;
                
                beforeEach(() => {
                    game = new Game(1, 'testgame', 'solo', { id: 1, name: 'creator' });
                    socketMock = { emit: jest.fn() }; // Example of a mock socket
                });
            
                it('should add players to the game and call the correct queries', async () => {
                    const player = { id: 2, name: 'player2', joinGame: jest.fn() };
                    await game.addPlayers(socketMock, player);
                    expect(game.players).toContain(player);
                    expect(gameQueries.addPlayerToGame).toHaveBeenCalledWith(game.id, player.id);
                    expect(player.joinGame).toHaveBeenCalledWith(socketMock, game.name);
                });
            
                it('should remove players from the game and call the correct queries', async () => {
                    const player = { id: 2, name: 'player2', leaveGame: jest.fn() };
                    game.players.push(player);
                    await game.removePlayers(socketMock, 100, player);
                    expect(game.players).not.toContain(player);
                    expect(gameQueries.removePlayerFromGame).toHaveBeenCalledWith(game.id, player.id);
                    expect(player.leaveGame).toHaveBeenCalledWith(socketMock, 100);
                });
            });

            describe('Enders and starters', () => {
                
                let game;
                let player1, player2;
            
                beforeEach(() => {
                    game = new Game(1, 'testgame', 'solo', { id: 1, name: 'creator' });
                    player1 = { id: 2, getScore: jest.fn().mockResolvedValue(100), updateScore: jest.fn() };
                    player2 = { id: 3, getScore: jest.fn().mockResolvedValue(200), updateScore: jest.fn() };
                    game.players = [player1, player2];
                    game.scores[player1.id] = 100;
                    game.scores[player2.id] = 200;
                });
            
                it('should start the game, add pieces if necessary, and set scores', async () => {
                    await game.startGame();
                    expect(game.status).toBe('in progress');
                    expect(game.pieces.length).toBeGreaterThan(0);
                    expect(gameQueries.updateGameStatus).toHaveBeenCalledWith(game.id, 'in progress');
                    expect(gameQueries.createGameScore).toHaveBeenCalledWith(game.id, player1.id, 0);
                    expect(gameQueries.createGameScore).toHaveBeenCalledWith(game.id, player2.id, 0);
                });
            
                it('should end the game, update winner and rematcher, and set status to finished', async () => {
                    await game.endGame();
                    expect(game.status).toBe('finished');
                    expect(gameQueries.updateGameStatus).toHaveBeenCalledWith(game.id, 'finished');
                    expect(gameQueries.updateGameWinner).toHaveBeenCalledWith(game.id, expect.any(Number));
                    expect(gameQueries.updateGameRematcher).toHaveBeenCalledWith(game.id, expect.any(Number));
                    expect(player1.updateScore).toHaveBeenCalledWith(expect.any(Number));
                    expect(player2.updateScore).toHaveBeenCalledWith(expect.any(Number));
                });
            });
            
        });

        describe('Class Static Methods', () => {
            let player;
        
            beforeEach(async () => {
                player = { id: 2, getScore: jest.fn().mockResolvedValue(100), updateScore: jest.fn() };
            });
        
            describe('create', () => {
                it('should create a new game instance and return it', async () => {
                    const game = await Game.create('newgame', 'solo', player, true);
        
                    expect(game).toBeInstanceOf(Game);
                    expect(game.getName()).toBe('newgame');
                    expect(game.getMode()).toBe('solo');
                    expect(game.getCreator()).toBe(player);
                    expect(game.getSprint()).toBe(true);
                    expect(game.getStatus()).toBe('pending');
                });
            });
        
            describe('getByName', () => {
            
                it('should return a game by name', async () => {
                    gameQueries.getGameByName.mockResolvedValue({ id: 1, name: 'testgame', creator_id: 1, mode: 'solo', status: 'pending' });
                    Player.getById.mockResolvedValue({ id: 1, username: 'creator' });
        
                    gameQueries.getGamePlayers.mockResolvedValue([
                        { id: 2, username: 'player1', connect: true, roomName: 'testgame' }
                    ]);
        
                    const game = await Game.getByName('testgame');
                    expect(game.name).toBe('testgame');
                    expect(game.players.length).toBe(1);
                });
        
                it('should return null if game not found', async () => {
                    // Mock the response to return null if no game is found
                    gameQueries.getGameByName.mockResolvedValue(null);
        
                    const game = await Game.getByName('unknown');
                    expect(game).toBeNull();
                });
            });
            
            describe('getById', () => {
                
                it('should return a game by ID', async () => {
                    gameQueries.getGameById.mockResolvedValue({ id: 1, name: 'testgame', creator_id: 1, mode: 'solo', status: 'pending' });
                    Player.getById.mockResolvedValue({ id: 1, username: 'creator' });
        
                    gameQueries.getGamePlayers.mockResolvedValue([
                        { id: 2, username: 'player1', connect: true, roomName: 'testgame' }
                    ]);
        
                    const game = await Game.getById(1);
                    expect(game.name).toBe('testgame');
                    expect(game.players.length).toBe(1);
                });
        
                it('should return null if game not found', async () => {
                    // Mock the response to return null if no game is found
                    gameQueries.getGameById.mockResolvedValue(null);
        
                    const game = await Game.getById(1);
                    expect(game).toBeNull();
                });
            });
    
        });
    });
});
