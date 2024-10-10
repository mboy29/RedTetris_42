const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const Player = require('@models/playerModel');
const gameRoutes = require('./../../../src/routes/gameRoutes');
const Game = require('./../../../src/models/gameModel');

const app = express();
app.use(express.json()); // To parse JSON in the request body
app.use('/game', gameRoutes); // Use the game routes

describe('Game Routes', () => {
    let getPlayerStub, getGameStub, createGameStub, addPlayerStub;

    beforeEach(() => {
        getPlayerStub = sinon.stub(Player, 'getByUsername');
        getGameStub = sinon.stub(Game, 'getByName');
        createGameStub = sinon.stub(Game, 'create');
        addPlayerStub = sinon.stub(Game.prototype, 'addPlayers');
    });

    afterEach(async () => {
        sinon.restore();
        await new Promise(resolve => setTimeout(resolve, 0)); 
    });



    describe('POST /game/create', () => {
        
        it('should create a game when room and player names are valid', async () => {
            const playerName = 'TestPlayer';
            const roomName = 'TestRoom';

        
            getPlayerStub.resolves({ username: playerName });
            getGameStub.resolves(null); 
            createGameStub.resolves({ name: roomName, player: { username: playerName } });

            const res = await request(app)
                .post('/game/create')
                .send({ roomName, playerName });

            expect(res.status).toBe(201); // Success
            expect(res.body.roomName).toBe(roomName);
            expect(res.body.playerName).toBe(playerName);
        });

        it('should return 400 if roomName or playerName is missing', async () => {
            const res = await request(app)
                .post('/game/create')
                .send({ roomName: 'TestRoom' }); // Missing playerName

            expect(res.status).toBe(400); // Bad Request
            expect(res.body.message).toBe('Invalid input');
        });

        it('should return 404 if player is not found', async () => {
            const playerName = 'UnknownPlayer';
            getPlayerStub.resolves(null); // Player not found

            const res = await request(app)
                .post('/game/create')
                .send({ roomName: 'TestRoom', playerName });

            expect(res.status).toBe(404); // Not Found
            expect(res.body.message).toBe('Player not found');
        });

        it('should return 409 if the game already exists', async () => {
            const roomName = 'TestRoom';
            const playerName = 'TestPlayer';

            // Stubbing that the game already exists
            getPlayerStub.resolves({ username: playerName });
            getGameStub.resolves({ name: roomName });

            const res = await request(app)
                .post('/game/create')
                .send({ roomName, playerName });

            expect(res.status).toBe(409); // Conflict
            expect(res.body.message).toBe('Game already exists');
        });
    });

    describe('POST /game/join', () => {
        it('should let a player join an existing game', async () => {
            const playerName = 'TestPlayer';
            const roomName = 'TestRoom';

            getPlayerStub.resolves({ username: playerName });
            getGameStub.resolves({ name: roomName, isGamePlayer: sinon.stub().resolves(false) }); // Game exists and player not in game

            const res = await request(app)
                .post('/game/join')
                .send({ roomName, playerName });

            expect(res.status).toBe(200);
        });

        it('should return 404 if the game is not found', async () => {
            const roomName = 'NonExistentRoom';
            const playerName = 'TestPlayer';

            getPlayerStub.resolves({ username: playerName });
            getGameStub.resolves(null); // Game doesn't exist

            const res = await request(app)
                .post('/game/join')
                .send({ roomName, playerName });

            expect(res.status).toBe(404); // Not Found
            expect(res.body.message).toBe('Game not found');
        });

        it('should return 409 if the player is already in the game', async () => {
            const playerName = 'TestPlayer';
            const roomName = 'TestRoom';

            getPlayerStub.resolves({ username: playerName });
            getGameStub.resolves({ name: roomName, isGamePlayer: sinon.stub().resolves(true) }); // Player already in game

            const res = await request(app)
                .post('/game/join')
                .send({ roomName, playerName });

            expect(res.status).toBe(409); // Conflict
            expect(res.body.message).toBe('Player already in game');
        });
    });
});
