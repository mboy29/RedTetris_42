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

    const [players, setPlayers] = useState([]); 
    const [playerGrids, setPlayerGrids] = useState({});

    const [isCreator, setIsCreator] = useState(false);
    const [showOverlay, setShowOverlay] = useState(true); 
    const [countdown, setCountdown] = useState(null); 
    const [isGameFull, setIsGameFull] = useState(false);
    const [isSoloGame, setIsSoloGame] = useState(false);

    const [showSoloModal, setShowSoloModal] = useState(false); 

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
                socket.emit('triggerGame', { roomName: room });
            } else {
                setCountdown(count);
            }
        }, 1000);
    }, [room]);

    useEffect(() => {
        if (room && session.username) {
            socket.emit('joinGame', { roomName: room, playerName: session.username });
        }
    
        socket.on('error', ({ message }) => {
            setErrors((prevErrors) => [...prevErrors, message]);
            navigate('/home');
        });
    
        socket.on('gamePlayers', (players) => {
            setPlayers(players);
            if (isGameFull) {
                setIsGameFull(false);
            }
        });

        socket.on('gameCreator', () => {
            setIsCreator(true);
        });

        socket.on('gameFull', (bool) => {
            setIsGameFull(bool);
        });

        socket.on('gameStarted', () => {
            startCountdown();
        });

        socket.on('gameDeleted', () => {
            setErrors(['Game creator left, game deleted. Redirecting to home...']);
            setTimeout(() => navigate('/home'), 2500);
        });

        socket.on('gameSurrendered', () => {
            setErrors(['A player has surrendered. Redirecting to home...']);
            setTimeout(() => navigate('/home'), 2500);
        });

        socket.on('gameUpdated', ({ playerName, grid }) => {
            setPlayerGrids((prevGrids) => ({
                ...prevGrids,
                [playerName]: grid,
            }));
        });
    
        return () => {
            socket.off('error');
            socket.off('gamePlayers');
            socket.off('gameCreator');
            socket.off('gameStarted');
            socket.off('gameDeleted');
            socket.off('gameUpdated');
            socket.off('gameSurrendered');
        };
    }, [room, session, navigate, isGameFull, startCountdown]);

    const handleLeaveGame = (e) => {
        e.preventDefault();
        if (session.username) {
            socket.emit('leaveGame', { roomName: room, playerName: session.username });
            navigate('/home'); 
        }
    };

    const handleStartGame = () => {
        if (players.length === 1) {
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
                method: 'GET',
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
                {showOverlay && (
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
                                        <h5>Waiting for players to join...</h5>
                                    )}
                                    <ListGroup className="my-4 game-overlay-players-container ">
                                        {Array.isArray(players) && players.map((player, index) => (
                                            <div key={index}>
                                                <ListGroup.Item className="game-overlay-players">
                                                    {player.username}
                                                </ListGroup.Item>
                                            </div>
                                        ))}
                                    </ListGroup>
                                    {isCreator && (
                                        <Button variant="primary" onClick={handleStartGame} className="w-100 global-btn mb-3">
                                            Start Game
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
                )}

                {!showOverlay && (
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
                            {!isSoloGame ? (
                                <div className='w-100 h-100 game-grids'>
                                    <div className='game-player-container'>
                                        <div className='game-player'>
                                            <Grid socket={socket} isInteractable={true} room={room} playerName={session.username}/>
                                        </div>
                                    </div>
                                    
                                    <div className="game-other-container">
                                        <div className="game-other-subcontainer">
                                            {players.filter(player => player.username !== session.username).map((player, index) => (
                                                <div className="game-other mb-2" key={index}>
                                                    <Grid 
                                                        socket={socket} 
                                                        isInteractable={false} 
                                                        room={room} 
                                                        playerName={session.username}
                                                        otherPlayer={player.username}
                                                        otherGrid={playerGrids[player.username] || null} // Pass the updated grid or an empty array
                                                    />
                                                    <div className="game-other-username">{player.username}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='w-100 h-100 game-grids'> 
                                    <div className='game-solo-container'>
                                        <div className='game-player'>
                                            <Grid socket={socket} isInteractable={true} room={room} playerName={session.username}/>
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
