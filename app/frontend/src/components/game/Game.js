// +------------------------------------------------+
// |            REDTETRIS GAME COMPONENT            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Game` component for
    the RedTetris frontend. The component provides
    the game room interface and handles game logic.
*/

// +----------------- REQUIREMENTS -----------------+

import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Container, Form, Button, Alert, ListGroup, Modal } from 'react-bootstrap'; 
import { SessionContext } from './../../contexts/sessionContext';

import Grid from './Grid';
import './../../css/game.css'; 
import NavBar from './../global/NavBar';
import config from './../../configs/config';

// +------------------- COMPONENT -------------------+

const socket = io(config.api_url);

const Game = () => {
    const { session } = useContext(SessionContext);
    const [errors, setErrors] = useState([]); 
    const navigate = useNavigate(); 

    const { room } = useParams();
    const [rematchRoom, setRematchRoom] = useState(null);

    const [players, setPlayers] = useState([]); 
    const [playerGrids, setPlayerGrids] = useState({});
    const [playerScores, setPlayerScores] = useState({});
    const [playerLost, setPlayerLost] = useState([]);
    
    const [winner, setWinner] = useState(null);

    const [countdown, setCountdown] = useState(null); 
    const [showOverlay, setShowOverlay] = useState(true); 
    const [showSoloModal, setShowSoloModal] = useState(false); 

    const [isCreator, setIsCreator] = useState(false);
    const [isGameFull, setIsGameFull] = useState(false);
    const [isSoloGame, setIsSoloGame] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isTrainingMode, setIsTrainingMode] = useState(false);
    const [isSprintMode, setIsSprintMode] = useState(false);
    const [isRematcher, setIsRematcher] = useState(false);

    const startCountdown = useCallback(() => {
        let count = 3;
        setCountdown(count);

        const interval = setInterval(() => {
            count -= 1;

            if (count === 0) {
                setCountdown('READY, STEADY, GO!');
            } else if (count < 0) {
                clearInterval(interval);
                setCountdown(null); 
                setShowOverlay(false);
            } else {
                setCountdown(count);
            }
        }, 1000);
    }, []);

    const resetGameState = () => {
        setErrors([]);
        setRematchRoom(null);
        setPlayers([]);
        setPlayerGrids({});
        setPlayerScores({});
        setPlayerLost([]);
        setWinner(null);
        setCountdown(null);
        setShowOverlay(true);
        setShowSoloModal(false);
        setIsCreator(false);
        setIsGameFull(false);
        setIsSoloGame(false);
        setIsGameOver(false);
        setIsSprintMode(false);
        setIsRematcher(false);
    };

    useEffect(() => {
        let isMounted = true; // Add a flag to track the mounted state
    
        if (room && session.username) {
            socket.emit('joinGame', { roomName: room, playerName: session.username });
        }
    
        const handleError = ({ message }) => {
            if (isMounted) {
                setErrors((prevErrors) => [...prevErrors, message]);
                navigate('/home');
            }
        };
    
        const handleGamePlayers = (players) => {
            if (isMounted) {
                setPlayers(players);
                if (isGameFull) {
                    setIsGameFull(false);
                }
            }
        };
    
        const handleGameCreator = ({ creator }) => {
            if (isMounted) {
                setIsCreator(creator.username === session.username);
            }
        };
    
        const handleGameFull = (bool) => {
            if (isMounted) {
                setIsGameFull(bool);
            }
        };
    
        const handleGameStarted = () => {
            if (isMounted) {
                startCountdown();
            }
        };
    
        const handleGameDeleted = () => {
            if (isMounted) {
                setErrors(['Game creator left, game deleted. Redirecting to home...']);
                setTimeout(() => navigate('/home'), 2500);
            }
        };
    
        const handleGameSurrendered = () => {
            if (isMounted) {
                setErrors(['A player has surrendered. Redirecting to home...']);
                setTimeout(() => navigate('/home'), 2500);
            }
        };
    
        const handleGameUpdated = ({ playerName, grid, score }) => {
            if (isMounted) {
                setPlayerGrids((prevGrids) => ({
                    ...prevGrids,
                    [playerName]: grid,
                }));
    
                setPlayerScores((prevScores) => ({
                    ...prevScores,
                    [playerName]: score,
                }));
            }
        };
    
        const handleGameLost = ({ playerName, scores }) => {
            if (isMounted) {
                setPlayerLost((prevLost) => [...prevLost, playerName]);
                setPlayerScores(scores);
            }
        };
    
        const handleGameEnded = ({ winner, scores, rematcher }) => {
            if (isMounted) {
                setIsGameOver(true);
                setWinner(winner);
                setPlayerScores(scores);
                if (rematcher.username === session.username) {
                    setIsRematcher(true);
                }
            }
        };
    
        const handleGameRematched = ({ creator, roomName }) => {
            if (isMounted) {
                if (roomName === null) {
                    setRematchRoom(null);
                } else {
                    setRematchRoom(roomName);
                    if (creator.username === session.username) {
                        resetGameState();
                        navigate(`/${roomName}/${session.username}`);
                    }
                }
            }
        };
    
        const handleGameRematcher = ({ rematcher }) => {
            if (isMounted) {
                setIsRematcher(rematcher.username === session.username);
            }
        };
    
        const handleGameTraining = ({ training }) => {
            if (isMounted) {
                setIsTrainingMode(training);
            }
        };
    
        const handleGameSprint = ({ sprint }) => {
            if (isMounted) {
                setIsSprintMode(sprint);
            }
        };
    
        socket.on('error', handleError);
        socket.on('gamePlayers', handleGamePlayers);
        socket.on('gameCreator', handleGameCreator);
        socket.on('gameFull', handleGameFull);
        socket.on('gameStarted', handleGameStarted);
        socket.on('gameDeleted', handleGameDeleted);
        socket.on('gameSurrendered', handleGameSurrendered);
        socket.on('gameUpdated', handleGameUpdated);
        socket.on('gameLost', handleGameLost);
        socket.on('gameEnded', handleGameEnded);
        socket.on('gameRematched', handleGameRematched);
        socket.on('gameRematcher', handleGameRematcher);
        socket.on('gameTraining', handleGameTraining);
        socket.on('gameSprint', handleGameSprint);
    
        return () => {
            isMounted = false; // Set the flag to false on cleanup
            socket.off('error', handleError);
            socket.off('gamePlayers', handleGamePlayers);
            socket.off('gameCreator', handleGameCreator);
            socket.off('gameFull', handleGameFull);
            socket.off('gameStarted', handleGameStarted);
            socket.off('gameDeleted', handleGameDeleted);
            socket.off('gameSurrendered', handleGameSurrendered);
            socket.off('gameUpdated', handleGameUpdated);
            socket.off('gameLost', handleGameLost);
            socket.off('gameEnded', handleGameEnded);
            socket.off('gameRematched', handleGameRematched);
            socket.off('gameRematcher', handleGameRematcher);
            socket.off('gameTraining', handleGameTraining);
            socket.off('gameSprint', handleGameSprint);
        };
    }, [room, session, navigate, isGameFull, startCountdown]);
    

    const handleLeaveGame = (e) => {
        e.preventDefault();
        if (session.username) {
            socket.emit('leaveGame', { roomName: room, playerName: session.username });
            navigate('/home'); 
        }
    };

    const handleRematch = (e) => {
        e.preventDefault();
        if (isRematcher) {
            socket.emit('rematchGame', { roomName: room, playerName: session.username });
        }
    };

    const handleJoinRematch = (e) => {
        e.preventDefault();
        resetGameState();
        navigate(`/${rematchRoom}/${session.username}`);
    };

    const handleStartGame = () => {
        if (isTrainingMode) {
            socket.emit('startGame', { roomName: room });
        } else if (players.length === 1) {
            setShowSoloModal(true);
        } else {
            socket.emit('startGame', { roomName: room });
        }
    };


    const confirmStartGame = async () => {
        setShowSoloModal(false);
        setIsSoloGame(true);
        try {
            const response = await fetch(`${config.api_url}/game/solo/set?room=${room}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to set solo mode');
            }
            socket.emit('startGame', { roomName: room });
        } catch (error) {
            setErrors((prevErrors) => [...prevErrors, error.message]);
        }
    };
    
    return (
        <div>
            <NavBar />
            <Container fluid className="game-container d-flex flex-column justify-content-center align-items-center vh-100">
                {isGameOver ? (
                    <div className="game-overlay-content">
                        <div className="overlay-card">
                            <h2 className="game-overlay-message">{room}</h2>
                            {isSoloGame || isTrainingMode ? (
                                <div>
                                    <h5>Game Over! Your score: {playerScores[session.username] || 0}</h5>
                                    <br />
                                    <Button variant="primary" onClick={handleRematch} className="w-100 global-btn mb-3">
                                        {isTrainingMode ? 'Train again' : 'Play again'}
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {winner && winner.username && (
                                        <h5>Game Over! {winner.username} wins!</h5>
                                    )}
                                   <ListGroup className="my-4 game-overlay-players-container">
                                        {Object.entries(playerScores).map(([playerName, score], index) => (
                                            <ListGroup.Item key={index} className="game-overlay-players">
                                                {playerName}: {score} points
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                    {isRematcher && (
                                        <Button variant="primary" onClick={handleRematch} className="w-100 global-btn mb-3">
                                            Launch a rematch 
                                        </Button>
                                    )}
                                    { rematchRoom && (
                                        <Button variant="primary" onClick={handleJoinRematch} className="w-100 global-btn mb-3">
                                            Join the rematch
                                        </Button>
                                    )}
                                </>
                            )}
                            <Form onSubmit={handleLeaveGame} className="game-leave">
                                <Button variant="danger" type="submit" className="global-btn bottom-0 end-0">
                                    <i className="bi bi-door-open"></i> Leave Game
                                </Button>
                            </Form>
                        </div>
                    </div>
                ) : (
                showOverlay && (
                    errors.length > 0 ? (
                        <div>
                            <h2 className="game-overlay-message">{room}</h2>
                            <Alert variant="danger" onClose={() => setErrors([])} dismissible className="game-custom-alert">
                                {errors.map((error, index) => (
                                    <div key={index}>{error}</div>
                                ))}
                            </Alert>
                        </div>
                    ) : (
                        <div className="game-overlay-content">
                            {countdown === null ? (
                                <div className="overlay-card">
                                    <h2 className="game-overlay-message">{room}</h2>
                                    {isGameFull ? (
                                        isCreator ? (
                                            <Alert variant="info" className="mb-3 game-custom-alert">
                                                The game is full. You can start the game now!
                                            </Alert>
                                        ) : (
                                            <Alert variant="info" className="mb-3 game-custom-alert">
                                                The game is full. Waiting for the creator to start the game...
                                            </Alert>
                                        )
                                    ) : (
                                        <>
                                        {isTrainingMode ? (
                                            !isSprintMode ? (
                                                <>
                                                    <h5>Enhance Your Skills with Training Mode!</h5>
                                                    <p>Practice without the pressure! In Training Mode, you can sharpen your strategies, try out new moves, and build up your speed. Play freely—any points scored here won’t affect your overall game stats. Perfect for getting ready to take on tougher challenges!</p>
                                                </>
                                            ) : (
                                                <>
                                                    <h5>Level Up with Training and Sprint Modes!</h5>
                                                    <p>In Training Mode, practice without the pressure—sharpen your strategies and refine your moves. Points here won’t count toward your overall stats, so experiment freely!</p>
                                                    <p>When you're ready for a challenge, train even harder in Sprint Mode! With each level, the speed increases, pushing you to think and react faster. It’s perfect for building quick-thinking skills under pressure!</p>
                                                </>
                                            )
                                        ) : (isSprintMode ? (
                                            <>
                                                <h5>Take on the Challenge with Sprint Mode!</h5>
                                                <p>Test your speed and endurance in Sprint Mode! Here, the pieces fall faster as you progress through each level, increasing the challenge over time. With every passing interval, the pace ramps up, pushing you to react quicker and think faster. It’s the ultimate way to enhance your skills and prepare for high-stakes matches!</p>
                                                <h5>Ready for a Sprint?</h5>
                                            </>
                                            ) : (
                                                <h5>Waiting for players to join...</h5>
                                            )
                                        )}
                                        </>
                                        
                                    )}
                                    {!isTrainingMode && (
                                        <ListGroup className="my-4 game-overlay-players-container ">
                                            {Array.isArray(players) && players.map((player, index) => (
                                                <div key={index}>
                                                    <ListGroup.Item className="game-overlay-players">
                                                        {player.username}
                                                    </ListGroup.Item>
                                                </div>
                                            ))}
                                        </ListGroup>
                                    )}
                                    {isCreator && (
                                        <Button variant="primary" onClick={handleStartGame} className="w-100 global-btn mb-3">
                                            {isTrainingMode ? 'Start Training' : 'Start Game'}
                                        </Button>
                                    )}
                                    <Form onSubmit={handleLeaveGame} className="game-leave">
                                        <Button variant="danger" type="submit" className="w-100 global-btn mb-3">
                                            <i className="bi bi-door-open"></i> Leave Game
                                        </Button>
                                    </Form>
                                </div>
                            ) : (
                                <h1 className="game-countdown-message">{countdown}</h1>
                            )}
                        </div>
                    )
                ))}
    
                {!showOverlay && !isGameOver && (
                    errors.length > 0 ? (
                        <div>
                            <h2 className="game-overlay-message">{room}</h2>
                            <Alert variant="danger" onClose={() => setErrors([])} dismissible>
                                {errors.map((error, index) => (
                                    <div key={index}>{error}</div>
                                ))}
                            </Alert>
                        </div>
                    ) : (
                        <div>
                            <h2 className="room-name text-center">{room}</h2>
                            {!isSoloGame && !isTrainingMode ? (
                                <div className='w-100 h-100 game-grids'>
                                    <div className='game-player-container'>
                                        <div className='game-player'>
                                            <Grid socket={socket} isSprintMode={isSprintMode} isGameOver={isGameOver} isInteractable={true} room={room} playerName={session.username} playerScore={playerScores[session.username] || 0}/>
                                        </div>
                                    </div>
                                    
                                    <div className="game-other-container">
                                        <div className="game-other-subcontainer">
                                            {players.filter(player => player.username !== session.username).map((player, index) => (
                                                <div className="game-other mb-2" key={index}>
                                                    <Grid 
                                                        socket={socket} 
                                                        isSprintMode={isSprintMode}
                                                        isGameOver={isGameOver}
                                                        isInteractable={false} 
                                                        room={room}
                                                        playerName={session.username}
                                                        playerScore={playerScores[player.username] || 0}
                                                        otherPlayer={player.username}
                                                        otherGrid={playerGrids[player.username]}
                                                        otherScore={playerScores[player.username] || 0}
                                                        otherLost={playerLost.includes(player.username)}
                                                    />
                                                    <div className="game-other-username">{player.username} {playerScores[player.username] || 0}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='w-100 h-100 game-grids'> 
                                    <div className='game-solo-container'>
                                        <div className='game-player'>
                                            <Grid socket={socket} isSprintMode={isSprintMode} isGameOver={isGameOver} isInteractable={true} room={room} playerName={session.username} playerScore={playerScores[session.username] || 0}/>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <Form onSubmit={handleLeaveGame} className="game-leave">
                                <Button variant="danger" type="submit" className="global-btn bottom-0 end-0">
                                    <i className="bi bi-door-open"></i> Leave Game
                                </Button>
                            </Form>
                        </div>
                    )
                )}
    
                <Modal show={showSoloModal} onHide={() => setShowSoloModal(false)} centered className="game-solo-modal">
                    <Modal.Header closeButton className="text-center game-solo-modal-header">
                        <Modal.Title className="game-solo-modal-title">Solo Game Confirmation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="game-solo-modal-body">
                        <p className="game-solo-modal-message">You are the only player in the room. Do you want to start the game solo?</p>
                    </Modal.Body>
                    <Modal.Footer className="game-solo-modal-footer">
                        <Button variant="secondary" onClick={() => setShowSoloModal(false)} className="game-solo-modal-button global-secondary-btn">
                            Wait for Players
                        </Button>
                        <Button variant="primary" onClick={confirmStartGame} className="game-solo-modal-button global-btn">
                            Start Solo Game
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
    
};

// +------------------- EXPORTS -------------------+

export default Game;
