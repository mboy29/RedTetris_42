// +------------------------------------------------+
// |     REDTETRIS LEADERBOARD PODIUM COMPONENT     |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Podium` component for the
    RedTetris frontend. The component displays the top
    3 players on a podium.
*/

// +----------------- REQUIREMENTS -----------------+

import React from 'react';
import { Row, Col } from 'react-bootstrap';
import './../../css/leaderboard.css'; // Ensure this contains the necessary custom styles

import RibbonIconFirstPlace from './../../assets/icons/ribbon-1.svg';
import RibbonIconSecondPlace from './../../assets/icons/ribbon-2.svg';
import RibbonIconThirdPlace from './../../assets/icons/ribbon-3.svg';

// +------------------- COMPONENT -------------------+

const Podium = ({ scores = [] }) => {
    return (
        <Row className="justify-content-center align-items-end leaderboard-podium-row">
            
            {/* Podium for 2nd place */}
            <Col xs={12} md={3} className="leaderboard-podium position-2">
                <div className="leaderboard-podium-label leaderboard-podium-label-2">2nd</div>
                <div className="leaderboard-podium-player">
                    <div>
                        <img src={RibbonIconSecondPlace} alt="2nd Place Trophy" className="leaderboard-podium-player-ribbon" />
                        {scores[1] ? (
                            <>
                                <h3 className="leaderboard-podium-player-username">{scores[1].username}</h3>
                                <p className="leaderboard-podium-player-score">{scores[1].score}</p>
                            </>
                        ) : (
                            <p className="leaderboard-podium-player-score">No Player</p>
                        )}
                    </div>
                </div>
            </Col>

            {/* leaderboard-podium for 1st place */}
            <Col xs={12} md={3} className="leaderboard-podium position-1">
                <div className="leaderboard-podium-label leaderboard-podium-label-1">1st</div>
                <div className="leaderboard-podium-player">
                    <div>
                        <img src={RibbonIconFirstPlace} alt="1st Place Trophy" className="leaderboard-podium-player-ribbon" />
                        {scores[0] ? (
                            <>
                                <h3 className="leaderboard-podium-player-username">{scores[0].username}</h3>
                                <p className="leaderboard-podium-player-score">{scores[0].score}</p>       
                            </>
                        ) : (
                            <p className="leaderboard-podium-player-score">No Player</p>
                        )}
                    </div>  
                </div>
            </Col>

            {/* Podium for 3rd place */}
            <Col xs={12} md={3} className="leaderboard-podium position-3">
                <div className="leaderboard-podium-label leaderboard-podium-label-3">3rd</div>
                <div className="leaderboard-podium-player">
                    <div>
                        <img src={RibbonIconThirdPlace} alt="3rd Place Trophy" className="leaderboard-podium-player-ribbon" />
                        {scores[2] ? (
                            <>
                            <h3 className="leaderboard-podium-player-username">{scores[2].username}</h3>
                            <p className="leaderboard-podium-player-score">{scores[2].score}</p>
                            </>
                        ) : (
                            <p className="leaderboard-podium-player-score">No Player</p>
                        )}
                    </div>
                </div>
            </Col>
        </Row>
    );
};

// +------------------- EXPORTS --------------------+

export default Podium;
