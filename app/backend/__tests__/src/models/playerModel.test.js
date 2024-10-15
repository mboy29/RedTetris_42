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

    Test suites include constructor, setters and getters,
    async methods for updating player data, and static
    methods for retrieving player data and authenticating
    players.
*/

// +----------------- REQUIREMENTS -----------------+

const bcrypt = require('bcrypt');
const Player = require('@models/playerModel');
const queries = require('@queries/playerQueries');

// +------------------- MOCKS ----------------------+

jest.mock('bcrypt');
jest.mock('@queries/playerQueries', () => ({
    getPlayerByUsername: jest.fn(),
    getPlayerById: jest.fn(),
    getPlayerPassword: jest.fn(),
    getAllPlayers: jest.fn(),
    getPlayersScore: jest.fn(),
    getByUsername: jest.fn(),
    createPlayer: jest.fn(),
    updatePlayerUsername: jest.fn(),
    updatePlayerConnect: jest.fn(),
    updatePlayerRoomName: jest.fn(),
    updatePlayerScore: jest.fn(),
    deletePlayer: jest.fn(),
}));

// +-------------------- TESTS ----------------------+

describe('Player Class', () => {
    let player;

    beforeEach(() => {
        player = new Player(1, 'testUser', false, 'testRoom', 0);
        jest.clearAllMocks();
    });

    describe('Class Methods', () => {

        describe('Constructor', () => {
            it('should create a Player instance with correct properties', () => {
                expect(player.getId()).toBe(1);
                expect(player.getUsername()).toBe('testUser');
                expect(player.getConnect()).toBe(false);
                expect(player.getRoomName()).toBe('testRoom');
                expect(player.getScore()).toBe(0);
            });
        });

        describe('Setters and Getters', () => {
            it('should set and get ID correctly', () => {
                player.setId(2);
                expect(player.getId()).toBe(2);
            });
    
            it('should throw an error for invalid ID', () => {
                expect(() => player.setId('invalid')).toThrow('ID must be a number.');
            });
    
            it('should set and get username correctly', () => {
                player.setUsername('newUser');
                expect(player.getUsername()).toBe('newUser');
            });
    
            it('should throw an error for invalid username', () => {
                expect(() => player.setUsername('')).toThrow('Username must be a non-empty string.');
                expect(() => player.setUsername('ab')).toThrow('Username must be between 4 and 12 characters long.');
                expect(() => player.setUsername('invalid_user!')).toThrow('Username can only contain letters, numbers, underscores, and dashes.');
            });
    
            it('should set and get connection status correctly', () => {
                player.setConnect(true);
                expect(player.getConnect()).toBe(true);
            });
    
            it('should set and get room name correctly', () => {
                player.setRoomName('newRoom');
                expect(player.getRoomName()).toBe('newRoom');
            });
    
            it('should set and get score correctly', () => {
                player.setScore(10);
                expect(player.getScore()).toBe(10);
            });
        });

        describe('Class Async Methods', () => {

            describe('Updators', () => {
                describe('updateUsername', () => {
                    it('should update the username and call the query', async () => {
                        queries.updatePlayerUsername.mockResolvedValueOnce(); // Mock the query to resolve
        
                        await player.updateUsername('newUser');
        
                        expect(player.getUsername()).toBe('newUser');
                        expect(queries.updatePlayerUsername).toHaveBeenCalledWith(player.getId(), 'newUser');
                    });
        
                    it('should throw an error if setUsername fails', async () => {
                        await expect(player.updateUsername('')).rejects.toThrow('Error updating player username: Username must be a non-empty string.');
                    });
        
                    it('should throw an error if query fails', async () => {
                        queries.updatePlayerUsername.mockRejectedValueOnce(new Error('Database error'));
        
                        await expect(player.updateUsername('newUser')).rejects.toThrow('Error updating player username: Database error');
                    });
                });
        
                describe('updateConnect', () => {
                    it('should update the connect status and call the query', async () => {
                        queries.updatePlayerConnect.mockResolvedValueOnce(); // Mock the query to resolve
        
                        await player.updateConnect(true);
        
                        expect(player.getConnect()).toBe(true);
                        expect(queries.updatePlayerConnect).toHaveBeenCalledWith(player.getId(), true);
                    });
        
                    it('should throw an error if query fails', async () => {
                        queries.updatePlayerConnect.mockRejectedValueOnce(new Error('Database error'));
        
                        await expect(player.updateConnect(true)).rejects.toThrow('Error updating player connection status: Database error');
                    });
                });
        
                describe('updateRoomName', () => {
                    it('should update the room name and call the query', async () => {
                        queries.updatePlayerRoomName.mockResolvedValueOnce(); // Mock the query to resolve
        
                        await player.updateRoomName('newRoom');
        
                        expect(player.getRoomName()).toBe('newRoom');
                        expect(queries.updatePlayerRoomName).toHaveBeenCalledWith(player.getId(), 'newRoom');
                    });
        
                    it('should throw an error if query fails', async () => {
                        queries.updatePlayerRoomName.mockRejectedValueOnce(new Error('Database error'));
        
                        await expect(player.updateRoomName('newRoom')).rejects.toThrow('Error updating player room name: Database error');
                    });
                });
        
                describe('updateScore', () => {
                    it('should update the score and call the query', async () => {
                        queries.updatePlayerScore.mockResolvedValueOnce(); // Mock the query to resolve
        
                        await player.updateScore(100);
        
                        expect(player.getScore()).toBe(100);
                        expect(queries.updatePlayerScore).toHaveBeenCalledWith(player.getId(), 100);
                    });
        
                    it('should throw an error if query fails', async () => {
                        queries.updatePlayerScore.mockRejectedValueOnce(new Error('Database error'));
        
                        await expect(player.updateScore(100)).rejects.toThrow('Error updating player score: Database error');
                    });
                });
            });
    
            describe('Authentication', () => {
                describe('authenticate', () => {
                    it('should authenticate the player with a valid password', async () => {
                        const validPasswordHash = 'hashedPassword'; // Mocked hashed password
                        player.getUsername = jest.fn().mockReturnValue('testUser'); // Mock getUsername
                        queries.getPlayerPassword = jest.fn().mockResolvedValue(validPasswordHash); // Mock the query
                        bcrypt.compareSync.mockReturnValue(true); // Mock bcrypt comparison
        
                        await player.authenticate('correctPassword');
        
                        expect(bcrypt.compareSync).toHaveBeenCalledWith('correctPassword', validPasswordHash);
                        expect(player.getConnect()).toBe(true); // Assuming updateConnect sets the connect status
                    });
        
                    it('should throw an error if the password is invalid', async () => {
                        const invalidPasswordHash = 'hashedPassword';
                        player.getUsername = jest.fn().mockReturnValue('testUser'); // Mock getUsername
                        queries.getPlayerPassword = jest.fn().mockResolvedValue(invalidPasswordHash); // Mock the query
                        bcrypt.compareSync.mockReturnValue(false); // Mock bcrypt comparison to return false
        
                        await expect(player.authenticate('wrongPassword')).rejects.toThrow('Invalid password.');
                    });
        
                    it('should throw an error if the getPlayerPassword query fails', async () => {
                        player.getUsername = jest.fn().mockReturnValue('testUser'); // Mock getUsername
                        queries.getPlayerPassword.mockRejectedValueOnce(new Error('Database error'));
        
                        await expect(player.authenticate('password')).rejects.toThrow('Database error');
                    });
                });
        
                describe('disconnect', () => {
                    it('should update the room name and connection status', async () => {
                        const updateRoomNameMock = jest.spyOn(player, 'updateRoomName');
                        const updateConnectMock = jest.spyOn(player, 'updateConnect');
        
                        await player.disconnect();
        
                        expect(updateRoomNameMock).toHaveBeenCalledWith(null);
                        expect(updateConnectMock).toHaveBeenCalledWith(false);
                    });
                });
            });
    
            describe("Game Management", () => {
                describe('joinGame', () => {
                    let socket;
        
                    beforeEach(() => {
                        socket = {
                            join: jest.fn(),
                        };
                    });
        
                    it('should update room name and join the game room', async () => {
                        await player.joinGame(socket, 'gameRoom');
        
                        expect(player.getRoomName()).toBe('gameRoom'); // Ensure room name is updated
                        expect(socket.join).toHaveBeenCalledWith('gameRoom'); // Ensure socket joins the room
                        expect(socket.playerName).toBe(player.getUsername()); // Ensure player name is set on socket
                        expect(socket.roomName).toBe(player.getRoomName()); // Ensure room name is set on socket
                    });
                });
        
                describe('leaveGame', () => {
                    let socket;
        
                    beforeEach(() => {
                        socket = {
                            leave: jest.fn(),
                            playerName: 'testUser',
                            roomName: 'gameRoom',
                        };
                    });
        
                    it('should update room name and leave the game room', async () => {
                        await player.leaveGame(socket, 0); // Assuming score is passed as 0
        
                        expect(player.getRoomName()).toBe(null); // Ensure room name is updated
                        expect(socket.leave).toHaveBeenCalledWith(null); // Ensure socket leaves the room
                        expect(socket.roomName).toBe(null); // Ensure room name is reset on socket
                        expect(socket.playerName).toBe(null); // Ensure player name is reset on socket
                    });
                });
            });
    
            describe('Other', () => {
                describe('remove', () => {
                    it('should call the deletePlayer query with the correct username', async () => {
                        // Ensure deletePlayer is mocked properly
                        queries.deletePlayer.mockResolvedValueOnce(); // Mock the query to resolve
            
                        await player.remove(); // Call the remove method
            
                        expect(queries.deletePlayer).toHaveBeenCalledWith(player.getUsername()); // Check that deletePlayer was called with the correct username
                    });
            
                    it('should throw an error if the query fails', async () => {
                        queries.deletePlayer.mockRejectedValueOnce(new Error('Database error')); // Simulate query failure
            
                        await expect(player.remove()).rejects.toThrow('Database error'); // Ensure the error is thrown
                    });
                });
            });
        });
    
        describe('Class Static Methods', () => {
            describe('getByUsername', () => {
                it('should return a Player instance for a valid username', async () => {
                    const mockPlayerData = { id: 1, username: 'testUser', connect: false, roomName: 'testRoom', score: 0 };
                    queries.getPlayerByUsername.mockResolvedValue(mockPlayerData);
                    
                    const result = await Player.getByUsername('testUser');
                    
                    expect(result).toBeInstanceOf(Player);
                    expect(result.getUsername()).toBe('testUser');
                    expect(queries.getPlayerByUsername).toHaveBeenCalledWith('testUser');
                });
    
                it('should return null for an invalid username', async () => {
                    queries.getPlayerByUsername.mockResolvedValue(null);
    
                    const result = await Player.getByUsername('invalidUser');
    
                    expect(result).toBeNull();
                });
    
                it('should throw an error if the query fails', async () => {
                    queries.getPlayerByUsername.mockRejectedValue(new Error('Database error'));
    
                    await expect(Player.getByUsername('testUser')).rejects.toThrow('Database error');
                });
            });
    
            describe('getById', () => {
                it('should return a Player instance for a valid ID', async () => {
                    const mockPlayerData = { id: 1, username: 'testUser', connect: false, roomName: 'testRoom', score: 0 };
                    queries.getPlayerById.mockResolvedValue(mockPlayerData);
    
                    const result = await Player.getById(1);
    
                    expect(result).toBeInstanceOf(Player);
                    expect(result.getId()).toBe(1);
                    expect(queries.getPlayerById).toHaveBeenCalledWith(1);
                });
    
                it('should return null for an invalid ID', async () => {
                    queries.getPlayerById.mockResolvedValue(null);
    
                    const result = await Player.getById(999);
    
                    expect(result).toBeNull();
                });
    
                it('should throw an error if the query fails', async () => {
                    queries.getPlayerById.mockRejectedValue(new Error('Database error'));
    
                    await expect(Player.getById(1)).rejects.toThrow('Database error');
                });
            });
    
            describe('getPlayerPassword', () => {
                it('should return the password for a valid username', async () => {
                    const mockPassword = 'hashedPassword';
                    queries.getPlayerPassword.mockResolvedValue(mockPassword);
    
                    const result = await Player.getPlayerPassword('testUser');
    
                    expect(result).toBe(mockPassword);
                    expect(queries.getPlayerPassword).toHaveBeenCalledWith('testUser');
                });
    
                it('should return null for an invalid username', async () => {
                    queries.getPlayerPassword.mockResolvedValue(null);
    
                    const result = await Player.getPlayerPassword('invalidUser');
    
                    expect(result).toBeNull();
                });
    
                it('should throw an error if the query fails', async () => {
                    queries.getPlayerPassword.mockRejectedValue(new Error('Database error'));
    
                    await expect(Player.getPlayerPassword('testUser')).rejects.toThrow('Database error');
                });
            });
    
            describe('getAll', () => {
                it('should return an array of Player instances', async () => {
                    const mockPlayersData = [
                        { id: 1, username: 'testUser1', connect: false, roomName: 'testRoom1', score: 0 },
                        { id: 2, username: 'testUser2', connect: true, roomName: 'testRoom2', score: 100 }
                    ];
                    queries.getAllPlayers.mockResolvedValue(mockPlayersData);
    
                    const result = await Player.getAll();
    
                    expect(result).toHaveLength(2);
                    expect(result[0]).toBeInstanceOf(Player);
                    expect(result[0].getUsername()).toBe('testUser1');
                    expect(result[1]).toBeInstanceOf(Player);
                    expect(result[1].getUsername()).toBe('testUser2');
                    expect(queries.getAllPlayers).toHaveBeenCalled();
                });
    
                it('should return null if no players are found', async () => {
                    queries.getAllPlayers.mockResolvedValue(null);
    
                    const result = await Player.getAll();
    
                    expect(result).toBeNull();
                });
    
                it('should throw an error if the query fails', async () => {
                    queries.getAllPlayers.mockRejectedValue(new Error('Database error'));
    
                    await expect(Player.getAll()).rejects.toThrow('Database error');
                });
            });
    
            describe('getAllScores', () => {
                it('should return an array of Player instances with scores', async () => {
                    const mockPlayersData = [
                        { id: 1, username: 'testUser1', connect: false, roomName: 'testRoom1', score: 0 },
                        { id: 2, username: 'testUser2', connect: true, roomName: 'testRoom2', score: 100 }
                    ];
                    queries.getPlayersScore.mockResolvedValue(mockPlayersData);
    
                    const result = await Player.getAllScores();
    
                    expect(result).toHaveLength(2);
                    expect(result[0]).toBeInstanceOf(Player);
                    expect(result[0].getUsername()).toBe('testUser1');
                    expect(result[1]).toBeInstanceOf(Player);
                    expect(result[1].getUsername()).toBe('testUser2');
                    expect(queries.getPlayersScore).toHaveBeenCalled();
                });
    
                it('should return null if no scores are found', async () => {
                    queries.getPlayersScore.mockResolvedValue(null);
    
                    const result = await Player.getAllScores();
    
                    expect(result).toBeNull();
                });
    
                it('should throw an error if the query fails', async () => {
                    queries.getPlayersScore.mockRejectedValue(new Error('Database error'));
    
                    await expect(Player.getAllScores()).rejects.toThrow('Database error');
                });
            });
    
            describe('authenticate', () => {
                it('should authenticate a player with valid credentials', async () => {
                    const username = 'testUser';
                    const password = 'securePassword';
                    const playerInstance = new Player(1, username, false, null, 0);
                    queries.getPlayerByUsername.mockResolvedValue(playerInstance);
                    queries.getPlayerPassword.mockResolvedValue('hashedPassword');
                    bcrypt.compareSync.mockReturnValue(true);
    
                    const result = await Player.authenticate(username, password);
    
                    expect(result).toBeInstanceOf(Player);
                    expect(result.getUsername()).toBe(username);
                    expect(queries.getPlayerByUsername).toHaveBeenCalledWith(username);
                    expect(queries.getPlayerPassword).toHaveBeenCalledWith(username);
                });
    
                it('should throw an error if player is not found', async () => {
                    queries.getPlayerByUsername.mockResolvedValue(null);
    
                    await expect(Player.authenticate('invalidUser', 'password')).rejects.toThrow('Player not found.');
                });
    
                it('should throw an error if password is invalid', async () => {
                    const playerInstance = new Player(1, 'testUser', false, null, 0);
                    queries.getPlayerByUsername.mockResolvedValue(playerInstance);
                    queries.getPlayerPassword.mockResolvedValue('hashedPassword');
                    bcrypt.compareSync.mockReturnValue(false);
    
                    await expect(Player.authenticate('testUser', 'wrongPassword')).rejects.toThrow('Invalid password.');
                });
    
                it('should throw an error if getting password fails', async () => {
                    const playerInstance = new Player(1, 'testUser', false, null, 0);
                    queries.getPlayerByUsername.mockResolvedValue(playerInstance);
                    queries.getPlayerPassword.mockRejectedValue(new Error('Database error'));
    
                    await expect(Player.authenticate('testUser', 'password')).rejects.toThrow('Database error');
                });
            });
    
            describe('disconnect', () => {
                it('should disconnect a player', async () => {
                    const playerInstance = new Player(1, 'testUser', true, 'testRoom', 0);
                    queries.getPlayerByUsername.mockResolvedValue(playerInstance);
    
                    await Player.disconnect('testUser');
    
                    expect(queries.getPlayerByUsername).toHaveBeenCalledWith('testUser');
                });
    
                it('should throw an error if player is not found', async () => {
                    queries.getPlayerByUsername.mockResolvedValue(null);
    
                    await expect(Player.disconnect('invalidUser')).rejects.toThrow('Player not found.');
                });
            });
        });
    });
});
