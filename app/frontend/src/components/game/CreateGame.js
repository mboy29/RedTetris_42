// +------------------------------------------------+
// |         REDTETRIS CREATE GAME COMPONENT        |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+
/*
    This module defines the `CreateGame` component for
    the RedTetris frontend. The component provides a
    form to create a new game room and handles errors,
    with options for Sprint Mode and Training Mode.
*/

// +----------------- REQUIREMENTS -----------------+

import { useNavigate, Link } from 'react-router-dom';
import { Container, Button, Form, Alert, ButtonGroup, ToggleButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import React, { useState, useContext } from 'react';

import './../../css/game.css'; 
import NavBar from './../global/NavBar';
import { SessionContext } from './../../contexts/sessionContext';
import config from './../../configs/config';

// +------------------- COMPONENT -------------------+

const CreateGame = () => {
    const { session } = useContext(SessionContext);
    const [roomName, setRoomName] = useState('');
    const [sprintMode, setSprintMode] = useState(false); // State for sprint mode
    const [trainingMode, setTrainingMode] = useState(false); // State for training mode
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();

    const handleCreateGame = async () => {
        if (session && session.username) {
            try {
                const response = await fetch(`${config.api_url}/game/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        roomName,
                        sprintMode, 
                        trainingMode,  // Add trainingMode in the request body
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
                setErrors(['Error creating game. Please try again.']);
            }
        }
    };

    const toggleSprintMode = () => {
        setSprintMode(!sprintMode); // Toggle sprint mode
    };

    const toggleTrainingMode = () => {
        setTrainingMode(!trainingMode); // Toggle training mode
    };

    return (
        <div>
            <NavBar />
            <Container fluid className="d-flex flex-column justify-content-center align-items-center vh-100">
                <div className="global-form-container">
                    <h2 className="text-center mb-4">Create a game</h2>
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
                            handleCreateGame();
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

                        {/* Sprint Mode Toggle */}
                        <Form.Group controlId="formSprintMode" className="mb-3">
                            <ButtonGroup className="w-100">
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip id="tooltip-sprint">
                                            Speed increases with each level. React quickly and stay sharp!
                                        </Tooltip>
                                    }
                                >
                                    <ToggleButton
                                        id="toggle-sprint-mode"
                                        type="checkbox"
                                        checked={sprintMode}
                                        value="1"
                                        onChange={toggleSprintMode}
                                        className={`w-100 global-toggle-btn ${sprintMode ? 'active' : ''}`}
                                    >
                                        {sprintMode ? 'Sprint Mode Enabled' : 'Sprint Mode Disabled'}
                                    </ToggleButton>
                                </OverlayTrigger>
                            </ButtonGroup>
                        </Form.Group>

                        {/* Training Mode Toggle */}
                        <Form.Group controlId="formTrainingMode" className="mb-3">
                            <ButtonGroup className="w-100">
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip id="tooltip-training">
                                            Practice freely without impacting your stats. Perfect for honing skills!
                                        </Tooltip>
                                    }
                                >
                                    <ToggleButton
                                        id="toggle-training-mode"
                                        type="checkbox"
                                        checked={trainingMode}
                                        value="1"
                                        onChange={toggleTrainingMode}
                                        className={`w-100 global-toggle-btn ${trainingMode ? 'active' : ''}`}
                                    >
                                        {trainingMode ? 'Training Mode Enabled' : 'Training Mode Disabled'}
                                    </ToggleButton>
                                </OverlayTrigger>
                            </ButtonGroup>
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100 global-btn"
                        >
                            Create Game
                        </Button>
                    </Form>
                    <p className="mt-3 text-center">
                        Game already created? <Link to="/game/join" className="global-link">Join one here</Link>.
                    </p>
                </div>
            </Container>
        </div>
    );
};

// +------------------- EXPORTS ---------------------+

export default CreateGame;
