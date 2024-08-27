// +------------------------------------------------+
// |             REDTETRIS PLAYERS MODEL            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Player` class for managing player 
    entities in the RedTetris game. The class provides methods 
    to handle player-related data and interactions, such as 
    creation, retrieval, updating, and deletion of player records.

    The `Player` class includes:
        - **Constructor**: Initializes a new player instance with 
            a username, socket, and connection status.
        - **Setters**: Methods to set the player's username, socket, 
            and connection status, with input validation.
        - **Getters**: Methods to retrieve the player's username, 
            socket, and connection status.
        - **Static Methods**: 
            - `create(username, socket, connect, password)`: Adds a new player 
                to the database.
            - `findByUsername(username)`: Retrieves a player from the 
                database by username.
            - `findBySocket(socket)`: Retrieves a player from the 
                database by socket.
            - `update(username, socket, connect)`: Updates an existing player's 
                details in the database.
            - `deleteById(id)`: Deletes a player from the database 
                by their ID.
            - `authenticate(username, password, socketId)`: Authenticates 
                a player by username and password and returns the player 
                instance if successful.
            - `comparePassword(storedPassword, inputPassword)`: Compares 
                the stored password with the input password.
*/

// +----------------- REQUIREMENTS -----------------+ 

const bcrypt = require('bcrypt');
const queries = require('./../database/queries/playerQuery');

// +--------------------- CLASS ---------------------+

class Player {
    constructor(username, socket = null, connect = false) {
        this.setUsername(username);
        this.setSocket(socket);
        this.setConnect(connect);
    }

    setUsername(username) {
        const validUsernamePattern = /^[a-zA-Z0-9_-]+$/;
        username = username.trim();
        let errors = [];

        if (typeof username !== 'string' || username === '') {
            errors.push('Username must be a non-empty string.');
        } 
        if (username.length < 4 || username.length > 12) {
            errors.push('Username must be between 4 and 12 characters long.');
        } 
        if (!validUsernamePattern.test(username)) {
            errors.push('Username can only contain letters, numbers, underscores, and dashes.');
        }

        if (errors.length > 0) {
            throw new Error(errors.join('; '));
        }

        this.username = username;
    }

    setSocket(socket) { this.socket = socket; }

    setConnect(connect) { this.connect = connect; }

    getUsername() { return this.username; }

    getSocket() { return this.socket; }

    getConnect() { return this.connect; }

    static async create(username, password, passwordConfirm) {
        let errors = [];

        if (!username || !password || !passwordConfirm) {
            errors.push('Username, password, and password confirmation are required.');
        } if (password !== passwordConfirm) {
            errors.push('Passwords do not match.');
        } if (password.length < 6 || password.length > 20) {
            errors.push('Password must be between 6 and 20 characters long.');
        } if (await queries.getPlayerByUsername(username)) {
            errors.push('Username already taken.');
        } try {
            const player = new Player(username);
        } catch (err) {
            errors.push(err.message);
        }
    
        if (errors.length > 0) {
            throw new Error(errors.join('; '));
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        await queries.createPlayer(username, null, false, hashedPassword);
        return new Player(username, null, false, hashedPassword);
    }

    static async authenticate(username, password, socketId) {
        let errors = [];
        const playerData = await queries.getPlayerByUsername(username);
        
        if (!playerData) {
            errors.push('User does not exist.');
        } else {
            const isPasswordValid = bcrypt.compareSync(password, playerData.password);
            if (!isPasswordValid) {
                errors.push('Invalid password.');
            }
        }
        if (errors.length > 0) {
            throw new Error(errors.join('; '));
        }
        const player = new Player(playerData.username, socketId, true, playerData.password);
        await queries.updatePlayer(username, socketId, true);
        return player;
    }

    static async disconnect(socketId) {
        const player = await Player.getBySocket(socketId);
        if (player) {
            player.setConnect(false);
            player.setSocket(null);
            await queries.updatePlayer(player.getUsername(), null, false);
        }
    }

    static async getByUsername(username) {
        const playerData = await queries.getPlayerByUsername(username);
        return new Player(playerData.username, playerData.socket, playerData.connect);
    }

    static async getBySocket(socket) {
        const playerData = await queries.getPlayerBySocket(socket);
        return new Player(playerData.username, playerData.socket, playerData.connect);
    }

    static async getAll() {
        const playersData = await queries.getAllPlayers();
        return playersData.map(playerData => new Player(playerData.username, playerData.socket, playerData.connect));
    }
}


// +-------------------- EXPORTS -------------------+ 

module.exports = Player;
