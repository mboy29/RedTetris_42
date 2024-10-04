import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './../../css/leaderboard.css';

const Leaderboard = ({ scores = [] }) => {
    return (
        <Container className="mt-4">
            <h2 className="text-center mb-4">Leaderboard</h2>
            <Row className="justify-content-center">
                {/* Podium for 1st place */}
                <Col xs={12} md={4} className="podium position-1">
                    <div className="podium-label">1st</div>
                    <div className="podium-player">
                        {scores[0] ? (
                            <div>
                                <h5>{scores[0].name}</h5>
                                <p>Score: {scores[0].score}</p>
                            </div>
                        ) : (
                            <p>No Player</p>
                        )}
                    </div>
                </Col>

                {/* Podium for 2nd place */}
                <Col xs={12} md={4} className="podium position-2">
                    <div className="podium-label">2nd</div>
                    <div className="podium-player">
                        {scores[1] ? (
                            <div>
                                <h5>{scores[1].name}</h5>
                                <p>Score: {scores[1].score}</p>
                            </div>
                        ) : (
                            <p>No Player</p>
                        )}
                    </div>
                </Col>

                {/* Podium for 3rd place */}
                <Col xs={12} md={4} className="podium position-3">
                    <div className="podium-label">3rd</div>
                    <div className="podium-player">
                        {scores[2] ? (
                            <div>
                                <h5>{scores[2].name}</h5>
                                <p>Score: {scores[2].score}</p>
                            </div>
                        ) : (
                            <p>No Player</p>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Leaderboard;
