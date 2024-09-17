// +------------------------------------------------+
// |              REDTETRIS GAME MODEL              |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+
/*
    This module defines a `Game` class that models game objects 
    and provides methods for interacting with game data. 

    Methods include:
        - `getByName`: retrieves a game by name
        - `getById`: retrieves a game by ID
        - `isGamePlayer`: checks if a player is in the game
        - `isGameCreator`: checks if a player is the game creator
        - `updateName`: updates the game name
        - `updateMode`: updates the game mode
        - `updateStatus`: updates the game status
        - `addPlayers`: adds players to the game
        - `removePlayers`: removes players from the game
        - `create`: creates a new game
        - `remove`: removes the game
*/

// +----------------- REQUIREMENTS -----------------+ 

const queries = require('./../database/queries/gameQueries');
const piecesQueries = require('./../database/queries/piecesQueries');

const Piece = require('./pieceModel');
const Player = require('./playerModel');

// +--------------------- CLASS ---------------------+

class Game {
    constructor(id, name, mode, creator, status = "pending") {
        this.setId(id);
        this.setName(name);
        this.setMode(mode);
        this.setCreator(creator);
        this.setStatus(status);
        this.setSize(2);

        this.players = [];
        this.setReadyPlayers(0);
        this.pieces = [];
    }
    
    setId(id) {
        this.id = id;
    }

    setName(name) {
        if (name.length < 4 || name.length > 14) {
            throw new Error('Name must be between 4 and 14 characters.');
        }
        this.name = name;
    }

    setStatus(status) {
        const validStatuses = ["pending", "in progress", "finished"];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Should be one of: ${validStatuses.join(', ')}`);
        }
        this.status = status;
    }

    setMode(mode) {
        const validModes = ["solo", "multiplayer"];
        if (!validModes.includes(mode)) {
            throw new Error('Invalid mode.');
        }
        this.mode = mode;
    }

    setCreator(creator) { this.creator = creator; }

    setSize(size) { this.size = size; }

    setReadyPlayers(ready_players) { this.ready_players = ready_players; }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getPlayers() {
        return this.players;
    }

    getStatus() {
        return this.status;
    }

    getMode() {
        return this.mode;
    }

    getCreator() {
        return this.creator;
    }

    getSize() {
        return this.size;
    }

    getReadyPlayers() {
        return this.ready_players;
    }

    getPieces() {
        return this.pieces;
    }

    static async getByName(name) {
        const game = await queries.getGameByName(name);
        if (!game) {
            return null;
        }
        const creator = await Player.getById(game.creator_id);
        const newGame = new Game(game.id, game.name, game.mode, creator, game.status);
        newGame.setSize(game.size);
        newGame.setReadyPlayers(game.ready_players);
        const players = await queries.getGamePlayers(game.id);
        for (const player of players) {
            newGame.players.push(new Player(player.id, player.username, player.connect, player.roomName));
        }
        for (const piece of await Piece.getPieces(game.id)) {
            newGame.pieces.push(new Piece(piece.type));
        }
        return newGame;
    }

    static async getById(id) {
        const game = await queries.getGameById(id);
        if (!game) {
            return null;
        }
        const creator = await Player.getById(game.creator_id);
        const newGame = new Game(game.id, game.name, game.mode, creator, game.status);
        newGame.setSize(game.size);
        newGame.setReadyPlayers(game.ready_players);
        for (const player of await queries.getGamePlayers(id)) {
            newGame.players.push(new Player(player.id, player.username, player.connect, player.roomName));
        }
        for (const piece of await Piece.getPieces(game.id)) {
            newGame.pieces.push(new Piece(piece.type));
        }
        return newGame;
    }

    isGamePlayer(player) {
        const index = this.players.findIndex(p => p.id === player.id);
        if (index === -1) {
            return false;
        }
        return true;
    }

    isGameCreator(player) {
        if (this.getCreator().id === player.id) {
            return true;
        }
        return false;
    }

    isGameFull() {
        const playerCount = this.getPlayers().length;
        if (playerCount === this.getSize()) {
            return true;
        }
        return false;
    }

    isGameJoinable() {
        if (this.getStatus() == 'pending') {
            return true;
        }
        return false;
    }

    arePlayersReady() {
        if (this.getReadyPlayers() === this.getSize()) {
            return true;
        }
        return false;
    }

    async updateName(name) {
        try {
            this.setName(name);
            await queries.updateGameName(this.id, name);
        } catch (error) {
            throw new Error(error.message);
        }   
    }

    async updateMode(mode) {
        this.setMode(mode);
        await queries.updateGameMode(this.id, mode);
    }

    async updateStatus(status) {
        this.setStatus(status);
        await queries.updateGameStatus(this.id, status);
    }

    async updateNbPlayers(size) {
        this.setSize(size);
        await queries.updateGameNbPlayers(this.id, size);
    }

    async updateReadyPlayers(ready_players) {
        this.setReadyPlayers(ready_players);
        await queries.updateReadyPlayers(this.id, ready_players);
    }

    async addPlayers(socket, ...players) {
        for (const player of players) {
            if (this.isGamePlayer(player) === false) {
                this.players.push(player);
                await queries.addPlayerToGame(this.id, player.id);
                await player.joinGame(socket, this.getName());
            }
        }
    }
    

    async removePlayers(socket, ...players) {
        for (const player of players) {
            if (this.isGamePlayer(player) === true) {
                const index = this.players.findIndex(p => p.id === player.id);
                this.players.splice(index, 1);
                await queries.removePlayerFromGame(this.id, player.id);
                await player.leaveGame(socket);
            }
        }
    }

    async addPiece() {
        for (let idx = 0; idx < 50; idx++) {
            const piece = new Piece();
            this.pieces.push(piece);
            await Piece.updatPieces(this.id, piece.getType(), idx);
        }
    }
    
    static async create(name, mode, creator) {
        const id = await queries.createGame(name, mode, creator.id, 'pending');
        return new Game(id, name, mode, creator);
    }

    async remove() {
        await queries.deleteGameById(this.id);
    }

    async increaseReadyPlayers() {
        await queries.updateReadyPlayers(this.id, 1);
        this.ready_players++;
    }
    

    async decreaseReadyPlayers() {
        await queries.updateReadyPlayers(this.id, -1);
        this.ready_players--;
    }

    async startGame() {
        const pieces = await this.getPieces();
        if (pieces.length === 0) {
            await this.addPiece();
        }
        await this.updateStatus('in progress');
    }

    async endGame(surrender = false) {
        await this.updateStatus('finished');
    }
}

// +-------------------- EXPORTS -------------------+ 

module.exports = Game;
