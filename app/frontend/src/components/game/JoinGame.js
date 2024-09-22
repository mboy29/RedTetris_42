// +------------------------------------------------+
// |          REDTETRIS JOIN GAME COMPONENT          |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+
/*
    This module defines the `JoinGame` component for
    the RedTetris frontend. It allows a user to join
    an existing game by entering the room name. 
*/

// +----------------- REQUIREMENTS -----------------+

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Button, Form, Alert } from 'react-bootstrap';

import './../../css/game.css'; 
import NavBar from './../global/NavBar';
import config from './../../configs/config';
import { SessionContext } from './../../contexts/sessionContext';

// +------------------- COMPONENT -------------------+

const JoinGame = () => {
    const { session } = useContext(SessionContext);
    const [roomName, setRoomName] = useState('');
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();

    const handleJoinGame = async () => {
        setErrors([]);
        if (!roomName.trim()) {
            setErrors(['Room name is required.']);
            return;
        }
        if (session && session.username) {
            try {
                const response = await fetch(`${config.api_url}/game/join`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        roomName,
                        playerName: session.username,
                    }),
                });

                if (response.ok) {
                    const { roomName, playerName } = await response.json();
                    navigate(`/${roomName}/${playerName}`);
                } else {
                    const errorData = await response.json();
                    setErrors([errorData.message]);
                }
            } catch (error) {
                setErrors(['Error joining game. Please try again.']);
            }
        } else {
            setErrors(['User session is not available.']);
        }
    };

    return (
        <div>
            <NavBar />
            <Container fluid className="d-flex flex-column justify-content-center align-items-center vh-100">
                <div className="global-form-container">
                    <h2 className="text-center mb-4">Join an Existing Game</h2>
                    {errors.length > 0 && (
                        <Alert variant="danger" className="text-center mb-4">
                            {errors.map((error, index) => (
                                <p key={index}>{error}</p>
                            ))}
                        </Alert>
                    )}
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleJoinGame();
                        }}
                    >
                        <Form.Group controlId="formRoomName" className="mb-3">
                            <Form.Control
                                type="text"
                                value={roomName}
                                className="global-form-control"
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="Room Name"
                                required
                            />
                        </Form.Group>
                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100 global-btn"
                        >
                            Join Game
                        </Button>
                    </Form>
                    <p className="mt-3 text-center">
                        Game not yet created? <Link to="/game/create" className="global-link">Create one here</Link>.
                    </p>
                </div>
            </Container>
        </div>
    );
};

// +------------------- EXPORTS ---------------------+

export default JoinGame;
