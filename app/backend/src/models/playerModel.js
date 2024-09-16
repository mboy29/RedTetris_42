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
        - `setUsername`: sets the player's username
        - `setId`: sets the player's ID
        - `setConnect`: sets the player's connection status
        - `setRoomName`: sets the player's room name
        - `getUsername`: gets the player's username
        - `getId`: gets the player's ID
        - `getConnect`: gets the player's connection status
        - `getRoomName`: gets the player's room name
        - `getByUsername`: retrieves a player by username
        - `getById`: retrieves a player by ID
        - `getPlayerPassword`: retrieves a player's password
        - `getAll`: retrieves all players
        - `updateUsername`: updates the player's username
        - `updateConnect`: updates the player's connection status
        - `updateRoomName`: updates the player's room name
        - `create`: creates a new player
        - `remove`: removes a player
        - `authenticate`: authenticates a player
        - `disconnect`: disconnects a player
        - `joinGame`: joins a game
        - `leaveGame`: leaves a game
*/

// +----------------- REQUIREMENTS -----------------+ 

const bcrypt = require('bcrypt');
const queries = require('./../database/queries/playerQueries');

// +--------------------- CLASS ---------------------+

class Player {
    constructor(id, username, connect = false, roomName = null) {
        this.setId(id);
        this.setUsername(username);
        this.setConnect(connect);
        this.setRoomName(roomName); 
    }

    setId(id) { 
        if (typeof id !== 'number') {
            throw new Error('ID must be a number.');
        }
        this.id = id;
    }

    setUsername(username) {
        const validUsernamePattern = /^[a-zA-Z0-9_-]+$/;
        
        let errors = [];

        if (typeof username !== 'string')
            errors.push('Username must be a non-empty string.');
        else {
            username = username.trim();
            if ( username === '') {
                errors.push('Username must be a non-empty string.');
            } 
            if (username.length < 4 || username.length > 12) {
                errors.push('Username must be between 4 and 12 characters long.');
            } 
            if (!validUsernamePattern.test(username)) {
                errors.push('Username can only contain letters, numbers, underscores, and dashes.');
            }
        }
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        this.username = username;
    }

    setConnect(connect) { this.connect = connect; }

    setRoomName(roomName) { this.roomName = roomName; }

    getId() { return this.id; }

    getUsername() { return this.username; }

    getConnect() { return this.connect; }

    getRoomName() { return this.roomName; }

    static async getByUsername(username) {
        const playerData = await queries.getPlayerByUsername(username);
        if (!playerData) {
            return null;
        }
        return new Player(Number(playerData.id), playerData.username, playerData.connect, playerData.roomName);
    }

    static async getById(id) {
        const playerData = await queries.getPlayerById(id);
        if (!playerData) {
            return null;
        }
        return new Player(Number(playerData.id), playerData.username, playerData.connect, playerData.roomName);
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
        return playersData.map(playerData => new Player(Number(Number), playerData.username, playerData.connect, playerData.roomName));
    }


    async updateUsername(username) {
        try {
            this.setUsername(username);
            await queries.updatePlayerUsername(this.getId(), this.getUsername());
        } catch (err) {
            throw new Error(`Error updating player username: ${err.message}`);
        } 
    }

    async updateConnect(connect) {
        try {
            this.setConnect(connect);
            await queries.updatePlayerConnect(this.getId(), this.getConnect());
        } catch (err) {
            throw new Error(`Error updating player connection status: ${err.message}`);
        }
    }

    async updateRoomName(roomName) {
        try {
            this.setRoomName(roomName);
            await queries.updatePlayerRoomName(this.getId(), this.getRoomName());
        } catch (err) {
            throw new Error(`Error updating player room name: ${err.message}`);
        }
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
        }
        if (errors.length > 0) {
            throw new Error(errors.join('; '));
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const id = await queries.createPlayer(username, false, hashedPassword);
        return new Player(Number(id), username, false, null);
    }

    async remove() {
        try {
            await queries.deletePlayer(this.getUsername());
        } catch (err) {
            throw new Error(`Error deleting player: ${err.message}`);
        }
    }

    async authenticate(password) {
        const passwordHash = await Player.getPlayerPassword(this.getUsername());
        const isPasswordValid = bcrypt.compareSync(password, passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid password.');
        }
        await this.updateConnect(true);
    }

    static async authenticate(username, password) {
        const player = await Player.getByUsername(username);

        if (!player) {
            throw new Error('Player not found.');
        } else {
            await player.authenticate(password);
        }
        await player.updateConnect(true);
        return player;
    }

    async disconnect() {
        await this.updateConnect(false);
    }

    static async disconnect(username) {
        let player = await Player.getByUsername(username);
        if (!player) {
            throw new Error('Player not found.');
        } else {
            await player.disconnect();
            player = null;
        }
    }

    async joinGame(socket, roomName) {
        await this.updateRoomName(roomName);
        socket.join(roomName);
        socket.playerName = this.getUsername();
        socket.roomName = this.getRoomName();
    }

    async leaveGame(socket) {
        await this.updateRoomName(null);
        if (socket != null) {
            socket.leave(this.getRoomName());
        }
        socket.roomName = null;
        socket.playerName = null;
        
    }
}

// +-------------------- EXPORTS -------------------+ 

module.exports = Player;