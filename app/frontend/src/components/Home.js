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

import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';

import NavBar from './global/NavBar';

// +------------------- COMPONENT -------------------+

const Home = ({ globalError }) => {
    return (
        <div>
            <NavBar />
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Row>
                    <Col className="text-center">
                        {globalError && 
                            <Alert variant="danger" className="text-center mb-4">
                                <p>{globalError}</p>
                            </Alert>
                        }
                        <div className="mt-4">
                            <Button
                                as={Link}
                                to="/game/create"
                                type="button"
                                variant="primary"
                                className="w-100 global-btn mb-3"
                            >
                                Create a Game
                            </Button>
                            <Button
                                as={Link}
                                to="/game/join"
                                type="button"
                                variant="primary"
                                className="w-100 global-btn"
                            >
                                Join a Game
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

// +------------------- EXPORTS ---------------------+

export default Home;
