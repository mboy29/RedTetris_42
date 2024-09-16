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

        if (game.isGameFull()) {
            return res.status(409).json({ message: 'Game is full' });
        }

        if (!game.isGameJoinable()) {
            return res.status(409).json({ message: 'Game has already started' });
        }

        res.status(200).json({ roomName, playerName });
    } catch (error) {
        console.log('[GAME] Error joining game:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:room/:playerName', async (req, res) => {
    const { room, playerName } = req.params;

    console.log("[DEBUG]")
    try {
        const user = await Player.getByUsername(req.session.user.username);
        const player = await Player.getByUsername(playerName);
        const game = await Game.getByName(room);

        console.log('[DEBUG] user', user);
        console.log('[DEBUG] player', player);
        console.log('[DEBUG] game', room, game.getName(), user.getRoomName());
        if (!player || !user) {
            return res.status(404).json({ success: false, message: 'Player not found' });
        } else if (player.getId() != user.getId()) {
            console.log('diff users');
            return res.status(403).json({ success: false, message: 'Access denied' });
        } else if (!game) {
            console.log('game not found');
            return res.status(404).json({ success: false, message: 'Game not found' });
        } else if (game.getName() != user.getRoomName()) {
            console.log('game not match');
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error validating game access:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// +-------------------- EXPORTS -------------------+

module.exports = router;
