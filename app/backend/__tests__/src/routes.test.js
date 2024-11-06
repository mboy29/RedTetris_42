// +------------------------------------------------+
// |            REDTETRIS ROUTES TESTING            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This test suite verifies the functionality of the
    RedTetris API routes. It includes tests for the
    authentication, player, session, and game routes.
    The tests use Jest and Supertest to simulate HTTP
    requests to the server.

    Test Suites includes: Authentication, Player,
    Session, and Game routes.
*/

// +----------------- REQUIREMENTS -----------------+

const express = require('express');
const session = require('express-session');
const request = require('supertest');

const { app } = require('@root/server');
const Player = require('@models/playerModel');
const Game = require('@models/gameModel');
const sessionRoutes = require('@routes/sessionRoutes');
const { init } = require('@database/initDatabase'); 

// +------------------- MOCKS ---------------------+

jest.mock('@models/playerModel'); 
jest.mock('@models/gameModel');

// +-------------------- TESTS --------------------+

describe('Routes', () => {
    let agent;

    beforeAll(async () => {
        agent = request.agent(app);
    });
    
    // +--------------- AUTH ROUTES ---------------+

    describe('Authentication Routes', () => {
        describe('POST Routes', () => {
            describe('POST /auth/register', () => {
                it('should register a new user and return success', async () => {
                    const mockPlayer = {
                        username: 'testuser',
                        authenticate: jest.fn(() => Promise.resolve(true))
                    };
                    Player.create.mockResolvedValue(mockPlayer);

                    const res = await agent.post('/auth/register')
                        .send({
                            username: 'testuser',
                            password: 'password123',
                            passwordConfirm: 'password123'
                        });

                    expect(res.statusCode).toBe(200);
                    expect(res.body.success).toBe(true);
                    expect(res.body.user.username).toBe('testuser');
                });

                it('should fail registration if passwords do not match', async () => {
                    Player.create.mockRejectedValue(new Error('Passwords do not match'));

                    const res = await agent.post('/auth/register')
                        .send({
                            username: 'testuser',
                            password: 'password123',
                            passwordConfirm: 'password456'
                        });

                    expect(res.statusCode).toBe(400);
                    expect(res.body.success).toBe(false);
                    expect(res.body.message).toBe('Passwords do not match');
                });
            });

            describe('POST /auth/login', () => {
                it('should login a user and return success', async () => {
                    const mockPlayer = {
                        username: 'testuser',
                        authenticate: jest.fn(() => Promise.resolve(true))
                    };
                    Player.authenticate.mockResolvedValue(mockPlayer);

                    const res = await agent.post('/auth/login')
                        .send({
                            username: 'testuser',
                            password: 'password123'
                        });

                    expect(res.statusCode).toBe(200);
                    expect(res.body.success).toBe(true);
                    expect(res.body.user.username).toBe('testuser');
                });

                it('should fail login with incorrect credentials', async () => {
                    Player.authenticate.mockRejectedValue(new Error('Invalid credentials'));

                    const res = await agent.post('/auth/login')
                        .send({
                            username: 'testuser',
                            password: 'wrongpassword'
                        });

                    expect(res.statusCode).toBe(401);
                    expect(res.body.success).toBe(false);
                    expect(res.body.message).toBe('Invalid credentials');
                });
            });

            describe('POST /auth/logout', () => {
                it('should logout the user and return success', async () => {
                    const mockPlayer = {
                        username: 'testuser',
                        disconnect: jest.fn(() => Promise.resolve())
                    };
                    Player.getByUsername.mockResolvedValue(mockPlayer);

                    const res = await agent.post('/auth/logout');

                    expect(res.statusCode).toBe(200);
                    expect(res.body.success).toBe(true);
                    expect(res.body.message).toBe('Logged out successfully');
                });

                it('should fail to logout if no user is logged in', async () => {
                    agent = await request.agent(app); // Reinitialize to not have a session

                    const res = await agent.post('/auth/logout');

                    expect(res.statusCode).toBe(401);
                    expect(res.body.success).toBe(false);
                    expect(res.body.message).toBe('Not logged in');
                });
            });
        });
    });

    // +-------------- PLAYER ROUTES --------------+

    describe('Player Routes', () => {
    
        describe('GET Routes', () => {
            describe('GET /player/scores', () => {
                it('should retrieve all player scores successfully', async () => {
                    const mockPlayers = [
                        { username: 'player1', score: 100 },
                        { username: 'player2', score: 200 }
                    ];
                    Player.getAllScores.mockResolvedValue(mockPlayers);
    
                    const res = await agent.get('/player/scores');
    
                    expect(res.statusCode).toBe(200);
                    expect(res.body.success).toBe(true);
                    expect(res.body.scores).toHaveLength(2);
                    expect(res.body.scores).toEqual(mockPlayers);
                });
    
                it('should handle errors when retrieving scores', async () => {
                    Player.getAllScores.mockRejectedValue(new Error('Database error'));
    
                    const res = await agent.get('/player/scores');
    
                    expect(res.statusCode).toBe(400);
                    expect(res.body.success).toBe(false);
                    expect(res.body.message).toBe('Database error');
                });
            });
        });
    });

    // +-------------- SESSION ROUTES -------------+

    describe('Session Routes', () => {
        beforeAll(() => {
            app.use(session({
                secret: 'test-secret',
                resave: false,
                saveUninitialized: true,
            }));
            app.use('/session', sessionRoutes);
        });

        describe('GET /session/get', () => {
            it('should return null if no user is in the session', async () => {
                const response = await agent.get('/session/get');
                expect(response.status).toBe(200);
                expect(response.body).toEqual(expect.objectContaining({ user: null }));
            });
        });
    });

    // +--------------- GAME ROUTES ---------------+


    describe('Game Routes', () => {
        beforeAll(() => {
            app.use(session({
                secret: 'test-secret',
                resave: false,
                saveUninitialized: true,
            }));
            app.use('/session', sessionRoutes);
        });

        describe('POST routes', () => {

            describe('/game/create', () => {
                it('should create a game when room and player names are valid', async () => {
                    const playerName = 'TestPlayer';
                    const roomName = 'TestRoom';

                    Player.getByUsername.mockResolvedValue({ username: playerName });
                    Game.getByName.mockResolvedValue(null); 
                    Game.create.mockResolvedValue({ name: roomName, player: { username: playerName } });

                    const res = await agent
                        .post('/game/create')
                        .send({ roomName, playerName });

                    expect(res.status).toBe(201); // Success
                    expect(res.body.roomName).toBe(roomName);
                    expect(res.body.playerName).toBe(playerName);
                });

                it('should return 400 if roomName or playerName is missing', async () => {
                    const res = await agent
                        .post('/game/create')
                        .send({ roomName: 'TestRoom' }); // Missing playerName

                    expect(res.status).toBe(400); // Bad Request
                    expect(res.body.message).toBe('Invalid input');
                });

                it('should return 400 if room name is invalid (too long)', async () => {
                    const playerName = 'TestPlayer';
                    const roomName = 'ThisRoomNameIsTooLongToBeValid';

                    const res = await agent
                        .post('/game/create')
                        .send({ roomName, playerName });
                    
                    expect(res.status).toBe(400); // Bad Request
                    expect(res.body.message).toBe('Room name must be between 4 and 20 characters');
                });

                it('should return 400 if room name is invalid (too short)', async () => {
                    const playerName = 'TestPlayer';
                    const roomName = 'Rm';

                    const res = await agent
                        .post('/game/create')
                        .send({ roomName, playerName });

                    expect(res.status).toBe(400); // Bad Request
                    expect(res.body.message).toBe('Room name must be between 4 and 20 characters');
                });

                it('should return 404 if player is not found', async () => {
                    const playerName = 'UnknownPlayer';
                    Player.getByUsername.mockResolvedValue(null); // Player not found

                    const res = await agent
                        .post('/game/create')
                        .send({ roomName: 'TestRoom', playerName });

                    expect(res.status).toBe(404); // Not Found
                    expect(res.body.message).toBe('Player not found');
                });

                it('should return 409 if the game already exists', async () => {
                    const roomName = 'TestRoom';
                    const playerName = 'TestPlayer';

                    // Stubbing that the game already exists
                    Player.getByUsername.mockResolvedValue({ username: playerName });
                    Game.getByName.mockResolvedValue({ name: roomName });

                    const res = await agent
                        .post('/game/create')
                        .send({ roomName, playerName });

                    expect(res.status).toBe(409); // Conflict
                    expect(res.body.message).toBe('Game already exists');
                });
            });

            describe('/game/join', () => {
                it('should let a player join an existing game', async () => {
                    const playerName = 'TestPlayer';
                    const roomName = 'TestRoom';
                
                    Player.getByUsername.mockResolvedValue({ username: playerName });
                    Game.getByName.mockResolvedValue({ 
                        name: roomName, 
                        isGamePlayer: jest.fn().mockResolvedValue(false), 
                        isGameTraining: jest.fn().mockReturnValue(false), 
                        isGameJoinable: jest.fn().mockReturnValue(true), 
                        isGameFull: jest.fn().mockReturnValue(false) 
                    });
                
                    const res = await agent
                        .post('/game/join')
                        .send({ roomName, playerName });
                
                    expect(res.status).toBe(200);
                });

                it('should return 400 if roomName or playerName is missing', async () => {
                    const res = await agent
                        .post('/game/join')
                        .send({ roomName: 'TestRoom' }); // Missing playerName
                    
                    expect(res.status).toBe(400); // Bad Request
                    expect(res.body.message).toBe('Invalid input');
                });

                it('should return 404 if the player is not found', async () => {
                    const roomName = 'TestRoom';
                    const playerName = 'PlayerCaca';
                
                    Player.getByUsername.mockResolvedValue(null); // Player not found
                    
                    const res = await agent
                        .post('/game/join')
                        .send({ roomName, playerName });
                    
                    expect(res.status).toBe(404); // Not Found
                    expect(res.body.message).toBe('Player not found');
                });

                it('should return 404 if the game is not found', async () => {
                    const roomName = 'NonExistentRoom';
                    const playerName = 'TestPlayer';

                    Player.getByUsername.mockResolvedValue({ username: playerName });
                    Game.getByName.mockResolvedValue(null); // Game doesn't exist

                    const res = await agent
                        .post('/game/join')
                        .send({ roomName, playerName });

                    expect(res.status).toBe(404); // Not Found
                    expect(res.body.message).toBe('Game not found');
                });

                it('should return 409 if the game is training', async () => {
                    const playerName = 'TestPlayer';
                    const roomName = 'TestRoom';

                    Player.getByUsername.mockResolvedValue({ username: playerName });
                    Game.getByName.mockResolvedValue({ 
                        name: roomName, 
                        isGamePlayer: jest.fn().mockResolvedValue(false), 
                        isGameTraining: jest.fn().mockReturnValue(true), // Game is training
                        isGameJoinable: jest.fn().mockReturnValue(true), 
                        isGameFull: jest.fn().mockReturnValue(false) 
                    });
                    
                    const res = await agent
                        .post('/game/join')
                        .send({ roomName, playerName });
                    
                    expect(res.status).toBe(409);
                    expect(res.body.message).toBe('Cannot join training game');
                });

                it('should return 409 if the game is no longer joinable', async () => {
                    const playerName = 'TestPlayer';
                    const roomName = 'TestRoom';

                    Player.getByUsername.mockResolvedValue({ username: playerName });
                    Game.getByName.mockResolvedValue({ 
                        name: roomName, 
                        isGamePlayer: jest.fn().mockResolvedValue(false), 
                        isGameTraining: jest.fn().mockReturnValue(false), 
                        isGameJoinable: jest.fn().mockReturnValue(false), // Game is no longer joinable
                        isGameFull: jest.fn().mockReturnValue(false) 
                    });

                    const res = await agent
                        .post('/game/join')
                        .send({ roomName, playerName });
                    
                    expect(res.status).toBe(409);
                    expect(res.body.message).toBe('Game is no longer joinable');
                });

                it('should return 409 if the game is full', async () => {
                    const playerName = 'TestPlayer';
                    const roomName = 'TestRoom';

                    Player.getByUsername.mockResolvedValue({ username: playerName });
                    Game.getByName.mockResolvedValue({ 
                        name: roomName, 
                        isGamePlayer: jest.fn().mockResolvedValue(false), 
                        isGameTraining: jest.fn().mockReturnValue(false), 
                        isGameJoinable: jest.fn().mockReturnValue(true), 
                        isGameFull: jest.fn().mockReturnValue(true) // Game is full
                    });

                    const res = await agent
                        .post('/game/join')
                        .send({ roomName, playerName });
                    
                    expect(res.status).toBe(409);
                    expect(res.body.message).toBe('Game is full');
                });

                it('should return 409 if the player is already in the game', async () => {
                    const playerName = 'TestPlayer';
                    const roomName = 'TestRoom';
                
                    Player.getByUsername.mockResolvedValue({ username: playerName });
                    Game.getByName.mockResolvedValue({ 
                        name: roomName, 
                        isGamePlayer: jest.fn().mockResolvedValue(true), // Player is already in the game
                        isGameTraining: jest.fn().mockReturnValue(false), 
                        isGameJoinable: jest.fn().mockReturnValue(true), 
                        isGameFull: jest.fn().mockReturnValue(false) 
                    });
                
                    const res = await agent
                        .post('/game/join')
                        .send({ roomName, playerName });
                
                    expect(res.status).toBe(409);
                    expect(res.body.message).toBe('Player already in game');
                });
            });

            describe('/game/solo/set', () => {
                it('should set the game to solo mode when game exists', async () => {
                    const roomName = 'TestRoom';
                    const game = { 
                        updateMode: jest.fn() 
                    };

                    Game.getByName.mockResolvedValue(game); // Mock the game found

                    const res = await agent
                        .post(`/game/solo/set?room=${roomName}`);

                    expect(res.status).toBe(200); // Success
                    expect(game.updateMode).toHaveBeenCalledWith('solo'); // Verify updateMode called
                    expect(res.body.success).toBe(true);
                });

                it('should return 404 if the game does not exist', async () => {
                    const roomName = 'NonExistentRoom';

                    Game.getByName.mockResolvedValue(null); // Mock that game is not found

                    const res = await agent
                        .post(`/game/solo/set?room=${roomName}`);

                    expect(res.status).toBe(404); // Not Found
                    expect(res.body.message).toBe('Game not found');
                });

                it('should return 500 on error during setting solo mode', async () => {
                    const roomName = 'TestRoom';

                    Game.getByName.mockResolvedValue({
                        updateMode: jest.fn().mockImplementation(() => {
                            throw new Error('Error updating mode');
                        }),
                    });

                    const res = await agent
                        .post(`/game/solo/set?room=${roomName}`);

                    expect(res.status).toBe(500); // Internal Server Error
                    expect(res.body.message).toBe('Internal server error');
                });
            });
        });      
    });
});
