// +------------------------------------------------+
// |        REDTETRIS AUTHENTICATION ROUTES         |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    Middleware that creates a session for the user
    using the express-session library.
*/

// +----------------- REQUIREMENTS -----------------+ 

const express = require('express');
const router = express.Router();

const Player = require('./../models/playerModel');

// +------------------- FUNCTIONS ------------------+

router.get('/logout', async (req, res) => {  // Add async here
    if (req.session) {
        try {
            const socketId = req.session.user.socket;
            const username = req.session.user.username;
            await Player.disconnect(socketId);
            req.session.destroy((err) => {
                if (err) {
                    console.error('[LOGOUT] Session destroy error', err);
                    return res.status(500).send('Logout failed');
                }
                console.log('[LOGOUT] Session destroyed for', username);
                console.log('[LOGOUT] Successful logout', username);
                return res.status(200).send('Logout successful');
            });
        } catch (err) {
            console.error('[LOGOUT] Error during logout:', err);
            return res.status(500).send('Logout failed');
        }
    } else {
        return res.status(400).send('No session found');
    }
});


// +-------------------- EXPORTS -------------------+ 

module.exports = router;
