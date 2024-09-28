import React, { useState, useEffect, useCallback } from 'react';
import './../../css/grid.css';

const Grid = ({ socket, isInteractable, room, playerName, playerScore, otherPlayer = null, otherGrid = null, otherScore = null }) => {
    const numRows = 20;
    const numCols = 10;
    const dropInterval = 1000; // 1 second drop interval

    const [pieceQueue, setPieceQueue] = useState([]);
    const [currentPiece, setCurrentPiece] = useState(null);
    const [currentPosition, setCurrentPosition] = useState({ row: 0, col: 3 }); // Initial spawn position
    const [pile, setPile] = useState(Array(numRows).fill().map(() => Array(numCols).fill(null)));
    const [gameOver, setGameOver] = useState(false); // New state for game over

    // Function to check collision with the pile or grid bottom
    const checkCollision = useCallback((newPile, newRow, newCol, piece) => {
        if (newRow >= numRows) return true; // Bottom of grid
        for (let row = 0; row < piece.piece.length; row++) {
            for (let col = 0; col < piece.piece[row].length; col++) {
                if (piece.piece[row][col] !== null) {
                    const targetRow = newRow + row;
                    const targetCol = newCol + col;
                    if (targetRow >= numRows || targetCol < 0 || targetCol >= numCols || newPile[targetRow][targetCol] !== null) {
                        return true;
                    }
                }
            }
        }
        return false;
    }, [numRows, numCols]);

    // Function to spawn a new piece from the queue
    const spawnNewPiece = useCallback((newPile, piece) => {
        if (gameOver) {
            console.log('Game over! Cannot spawn new piece.');
            return; // Do nothing if the game is over
        }

        console.log('Spawning new piece:', piece, newPile);
        setCurrentPiece(piece);
        // Set piece to spawn at the top center of the grid
        setCurrentPosition({ 
            row: 0, 
            col: Math.floor(numCols / 2) - Math.floor(piece.piece[0].length / 2) 
        });

        // Check for immediate collision to set game over
        if (checkCollision(newPile, 0, Math.floor(numCols / 2) - Math.floor(piece.piece[0].length / 2), piece)) {
            setGameOver(true);
            setCurrentPiece(null);
            console.log("Game Over! No space to place new piece.", newPile);
        }
    }, [gameOver, numCols, checkCollision]);

    // Function to merge current piece into the pile when it can no longer move
    const mergePieceToPile = useCallback((position) => {
        const newPile = pile.map((row) => [...row]); // Clone pile
        for (let row = 0; row < currentPiece.piece.length; row++) {
            for (let col = 0; col < currentPiece.piece[row].length; col++) {
                if (currentPiece.piece[row][col] !== null) {
                    const targetRow = position.row + row;
                    const targetCol = position.col + col;
                    newPile[targetRow][targetCol] = currentPiece.type;
                }
            }
        }
        setPile(newPile);
        setCurrentPiece(null); // Clear current piece
        // Only spawn a new piece if the game is still ongoing
        if (!gameOver && pieceQueue.length > 0) {
            const nextPiece = pieceQueue[0];
            setPieceQueue(pieceQueue.slice(1)); // Remove the used piece from the queue
            spawnNewPiece(newPile, nextPiece); // Spawn the next piece
        }
    }, [currentPiece, pieceQueue, spawnNewPiece, pile, gameOver]);

    // Fetch pieces from the server on mount
    useEffect(() => {
        if (socket && isInteractable) {
            socket.on('gamePieces', (pieces) => {
                console.log('Received game pieces:', pieces);
                setPieceQueue(pieces);  // Assuming 'pieces' is an array of piece objects
                if (!gameOver) {
                    spawnNewPiece(pile, pieces[0]); // Spawn the first piece on receiving pieces only if game is not over
                }
            });
            return () => {
                socket.off('gamePieces');
            };
        }
    }, [socket, isInteractable, spawnNewPiece, gameOver, pile]); // Added gameOver to dependencies

    // Move the piece down every 'dropInterval'
    useEffect(() => {
        const dropPiece = () => {
            if (!currentPiece || gameOver) return; // No piece to move or game over

            const newRow = currentPosition.row + 1;
            const newCol = currentPosition.col;

            if (checkCollision(pile, newRow, newCol, currentPiece)) {
                mergePieceToPile(currentPosition); // If there's a collision, merge the piece to the pile
            } else {
                setCurrentPosition({ row: newRow, col: newCol });
            }
        };

        const interval = setInterval(dropPiece, dropInterval);
        return () => clearInterval(interval); // Clean up interval on unmount
    }, [currentPosition, currentPiece, gameOver, dropInterval, checkCollision, mergePieceToPile, pile]); // Dropping logic depends on position and piece

    // Handle keyboard input for piece movement
    useEffect(() => {
        const moveLeft = (pile) => {
            if (!gameOver && !checkCollision(pile, currentPosition.row, currentPosition.col - 1, currentPiece)) {
                setCurrentPosition((pos) => ({ ...pos, col: pos.col - 1 }));
            }
        };

        const moveRight = (pile) => {
            if (!gameOver && !checkCollision(pile, currentPosition.row, currentPosition.col + 1, currentPiece)) {
                setCurrentPosition((pos) => ({ ...pos, col: pos.col + 1 }));
            }
        };

        const rotatePiece = (pile) => {
            // Rotate the piece 90 degrees clockwise
            const rotatedPiece = {
                ...currentPiece,
                piece: currentPiece.piece[0].map((_, index) => currentPiece.piece.map(row => row[index])).reverse() // Rotate logic
            };

            // Check for collision after rotation
            if (!gameOver && !checkCollision(pile, currentPosition.row, currentPosition.col, rotatedPiece)) {
                console.log('setCurrentPiece', rotatedPiece);
                setCurrentPiece(rotatedPiece);
            }
        };

        const fastDrop = (pile) => {
            if (gameOver) return; // Do nothing if the game is over

            const newRow = currentPosition.row + 1;
            const newCol = currentPosition.col;

            // Move the piece down immediately if no collision
            if (!checkCollision(pile, newRow, newCol, currentPiece)) {
                setCurrentPosition({ row: newRow, col: newCol });
            } else {
                mergePieceToPile(currentPosition); // Merge if collision occurs
            }
        };

        const instantDrop = (pile) => {
            if (gameOver) return; // Do nothing if the game is over
            
            let newRow = currentPosition.row;
    
            while (!checkCollision(pile, newRow + 1, currentPosition.col, currentPiece)) {
                newRow++;
            }
            setCurrentPosition({ row: newRow, col: currentPosition.col });
            mergePieceToPile({ row: newRow, col: currentPosition.col }); // Pass final position
        };

        const handleKeyDown = (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                    moveLeft(pile);
                    break;
                case 'ArrowRight':
                    moveRight(pile);
                    break;
                case 'ArrowUp': // Handle rotation
                    rotatePiece(pile);
                    break;
                case 'ArrowDown': // Handle fast drop
                    fastDrop(pile);
                    break;
                case ' ':
                    instantDrop(pile);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentPosition, currentPiece, gameOver, checkCollision, mergePieceToPile, pile]); // Dependencies remain the same

    const renderGrid = () => {
        const newGrid = pile.map((row) => [...row]);
        if (currentPiece) {
            for (let row = 0; row < currentPiece.piece.length; row++) {
                for (let col = 0; col < currentPiece.piece[row].length; col++) {
                    if (currentPiece.piece[row][col] !== null) {
                        const targetRow = currentPosition.row + row;
                        const targetCol = currentPosition.col + col;
                        if (targetRow < numRows && targetCol < numCols) {
                            newGrid[targetRow][targetCol] = currentPiece.type;
                        }
                    }
                }
            }
        }
        return newGrid;
    };

    const getCellClassName = (value, isShadow = false) => {
        if (isShadow) {
            return 'cell-shadow';
        } else if (value === null) {
            return 'cell-default';
        }
        switch (value) {
            case 'S': return 'cell-S';
            case 'I': return 'cell-I';
            case 'O': return 'cell-O';
            case 'T': return 'cell-T';
            case 'L': return 'cell-L';
            case 'J': return 'cell-J';
            case 'Z': return 'cell-Z';
            case 'M': return 'cell-malus';
            default: return 'cell-default';
        }
    };

    return (
        <div className="grid-container">
            <div className={`grid ${!isInteractable || gameOver ? 'grid-non-interactable' : ''}`}>
                {renderGrid().map((row, rowIndex) => (
                    <div key={rowIndex} className="grid-row">
                        {row.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                className={`grid-cell ${getCellClassName(cell)}`}
                            ></div>
                        ))}
                    </div>
                ))}
            </div>
            {gameOver && (
                <div className="game-over">
                    <h1>Game Over!</h1>
                    <p>Your score: {playerScore}</p>
                    {/* You can add more actions like restart or quit here */}
                </div>
            )}
        </div>
    );
};

export default Grid;
