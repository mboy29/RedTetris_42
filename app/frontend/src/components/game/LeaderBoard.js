// +------------------------------------------------+
// |        REDTETRIS LEADERBOARDS COMPONENT        |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Leaderboard` component 
    for the RedTetris frontend. The component displays
    the top 3 players on a podium and the remaining
    players in a list.
*/

// +----------------- REQUIREMENTS -----------------+

import React from 'react';
import { Container } from 'react-bootstrap';

import './../../css/leaderboard.css';
import Podium from './Podium';

// +------------------- COMPONENT -------------------+

const Leaderboard = ({ scores = [] }) => {
    const remainingPlayers = scores.slice(3);
    const podiumPlayers = scores.slice(0, 3);

    return (
        <Container className="w-100 leaderboard-container">
            <h2 className="text-center mb-4">Leaderboard</h2>
            <Podium scores={podiumPlayers} />

            {remainingPlayers.length > 0 ? (
                <div className="w-100 leaderboard-list">
                    {remainingPlayers.map((player, index) => (
                        <div key={index} className="leaderboard-list-item">
                            <div className="leaderboard-list-item-info">
                                <span className="leaderboard-list-item-index">{index + 4}</span>
                                <span className="leaderboard-list-item-username">{player.username}</span>
                            </div>
                            <span className="leaderboard-list-item-score">{player.score} points</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="w-100 leaderboard-list">
                   <span className="leaderboard-list-item-error">No other players</span>
                </div>
            )}
        </Container>
    );
};

// +------------------- EXPORTS --------------------+

export default Leaderboard;
