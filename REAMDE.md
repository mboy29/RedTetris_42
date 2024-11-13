# Red Tetris

A real-time, multiplayer Tetris game built with **JavaScript**, **Node.js** (backend), and **React** (frontend). The game uses **socket.io** for bi-directional client-server communication and supports features like player versus player, piece animations, line clearing, and a game-over condition when the board is full.

## Main features
- **Multiplayer**: Play with others, view their gameplay, and disrupt their progress with penalty lines.
- **Game Mechanics**: Classic Tetris with gravity, rotation, and line-clearing.
- **Client-Server Architecture**: Asynchronous communication with `socket.io` and REST API.
- **SPA**: Built with React and Redux for state management.
- **Testing**: Unit tests with Jest ensuring 70% statement coverage.

## Lets go a little **extra**
- **General Scoring System**: Earn points for each line cleared, with extra bonuses for doubles, triples, and Tetrises. Track your score to boost rankings and compete with other players.
- **Sprint Mode**: In Sprint Mode, the pace increases with each level, pushing you to clear lines faster. Great for practicing quick thinking and honing reflexes under pressure.
- **Training Mode**: Practice at your own pace in Training Mode, where points don’t count towards rankings. Perfect for experimenting with new strategies and building skills without pressure.
