import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './../../css/game.css'; 
import { Container, Form, Button, Alert, ListGroup, Modal } from 'react-bootstrap'; 
import { SessionContext } from './../../contexts/sessionContext';
import config from './../../configs/config';

import Grid from './Grid';
import NavBar from './../global/NavBar';

const socket = io(config.api_url);

const Game = () => {
    const { session } = useContext(SessionContext);
    const [errors, setErrors] = useState([]); 
    const navigate = useNavigate(); 

    const { room } = useParams(); 

    const [players, setPlayers] = useState([]); 
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
    
        return () => {
            socket.off('error');
            socket.off('gamePlayers');
            socket.off('gameCreator');
            socket.off('gameStarted');
            socket.off('gameDeleted');
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

    const confirmStartGame = () => {
        setShowSoloModal(false);
        setIsSoloGame(true);
        socket.emit('startGame', { roomName: room });
    };

    return (
        <div>
            <NavBar />
            <Container fluid className="game-container d-flex flex-column justify-content-center align-items-center vh-100">
                {showOverlay && (
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
                        <div className="game-overlay-content">
                            {countdown === null ? (
                                <>
                                    <h2 className="game-overlay-message">{room}</h2>
                                    <h5>Waiting for players to join...</h5>
                                    <ListGroup className="my-4">
                                        {Array.isArray(players) && players.map((player, index) => (
                                            <ListGroup.Item key={index}>{player.username}</ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                    {isGameFull && isCreator && (
                                        <Alert variant="info" className="mb-3">
                                            The game is full. You can start the game now!
                                        </Alert>
                                    )}
                                    {isCreator && (
                                        <Button variant="primary" onClick={handleStartGame} className="mb-3">
                                            Start Game
                                        </Button>
                                    )}
                                    <Form onSubmit={handleLeaveGame}>
                                        <Button variant="danger" type="submit">
                                            <i className="bi bi-door-open"></i> Leave Game
                                        </Button>
                                    </Form>
                                </>
                            ) : (
                                <h1 className="countdown-message">{countdown}</h1>
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
                                            <Grid socket={socket} isInteractable={true} />
                                        </div>
                                    </div>
                                    
                                    <div className="game-other-container">
                                        <div className="game-other-subcontainer">
                                            {players.filter(player => player.username !== session.username).map((player, index) => (
                                                <div className="game-other mb-2" key={index}>
                                                    <Grid socket={socket} isInteractable={false} />
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
                                            <Grid socket={socket} isInteractable={true} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <Form onSubmit={handleLeaveGame} className="game-leave">
                                <Button variant="danger" type="submit" className="global-btn bottom-0 end-0">
                                    <i className="bi bi-door-open"></i> Leave
                                </Button>
                            </Form>
                        </div>
                    )
                )}

                <Modal show={showSoloModal} onHide={() => setShowSoloModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Solo Game Confirmation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>You are the only player in the room. Do you want to start the game solo?</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowSoloModal(false)}>
                            Wait for Players
                        </Button>
                        <Button variant="primary" onClick={confirmStartGame}>
                            Start Solo Game
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default Game;
