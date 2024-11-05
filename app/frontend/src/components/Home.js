// +------------------------------------------------+
// |           REDTETRIS HOME COMPONENT             |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Home` component for the 
    RedTetris frontend. It displays a welcome message 
    or login/register options depending on the session state.
*/

// +----------------- REQUIREMENTS -----------------+

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';

import NavBar from './global/NavBar';
import Leaderboard from './game/LeaderBoard';
import './../css/global.css'; // Ensure this contains the necessary custom styles
import config from './../configs/config';

// +------------------- COMPONENT -------------------+

const Home = ({ globalError }) => {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const response = await fetch(`${config.api_url}/player/scores`);

                if (response.ok) {
                    const { scores } = await response.json();
                    setScores(scores);
                } else {
                    const errorData = await response.json();
                    setScores([]);
                    console.log(errorData.message);
                }
            } catch (error) {
                setScores([]);
                console.log('Error fetching scores:', error);
            }
        };

        fetchScores();
    }, []);

    return (
        <div>
            <NavBar />
            <Container className="d-flex flex-column justify-content-center align-items-center vh-100 global-home-container">
    
                {/* Error Message (if any) */}
                <Row className="w-100">
                    <Col className="text-center">
                        {globalError && (
                            <Alert variant="danger" className="text-center mb-4">
                                <p>{globalError}</p>
                            </Alert>
                        )}
                    </Col>
                </Row>

                {/* Leaderboard Component */}
                <Row className="w-100 mb-4">
                    <Leaderboard scores={scores} /> {/* Add margin-bottom */}
                </Row>
    
                <Row className="justify-content-between w-100"> {/* Add margin-top for spacing */}
                    <Col className="text-center">
                        <Button
                            as={Link}
                            to="/game/create"
                            type="button"
                            variant="primary"
                            className="global-btn w-100"
                        >
                            Create a Game
                        </Button>
                    </Col>
                    <Col className="text-center">
                        <Button
                            as={Link}
                            to="/game/join"
                            type="button"
                            variant="primary"
                            className="global-btn w-100"
                        >
                            Join a Game
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );     
};

// +------------------- EXPORTS ---------------------+

export default Home;
