// +------------------------------------------------+
// |              REDTETRIS GAME MODEL              |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+
/*
    This module defines a `Game` class that models game 
    objects and provides methods for interacting with 
    game data. 

    This includes methods like constructors, getters, 
    setters,and async functions to handle game operations 
    such as updating game status, scores, and players, 
    as well as creating and deleting games.
*/

// +----------------- REQUIREMENTS -----------------+ 

const queries = require('./../database/queries/gameQueries');

const Piece = require('./pieceModel');
const Player = require('./playerModel');

// +--------------------- CLASS ---------------------+

class Game {

    // +---------------- PROPRETIES -----------------+

    static TETRIS_SCORES = {
        1: 40,
        2: 100,
        3: 300,
        4: 1200
    };

    static SURRENDER_PENALTY = -1200; 
    static LOSER_BONUS_MULTIPLIER = 1.5;

    // +----------------- CONSTRUCTOR -----------------+

    constructor(id, name, mode, creator, sprint = false, status = "pending", parent = null, winner = null, rematcher = null) {
        this.setId(id);
        this.setName(name);
        this.setMode(mode);
        this.setCreator(creator);
        this.setStatus(status);
        this.setSize(4);
        this.setWinner(winner);
        this.setRematcher(rematcher);
        this.setSprint(sprint);
        this.setParent(parent);
       
        this.losers = [];
        this.scores = {};
        this.players = [];
        this.pieces = [];
    }
    
    // +------------------- SETTERS -------------------+

    setId(id) { this.id = id; }

    setName(name) {
        if (name.length < 4 || name.length > 14) {
            throw new Error('Invalid name, must be between 4 and 14 characters.');
        }
        this.name = name;
    }

    setStatus(status) {
        const validStatuses = ["pending", "in progress", "finished"];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status, should be one of: ${validStatuses.join(', ')}`);
        }
        this.status = status;
    }

    setMode(mode) {
        const validModes = ["solo", "multiplayer", "training"];
        if (!validModes.includes(mode)) {
            throw new Error('Invalid mode, should be one of: solo, multiplayer, training');
        }
        this.mode = mode;
    }

    setCreator(creator) { this.creator = creator; }

    setSize(size) { this.size = size; }

    setSprint(sprint) { this.sprint = sprint; } 

    setWinner(winner) { this.winner = winner; }

    setParent(parent) { this.parent = parent; }

    setRematcher(rematcher) { this.rematcher = rematcher; }

    // +------------------- GETTERS -------------------+

    getId() { return this.id; }

    getName() { return this.name; }

    getPlayers() { return this.players; }

    getStatus() { return this.status; }

    getMode() { return this.mode; }

    getCreator() { return this.creator; }

    getSize() { return this.size; }

    getSprint() { return this.sprint; }

    getPieces() { return this.pieces; }

    getWinner() { return this.winner; }

    getLosers() { return this.losers; }

    getScores() { return this.scores; }

    getParent() { return this.parent; }

    getRematcher() { return this.rematcher; }

    getPlayerScore(player) { return this.scores[player.id]; }

    // +------------------- BOOLEANS ------------------+

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

    isGameJoinable(player = null) {
        if (this.getMode() === "training" && this.getCreator().id !== player.id) {
            return false;
        } else if (this.getStatus() == 'pending') {
            return true;
        }
        return false;
    }

    isGameTraining() {
        if (this.getMode() === 'training') {
            return true;
        }
        return false;
    }

    isGameSprint() {
        if (this.getSprint()) {
            return true;
        }
        return false;
    }

    isGameWinner(player) {
        if (this.getWinner() && this.getWinner().id === player.id) {
            return true;
        }
        return false;
    }

    isGameRematcher(player) {
        if (this.getRematcher() && this.getRematcher().id === player.id) {
            return true;
        }
        return false;
    }

    isGameLoser(player) {
        if (this.getLosers().includes(player.id)) {
            return true;
        }
        return false;
    }

    isEndGame() {
        const losers = this.getLosers();
        const players = this.getPlayers();
        if ((this.getMode() === 'solo' || this.getMode() === "training") && losers.length > 0) {
            return true;
        }
        if (losers.length === players.length - 1 || losers.length === players.length) {
            return true;
        }
        return false;

    }

    // +-------------------- ASYNC --------------------+

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

    async updateLosers(loser, surrendered = false) {;
        this.losers.push(loser.id);
        await queries.updateGameLosers(this.id, loser.id);
        if (surrendered) {
            if (this.getMode() !== 'solo' && this.getMode() !== 'training') {
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

    async updateParent(parent) {
        this.setParent(parent);
        await queries.updateGameParent(this.id, parent.id);
    }

    async updateRematcher(rematcher) {
        this.setRematcher(rematcher);
        await queries.updateGameRematcher(this.id, rematcher.id);
    }

    async updateCreator(creator) {
        this.setCreator(creator);
        await queries.updateGameCreator(this.id, creator.id);
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

    async addPiece() {
        const existingPieces = await Piece.getPieces(this.id);
        let startIdx = existingPieces.length;
    
        for (let idx = startIdx; idx < startIdx + 50; idx++) {
            const piece = new Piece();
            this.pieces.push(piece);
            await Piece.updatPieces(this.id, piece.getType(), idx);
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

    async endGame() {
        const players = this.getPlayers();
        if (this.getMode() == 'solo' || this.getMode() == 'training') {
            await this.updateWinner(players[0]);
            await this.updateRematcher(players[0]);
        } else {
            for (const player of players) {
                if (!this.losers.includes(player.id)) {
                    await this.updateWinner(player);
                    await this.updateRematcher(player);
                    break;
                }
            }
        }
        if (this.getMode() !== 'training') {
            for (const player of players) {
                const score = this.scores[player.id];
                const playerScore = await player.getScore();
                await player.updateScore(playerScore + score);
            }
        }
        await this.updateStatus('finished');
    }

    // +------------------- STATIC --------------------+

    static async create(name, mode, creator, sprint = false, parent = null) {
        const id = await queries.createGame(name, mode, creator.id, 'pending', sprint, parent ? parent.id : null);
        const new_game = new Game(id, name, mode, creator, sprint, 'pending', parent);
        return new_game
    }

    static async getByName(name) {
        const game = await queries.getGameByName(name);
        if (!game) {
            return null;
        }
        const creator = await Player.getById(game.creator_id);
        const parent = game.parent_id ? await Game.getById(game.parent_id) : null;
        const winner = game.winner_id ? await Player.getById(game.winner_id) : null;
        const rematcher = game.rematcher_id ? await Player.getById(game.rematcher_id) : null;
        const newGame = new Game(game.id, game.name, game.mode, creator, game.sprint, game.status, parent, winner, rematcher);
        const players = await queries.getGamePlayers(game.id);
        if (players && players.length > 0) {
            for (const player of players) {
                newGame.players.push(new Player(player.id, player.username, player.connect, player.roomName, player.score));
            }
        }
       const pieces = await Piece.getPieces(game.id);
        if (pieces && pieces.length > 0) {
            for (const piece of await Piece.getPieces(game.id)) {
                newGame.pieces.push(new Piece(piece.type));
            }
        }
        const scores = await queries.getGameScoresByGame(game.id);
        if (scores && scores.length > 0) {
            for (const score of await queries.getGameScoresByGame(game.id)) {
                newGame.scores[score.player_id] = score.score;
            }
        }
        const losers = await queries.getGameLosersByGame(game.id);
        if (losers && losers.length > 0) {
            for (const loser of await queries.getGameLosersByGame(game.id)) {
                newGame.losers.push(loser.player_id);
            }
        }
        return newGame;
    }


    static async getById(id) {
        const game = await queries.getGameById(id);
        
        if (!game) {
            return null;
        }
        const creator = await Player.getById(game.creator_id);
        const parent = game.parent_id ? await Game.getById(game.parent_id) : null;
        const winner = game.winner_id ? await Player.getById(game.winner_id) : null;
        const rematcher = game.rematcher_id ? await Player.getById(game.rematcher_id) : null;
        const newGame = new Game(game.id, game.name, game.mode, creator, game.sprint, game.status, parent, winner, rematcher);
        const players = await queries.getGamePlayers(game.id);
        if (players && players.length > 0) {
            for (const player of players) {
                newGame.players.push(new Player(player.id, player.username, player.connect, player.roomName, player.score));
            }
        }
       const pieces = await Piece.getPieces(game.id);
        if (pieces && pieces.length > 0) {
            for (const piece of await Piece.getPieces(game.id)) {
                newGame.pieces.push(new Piece(piece.type));
            }
        }
        const scores = await queries.getGameScoresByGame(game.id);
        if (scores && scores.length > 0) {
            for (const score of await queries.getGameScoresByGame(game.id)) {
                newGame.scores[score.player_id] = score.score;
            }
        }
        const losers = await queries.getGameLosersByGame(game.id);
        if (losers && losers.length > 0) {
            for (const loser of await queries.getGameLosersByGame(game.id)) {
                newGame.losers.push(loser.player_id);
            }
        }
        return newGame;
    }
}

// +-------------------- EXPORTS -------------------+ 

module.exports = Game;