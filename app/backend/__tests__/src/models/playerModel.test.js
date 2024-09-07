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
        - Tests the creation of a new player instance and
            the setting and getting of player properties.
        

    2. Static Methods
        - getByUsername: Tests the retrieval of a player by
            username.
        - getById: Tests the retrieval of a player by ID.
        - getPlayerPassword: Tests the retrieval of a player's
            password.
        - getAll: Tests the retrieval of all players.
        - create: Tests the creation of a new player.
        - authenticate: Tests the authentication of a player.
        - disconnect: Tests the disconnection of a player.


    3. Instance Methods
        - updateUsername: Tests the updating of a player's username.
        - updateConnect: Tests the updating of a player's connection status.
        - updateRoomName: Tests the updating of a player's room name.
        - authenticate: Tests the authentication of a player.
        - disconnect: Tests the disconnection of a player.
        - joinGame: Tests the joining of a player to a game room.
        - leaveGame: Tests the leaving of a game room.
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
            const player = new Player(1, 'testuser');
            expect(player.getId()).toBe(1);
            expect(player.getUsername()).toBe('testuser');
            expect(player.getConnect()).toBe(false);
            expect(player.getRoomName()).toBe(null);
        });

        it('should throw an errir if ID is invalid', () => {
            expect(() => new Player('1', 'testuser')).toThrow('ID must be a number.');
            expect(() => new Player(null, 'testuser')).toThrow('ID must be a number.');
        });

        it('should throw an error if username is invalid', () => {
            expect(() => new Player(1, '')).toThrow('Username must be a non-empty string.');
            expect(() => new Player(1, 'too_long_username')).toThrow('Username must be between 4 and 12 characters long.');
            expect(() => new Player(1, 'invalid$user')).toThrow('Username can only contain letters, numbers, underscores, and dashes.');
            expect(() => new Player(1, 123)).toThrow('Username must be a non-empty string.');
        });

        it('should set the player instance properties', () => {
            const player = new Player(1, 'testuser');
            player.setId(2);
            player.setUsername('newuser');
            player.setConnect(true);
            player.setRoomName('room1');
            expect(player.getId()).toBe(2);
            expect(player.getUsername()).toBe('newuser');
            expect(player.getConnect()).toBe(true);
            expect(player.getRoomName()).toBe('room1');
        });

        it('should return the player instance properties', () => {
            const player = new Player(1, 'testuser', true, 'room1');
            expect(player.getId()).toBe(1);
            expect(player.getUsername()).toBe('testuser');
            expect(player.getConnect()).toBe(true);
            expect(player.getRoomName()).toBe('room1');
        });
    });


    describe('Static Methods', () => {

        describe('getByUsername', () => {
            it('should return a player by username', async () => {
                const mockPlayer = { id: 1, username: 'testuser', connect: true, roomName: 'room1' };
                await queries.getPlayerByUsername.mockResolvedValue(mockPlayer);

                const player = await Player.getByUsername('testuser');
                expect(player.getId()).toBe(1);
                expect(player.getUsername()).toBe('testuser');
                expect(player.getConnect()).toBe(true);
                expect(player.getRoomName()).toBe('room1');
            });

            it('should return null if player does not exist', async () => {
                await queries.getPlayerByUsername.mockResolvedValue(null);

                const player = await Player.getByUsername('testuser');
                expect(player).toBe(null);
            });
        });

        describe('getByID', () => {
            it('should return a player by ID', async () => {
                const mockPlayer = { id: 1, username: 'testuser', connect: true, roomName: 'room1' };
                await queries.getPlayerById.mockResolvedValue(mockPlayer);

                const player = await Player.getById(1);
                expect(player.getId()).toBe(1);
                expect(player.getUsername()).toBe('testuser');
                expect(player.getConnect()).toBe(true);
                expect(player.getRoomName()).toBe('room1');
            });
        });

        describe('getPlayerPassword', () => {
            it('should return the password for a player', async () => {
                await queries.getPlayerPassword.mockResolvedValue('hashedPassword');

                const password = await Player.getPlayerPassword('testuser');
                expect(password).toBe('hashedPassword');
            });
        });

        describe('getAll', () => {
            it('should return all players', async () => {
                const mockPlayers = [
                    { id: 1, username: 'testuser1', connect: true, roomName: 'room1' },
                    { id: 2, username: 'testuser2', connect: false, roomName: 'room2' }
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

        describe('create', () => {
            it('should create a new player and hash the password', async () => {
                bcrypt.hashSync.mockReturnValue('hashedPassword');
                await queries.getPlayerByUsername.mockResolvedValue(null);
                await queries.createPlayer.mockResolvedValue();

                const player = await Player.create('testuser', 'password123', 'password123');
                expect(player.getUsername()).toBe('testuser');
                expect(bcrypt.hashSync).toHaveBeenCalledWith('password123', 10);
                expect(await queries.createPlayer).toHaveBeenCalledWith('testuser', false, 'hashedPassword');
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
                 // Arrange
                const validPassword = 'password123';
                const hashedPassword = 'hashedPassword';

                const mockPlayer = new Player(1, 'testuser');
                mockPlayer.updateConnect = jest.fn(); // Ensure this is a mock function

                await queries.getPlayerByUsername.mockResolvedValue(mockPlayer);
                await queries.getPlayerPassword.mockResolvedValue(hashedPassword);
                bcrypt.compareSync.mockReturnValue(true);

                const player = await Player.authenticate('testuser', validPassword);

                expect(player).toBeInstanceOf(Player);
                expect(player.getConnect()).toBe(true);
                expect(bcrypt.compareSync).toHaveBeenCalledWith(validPassword, hashedPassword);
            });
            it('should throw an error if player does not exist', async () => {
                await queries.getPlayerByUsername.mockResolvedValue(null);
    
                await expect(Player.authenticate('testuser', 'password123'))
                    .rejects.toThrow('Player not found.');
            });
    
            it('should throw an error if password is invalid', async () => {
                const mockPlayer = new Player(1, 'testuser');
                const validPassword = 'password123';
                const hashedPassword = 'hashedPassword';
    
                await queries.getPlayerByUsername.mockResolvedValue(mockPlayer);
                await queries.getPlayerPassword.mockResolvedValue(hashedPassword);
                bcrypt.compareSync.mockReturnValue(false);
    
                await expect(Player.authenticate('testuser', validPassword))
                    .rejects.toThrow('Invalid password.');
            });
        });

        describe('disconnect', () => {
            it('should disconnect a player by setting connect to false', async () => {
                const mockPlayer = new Player(1, 'testuser');
                mockPlayer.updateConnect = jest.fn();
    
                await mockPlayer.disconnect();
                expect(mockPlayer.updateConnect).toHaveBeenCalledWith(false);
            });
        });
    });

    describe('Instance Methods', () => {

        describe('updateUsername', () => {

            it('should update the username of a player instance', async () => {
                const player = new Player(1, 'testuser');
                queries.updatePlayerUsername.mockResolvedValue(); 

                await player.updateUsername('newuser');
                expect(player.getUsername()).toBe('newuser');
            });

            it('should throw an error if username is invalid', async () => {
                const player = new Player(1, 'testuser');

                await expect(player.updateUsername('')).rejects.toThrow('Username must be a non-empty string.');
                await expect(player.updateUsername('too_long_username')).rejects.toThrow('Username must be between 4 and 12 characters long.');
                await expect(player.updateUsername('invalid$user')).rejects.toThrow('Username can only contain letters, numbers, underscores, and dashes.');
            });
        });

        describe('updateConnect', () => {
                
            it('should update the connection status of a player instance', async () => {
                const player = new Player(1, 'testuser');
                queries.updatePlayerConnect.mockResolvedValue();

                await player.updateConnect(true);
                expect(player.getConnect()).toBe(true);
            });
            
        });

        describe('updateRoomName', () => {
                    
            it('should update the room name of a player instance', async () => {
                const player = new Player(1, 'testuser');
                queries.updatePlayerRoomName.mockResolvedValue();

                await player.updateRoomName('room1');
                expect(player.getRoomName()).toBe('room1');
            });
            
        });


        describe('authenticate', () => {
            
            it('should authenticate a player with a valid password', async () => {
                const player = new Player(1, 'testuser');
                const validPassword = 'password123';
                const hashedPassword = 'hashedPassword';
    
                await queries.getPlayerPassword.mockResolvedValue(hashedPassword);
                bcrypt.compareSync.mockReturnValue(true);
                player.updateConnect = jest.fn();
                await player.authenticate(validPassword);
    
                expect(bcrypt.compareSync).toHaveBeenCalledWith(validPassword, hashedPassword);
                expect(player.updateConnect).toHaveBeenCalledWith(true);
            });
    
            it('should throw an error if password is invalid', async () => {
                const player = new Player(1, 'testuser');
                const invalidPassword = 'wrongpassword';
                const hashedPassword = 'hashedPassword';
    
                await queries.getPlayerPassword.mockResolvedValue(hashedPassword);
                bcrypt.compareSync.mockReturnValue(false);
    
                await expect(player.authenticate(invalidPassword))
                    .rejects.toThrow('Invalid password.');
            });
        });

        describe('disconnect', () => {
            it('should disconnect a player if player exists', async () => {
                const mockPlayer = new Player(1, 'testuser');
                await queries.getPlayerByUsername.mockResolvedValue(mockPlayer);
                await Player.disconnect('testuser');
            });

            it('should throw an error if player does not exist', async () => {
                await queries.getPlayerByUsername.mockResolvedValue(null);
                await expect(Player.disconnect('testuser'))
                    .rejects.toThrow('Player not found.');
            });
            
        });

        describe('joinGame', () => {
            it('should join a player to a game room', async () => {
                const player = new Player(1, 'testuser');
                const socket = { join: jest.fn() };
                queries.updatePlayerRoomName.mockResolvedValue();

                await player.joinGame(socket, 'room1');
                expect(player.getRoomName()).toBe('room1');
                expect(socket.join).toHaveBeenCalledWith('room1');
            });
        });

        describe('leaveGame', () => {
            it('should leave a game room', async () => {
                const player = new Player(1, 'testuser', true, 'room1');
                const socket = { leave: jest.fn() };
                queries.updatePlayerRoomName.mockResolvedValue();

                await player.leaveGame(socket);
                expect(player.getRoomName()).toBe(null);
                expect(socket.leave).toHaveBeenCalledWith(null);
            });
        });
    });
});
