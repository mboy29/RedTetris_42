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
const Player = require('./../models/playerModel');

// +------------------- FUNCTIONS ------------------+

router.get('/score/top', async (req, res) => {
    try {
        const players = await Player.getTopPlayers();
        res.status(200).json({ success: true, players });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
   
   

// +-------------------- EXPORTS -------------------+ 

module.exports = router;
