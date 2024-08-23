// +------------------------------------------------+
// |             REDTETRIS PLAYERS MODEL            |
// +------------------------------------------------+

// +--------------------- CLASS --------------------+

class Player {

    constructor(name, socket, game) {
        this.name = name;
        this.socket = socket;
        this.game = game;
    }
}