// +------------------------------------------------+
// |              REDTETRIS SCORE MODEL              |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Score` class for 
    managing player scores in the RedTetris game. The
    class provides methods to adjust player scores based
    on game events, such as line clears and surrenders.
*/

// +----------------- REQUIREMENTS -----------------+

const queries = require('./../database/queries/gameQueries');

// +--------------------- CLASS ---------------------+

class Score {
    static TETRIS_SCORES = {
        SINGLE: 40,   // 1 line
        DOUBLE: 100,  // 2 lines
        TRIPLE: 300,  // 3 lines
        TETRIS: 1200  // 4 lines
    };

    static SURRENDER_PENALTY = -1200;  // Penalty for surrendering
    static LOSER_BONUS_MULTIPLIER = 1.5; // Multiplier for scores against a losing player

    constructor(game) {
        this.game = game;  // store the current game instance
    }

    // Adjust a player's score based on the number of cleared lines
    async adjustPlayerScore(player, score, linesCleared = -1) {
        let additionalScore = score;

        // Adjust score based on lines cleared
        if (linesCleared !== -1) {
            additionalScore += Score.TETRIS_SCORES[linesCleared] || 0;
        }

        await queries.updateGameScore(this.game.id, player.id, additionalScore);
        this.game.scores[player.id] += additionalScore;

        return additionalScore;
    }

    // Distribute bonus points to remaining players based on the loser's score
    async distributeBonusPoints(loser) {
        const loserScore = this.game.scores[loser.id];

        for (const player of this.game.getPlayers()) {
            if (!this.game.losers.includes(player.id) && player.id !== loser.id) {
                let bonus = loserScore <= 0 
                            ? Score.TETRIS_SCORES.SINGLE * Score.LOSER_BONUS_MULTIPLIER
                            : loserScore * Score.LOSER_BONUS_MULTIPLIER;

                await this.adjustPlayerScore(player, bonus);
            }
        }
    }

    // Handle surrender by adjusting the loser's score
    async handleSurrender(loser) {
        await this.adjustPlayerScore(loser, Score.SURRENDER_PENALTY);
    }
}

// +------------------- EXPORT ---------------------+

module.exports = Score;
