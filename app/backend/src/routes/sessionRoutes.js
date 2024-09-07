// +------------------------------------------------+
// |            REDTETRIS SESSION ROUTES            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the session routes for the
    RedTetris game. The routes handle session 
    management, such as checking if a user is logged
    in.
*/

// +----------------- REQUIREMENTS -----------------+ 

const express = require('express');
const router = express.Router();
// +------------------- FUNCTIONS ------------------+

router.get('/get', (req, res) => {
    if (req.session.user ) {
        res.json({ user: req.session.user });
    } else {
        res.json({ user: null });
    }
});


// +-------------------- EXPORTS -------------------+ 

module.exports = router;
