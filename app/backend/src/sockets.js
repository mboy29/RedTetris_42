// +------------------------------------------------+
// |         REDTETRIS WEBSOCKET HANDLERS           |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module contains the WebSocket handlers for 
    the RedTetris server. It handles the registration, 
    login, and disconnection of players.
*/

// +----------------- REQUIREMENTS -----------------+

const Player = require('./models/playerModel');

// +------------------- MANAGEMENT ------------------+

const socketManager = (io, sessionMiddleware) => {
    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    });

    io.on('connection', (socket) => {
        console.log('[CONNECTION]', socket.id);

        socket.on('register', async ({ username, password, passwordConfirm }) => {
            try {
                const player = await Player.create(username, password, passwordConfirm);
                await player.authenticate(password, socket.id);
                socket.request.session.user = player;
                socket.request.session.save((err) => {
                    if (err) {
                        console.error('[REGISTER] Session save error', err);
                    } else {
                        console.log('[REGISTER] Session saved for', player.username);
                    }
                });
                console.log('[REGISTER] Successful registration for', player.username);
                socket.emit('register_success');
            } catch (err) {
                console.error('[REGISTER]', err.message);
                socket.emit('register_error', err.message.split('; '));
            }
        });

        socket.on('login', async ({ username, password }) => {
            try {
                const player = await Player.authenticate(username, password, socket.id);
                socket.request.session.user = player;
                socket.request.session.save((err) => {
                    if (err) {
                        console.error('[LOGIN] Session save error', err);
                    } else {
                        console.log('[LOGIN] Session saved for', player.username);
                    }
                });
                console.log('[LOGIN] Successful login for', player.username);
                socket.emit('login_success');
            } catch (err) {
                console.error('[LOGIN]', err.message);
                socket.emit('login_error', err.message.split('; '));
            }
        });
    });
};

// +-------------------- EXPORTS -------------------+

module.exports = socketManager;
