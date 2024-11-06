// +------------------------------------------------+
// |        REDTETRIS SOCKET SERVICE TESTING        |
// +------------------------------------------------+

const Game = require('@models/gameModel');
const Player = require('@models/playerModel');
const { setupSocket } = require('@services/socketService'); 
const gameService = require('@services/gameService');

// +------------------- MOCKS ---------------------+

jest.mock('@models/gameModel');
jest.mock('@models/playerModel');

// +------------------- TESTS ---------------------+

describe('Socket Service', () => {

    describe('Socket setup', () => {
        let io;
        let socket;

        beforeEach(() => {
            io = {
                on: jest.fn(),
            };
            socket = {
                on: jest.fn(),
            };
            io.on.mockImplementation((event, callback) => {
                if (event === 'connection') {
                    callback(socket);
                }
            });
        });

        test('should register event listeners on connection', () => {
            setupSocket(io); 

            expect(io.on).toHaveBeenCalledWith('connection', expect.any(Function));

            expect(socket.on).toHaveBeenCalledWith('joinGame', expect.any(Function));
            expect(socket.on).toHaveBeenCalledWith('startGame', expect.any(Function));
            expect(socket.on).toHaveBeenCalledWith('triggerGame', expect.any(Function));
            expect(socket.on).toHaveBeenCalledWith('leaveGame', expect.any(Function));
            expect(socket.on).toHaveBeenCalledWith('updatedGame', expect.any(Function));
            expect(socket.on).toHaveBeenCalledWith('scoreGame', expect.any(Function));
            expect(socket.on).toHaveBeenCalledWith('lostGame', expect.any(Function));
            expect(socket.on).toHaveBeenCalledWith('rematchGame', expect.any(Function));
            expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
        });

        test('should call gameService.joinGame when joinGame event is emitted', async () => {
            setupSocket(io);
            const { joinGame } = gameService;
            const joinGameMock = jest.fn();
            gameService.joinGame = joinGameMock;

            await socket.on.mock.calls.find(call => call[0] === 'joinGame')[1]({ roomName: 'testRoom', playerName: 'testPlayer' }); // Trigger joinGame event
            expect(joinGameMock).toHaveBeenCalledWith(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' }); // Check if the mock was called with the right arguments
            gameService.joinGame = joinGame; // Restore the original method
        });

        test('should call gameService.startGame when startGame event is emitted', async () => {
            setupSocket(io);
            const { startGame } = gameService;
            const startGameMock = jest.fn();
            gameService.startGame = startGameMock;

            await socket.on.mock.calls.find(call => call[0] === 'startGame')[1]({ roomName: 'testRoom', playerName: 'testPlayer' }); // Trigger startGame event
            expect(startGameMock).toHaveBeenCalledWith(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' }); // Check if the mock was called with the right arguments
            gameService.startGame = startGame; // Restore the original method
        });

        test('should call gameService.triggerGame when triggerGame event is emitted', async () => {
            setupSocket(io);
            const { triggerGame } = gameService;
            const triggerGameMock = jest.fn();
            gameService.triggerGame = triggerGameMock;

            await socket.on.mock.calls.find(call => call[0] === 'triggerGame')[1]({ roomName: 'testRoom' }); // Trigger triggerGame event
            expect(triggerGameMock).toHaveBeenCalledWith(io, socket, { roomName: 'testRoom' }); // Check if the mock was called with the right arguments
            gameService.triggerGame = triggerGame; // Restore the original method
        });

        test('should call gameService.leaveGame when leaveGame event is emitted', async () => {
            setupSocket(io);
            const { leaveGame } = gameService;
            const leaveGameMock = jest.fn();
            gameService.leaveGame = leaveGameMock;

            await socket.on.mock.calls.find(call => call[0] === 'leaveGame')[1]({ roomName: 'testRoom', playerName: 'testPlayer' }); // Trigger leaveGame event
            expect(leaveGameMock).toHaveBeenCalledWith(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' }); // Check if the mock was called with the right arguments
            gameService.leaveGame = leaveGame; // Restore the original method
        });

        test('should call gameService.updateGame when updatedGame event is emitted', async () => {
            setupSocket(io);
            const { updateGame } = gameService;
            const updateGameMock = jest.fn();
            gameService.updateGame = updateGameMock;

            await socket.on.mock.calls.find(call => call[0] === 'updatedGame')[1]({ roomName: 'testRoom', playerName: 'testPlayer', grid: [[null, null], [null, null]] }); // Trigger updatedGame event
            expect(updateGameMock).toHaveBeenCalledWith(io, socket, { roomName: 'testRoom', playerName: 'testPlayer', grid: [[null, null], [null, null]] }); // Check if the mock was called with the right arguments
            gameService.updateGame = updateGame; // Restore the original method
        });

        test('should call gameService.scoreGame when scoreGame event is emitted', async () => {
            setupSocket(io);
            const { scoreGame } = gameService;
            const scoreGameMock = jest.fn();
            gameService.scoreGame = scoreGameMock;

            await socket.on.mock.calls.find(call => call[0] === 'scoreGame')[1]({ roomName: 'testRoom', playerName: 'testPlayer', lines: 10, level: 1 }); // Trigger scoreGame event
            expect(scoreGameMock).toHaveBeenCalledWith(io, socket, { roomName: 'testRoom', playerName: 'testPlayer', lines: 10, level: 1 }); // Check if the mock was called with the right arguments
            gameService.scoreGame = scoreGame; // Restore the original method
        });

        test('should call gameService.lostGame when lostGame event is emitted', async () => {
            setupSocket(io);
            const { lostGame } = gameService;
            const lostGameMock = jest.fn();
            gameService.lostGame = lostGameMock;

            await socket.on.mock.calls.find(call => call[0] === 'lostGame')[1]({ roomName: 'testRoom', playerName: 'testPlayer' }); // Trigger lostGame event
            expect(lostGameMock).toHaveBeenCalledWith(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' }); // Check if the mock was called with the right arguments
            gameService.lostGame = lostGame; // Restore the original method
        });

        test('should call gameService.leaveGame when disconnect event is emitted', async () => {
            setupSocket(io);
            const { disconnect } = gameService;
            const disconnectMock = jest.fn();
            gameService.disconnect = disconnectMock;

            await socket.on.mock.calls.find(call => call[0] === 'disconnect')[1](); // Trigger disconnect event
            expect(disconnectMock).toHaveBeenCalledWith(io, socket); // Check if the mock was called with the right arguments
            gameService.disconnect = disconnect; // Restore the original method
        });

        test('should call gameService.rematchGame when rematchGame event is emitted', async () => {
            setupSocket(io);
            const { rematchGame } = gameService;
            const rematchGameMock = jest.fn();
            gameService.rematchGame = rematchGameMock;

            await socket.on.mock.calls.find(call => call[0] === 'rematchGame')[1]({ roomName: 'testRoom', playerName: 'testPlayer' }); // Trigger rematchGame event
            expect(rematchGameMock).toHaveBeenCalledWith(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' }); // Check if the mock was called with the right arguments
            gameService.rematchGame = rematchGame; // Restore the original method
        });
  
       
    });

    describe('Socket events', () => {
        
        describe('joinGame', () => {
            let io;
            let socket;
            let mockGame;
            let mockPlayer;

            beforeEach(() => {
                io = {
                    to: jest.fn().mockReturnThis(),
                    emit: jest.fn(),
                };
                socket = {
                    id: 'socket_id',
                };

                mockGame = {
                    isGamePlayer: jest.fn(),
                    addPlayers: jest.fn(),
                    getPlayers: jest.fn().mockReturnValue([]),
                    getStatus: jest.fn().mockReturnValue('pending'),
                    isGameFull: jest.fn().mockReturnValue(false),
                    isGameCreator: jest.fn(),
                    isGameTraining: jest.fn().mockReturnValue(false),
                    isGameSprint: jest.fn().mockReturnValue(false),
                    updateMode: jest.fn(),
                    isGameJoinable: jest.fn().mockReturnValue(true),
                };

                mockPlayer = {
                    username: 'testPlayer',
                };

                // Mock implementations
                Player.getByUsername.mockResolvedValue(mockPlayer);
                Game.getByName.mockResolvedValue(mockGame);
            });

            afterEach(() => {
                jest.clearAllMocks();
            });

            test('should join the game successfully', async () => {
                mockGame.isGamePlayer.mockResolvedValue(false);
                mockGame.getPlayers.mockReturnValue([mockPlayer]);
                
                await gameService.joinGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' });
                
                expect(mockGame.addPlayers).toHaveBeenCalledWith(socket, mockPlayer);
                expect(io.to).toHaveBeenCalledWith('testRoom');
                expect(io.emit).toHaveBeenCalledWith('gamePlayers', [mockPlayer]);
                expect(io.emit).toHaveBeenCalledWith('gameFull', false);
            });

            test('should throw error for invalid input', async () => {
                await expect(gameService.joinGame(io, socket, { roomName: 'testRoom' })).rejects.toThrow('Invalid input');
                await expect(gameService.joinGame(io, socket, { playerName: 'testPlayer' })).rejects.toThrow('Invalid input');
            });

            test('should throw error if player not found', async () => {
                Player.getByUsername.mockResolvedValue(null);
                await expect(gameService.joinGame(io, socket, { roomName: 'testRoom', playerName: 'unknownPlayer' })).rejects.toThrow('Player not found');
            });

            test('should throw error if game not found', async () => {
                Game.getByName.mockResolvedValue(null);
                await expect(gameService.joinGame(io, socket, { roomName: 'unknownRoom', playerName: 'testPlayer' })).rejects.toThrow('Game not found or does not exist');
            });

            test('should throw error if player already in game', async () => {
                mockGame.isGamePlayer.mockResolvedValue(true);
                await expect(gameService.joinGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' })).rejects.toThrow('Player already in game');
            });
        });

        describe('startGame', () => {
            let io;
            let socket;
            let mockGame;

            beforeEach(() => {
                io = {
                    to: jest.fn().mockReturnThis(),
                    emit: jest.fn(),
                };
                socket = {
                    id: 'socket_id',
                };

                mockGame = {
                    startGame: jest.fn(),
                    getStatus: jest.fn().mockReturnValue('pending'),
                    getSprint: jest.fn(),
                };
                Game.getByName.mockResolvedValue(mockGame);
            });

            afterEach(() => {
                jest.clearAllMocks();
            });

            test('should start the game successfully', async () => {
                await gameService.startGame(io, socket, { roomName: 'testRoom' });

                expect(io.to).toHaveBeenCalledWith('testRoom');
                expect(io.emit).toHaveBeenCalledWith('gameStarted');
            });

            test('should throw error for invalid input', async () => {
                await expect(gameService.startGame(io, socket, { roomName: '' })).rejects.toThrow('Invalid input');
            });

            test('should throw error if game not found', async () => {
                Game.getByName.mockResolvedValue(null);
                await expect(gameService.startGame(io, socket, { roomName: 'unknownRoom' })).rejects.toThrow('Game not found');
            });

            test('should throw error if game is not in pending status', async () => {
                mockGame.getStatus.mockReturnValue('started');
                await expect(gameService.startGame(io, socket, { roomName: 'testRoom' })).rejects.toThrow('Game is not in pending status');
            });
        });

        describe('leaveGame', () => {
            let io;
            let socket;
            let mockGame;
            let mockPlayer;
        
            beforeEach(() => {
                io = {
                    to: jest.fn().mockReturnThis(),
                    emit: jest.fn(),
                };
                socket = {
                    id: 'socket_id',
                };
        
                mockPlayer = {
                    username: 'testPlayer',
                    getUsername: jest.fn().mockReturnValue('testPlayer')
                };
        
                mockGame = {
                    isGamePlayer: jest.fn(),
                    removePlayers: jest.fn(),
                    getPlayers: jest.fn().mockReturnValue([mockPlayer]), // Return player here
                    getStatus: jest.fn().mockReturnValue('pending'),
                    isGameFull: jest.fn().mockReturnValue(false),
                    updateLosers: jest.fn(),
                    getScores: jest.fn(),
                    isEndGame: jest.fn().mockReturnValue(false),
                    isGameCreator: jest.fn(),
                    isGameLoser: jest.fn().mockReturnValue(false),
                    updateCreator: jest.fn(),
                    remove: jest.fn(),
                    getParent: jest.fn(),
                    isGameRematcher: jest.fn(),
                    updateRematcher: jest.fn(),
                    getMode: jest.fn().mockReturnValue('multiplayer'),
                };
        
                // Mock implementations
                Player.getByUsername.mockResolvedValue(mockPlayer);
                Game.getByName.mockResolvedValue(mockGame);
            });
        
            afterEach(() => {
                jest.clearAllMocks();
            });
        
            test('should leave the game successfully when in progress', async () => {
                mockGame.getStatus.mockReturnValue('in progress'); // Game status should be 'in progress'
                mockGame.isGameCreator.mockReturnValue(true); // Current player is the game creator
                mockGame.isGamePlayer.mockResolvedValue(true); // Player is in the game
        
                await gameService.leaveGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' });

                expect(io.to).toHaveBeenCalledWith('testRoom');
            });
        
            test('should leave the game successfully when pending', async () => {
                mockGame.getStatus.mockReturnValue('pending');
                mockGame.isGameCreator.mockReturnValue(true);
                mockGame.isGamePlayer.mockResolvedValue(true); // Ensure player is in game
        
                await gameService.leaveGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' });
        
                expect(mockGame.removePlayers).toHaveBeenCalledWith(socket, 0, mockPlayer);
                expect(mockGame.remove).toHaveBeenCalledWith('testRoom');
                expect(io.to).toHaveBeenCalledWith('testRoom');
                expect(io.emit).toHaveBeenCalledWith('gameDeleted', {});
            });
        
            test('should throw error for invalid input', async () => {
                await expect(gameService.leaveGame(io, socket, { roomName: 'testRoom' })).rejects.toThrow('Invalid input');
                await expect(gameService.leaveGame(io, socket, { playerName: 'testPlayer' })).rejects.toThrow('Invalid input');
            });
        
            test('should throw error if player not found', async () => {
                Player.getByUsername.mockResolvedValue(null);
                await expect(gameService.leaveGame(io, socket, { roomName: 'testRoom', playerName: 'unknownPlayer' })).rejects.toThrow('Player not found');
            });
        
            test('should throw error if game not found', async () => {
                Game.getByName.mockResolvedValue(null);
                await expect(gameService.leaveGame(io, socket, { roomName: 'unknownRoom', playerName: 'testPlayer' })).rejects.toThrow('Game not found');
            });
        
            test('should throw error if player is not in game', async () => {
                mockGame.isGamePlayer.mockResolvedValue(false); // Ensure this fails the test
                await expect(gameService.leaveGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' })).rejects.toThrow('Player not in game');
            });
        });

        describe('rematchGame', () => {
            let io;
            let socket;
            let mockGame;
            let mockPlayer;
        
            beforeEach(() => {
                io = {
                    to: jest.fn().mockReturnThis(),
                    emit: jest.fn(),
                };
                socket = {
                    id: 'socket_id',
                };
        
                mockPlayer = {
                    username: 'testPlayer',
                    getUsername: jest.fn().mockReturnValue('testPlayer')
                };
        
                mockGame = {
                    getStatus: jest.fn().mockReturnValue('finished'),
                    getName: jest.fn().mockReturnValue('testRoom.1'),
                    getMode: jest.fn().mockReturnValue('multiplayer'),
                    getSprint: jest.fn(),
                    isGamePlayer: jest.fn(),
                    isGameRematcher: jest.fn(),
                    create: jest.fn(),
                    getCreator: jest.fn().mockReturnValue(mockPlayer),
                };
        
                // Mock implementations
                Player.getByUsername.mockResolvedValue(mockPlayer);
                Game.getByName.mockResolvedValue(mockGame);
            });
        
            afterEach(() => {
                jest.clearAllMocks();
            });
        
            test('should create a rematch game successfully', async () => {
                mockGame.isGamePlayer.mockResolvedValue(true);
                mockGame.isGameRematcher.mockReturnValue(true); // Allow rematch
                Game.create.mockResolvedValue({
                    getName: jest.fn().mockReturnValue('testRoom.2'),
                    getCreator: jest.fn().mockReturnValue(mockPlayer),
                });
        
                await gameService.rematchGame(io, socket, { roomName: 'testRoom.1', playerName: 'testPlayer' });
        
                expect(Game.getByName).toHaveBeenCalledWith('testRoom.1');
                expect(mockGame.isGamePlayer).toHaveBeenCalledWith(mockPlayer);
                expect(mockGame.isGameRematcher).toHaveBeenCalledWith(mockPlayer);
                expect(Game.create).toHaveBeenCalledWith('testRoom.2', 'multiplayer', mockPlayer, undefined, mockGame);
                expect(io.to).toHaveBeenCalledWith('testRoom.1');
                expect(io.emit).toHaveBeenCalledWith('gameRematched', { creator: mockPlayer, roomName: 'testRoom.2' });
            });
        
            test('should throw error if game is not found', async () => {
                Game.getByName.mockResolvedValue(null);
                await expect(gameService.rematchGame(io, socket, { roomName: 'testRoom.1', playerName: 'testPlayer' })).rejects.toThrow('Game not found');
            });
        
            test('should throw error if game is not finished', async () => {
                mockGame.getStatus.mockReturnValue('in progress');
                await expect(gameService.rematchGame(io, socket, { roomName: 'testRoom.1', playerName: 'testPlayer' })).rejects.toThrow('Game is not ended');
            });
        
            test('should throw error if player is not found', async () => {
                Player.getByUsername.mockResolvedValue(null);
                await expect(gameService.rematchGame(io, socket, { roomName: 'testRoom.1', playerName: 'unknownPlayer' })).rejects.toThrow('Player not found');
            });
        
            test('should throw error if player is not in game', async () => {
                mockGame.isGamePlayer.mockResolvedValue(false);
                await expect(gameService.rematchGame(io, socket, { roomName: 'testRoom.1', playerName: 'testPlayer' })).rejects.toThrow('Player not in game');
            });
        
            test('should throw error if player is not allowed to rematch', async () => {
                mockGame.isGamePlayer.mockResolvedValue(true);
                mockGame.isGameRematcher.mockReturnValue(false);
                await expect(gameService.rematchGame(io, socket, { roomName: 'testRoom.1', playerName: 'testPlayer' })).rejects.toThrow('Player not allowed to rematch');
            });
        });    

        describe('triggerGame', () => {
            let io;
            let socket;
            let mockGame;
        
            beforeEach(() => {
                io = {
                    to: jest.fn().mockReturnThis(),
                    emit: jest.fn(),
                };
                socket = {
                    id: 'socket_id',
                };
        
                mockGame = {
                    getStatus: jest.fn().mockReturnValue('in progress'),
                    getPieces: jest.fn().mockReturnValue([{ piece: 'X' }, { piece: 'O' }]), // Example game pieces
                };
        
                // Mock Game.getByName to return the mockGame
                Game.getByName.mockResolvedValue(mockGame);
            });
        
            afterEach(() => {
                jest.clearAllMocks();
            });
        
            test('should throw error for invalid input', async () => {
                await expect(gameService.triggerGame(io, socket, { roomName: undefined })).rejects.toThrow('Invalid input');
            });
        
            test('should throw error if game is not found', async () => {
                Game.getByName.mockResolvedValue(null); // Mock game not found
                await expect(gameService.triggerGame(io, socket, { roomName: 'unknownRoom' })).rejects.toThrow('Game not found');
            });
        
            test('should throw error if game is not in progress', async () => {
                mockGame.getStatus.mockReturnValue('finished'); // Mock game status
                await expect(gameService.triggerGame(io, socket, { roomName: 'testRoom' })).rejects.toThrow('Game is not in progress');
            });
        
            test('should emit game pieces if game is in progress', async () => {
                await gameService.triggerGame(io, socket, { roomName: 'testRoom' });
        
                // Check that emit was called correctly
                expect(io.to).toHaveBeenCalledWith('testRoom');
                expect(io.to('testRoom').emit).toHaveBeenCalledWith('gamePieces', mockGame.getPieces());
            });
        });

        describe('updateGame', () => {
            let io;
            let socket;
            let mockGame;
            let mockPlayer;
            const grid = [[null, null], [null, null]]; // Sample grid input
        
            beforeEach(() => {
                io = {
                    to: jest.fn().mockReturnThis(),
                    emit: jest.fn(),
                };
                socket = {
                    id: 'socket_id',
                };
        
                mockGame = {
                    getStatus: jest.fn().mockReturnValue('in progress'),
                    isGamePlayer: jest.fn(),
                    getPlayerScore: jest.fn().mockResolvedValue(10), // Example score
                };
        
                mockPlayer = {
                    username: 'testPlayer',
                };
        
                // Mock implementations
                Game.getByName.mockResolvedValue(mockGame);
                Player.getByUsername.mockResolvedValue(mockPlayer);
            });
        
            afterEach(() => {
                jest.clearAllMocks();
            });
        
            test('should throw error for invalid input', async () => {
                await expect(gameService.updateGame(io, socket, { roomName: undefined, playerName: 'testPlayer', grid })).rejects.toThrow('Invalid input');
                await expect(gameService.updateGame(io, socket, { roomName: 'testRoom', playerName: undefined, grid })).rejects.toThrow('Invalid input');
                await expect(gameService.updateGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer', grid: undefined })).rejects.toThrow('Invalid input');
            });
        
            test('should throw error if game is not found', async () => {
                Game.getByName.mockResolvedValue(null); // Mock game not found
                await expect(gameService.updateGame(io, socket, { roomName: 'unknownRoom', playerName: 'testPlayer', grid })).rejects.toThrow('Game not found');
            });
        
            test('should throw error if game is not in progress', async () => {
                mockGame.getStatus.mockReturnValue('finished'); // Mock game status
                await expect(gameService.updateGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer', grid })).rejects.toThrow('Game is not in progress');
            });
        
            test('should throw error if player is not found', async () => {
                Player.getByUsername.mockResolvedValue(null); // Mock player not found
                await expect(gameService.updateGame(io, socket, { roomName: 'testRoom', playerName: 'unknownPlayer', grid })).rejects.toThrow('Player not found');
            });
        
            test('should throw error if player is not in game', async () => {
                mockGame.isGamePlayer.mockResolvedValue(false); // Ensure player is not in game
                await expect(gameService.updateGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer', grid })).rejects.toThrow('Player not in game');
            });
        
            test('should emit gameUpdated event with updated grid and score', async () => {
                mockGame.isGamePlayer.mockResolvedValue(true); // Ensure player is in game
        
                // Run the updateGame function
                await gameService.updateGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer', grid });
        
                // Expect the first two rows to remain unchanged and the rest to be filled with 'H'
                const expectedGrid = [[null, null], [null, null]];
        
                expect(io.to).toHaveBeenCalledWith('testRoom');
                expect(io.to('testRoom').emit).toHaveBeenCalledWith('gameUpdated', {
                    playerName: 'testPlayer',
                    grid: expectedGrid,
                    score: 10,
                });
            });
        });
        
        describe('scoreGame', () => {
            let io;
            let socket;
            let mockGame;
            let mockPlayer;
        
            beforeEach(() => {
                io = {
                    to: jest.fn().mockReturnThis(),
                    emit: jest.fn(),
                };
                socket = {
                    id: 'socket_id',
                };
        
                mockGame = {
                    getStatus: jest.fn().mockReturnValue('in progress'),
                    isGamePlayer: jest.fn(),
                    updateScore: jest.fn().mockResolvedValue(true), // Mock successful score update
                };
        
                mockPlayer = {
                    username: 'testPlayer',
                };
        
                // Mock implementations
                Game.getByName.mockResolvedValue(mockGame);
                Player.getByUsername.mockResolvedValue(mockPlayer);
            });
        
            afterEach(() => {
                jest.clearAllMocks();
            });
        
            test('should throw error for invalid input', async () => {
                await expect(gameService.scoreGame(io, socket, { roomName: undefined, playerName: 'testPlayer', lines: 10, level: 1 })).rejects.toThrow('Invalid input');
                await expect(gameService.scoreGame(io, socket, { roomName: 'testRoom', playerName: undefined, lines: 10, level: 1 })).rejects.toThrow('Invalid input');
                await expect(gameService.scoreGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer', lines: undefined, level: 1 })).rejects.toThrow('Invalid input');
            });
        
            test('should throw error if game is not found', async () => {
                Game.getByName.mockResolvedValue(null); // Mock game not found
                await expect(gameService.scoreGame(io, socket, { roomName: 'unknownRoom', playerName: 'testPlayer', lines: 10, level: 1 })).rejects.toThrow('Game not found');
            });
        
            test('should throw error if game is not in progress', async () => {
                mockGame.getStatus.mockReturnValue('finished'); // Mock game status
                await expect(gameService.scoreGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer', lines: 10, level: 1 })).rejects.toThrow('Game is not in progress');
            });
        
            test('should throw error if player is not found', async () => {
                Player.getByUsername.mockResolvedValue(null); // Mock player not found
                await expect(gameService.scoreGame(io, socket, { roomName: 'testRoom', playerName: 'unknownPlayer', lines: 10, level: 1 })).rejects.toThrow('Player not found');
            });
        
            test('should throw error if player is not in game', async () => {
                mockGame.isGamePlayer.mockResolvedValue(false); // Ensure player is not in game
                await expect(gameService.scoreGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer', lines: 10, level: 1 })).rejects.toThrow('Player not in game');
            });
        });

        describe('lostGame', () => {
            let io;
            let socket;
            let mockGame;
            let mockPlayer;
        
            beforeEach(() => {
                io = {
                    to: jest.fn().mockReturnThis(),
                    emit: jest.fn(),
                };
                socket = {
                    id: 'socket_id',
                };
        
                mockGame = {
                    getStatus: jest.fn().mockReturnValue('in progress'),
                    isGamePlayer: jest.fn(),
                    updateLosers: jest.fn().mockResolvedValue(true),
                    getScores: jest.fn(),
                    isEndGame: jest.fn().mockReturnValue(false),
                    endGame: jest.fn(),
                    getWinner: jest.fn(),
                    getRematcher: jest.fn(),
                };
        
                mockPlayer = {
                    username: 'testPlayer',
                };
        
                // Mock implementations
                Game.getByName = jest.fn().mockResolvedValue(mockGame);
                Player.getByUsername = jest.fn().mockResolvedValue(mockPlayer);
            });
        
            afterEach(() => {
                jest.clearAllMocks();
            });
        
            test('should throw error for invalid input', async () => {
                await expect(gameService.lostGame(io, socket, { playerName: 'testPlayer' })).rejects.toThrow('Invalid input');
                await expect(gameService.lostGame(io, socket, { roomName: 'testRoom' })).rejects.toThrow('Invalid input');
            });
        
            test('should throw error if game is not found', async () => {
                Game.getByName.mockResolvedValue(null);
                await expect(gameService.lostGame(io, socket, { roomName: 'unknownRoom', playerName: 'testPlayer' })).rejects.toThrow('Game not found');
            });
        
            test('should throw error if game is not in progress', async () => {
                mockGame.getStatus.mockReturnValue('finished');
                await expect(gameService.lostGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' })).rejects.toThrow('Game is not in progress');
            });
        
            test('should throw error if player is not found', async () => {
                Player.getByUsername.mockResolvedValue(null);
                await expect(gameService.lostGame(io, socket, { roomName: 'testRoom', playerName: 'unknownPlayer' })).rejects.toThrow('Player not found');
            });
        
            test('should throw error if player is not in game', async () => {
                mockGame.isGamePlayer.mockResolvedValue(false);
                await expect(gameService.lostGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' })).rejects.toThrow('Player not in game');
            });
        
            test('should emit gameLost event with correct scores', async () => {
                mockGame.isGamePlayer.mockResolvedValue(true);
                mockGame.getScores.mockResolvedValue({ player1: 10, player2: 20 });
        
                Player.getById = jest.fn((id) => Promise.resolve({ username: id === 'player1' ? 'Player1' : 'Player2' }));
        
                const formattedScores = { Player2: 20, Player1: 10 };
        
                await gameService.lostGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' });
        
                expect(mockGame.updateLosers).toHaveBeenCalledWith(mockPlayer, false);
                expect(io.to).toHaveBeenCalledWith('testRoom');
                expect(io.to('testRoom').emit).toHaveBeenCalledWith('gameLost', { playerName: 'testPlayer', scores: formattedScores });
            });
        
            test('should end game if isEndGame returns true', async () => {
                mockGame.isGamePlayer.mockResolvedValue(true);
                mockGame.isEndGame.mockReturnValue(true);
                mockGame.getWinner.mockReturnValue(mockPlayer);
                mockGame.getRematcher.mockReturnValue({ username: 'rematcher' });
        
                await gameService.lostGame(io, socket, { roomName: 'testRoom', playerName: 'testPlayer' });
        
                expect(mockGame.endGame).toHaveBeenCalled();
                expect(io.to('testRoom').emit).toHaveBeenCalledWith('gameEnded', { winner: mockPlayer, scores: expect.anything(), rematcher: { username: 'rematcher' } });
            });
        });
        
        describe('disconnect', () => {
            let io;
            let socket;
        
            beforeEach(() => {
                io = {
                    to: jest.fn().mockReturnThis(),
                    emit: jest.fn(),
                };
        
                socket = {
                    id: 'socket_id',
                };
        
                global.socketRooms = new Map();
            });
        
            afterEach(() => {
                jest.clearAllMocks();
                global.socketRooms.clear();
            });
        
            test('should not attempt to leave game if player is not found', async () => {
                console.log = jest.fn();
        
                socketRooms.set(socket.id, { roomName: 'testRoom', playerName: 'testPlayer' });
        
                Player.getByUsername = jest.fn().mockResolvedValue(null);
        
                await gameService.disconnect(io, socket);
        
                expect(console.log).toHaveBeenCalledWith('[GAME] Player testPlayer disconnected from game testRoom');
            });
        });
        
    });
});