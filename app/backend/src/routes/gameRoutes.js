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

const isValidRoomName = (roomName) => /^[a-zA-Z0-9]+$/.test(roomName);

router.post('/create', async (req, res) => {
    try {
        const { roomName, playerName } = req.body;

        if (!roomName || !playerName) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        if (!isValidRoomName(roomName)) {
            return res.status(400).json({ message: 'Room name must contain only letters and numbers' });
        }

        const player = await Player.getByUsername(playerName);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        } else if (await Game.getByName(roomName)) {
            return res.status(409).json({ message: 'Game already exists' });
        }
        await Game.create(roomName, 'multiplayer', player);

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

        if (!game.isGameJoinable()) {
            return res.status(409).json({ message: 'Game has already started' });
        }

        if (game.isGameFull() === true) {
            return res.status(409).json({ message: 'Game is full' });
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

router.get('/check', async (req, res) => {
    try {
        const { room, playerName } = req.query;
        const user = await Player.getByUsername(req.session.user.username);
        const player = await Player.getByUsername(playerName);
        const game = await Game.getByName(room);
        
        if (!player || !user) {
            console.log('[GAME] Player or user not found');
            return res.status(403).json({ success: false, message: 'Access denied' });
        } else if (player.getId() != user.getId()) {
            console.log('[GAME] User and player do not match');
            return res.status(403).json({ success: false, message: 'Access denied' });
        } else if (!game) {
            console.log('[GAME] game not found');
            return res.status(404).json({ success: false, message: 'Game not found' });
        }
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('[GAME] Error checking game access:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// +-------------------- EXPORTS -------------------+

module.exports = router;
