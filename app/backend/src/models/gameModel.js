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
    static TETRIS_SCORES = {
        1: 40,
        2: 100,
        3: 300,
        4: 1200
    };

    static SURRENDER_PENALTY = -1200; 
    static LOSER_BONUS_MULTIPLIER = 1.5;

    constructor(id, name, mode, creator, sprint = false, status = "pending", winner = null) {
        this.setId(id);
        this.setName(name);
        this.setMode(mode);
        this.setCreator(creator);
        this.setStatus(status);
        this.setSize(4);
        this.setWinner(winner);
        this.setSprint(sprint);
       
        this.losers = [];
        this.scores = {};
        this.players = [];
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

    setSprint(sprint) { this.sprint = sprint; } 

    setWinner(winner) { this.winner = winner; }

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

    getSprint() {
        return this.sprint;
    }

    getPieces() {
        return this.pieces;
    }

    getWinner() {
        return this.winner;
    }

    getLosers() {
        return this.losers;
    }

    getScores() {
        return this.scores;
    }

    static async getByName(name) {
        const game = await queries.getGameByName(name);
        if (!game) {
            return null;
        }
        const creator = await Player.getById(game.creator_id);
        const winner = game.winner_id ? await Player.getById(game.winner_id) : null;
        const newGame = new Game(game.id, game.name, game.mode, creator, game.sprint, game.status, winner);
        const players = await queries.getGamePlayers(game.id);
        for (const player of players) {
            newGame.players.push(new Player(player.id, player.username, player.connect, player.roomName, player.score));
        }
        for (const piece of await Piece.getPieces(game.id)) {
            newGame.pieces.push(new Piece(piece.type));
        }
        for (const score of await queries.getGameScoresByGame(game.id)) {
            newGame.scores[score.player_id] = score.score;
        }
        for (const loser of await queries.getGameLosersByGame(game.id)) {
            newGame.losers.push(loser.player_id);
        }
        return newGame;
    }

    static async getById(id) {
        const game = await queries.getGameById(id);
        
        if (!game) {
            return null;
        }
        const creator = await Player.getById(game.creator_id);
        const winner = game.winner_id ? await Player.getById(game.winner_id) : null;
        const newGame = new Game(game.id, game.name, game.mode, creator, game.sprint, game.status, winner);
        for (const player of await queries.getGamePlayers(id)) {
            newGame.players.push(new Player(player.id, player.username, player.connect, player.roomName, player.score));
        }
        for (const piece of await Piece.getPieces(game.id)) {
            newGame.pieces.push(new Piece(piece.type));
        }
        for (const score of await queries.getGameScoresByGame(id)) {
            newGame.scores[score.player_id] = score.score;
        }
        for (const loser of await queries.getGameLosersByGame(id)) {
            newGame.losers.push(loser.player_id);
        }
        return newGame;
    }

    async getPlayerScore(player) {
        return this.scores[player.id];
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

    isGameLoser(player) {
        if (this.losers.includes(player.id)) {
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

    async updateWinner(player) {
        this.setWinner(player);
        await queries.updateGameWinner(this.id, player.id);
    }

    async updateLosers(loser, surrendered = false) {
        this.losers.push(loser.id);
        await queries.updateGameLosers(this.id, loser.id);
        if (surrendered) {
            if (this.getMode() !== 'solo') {
                await this.updateScore(loser,Game.SURRENDER_PENALTY);
            }
        } 
        const players = this.getPlayers();
        const loserScore = this.scores[loser.id];
        for (const player of players) {
            if (!this.losers.includes(player.id) && player.id !== loser.id) {
                if (loserScore <= 0) {
                    await this.updateScore(player, Game.TETRIS_SCORES[1] * Game.LOSER_BONUS_MULTIPLIER);
                } else {
                    await this.updateScore(player, loserScore * Game.LOSER_BONUS_MULTIPLIER);
                }
            }
        }
    }

    async updateScore(player, score, lines = -1, level = 1) {
        if (lines !== -1) {
            score += Game.TETRIS_SCORES[lines] || 0;
            score *= level;
        }
        await queries.updateGameScore(this.id, player.id, score);
        this.scores[player.id] += score;
    }

    async updateSprint(sprint) {
        this.setSprint(sprint);
        await queries.updateGameSprint(this.id, sprint);
    }

    async addPlayers(socket, ...players) {
        for (const player of players) {
            if (this.isGamePlayer(player) === false) {
                this.players.push(player);
                await queries.addPlayerToGame(this.id, player.id);
                await player.joinGame(socket, this.getName());
                this.scores[player.id] = 0;
            }
        }
    }
    
    async removePlayers(socket, score, ...players) {
        for (const player of players) {
            if (this.isGamePlayer(player) === true) {
                const index = this.players.findIndex(p => p.id === player.id);
                this.players.splice(index, 1);
                await queries.removePlayerFromGame(this.id, player.id);
                await player.leaveGame(socket, score);
                delete this.scores[player.id];
            }
        }
    }

    async addPiece() {
        const existingPieces = await Piece.getPieces(this.id);
        let startIdx = existingPieces.length;
    
        for (let idx = startIdx; idx < startIdx + 50; idx++) {
            const piece = new Piece();
            this.pieces.push(piece);
            await Piece.updatPieces(this.id, piece.getType(), idx);
        }
    }
    
    
    static async create(name, mode, creator, sprint = false) {
        const id = await queries.createGame(name, mode, creator.id, 'pending', sprint);
        const new_game = new Game(id, name, mode, creator, sprint);
        return new_game
    }

    async remove() {
        await queries.deleteGameById(this.id);
    }

    async startGame() {
        const pieces = await this.getPieces();
        if (pieces.length === 0) {
            await this.addPiece();
        }
        await this.updateStatus('in progress');
        for (const player of this.players) {
            await queries.createGameScore(this.id, player.id, 0);
            this.scores[player.id] = 0;
        }
    }

    isEndGame() {
        const losers = this.getLosers();
        const players = this.getPlayers();
        if (this.getMode() === 'solo' && losers.length > 0) {
            return true;
        }
        if (losers.length === players.length - 1) {
            return true;
        }
        return false;

    }

    async endGame() {
        const players = this.getPlayers();
        if (this.getMode() == 'solo') {
            await this.updateWinner(players[0]);
        } else {
            for (const player of players) {
                if (!this.losers.includes(player.id)) {
                    await this.updateWinner(player);
                    break;
                }
            }
        }
        for (const player of players) {
            const score = this.scores[player.id];
            const playerScore = await player.getScore();
            await player.updateScore(playerScore + score);
        }
        await this.updateStatus('finished');
    }
}

// +-------------------- EXPORTS -------------------+ 

module.exports = Game;