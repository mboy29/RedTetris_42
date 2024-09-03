// +------------------------------------------------+
// |        REDTETRIS PLAYERS MODEL TESTING         |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This test suite is designed to test the `Player` class
    for managing player entities in the RedTetris game. 
    It covers methods and static methods of the `Player` 
    class, including player creation, retrieval, updating,
    and authentication.

    Test suites:

    1. Constructor, setters & getters
        - Validates the creation of a `Player` instance and 
          checks the correctness of its properties and methods.

    2. Static Methods
        - create: Tests player creation, including password hashing 
          and validation for unique usernames.
        - authenticate: Tests player authentication by verifying 
          credentials against stored data.
        - getByUsername: Ensures retrieval of player data by username.
        - getBySocket: Ensures retrieval of player data by socket ID.
        - getAll: Tests retrieval of all player records.

    3. Instance Methods
        - authenticate: Tests the authentication of an individual 
          player instance.
        - disconnect: Verifies the disconnection process of a player 
          instance, including updating the connection status.
        - update: Ensures that player instance properties can be updated 
          correctly in the database.
*/

// +----------------- REQUIREMENTS -----------------+

const bcrypt = require('bcrypt');
const Player = require('@models/playerModel');
const queries = require('@queries/playerQueries');

// +------------------- MOCKS ----------------------+

jest.mock('bcrypt');
jest.mock('@queries/playerQueries');

// +-------------------- TESTS ----------------------+

describe('Player Model', () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('Constructor, setters & getters', () => {
        it('should create a new player instance', () => {
            const player = new Player('testuser');
            expect(player.getUsername()).toBe('testuser');
            expect(player.getSocket()).toBe(null);
            expect(player.getConnect()).toBe(false);
        });

        it('should throw an error if username is invalid', () => {
            expect(() => new Player('')).toThrow('Username must be a non-empty string.');
            expect(() => new Player('too_long_username')).toThrow('Username must be between 4 and 12 characters long.');
            expect(() => new Player('invalid$user')).toThrow('Username can only contain letters, numbers, underscores, and dashes.');
            expect(() => new Player(123)).toThrow('Username must be a non-empty string.');
        });

        it('should set the socket and connection status', () => {
            const player = new Player('testuser');
            player.setSocket('socket123');
            player.setConnect(true);
            expect(player.getSocket()).toBe('socket123');
            expect(player.getConnect()).toBe(true);
        });

        it('should return the player instance properties', () => {
            const player = new Player('testuser', 'socket123', true);
            expect(player.getUsername()).toBe('testuser');
            expect(player.getSocket()).toBe('socket123');
            expect(player.getConnect()).toBe(true);
        });
    });


    describe('Static Methods', () => {

        describe('create', () => {
            it('should create a new player and hash the password', async () => {
                bcrypt.hashSync.mockReturnValue('hashedPassword');
                await queries.getPlayerByUsername.mockResolvedValue(null);
                await queries.createPlayer.mockResolvedValue();

                const player = await Player.create('testuser', 'password123', 'password123');
                expect(player.getUsername()).toBe('testuser');
                expect(bcrypt.hashSync).toHaveBeenCalledWith('password123', 10);
                expect(await queries.createPlayer).toHaveBeenCalledWith('testuser', null, false, 'hashedPassword');
            });

            it('should throw an error if passwords do not match', async () => {
                await expect(Player.create('testuser', 'password123', 'password456'))
                    .rejects.toThrow('Passwords do not match.');
            });

            it('should throw an error if username is already taken', async () => {
                await queries.getPlayerByUsername.mockResolvedValue({ username: 'testuser' });

                await expect(Player.create('testuser', 'password123', 'password123'))
                    .rejects.toThrow('Username already taken.');
            });
        });

        describe('authenticate', () => {
            it('should authenticate a player with valid credentials', async () => {
                const mockPlayer = new Player('testuser');
                await queries.getPlayerByUsername.mockResolvedValue(mockPlayer);
                await queries.getPlayerPassword.mockResolvedValue('hashedPassword');
                bcrypt.compareSync.mockReturnValue(true);
                await queries.updatePlayer.mockResolvedValue();

                const player = await Player.authenticate('testuser', 'password123');
                expect(player.getUsername()).toBe('testuser');
                expect(await queries.getPlayerByUsername).toHaveBeenCalledWith('testuser');
                expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashedPassword');
                expect(await queries.updatePlayer).toHaveBeenCalledWith('testuser', null, true);
            });

            it('should throw an error if authentication fails', async () => {
                await queries.getPlayerByUsername.mockResolvedValue(null);

                await expect(Player.authenticate('testuser', 'password123'))
                    .rejects.toThrow('Player not found.');

                await queries.getPlayerByUsername.mockResolvedValue(new Player('testuser'));
                bcrypt.compareSync.mockReturnValue(false);

                await expect(Player.authenticate('testuser', 'password123'))
                    .rejects.toThrow('Invalid password.');
            });
        });

        describe('getByUsername', () => {
            it('should return a player by username', async () => {
                const mockPlayer = { username: 'testuser', socket: 'socket123', connect: true };
                await queries.getPlayerByUsername.mockResolvedValue(mockPlayer);

                const player = await Player.getByUsername('testuser');
                expect(player.getUsername()).toBe('testuser');
                expect(player.getSocket()).toBe('socket123');
                expect(player.getConnect()).toBe(true);
            });

            it('should return null if player does not exist', async () => {
                await queries.getPlayerByUsername.mockResolvedValue(null);

                const player = await Player.getByUsername('testuser');
                expect(player).toBe(null);
            });
        });

        describe('getBySocket', () => {
            it('should return a player by socket', async () => {
                const mockPlayer = { username: 'testuser', socket: 'socket123', connect: true };
                await queries.getPlayerBySocket.mockResolvedValue(mockPlayer);
                
                const player = await Player.getBySocket('socket123');
                expect(player.getUsername()).toBe('testuser');
                expect(player.getSocket()).toBe('socket123');
                expect(player.getConnect()).toBe(true);
            });
            
            it('should return null if player does not exist', async () => {
                await queries.getPlayerBySocket.mockResolvedValue(null);

                const player = await Player.getBySocket('socket123');
                expect(player).toBe(null);
            });
        });

        describe('getAll', () => {
            it('should return all players', async () => {
                const mockPlayers = [
                    { username: 'testuser1', socket: 'socket1', connect: true },
                    { username: 'testuser2', socket: 'socket2', connect: false }
                ];
                await queries.getAllPlayers.mockResolvedValue(mockPlayers);

                const players = await Player.getAll();
                expect(players.length).toBe(2);
                expect(players[0].getUsername()).toBe('testuser1');
                expect(players[1].getUsername()).toBe('testuser2');
            });

            it('should return null if no players exist', async () => {
                await queries.getAllPlayers.mockResolvedValue(null);

                const players = await Player.getAll();
                expect(players).toBe(null);
            });
        });
    });

    describe('Instance Methods', () => {

        describe('authenticate', () => {
            it('should authenticate a player instance', async () => {
                const player = new Player('testuser');
                await queries.getPlayerPassword.mockResolvedValue('hashedPassword');
                bcrypt.compareSync.mockReturnValue(true);
                await queries.updatePlayer.mockResolvedValue();

                await player.authenticate('password123');
                expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashedPassword');
                expect(await queries.updatePlayer).toHaveBeenCalledWith('testuser', null, true);
                expect(player.getConnect()).toBe(true);
            });

            it('should throw an error if authentication fails', async () => {
                const player = new Player('testuser');
                await queries.getPlayerPassword.mockResolvedValue('hashedPassword');
                bcrypt.compareSync.mockReturnValue(false);

                await expect(player.authenticate('wrongpassword'))
                    .rejects.toThrow('Invalid password.');
            });
        });

        describe('disconnect', () => {
            it('should disconnect a player instance', async () => {
                const player = new Player('testuser', 'socket123', true);
                await queries.updatePlayer.mockResolvedValue();

                await player.disconnect();
                expect(player.getConnect()).toBe(false);
                expect(player.getSocket()).toBe(null);
                expect(await queries.updatePlayer).toHaveBeenCalledWith('testuser', null, false);
            });
        });

        describe('update', () => {
            it('should update a player instance', async () => {
                const player = new Player('testuser')
                await queries.updatePlayer.mockResolvedValue();

                await player.update('testsocket', 'testconnect', true);    
                expect(await queries.updatePlayer).toHaveBeenCalled();
            });
        });
    });

});
