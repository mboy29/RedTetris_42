// +------------------------------------------------+
// |          REDTETRIS GAME MODEL TESTING          |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module contains tests for the RedTetris game model.
    The tests cover the game model class and its methods.

    Tests include:
    
    1. Constructor, setters & getters
        - Create a new game instance
        - Set/get the game name
        - Set/get the game status
        - Set/get the game mode

    2. Static methods
        - Get a game by name
        - Get a game by ID
        - Create a new game

    3. Instance methods
        - Check if a player is in the game
        - Check if a player is the game creator
        - Update the game name
        - Update the game mode
        - Update the game status
        - Add players to the game
        - Remove players from the game
        - Remove the game   
*/

// +----------------- REQUIREMENTS -----------------+

const bcrypt = require('bcrypt');
const Player = require('@models/playerModel');
const Game = require('@models/gameModel');
const queries = require('@queries/gameQueries');

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

    describe('Constructor, setters & getters', () => {
        it('should create a new game instance', () => {
            const game = new Game(1, 'testgame', 'solo', 'testuser');
            expect(game.id).toBe(1);
            expect(game.name).toBe('testgame');
            expect(game.mode).toBe('solo');
            expect(game.creator).toBe('testuser');
            expect(game.status).toBe('pending');
            expect(game.players).toEqual([]);
        });

        it('should set the game name', () => {
            const game = new Game(1, 'testgame', 'solo', 'testuser');
            game.setName('newgame');
            expect(game.name).toBe('newgame');
        });

        it('should throw an error for invalid game name', () => {
            const game = new Game(1, 'testgame', 'solo', 'testuser');
            expect(() => game.setName('a')).toThrow('Name must be between 4 and 14 characters.');
            expect(() => game.setName('thisisaverylongname')).toThrow('Name must be between 4 and 14 characters.');
        });

        it('should set the game status', () => {
            const game = new Game(1, 'testgame', 'solo', 'testuser');
            game.setStatus('in progress');
            expect(game.status).toBe('in progress');
        });

        it('should throw an error for invalid game status', () => {
            const game = new Game(1, 'testgame', 'solo', 'testuser');
            expect(() => game.setStatus('invalid')).toThrow('Invalid status.');
        });

        it('should set the game mode', () => {
            const game = new Game(1, 'testgame', 'solo', 'testuser');
            game.setMode('multiplayer');
            expect(game.mode).toBe('multiplayer');
        });

        it('should throw an error for invalid game mode', () => {
            const game = new Game(1, 'testgame', 'solo', 'testuser');
            expect(() => game.setMode('invalid')).toThrow('Invalid mode.');
        });
    });

    describe('Static Methods', () => {
        
        describe('getByName', () => {
            
            it('should return a game by name', async () => {
                queries.getGameByName.mockResolvedValue({ id: 1, name: 'testgame', creator_id: 1, mode: 'solo', status: 'pending' });
                Player.getById.mockResolvedValue({ id: 1, username: 'creator' });
    
                queries.getGamePlayers.mockResolvedValue([
                    { id: 2, username: 'player1', connect: true, roomName: 'testgame' }
                ]);
    
                const game = await Game.getByName('testgame');
                expect(game.name).toBe('testgame');
                expect(game.players.length).toBe(1);
            });
    
            it('should return null if game not found', async () => {
                // Mock the response to return null if no game is found
                queries.getGameByName.mockResolvedValue(null);
    
                const game = await Game.getByName('unknown');
                expect(game).toBeNull();
            });
        });

        describe('getById', () => {
                
            it('should return a game by ID', async () => {
                queries.getGameById.mockResolvedValue({ id: 1, name: 'testgame', creator_id: 1, mode: 'solo', status: 'pending' });
                Player.getById.mockResolvedValue({ id: 1, username: 'creator' });
    
                queries.getGamePlayers.mockResolvedValue([
                    { id: 2, username: 'player1', connect: true, roomName: 'testgame' }
                ]);
    
                const game = await Game.getById(1);
                expect(game.name).toBe('testgame');
                expect(game.players.length).toBe(1);
            });
    
            it('should return null if game not found', async () => {
                // Mock the response to return null if no game is found
                queries.getGameById.mockResolvedValue(null);
    
                const game = await Game.getById(1);
                expect(game).toBeNull();
            });
        });

        describe('create', () => {
                
            it('should create a new game', async () => {
                queries.createGame.mockResolvedValue({ id: 1, name: 'testgame', creator_id: 1, mode: 'solo', status: 'pending' });
                Player.getById.mockResolvedValue({ id: 1, username: 'creator' });
    
                const game = await Game.create('testgame', 'solo', 'creator');
                expect(game.name).toBe('testgame');
                expect(game.creator).toBe('creator');
            });
    
            it('should throw an error if game creation fails', async () => {
                queries.createGame.mockRejectedValue(new Error('Failed to create game.'));
    
                await expect(Game.create('testgame', 'solo', 'creator')).rejects.toThrow('Failed to create game.');
            });
        });
    });

    describe('Instance Methods', () => {
        
        describe('isGamePlayer', () => {
                
            it('should return true if player is in game', () => {
                const game = new Game(1, 'testgame', 'solo', 'testuser');
                game.players = [
                    { id: 1, username: 'player1', connect: true, roomName: 'testgame' }
                ];
    
                const player = { id: 1, username: 'player1' };
                expect(game.isGamePlayer(player)).toBe(true);
            });
    
            it('should return false if player is not in game', () => {
                const game = new Game(1, 'testgame', 'solo', 'testuser');
                game.players = [
                    { id: 1, username: 'player1', connect: true, roomName: 'testgame' }
                ];
    
                const player = { id: 2, username: 'player2' };
                expect(game.isGamePlayer(player)).toBe(false);
            });
        });

        describe('isGameCreator', () => {
                    
            it('should return true if player is game creator', () => {
                const game = new Game(1, 'testgame', 'solo', 'testuser');
                game.creator = { id: 1, username: 'creator' };
    
                const player = { id: 1, username: 'creator' };
                expect(game.isGameCreator(player)).toBe(true);
            });
    
            it('should return false if player is not game creator', () => {
                const game = new Game(1, 'testgame', 'solo', 'testuser');
                game.creator = { id: 1, username: 'creator' };
    
                const player = { id: 2, username: 'player2' };
                expect(game.isGameCreator(player)).toBe(false);
            });
        });

        describe('updateName', () => {
            it('should update the game name and call the database query', async () => {
                queries.updateGameName.mockResolvedValue();
                await game.updateName('newgame');
                expect(game.name).toBe('newgame');
                expect(queries.updateGameName).toHaveBeenCalledWith(1, 'newgame');
            });
    
            it('should throw an error if the query fails', async () => {
                queries.updateGameName.mockRejectedValue(new Error('Database error'));
                await expect(game.updateName('newgame')).rejects.toThrow('Database error');
            });
        });
    
        describe('updateMode', () => {
            it('should update the game mode and call the database query', async () => {
                queries.updateGameMode.mockResolvedValue();
                await game.updateMode('multiplayer');
                expect(game.mode).toBe('multiplayer');
                expect(queries.updateGameMode).toHaveBeenCalledWith(1, 'multiplayer');
            });

            it('should throw an error if mode is invalid', async () => {
                await expect(game.updateMode('invalid')).rejects.toThrow('Invalid mode.');
            });
        });
    
        describe('updateStatus', () => {
            it('should update the game status and call the database query', async () => {
                queries.updateGameStatus.mockResolvedValue();
                await game.updateStatus('finished');
                expect(game.status).toBe('finished');
                expect(queries.updateGameStatus).toHaveBeenCalledWith(1, 'finished');
            });

            it('should throw an error if status is invalid', async () => {
                await expect(game.updateStatus('invalid')).rejects.toThrow('Invalid status.');
            });
        });

        describe('addPlayers', () => {
            it('should add players to the game and call database queries', async () => {
                queries.addPlayerToGame.mockResolvedValue();
                mockPlayer1.joinGame = jest.fn().mockResolvedValue();
                mockPlayer2.joinGame = jest.fn().mockResolvedValue();
                game.isGamePlayer = jest.fn().mockReturnValue(false);

                await game.addPlayers(mockSocket, mockPlayer1, mockPlayer2);
                
                expect(game.players).toContain(mockPlayer1);
                expect(game.players).toContain(mockPlayer2);

                expect(queries.addPlayerToGame).toHaveBeenCalledWith(1, mockPlayer1.id);
                expect(queries.addPlayerToGame).toHaveBeenCalledWith(1, mockPlayer2.id);

                expect(mockPlayer1.joinGame).toHaveBeenCalledWith(mockSocket, game.getName());
                expect(mockPlayer2.joinGame).toHaveBeenCalledWith(mockSocket, game.getName());
            });

            it('should not add a player if they are already in the game', async () => {
                
                game.isGamePlayer = jest.fn().mockReturnValue(true); 
                await game.addPlayers(mockSocket, mockPlayer1);
                expect(game.players).not.toContain(mockPlayer1);
                expect(mockPlayer1.joinGame).not.toHaveBeenCalled();
            });

            it('should throw an error if adding a player fails', async () => {
                queries.addPlayerToGame.mockRejectedValue(new Error('Database error'));
                await expect(game.addPlayers(mockSocket, mockPlayer1)).rejects.toThrow('Database error');
            });
        });
        
        describe('removePlayers', () => {
            it('should remove players from the game and call database queries', async () => {
                queries.removePlayerFromGame.mockResolvedValue();
                mockPlayer1.leaveGame = jest.fn().mockResolvedValue();
                mockPlayer2.leaveGame = jest.fn().mockResolvedValue();
                game.isGamePlayer = jest.fn(player => player === mockPlayer1 || player === mockPlayer2); // Players are in the game
    
                await game.removePlayers(mockSocket, mockPlayer1, mockPlayer2);
    
                expect(game.players).not.toContain(mockPlayer1);
                expect(game.players).not.toContain(mockPlayer2);
    
                expect(queries.removePlayerFromGame).toHaveBeenCalledWith(game.id, mockPlayer1.id);
                expect(queries.removePlayerFromGame).toHaveBeenCalledWith(game.id, mockPlayer2.id);
    
                expect(mockPlayer1.leaveGame).toHaveBeenCalledWith(mockSocket);
                expect(mockPlayer2.leaveGame).toHaveBeenCalledWith(mockSocket);
            });
    
            it('should not remove a player if they are not in the game', async () => {
                game.players = [mockPlayer1];
                game.isGamePlayer = jest.fn().mockReturnValue(false); 
                
                await game.removePlayers(mockSocket, mockPlayer1);
                
                expect(game.players).toContain(mockPlayer1);
                expect(mockPlayer1.leaveGame).not.toHaveBeenCalled();
            });
    
            it('should throw an error if removing a player fails', async () => {
                game.players = [mockPlayer1];
                queries.removePlayerFromGame.mockRejectedValue(new Error('Database error'));
                await expect(game.removePlayers(mockSocket, mockPlayer1)).rejects.toThrow('Database error');
            });
        });

        describe('remove', () => {
            it('should remove the game and call the database query', async () => {
                const game = new Game(1, 'testgame', 'solo', {}, 'pending');
                queries.deleteGameById = jest.fn().mockResolvedValue();
                
                await game.remove();
                
                expect(queries.deleteGameById).toHaveBeenCalledWith(game.id);
            });

            it('should throw an error if the query fails', async () => {
                queries.deleteGameById = jest.fn().mockRejectedValue(new Error('Database error'));
                await expect(game.remove()).rejects.toThrow('Database error');
            });
        });
    
    });
});