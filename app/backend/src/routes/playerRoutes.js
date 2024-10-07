// +------------------------------------------------+
// |             REDTETRIS SCORE ROUTES             |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the score routes for the
    RedTetris game. The routes handle score
    operations for the game.
*/

// +----------------- REQUIREMENTS -----------------+ 

const express = require('express');
const router = express.Router();
const Player = require('../models/playerModel');

// +------------------- FUNCTIONS ------------------+

router.get('/scores', async (req, res) => {
    try {
        const players = await Player.getAllScores();
        let scores = [];
        players.forEach(player => {
            scores.push({ username: player.username, score: player.score });
        });
        res.status(200).json({ success: true, scores });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
   
   

// +-------------------- EXPORTS -------------------+ 

module.exports = router;
