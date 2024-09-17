import io from 'socket.io-client';
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import Grid from './Grid';
import './../../css/game.css'; 
import NavBar from './../global/NavBar';
import config from './../../configs/config';
import { SessionContext } from './../../contexts/sessionContext';

const socket = io(config.api_url);

const Game = () => {
    const { session } = useContext(SessionContext);
    const [errors, setErrors] = useState([]);
    const [players, setPlayers] = useState([]);
    const [isGameFull, setIsGameFull] = useState(false);
    const [waitingForPlayers, setWaitingForPlayers] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [playersReady, setPlayersReady] = useState(new Set());
    const [countdown, setCountdown] = useState(null);
    const [countdownFinished, setCountdownFinished] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [socketReady, setSocketReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const { room } = useParams(); 
    const navigate = useNavigate();

    useEffect(() => {
        socket.on('error', ({ message }) => {
            setErrors((prevErrors) => [...prevErrors, message]);
            navigate('/home');
        });

        socket.on('gameReconnected', ({ players }) => {
            setPlayers(players);
            setIsReconnecting(true);
        });

        socket.on('gameJoined', ({ players }) => {
            setPlayers(players);
            setWaitingForPlayers(players.length < 2);
        });

        socket.on('gameFull', ({ players }) => {
            setPlayers(players);
            setIsGameFull(true);
            setWaitingForPlayers(false);
        });

        socket.on('gamePlayerReady', ({ playerName }) => {
            setPlayersReady((prevReady) => new Set(prevReady).add(playerName));
        });

        socket.on('gameDeleted', () => {
            setErrors(['Game creator left, game deleted. Redirecting to home...']);
            setTimeout(() => navigate('/home'), 5000);
        });

        socket.on('gameSurrendered', () => {
            setErrors(['A player has surrendered, game ended. Redirecting to home...']);
            setTimeout(() => navigate('/home'), 5000);
        });

        socket.on('gameStarted', () => {
            setCountdown(3);
            setCountdownFinished(false);
        });

        setSocketReady(true);
        setLoading(false);

        return () => {
            socket.off('error');
            socket.off('gameDeleted');
            socket.off('gameJoined');
            socket.off('gameFull');
            socket.off('gamePlayerReady');
            socket.off('gameSurrendered');
            socket.off('gameStarted');
        };
    }, [navigate]);

    useEffect(() => {
        if (socketReady) {
            socket.emit('joinGame', { roomName: room, playerName: session.username });
        }
    }, [socketReady, room, session.username]);

    useEffect(() => {
        let timer;
        if (countdown !== null) {
            timer = setInterval(() => {
                setCountdown(prevCountdown => {
                    if (prevCountdown > 1) {
                        return prevCountdown - 1;
                    } else {
                        clearInterval(timer);
                        setCountdownFinished(true);
                        setGameStarted(true);
                        return null;
                    }
                });
            }, 1000);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [countdown]);

    const handleLeaveGame = (e) => {
        e.preventDefault();
        socket.emit('leaveGame', { roomName: room, playerName: session.username });
        navigate('/home');
    };

    const handleReady = () => {
        socket.emit('readyGame', { roomName: room, playerName: session.username });
        setIsReady(true);
        if (allPlayersReady()) {
            socket.emit('gameStarted', { roomName: room });
        }
    };

    const allPlayersReady = () => {
        return players.length >= 2 && players.every(player => playersReady.has(player.username));
    };

    const showOverlay = !isReconnecting && (waitingForPlayers || (isGameFull && !gameStarted));

    return (
        <div>
            <NavBar />
            <Container fluid className="game-container d-flex flex-column justify-content-center align-items-center vh-100">
                <Row className="w-100 justify-content-center align-items-start mt-4">
                    <Col md={4} className="text-center">
                        <h2>{room}</h2>
                        {errors.length > 0 && (
                            <Alert variant="danger" className="text-center mb-4">
                                {errors.map((error, index) => (
                                    <p key={index}>{error}</p>
                                ))}
                            </Alert>
                        )}

                        <Form onSubmit={handleLeaveGame} className="mt-4">
                            <Button variant="danger" type="submit" className="w-100 global-btn">
                                <i className="bi bi-door-open"></i> Leave
                            </Button>
                        </Form>
                    </Col>

                    <Col md={6} className="d-flex justify-content-between">
                        <Grid socket={socket} isInteractable={true}/>
                    </Col>
                </Row>

                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-overlay-content">
                            <h2>{room}</h2>
                            <div className="loading-message">Loading, please wait...</div>
                        </div>
                    </div>
                )}

                {showOverlay && !loading && (
                    <div className="game-overlay">
                        <div className="game-overlay-content">
                            <h2>{room}</h2>
                            <div className="game-overlay-message">
                                {waitingForPlayers
                                    ? 'Waiting for players to join...'
                                    : (isGameFull
                                        ? (isReady
                                            ? (allPlayersReady()
                                                ? countdown !== null ? `Game starting in ${countdown}...` : 'Waiting for game to start...'
                                                : 'Waiting for opponents to be ready...')
                                            : 'Game is full! Are you ready to play?')
                                        : 'Waiting for players to join...')}
                            </div>
                            {waitingForPlayers && (
                                <Form onSubmit={handleLeaveGame} className="mt-4">
                                    <Button variant="danger" type="submit" className="w-100 global-btn">
                                        <i className="bi bi-door-open"></i> Leave
                                    </Button>
                                </Form>
                            )}
                            {isGameFull && !isReady && !waitingForPlayers && (
                                <Button
                                    variant="primary"
                                    onClick={handleReady}
                                    className="mt-3"
                                >
                                    Ready
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {countdownFinished && !gameStarted && (
                    <div className="game-overlay">
                        <div className="game-overlay-content">
                            <div className="game-overlay-message">
                                GAME START!
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default Game;
