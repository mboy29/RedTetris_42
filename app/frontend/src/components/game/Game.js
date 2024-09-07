import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './../../css/game.css'; 
import NavBar from './../global/NavBar';
import { Container, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { SessionContext } from './../../contexts/sessionContext';
import config from './../../configs/config';


const socket = io(config.api_url);

const Game = () => {
    const { session } = useContext(SessionContext);
    const [errors, setErrors] = useState([]); 
    const [players, setPlayers] = useState([]); 
    const { room } = useParams(); 
    const navigate = useNavigate(); 


    useEffect(() => {

        if (room && session.username) {
            socket.emit('joinGame', { roomName: room, playerName: session.username });
        }
    
        socket.on('error', ({ message }) => {
            setErrors((prevErrors) => [...prevErrors, message]);
            navigate('/home');
        });
    
        socket.on('updatePlayers', (players) => {
            setPlayers(players);
        });
        
        socket.on('gameDeleted', () => {
            setErrors(['Game creator left, game deleted. Redirecting to home...']);
            setTimeout(() => navigate('/home'), 5000); // Redirect after 5 seconds
        });
       
    
        return () => {
            socket.off('error');
            socket.off('updatePlayers');
            socket.off('gameDeleted');
        };
    }, [room, session, navigate]);
    

    const handleLeaveGame = (e) => {
        e.preventDefault();
        if (session.username) {
            socket.emit('leaveGame', { roomName: room, playerName: session.username }); // Notify server that player left
            navigate('/home'); 
        }
    };
    return (
        <div>
            <NavBar />
            <Container fluid className="game-container d-flex flex-column justify-content-center align-items-center vh-100">
                <div className="global-form-container">
                    <h2 className="text-center mb-4">Game Room: {room}</h2>

                    {errors.length > 0 && (
                        <Alert variant="danger" className="text-center mb-4">
                            {errors.map((error, index) => (
                                <p key={index}>{error}</p>
                            ))}
                        </Alert>
                    )}
                    <Form onSubmit={handleLeaveGame}>
                        <Button
                            variant="danger"
                            type="submit"
                            className="w-100 global-btn"
                        >
                            <i className="bi bi-door-open"></i> Leave Game
                        </Button>
                    </Form>
                    <div className="mt-4">
                        <h4>Players in the room:</h4>
                        <ListGroup>
                            {players.map((player, index) => (
                                <ListGroup.Item key={index}>{player.username}</ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Game;
