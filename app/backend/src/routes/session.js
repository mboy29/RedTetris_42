// src/middleware/auth.js
// +------------------------------------------------+
// |            REDTETRIS SESSION ROUTES            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    Middleware that creates a session for the user
    using the express-session library.
*/

// +----------------- REQUIREMENTS -----------------+ 

const express = require('express');
const router = express.Router();

// +------------------- FUNCTIONS ------------------+

router.get('/session', (req, res) => {
    res.json({ user: req.session.user });
});

// +-------------------- EXPORTS -------------------+ 

module.exports = router;
