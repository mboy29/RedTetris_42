# Tetris Project Instructions

## General Requirements

1. **Language**: 
   - Entire project must be written in JavaScript, using the latest versions available.

2. **Client-Side Code**: 
   - Must be functional (no use of `this`), except for defining custom subclasses of `Error`.
   - Can use a functional library like Lodash or Ramda, but not mandatory.
   - Must be built using a JavaScript framework like React or Vue.
   - Must use grid or flexbox for layout; `<TABLE>` elements are prohibited.
   - Single Page Application (SPA) architecture.

3. **Server-Side Code**: 
   - Must use object-oriented programming (OOP) with prototype-based classes.
   - Required classes: `Player`, `Piece`, `Game`.

4. **Prohibitions**:
   - No use of DOM manipulation libraries (e.g., jQuery).
   - No use of Canvas or SVG for graphics.
   - No need for direct DOM manipulation.

5. **Testing**:
   - Unit tests must cover at least 70% of statements, functions, and lines, and 50% of branches.
   - Tests should increase reliability and reduce time-to-market.

## Tetris Game Requirements (V.1)

1. **Basic Game Mechanics**:
   - Implement classic Tetris mechanics with falling pieces and line clearing.
   - The game ends when no room is left for new pieces.
   - When a player clears lines, other players receive `n - 1` indestructible penalty lines at the bottom of their playground.
   - Last remaining player wins.

2. **Multi-Player Functionality**:
   - All players face the same series of pieces.
   - Each player has their own playground (10 columns, 20 rows).
   - Players can see opponents’ names and the “specter” (first occupied line) of their fields.
   - Updates in a player's terrain should be visible to all opponents.

3. **Piece Movements**:
   - Pieces move down at a constant speed.
   - Player-initiated movements include left, right, down, and rotation.
   - Spacebar allows direct placement of a piece.

## Technical Architecture (V.2)

1. **Client-Server Communication**:
   - Must be event-driven and bi-directional using `socket.io`.
   - Clients and server communicate via HTTP.
   - Server responsibilities: manage games and players, distribute pieces, and update opponents' specters.

2. **Game Management**:
   - Players join games via URLs formatted as `http://<server_name_or_ip>:<port>/<room>/<player_name>`.
   - The first player to join a game becomes the game leader, with control to start or restart the game.
   - New players cannot join a game in progress.
   - Multiple games can run simultaneously.

3. **Server Setup**:
   - Asynchronous loop for handling events.
   - Server also serves the initial `index.html` and `bundle.js` to clients.

4. **Client Setup**:
   - Client runs entirely in the browser with no further HTML exchanges after the initial load.
   - Client must handle graphical rendering and application logic independently.
   - Use Redux for state management, with support for immutability and asynchronous actions.

## Testing Requirements (V.2.5)

- Tests should ensure reliability and reduce development cycles.
- Minimum coverage required:
  - 70% of statements, functions, and lines.
  - 50% of branches.
- Boilerplate includes tools for running server, building JS bundles, and performing unit tests.

## Security Considerations

- Store credentials, API keys, and environment variables locally in a `.env` file and exclude them from version control (e.g., using `.gitignore`).
