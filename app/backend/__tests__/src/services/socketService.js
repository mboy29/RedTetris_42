// +------------------------------------------------+
// |        REDTETRIS SOCKET SERVICE TESTING        |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This test suite is designed to test the socket service
    for the RedTetris project. It tests the joinGame and
    leaveGame functionality.

    Test Suites:
    
    1. Join Game:
        - Tests successful game join.
        - Handles cases where game join fails due to invalid input. 
        - Handles cases where game join fails due to nonexistent player.
        - Handles cases where game join fails due to nonexistent game.
        - Handles cases where game join fails due to player already in game.
    
    2. Leave Game:
        - Tests successful game leave.
        - Handles cases where game leave fails due to invalid input. 
        - Handles cases where game leave fails due to nonexistent player.
        - Handles cases where game leave fails due to nonexistent game.
        - Handles cases where game leave fails due to player not in game.
*/

// +----------------- REQUIREMENTS -----------------+

const http = require('http');
const io = require('socket.io');
const socketClient = require('socket.io-client');

const Game = require('@models/gameModel');
const Player = require('@models/playerModel');
const { setupSocket } = require('@services/socketService');

// +------------------- MOCKS ---------------------+

jest.mock('@models/gameModel');
jest.mock('@models/playerModel');

// +-------------------- TESTS --------------------+

describe('Socket Service', () => {
    let server;
    let ioServer;
    let clientSocket;
    let testServerUrl = 'http://localhost:4000';

    beforeEach((done) => {
        server = http.createServer();
        ioServer = io(server);
        setupSocket(ioServer);

        server.listen(4000, () => {
            console.log('Server listening on port 4000');
            clientSocket = socketClient(testServerUrl);

            clientSocket.on('connect', () => {
                console.log('Client connected');
                done();
            });

            clientSocket.on('connect_error', (error) => {
                console.log('Connection error:', error);
                done(new Error(`Connection failed: ${error.message}`));
            });
        });
    });

    afterEach((done) => {
        if (clientSocket.connected) {
            clientSocket.disconnect();
        }
        ioServer.close(() => {
            server.close(() => {
                console.log('Server closed');
                done();
            });
        });
    });

    describe('Join Game', () => {
        test('should join game successfully', (done) => {
            const mockPlayer = { name: 'player1' };
            const mockGame = {
                name: 'game1',
                addPlayers: jest.fn(),
                getPlayers: jest.fn().mockResolvedValue([mockPlayer]),
                isGamePlayer: jest.fn().mockResolvedValue(false), 
            };

            Player.getByUsername.mockResolvedValue(mockPlayer);
            Game.getByName.mockResolvedValue(mockGame);

            clientSocket.emit('joinGame', { roomName: 'game1', playerName: 'player1' });
            clientSocket.on('gameJoined', (data) => {
                try {
                    expect(data).toEqual({ roomName: 'game1', playerName: 'player1' });
                    expect(mockGame.addPlayers).toHaveBeenCalled();
                    done();
                } catch (error) {
                    done(error);
                }
            });

            clientSocket.on('error', (error) => {
                done(new Error(`Unexpected error: ${error.message}`));
            });
        });

        test('should handle errors when joining game as user does not exists', (done) => {
            Player.getByUsername.mockResolvedValue(null); 
            clientSocket.emit('joinGame', { roomName: 'game1', playerName: 'nonexistentPlayer' });

            clientSocket.on('error', (error) => {
                try {
                    expect(error.message).toBe('Player not found');
                    done();
                } catch (err) {
                    done(err);
                }
            });

            clientSocket.on('gameJoined', () => {
                done(new Error('Unexpected successful game join'));
            });
        });

        test('should handle errors when joining game as game does not exists', (done) => {
            Player.getByUsername.mockResolvedValue({ name: 'player1' });
            Game.getByName.mockResolvedValue(null);
            clientSocket.emit('joinGame', { roomName: 'nonexistentGame', playerName: 'player1' });

            clientSocket.on('error', (error) => {
                try {
                    expect(error.message).toBe('Game not found');
                    done();
                } catch (err) {
                    done(err);
                }
            });

            clientSocket.on('gameJoined', () => {
                done(new Error('Unexpected successful game join'));
            });
        });

        test('should handle errors when joining game as player already in game', (done) => {
            const mockPlayer = { name: 'player1' };
            const mockGame = {
                name: 'game1',
                addPlayers: jest.fn(),
                getPlayers: jest.fn().mockResolvedValue([mockPlayer]),
                isGamePlayer: jest.fn().mockResolvedValue(true), // Ensure this is a mock
            };

            Player.getByUsername.mockResolvedValue(mockPlayer);
            Game.getByName.mockResolvedValue(mockGame);

            clientSocket.emit('joinGame', { roomName: 'game1', playerName: 'player1' });

            clientSocket.on('error', (error) => {
                try {
                    expect(error.message).toBe('Player already in game');
                    done();
                } catch (err) {
                    done(err);
                }
            });

            clientSocket.on('gameJoined', () => {
                done(new Error('Unexpected successful game join'));
            });
        });
    });

    describe('Leave Game', () => {

        test('should leave game successfully', (done) => {
            const mockPlayer = { name: 'player1' };
            const mockGame = {
                name: 'game1',
                removeGame: jest.fn(),
                removePlayers: jest.fn(),
                getPlayers: jest.fn().mockResolvedValue([]),
                isGamePlayer: jest.fn().mockResolvedValue(true),
                isGameCreator: jest.fn().mockResolvedValue(false),
                remove: jest.fn(),
            };
        
            Player.getByUsername.mockResolvedValue(mockPlayer);
            Game.getByName.mockResolvedValue(mockGame);
        
            clientSocket.emit('leaveGame', { roomName: 'game1', playerName: 'player1' });
        
            clientSocket.on('gameDeleted', (data) => {
                try {
                    expect(data).toBeUndefined();
                    expect(mockGame.remove).toHaveBeenCalledWith('game1');
                    done();
                } catch (error) {
                    done(error);
                }
            });
        
            clientSocket.on('error', (error) => {
                done(new Error(`Unexpected error: ${error.message}`));
            });
        });
            

        test('should handle errors when leaving game as user does not exists', (done) => {
            Player.getByUsername.mockResolvedValue(null);
            clientSocket.emit('leaveGame', { roomName: 'game1', playerName: 'nonexistentPlayer' });
    
            clientSocket.on('error', (error) => {
                try {
                    expect(error.message).toBe('Player not found');
                    done();
                } catch (err) {
                    done(err);
                }
            });
    
            clientSocket.on('gameLeft', () => {
                done(new Error('Unexpected successful game leave'));
            });
        });

        test('should handle errors when leaving game as game does not exists', (done) => {
            Player.getByUsername.mockResolvedValue({ name: 'player1' });
            Game.getByName.mockResolvedValue(null);
            clientSocket.emit('leaveGame', { roomName: 'nonexistentGame', playerName: 'player1' });
    
            clientSocket.on('error', (error) => {
                try {
                    expect(error.message).toBe('Game not found');
                    done();
                } catch (err) {
                    done(err);
                }
            });
    
            clientSocket.on('gameLeft', () => {
                done(new Error('Unexpected successful game leave'));
            });
        });

        test('should handle errors when leaving game as player not in game', (done) => {
            const mockPlayer = { name: 'player1' };
            const mockGame = {
                name: 'game1',
                removePlayer: jest.fn(),  // Ensure this method is correctly mocked
                getPlayers: jest.fn().mockResolvedValue([]),
                isGamePlayer: jest.fn().mockResolvedValue(false),  // Ensure this method is correctly mocked
            };
    
            Player.getByUsername.mockResolvedValue(mockPlayer);
            Game.getByName.mockResolvedValue(mockGame);
    
            // Emit event to leave game
            clientSocket.emit('leaveGame', { roomName: 'game1', playerName: 'player1' });
    
            clientSocket.on('gameLeft', () => {
                done(new Error('Unexpected successful game leave'));
            });
    
            clientSocket.on('error', (error) => {
                try {
                    expect(error.message).toBe('Player not in game');
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });
});
