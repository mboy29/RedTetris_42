// +------------------------------------------------+
// |             REDTETRIS GAME ROUTES              |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the game routes for the RedTetris
    backend. The routes handle game creation and joining
    operations.
*/

// +----------------- REQUIREMENTS -----------------+

const express = require('express');
const router = express.Router();

const Game = require('./../models/gameModel');
const Player = require('./../models/playerModel');

// +------------------- FUNCTIONS ------------------+

router.post('/create', async (req, res) => {
    try {
        const { roomName, playerName } = req.body;

        if (!roomName || !playerName) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        const player = await Player.getByUsername(playerName);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        } else if (await Game.getByName(roomName)) {
            return res.status(409).json({ message: 'Game already exists' });
        }

        // Create the game and associate it with the player
        const game = await Game.create(roomName, 'multiplayer', player);

        console.log(`[GAME] Game ${roomName} created by ${playerName}`);
        res.status(201).json({ roomName, playerName }); 
    } catch (error) {
        console.log('[GAME] Error creating game:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/join', async (req, res) => {
    try {
        const { roomName, playerName } = req.body;

        if (!roomName || !playerName) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        const player = await Player.getByUsername(playerName);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const game = await Game.getByName(roomName);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        if (await game.isGamePlayer(player)) {
            return res.status(409).json({ message: 'Player already in game' });
        }

        res.status(200).json({ roomName, playerName });
    } catch (error) {
        console.log('[GAME] Error joining game:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// +-------------------- EXPORTS -------------------+

module.exports = router;
