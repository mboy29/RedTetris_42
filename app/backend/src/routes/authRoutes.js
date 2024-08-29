// +------------------------------------------------+
// |        REDTETRIS AUTHENTICATIONS ROUTES        |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the authentication routes for 
    the RedTetris game. The routes handle user 
    registration, login, and logout operations.
*/

// +----------------- REQUIREMENTS -----------------+ 

const express = require('express');
const router = express.Router();
const Player = require('./../models/playerModel');

// +------------------- FUNCTIONS ------------------+

router.post('/register', async (req, res) => {
    const { username, password, passwordConfirm } = req.body;
    try {
        const player = await Player.create(username, password, passwordConfirm);
        await player.authenticate(password);
        req.session.user = player;
        req.session.save();
        console.log('[REGISTER] Successful registration for', player.username);
        res.status(200).json({ success: true, user: player });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const player = await Player.authenticate(username, password);
        req.session.user = player; 
        req.session.save();
        console.log('[LOGIN] Successful login for', player.username);
        res.status(200).json({ success: true, user: player });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const user = req.session.user;
        if (req.session.user) {
            const player = await Player.getByUsername(user.username); // This shadows the outer `player` variable
            const username = player.username;
            await player.disconnect();
            req.session.destroy((err) => {
                if (err) {
                    res.status(500).json({ success: false, message: 'Logout failed' });
                } else {
                    console.log('[LOGOUT] Successful logout for', username);
                    res.status(200).json({ success: true, message: 'Logged out successfully' });
                }
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.json({ user: null });
    }
});


// +-------------------- EXPORTS -------------------+ 

module.exports = router;
