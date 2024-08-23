// +------------------------------------------------+
// |       REDTETRIS PLAYER QUERY DATABASE JS       |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module is designed to initialize the SQLite 
    database for the RedTetris project with the
    necessary tables. 

    This includes :
        - players
*/

// +----------------- REQUIREMENTS -----------------+ 

// const db = require('./database').connect();

// function createPlayer(player) {
//     return new Promise((resolve, reject) => {
//         const sql = 'INSERT INTO players (name, socket, game) VALUES (?, ?, ?)';
//         db.run(sql, [player.name, player.socket, player.game], function (err) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve({ id: this.lastID });
//             }
//         });
//     });
// }

// function getPlayerByName(name) {
//     return new Promise((resolve, reject) => {
//         const sql = 'SELECT * FROM players WHERE name = ?';
//         db.get(sql, [name], (err, row) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(row);
//             }
//         });
//     });
// }

// function updatePlayerByName(name, updatedPlayer) {
//     return new Promise((resolve, reject) => {
//         const sql = 'UPDATE players SET socket = ?, game = ? WHERE name = ?';
//         db.run(sql, [updatedPlayer.socket, updatedPlayer.game, name], function (err) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve({ changes: this.changes });
//             }
//         });
//     });
// }

// function deletePlayerByName(name) {
//     return new Promise((resolve, reject) => {
//         const sql = 'DELETE FROM players WHERE name = ?';
//         db.run(sql, [name], function (err) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve({ changes: this.changes });
//             }
//         });
//     });
// }

// module.exports = {
//     createPlayer,
//     getPlayerByName,
//     updatePlayerByName,
//     deletePlayerByName
// };
