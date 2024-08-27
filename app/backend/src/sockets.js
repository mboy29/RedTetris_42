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
                socket.request.session.user = player;
                socket.request.session.save((err) => {
                    if (err) {
                        console.error('[REGISTER] Session save error', err);
                    }
                    console.log('[REGISTER] Session saved');
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
                    }
                    console.log('[LOGIN] Session user:', socket.request.session);
                });
                console.log('[LOGIN] Successful login for', player.username);
                socket.emit('login_success');
            } catch (err) {
                console.error('[LOGIN]', err.message);
                socket.emit('login_error', err.message.split('; '));
            }
        });

        socket.on('disconnect', async () => {
            console.log("[DISCONNECT]");
            // try {
            //     const user = socket.request.session.user ? socket.request.session.user.user : null;
            //     if (user) {
            //         await Player.disconnect(socket.id);
            //         console.log('[DISCONNECT]', user.username);
            //     } else {
            //         console.log('[DISCONNECT] Unknown user');
            //     }
            //     socket.request.session.destroy();
            // } catch (err) {
            //     console.error('[DISCONNECT]', err.message);
            // }
        });
    });
};

// +-------------------- EXPORTS -------------------+

module.exports = socketManager;
