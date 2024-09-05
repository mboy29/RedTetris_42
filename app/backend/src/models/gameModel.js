// +------------------------------------------------+
// |              REDTETRIS GAME MODEL              |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+
/*
    This module defines a `Game` class that models game objects 
    and provides methods for interacting with game data. 

    Methods include:
        - Setting and getting game properties (name, status, mode)
        - Adding and removing players
        - Static methods for creating and retrieving games
        - Updating and removing games
*/

// +----------------- REQUIREMENTS -----------------+ 

const queries = require('./../database/queries/gameQueries');


// +--------------------- CLASS ---------------------+

class Game {
    constructor(name, mode, status = "pending") {
        this.name = name;
        this.mode = mode;
        this.status = status;
        this.players = [];
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
            throw new Error('Invalid status.');
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

    async addPlayers(...players) {
        try {
            for (const player of players) {
                if (!this.players.includes(player)) {
                    this.players.push(player);
                    await dbModule.addPlayerToGame(this.id, player.id);
                }
            }
        } catch (err) {
            throw new Error(`Error adding players: ${err.message}`);
        }
    }

    async removePlayers(...players) {
        try {
            for (const player of players) {
                const index = this.players.indexOf(player);
                if (index !== -1) {
                    this.players.splice(index, 1);
                    await dbModule.removePlayerFromGame(this.id, player.id);
                }
            }
        } catch (err) {
            throw new Error(`Error removing players: ${err.message}`);
        }
    }

    static async getByName(name) {
        try {
            const game = await dbModule.getGameByName(name);
            if (!game) {
                throw new Error('Game not found');
            }
            return new Game(game.name, game.mode, game.status);
        } catch (err) {
            throw new Error(`Error retrieving game by name: ${err.message}`);
        }
    }

    static async getById(id) {
        try {
            const game = await dbModule.getGameById(id);
            if (!game) {
                throw new Error('Game not found');
            }
            return new Game(game.name, game.mode, game.status);
        } catch (err) {
            throw new Error(`Error retrieving game by ID: ${err.message}`);
        }
    }

    static async create(name, mode) {
        try {
            const id = await dbModule.createGame(name, mode);
            return await Game.getById(id);
        } catch (err) {
            throw new Error(`Error creating game: ${err.message}`);
        }
    }

    async update() {
        try {
            await dbModule.updateGame(this.id, this.status);
        } catch (err) {
            throw new Error(`Error updating game: ${err.message}`);
        }
    }

    async remove() {
        try {
            await dbModule.deleteGameById(this.id);
        } catch (err) {
            throw new Error(`Error removing game: ${err.message}`);
        }
    }
}

// +-------------------- EXPORTS -------------------+ 

module.exports = Game;
