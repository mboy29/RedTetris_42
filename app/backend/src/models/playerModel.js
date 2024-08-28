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
const queries = require('./../database/queries/playerQueries');

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

    static async getByUsername(username) {
        const playerData = await queries.getPlayerByUsername(username);
        if (!playerData) {
            return null;
        }
        return new Player(playerData.username, playerData.socket, playerData.connect);
    }

    static async getBySocket(socket) {
        const playerData = await queries.getPlayerBySocket(socket);
        if (!playerData) {
            return null;
        }
        return new Player(playerData.username, playerData.socket, playerData.connect);
    }

    static async getPlayerPassword(username) {
        const password = await queries.getPlayerPassword(username);
        if (!password) {
            return null;
        }
        return password;
    }

    static async getAll() {
        const playersData = await queries.getAllPlayers();
        if (!playersData) {
            return null;
        }
        return playersData.map(playerData => new Player(playerData.username, playerData.socket, playerData.connect));
    }

    static async create(username, password, passwordConfirm) {
        let errors = [];

        if (!username || !password || !passwordConfirm) {
            errors.push('Username, password, and password confirmation are required.');
        } if (password !== passwordConfirm) {
            errors.push('Passwords do not match.');
        } if (password.length < 6 || password.length > 20) {
            errors.push('Password must be between 6 and 20 characters long.');
        } if (await Player.getByUsername(username)) {
            errors.push('Username already taken.');
        } try {
            new Player(username);
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

    async authenticate(password, socketId) {
        const passwordHash = await Player.getPlayerPassword(this.getUsername());
        const isPasswordValid = bcrypt.compareSync(password, passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid password.');
        }
        this.setSocket(socketId);
        this.setConnect(true);
        await queries.updatePlayer(this.getUsername(), socketId, true);
    }

    static async authenticate(username, password, socketId) {
        const player = await Player.getByUsername(username);

        if (!player) {
            throw new Error('Player not found.');
        } else {
            await player.authenticate(password, socketId);
        }
        await queries.updatePlayer(username, socketId, true);
        return new Player(player.username, socketId, true, player.password);;
    }

    async disconnect() {
        this.setConnect(false);
        this.setSocket(null);
        await queries.updatePlayer(this.getUsername(), null, false);
    }

    static async disconnect(socketId) {
        let errors = [];

        console.log('socketId', socketId);
        let player = await Player.getBySocket(socketId);
        if (!player) {
            throw new Error('Player not found.');
        } else {
            await player.disconnect();
            player = null;
        }
    }


}


// +-------------------- EXPORTS -------------------+ 

module.exports = Player;
