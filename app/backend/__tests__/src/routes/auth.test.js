// +------------------------------------------------+
// |     REDTETRIS AUTHENTICATION ROUTES TESTING    |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This test suite is designed to test the 
    authentication routes of the RedTetris project. 
    It tests user registration, login, and logout
    functionality.

    Test Suites:
    
    1. User Registration:
       - Tests successful user registration.
       - Handles cases where registration fails due to 
         mismatched passwords.

    2. User Login:
       - Validates successful login with correct credentials.
       - Handles login failure scenarios due to incorrect credentials.

    3. User Logout:
       - Tests successful logout of a logged-in user.
       - Handles scenarios where logout is attempted without an 
         active session.
*/

// +----------------- REQUIREMENTS -----------------+

const request = require('supertest');

const { app, startServer, closeServer } = require('@root/server');
const Player = require('@models/playerModel');

// +------------------- MOCKS ---------------------+

jest.mock('@models/playerModel'); 

// +-------------------- TESTS --------------------+

describe('Authentication Routes', () => {
    let server;
    let agent;

    beforeAll(async () => {
        await startServer();
        agent = request.agent(app);
    });

    afterAll(async () => {
        await closeServer();
    });

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
            agent = request.agent(app); // Reinitialize to not have a session

            const res = await agent.post('/auth/logout');

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Not logged in');
        });
    });
});
