const TetrisScores = {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800
};

const getScoreForLines = (lines) => {
    switch (lines) {
        case 1: return TetrisScores.SINGLE;
        case 2: return TetrisScores.DOUBLE;
        case 3: return TetrisScores.TRIPLE;
        case 4: return TetrisScores.TETRIS;
        default: return 0;
    }
};

calculateScore = (lines) => {
    return getScoreForLines(lines);
}