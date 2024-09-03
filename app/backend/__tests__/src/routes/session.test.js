// +------------------------------------------------+
// |         REDTETRIS SESSION ROUTES TESTING       |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This test suite is designed to test the session routes
    of the RedTetris project. It tests the session route
    that returns the current session user.

    Test Suites:

    1. Retrieve Session User:
       - Ensures that the session user is returned correctly when
         a user is logged in.
       - Validates that a null value is returned when no user is
         logged in.
*/

// +----------------- REQUIREMENTS -----------------+

const request = require('supertest');
const { app, startServer, closeServer } = require('@root/server');

// +-------------------- TESTS --------------------+

describe('GET /session/get', () => { 
    let agent;

    beforeAll(async () => {
        await startServer();
        agent = request.agent(app);
    });

    afterAll(async () => {
        await closeServer();
    });

    it('should return current session user if logged in', async () => {
        await agent.post('/auth/register').send({
            username: 'testuser',
            password: 'password123',
            passwordConfirm: 'password123'
        });

        const resLogin = await agent.post('/auth/login').send({
            username: 'testuser',
            password: 'password123'
        });

        expect(resLogin.statusCode).toBe(200);
        expect(resLogin.body.success).toBe(true);

        const resSession = await agent.get('/session/get'); 
        expect(resSession.statusCode).toBe(200);
        expect(resSession.body.user.username).toBe('testuser');
    });

    it('should return null if no user is logged in', async () => {
        agent = request.agent(app);
        const resSession = await agent.get('/session/get');

        expect(resSession.statusCode).toBe(200);
        expect(resSession.body.user).toBe(null);
    });
});
