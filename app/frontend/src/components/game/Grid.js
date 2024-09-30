import React, { useState, useEffect, useCallback } from 'react';
import './../../css/grid.css';
import Queue from './Queue';

const Grid = ({ socket, isGameOver, isInteractable, room, playerName, playerScore, otherPlayer = null, otherGrid = null, otherScore = null, otherLost = null}) => {
    const numRows = 20;
    const numCols = 10;
    const dropInterval = 1000; // 1 second drop interval

    const [queue, setQueue] = useState([]);
    const [currentPiece, setCurrentPiece] = useState(null);
    const [currentPosition, setCurrentPosition] = useState({ row: 0, col: 3 }); // Initial spawn position
    const [pile, setPile] = useState(Array(numRows).fill().map(() => Array(numCols).fill(null)));
   
    const [isGameLost, setIsGameLost] = useState(false);

    // Check for collision with the pile or grid bottom
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

    const updatePile = useCallback((pile, position, piece = null) => {
        if (!piece) {
            piece = currentPiece;
        }
        const newPile = pile.map((row) => [...row]); // Clone pile
        for (let row = 0; row < piece.piece.length; row++) {
            for (let col = 0; col < piece.piece[row].length; col++) {
                if (piece.piece[row][col] !== null) {
                    const targetRow = position.row + row;
                    const targetCol = position.col + col;
                    newPile[targetRow][targetCol] = piece.type;
                }
            }
        }
        return newPile;
    }, [currentPiece]);

    const spawnNewPiece = useCallback((newPile, piece) => {
        if (isGameLost || isGameOver) {
            return;
        }
        setCurrentPiece(piece);
        const initialPosition = { row: 0, col: Math.floor(numCols / 2) - Math.floor(piece.piece[0].length / 2) };
        setCurrentPosition(initialPosition);
        if (checkCollision(newPile, 0, Math.floor(numCols / 2) - Math.floor(piece.piece[0].length / 2), piece)) {
            let lastLine = 0;
            for (let i = piece.piece.length - 1; i >= 0; i--) {
                if (piece.piece[i].some(cell => cell !== null)) {
                    lastLine = piece.piece[i];
                    break;
                }
            }

            const lastPiece = {
                piece: [lastLine],
                type: piece.type
            };
            if (!checkCollision(newPile, 0, Math.floor(numCols / 2) - Math.floor(lastPiece.piece[0].length / 2), lastPiece)) {
                const finalPile = updatePile(newPile, initialPosition, lastPiece);
                setPile(finalPile);
                socket.emit('updatedGame', { roomName: room, playerName, grid: finalPile });
            }
            setIsGameLost(true);
            setCurrentPiece(null);
            socket.emit('lostGame', { roomName: room, playerName });
        }
    }, [socket, isGameOver, isGameLost, numCols, checkCollision, updatePile, playerName, room]);

    // Function to merge current piece into the pile when it can no longer move
    const mergePieceToPile = useCallback((position) => {
        const newPile = updatePile(pile, position);
        
        const clearFullRows = (pile) => {
            const fullRows = [];
            const updatedPile = pile.filter((row, rowIndex) => {
                const isFull = row.every(cell => cell !== null && cell !== 'M'); // Check for full rows excluding malus lines
                if (isFull) fullRows.push(rowIndex);
                return !isFull; // Keep only non-full rows
            });
            return { updatedPile, fullRows };
        };
    
        const { updatedPile: pileAfterClear, fullRows } = clearFullRows(newPile);
        
        // Add empty rows for each cleared line at the top (not including malus lines)
        for (let i = 0; i < fullRows.length; i++) {
            pileAfterClear.unshift(Array(numCols).fill(null));
        }
    
        setPile(pileAfterClear);
        setCurrentPiece(null);
    
        const linesCleared = fullRows.length;
        if (linesCleared > 0) {
            socket.emit('scoreGame', { roomName: room, playerName, lines: linesCleared });
        }
    
        if (!isGameLost && !isGameOver && queue.length > 0) {
            const nextPiece = queue[0];
            setQueue(queue.slice(1));
            spawnNewPiece(pileAfterClear, nextPiece);
        }
    
        socket.emit('updatedGame', { roomName: room, playerName, grid: pileAfterClear });
    }, [queue, spawnNewPiece, isGameOver, isGameLost, updatePile, pile, playerName, room, socket]);
    

    // Fetch pieces from the server on mount
    useEffect(() => {
        if (socket && isInteractable) {
            socket.on('gamePieces', (pieces) => {
                setQueue(pieces);  // Assuming 'pieces' is an array of piece objects
                if (!isGameLost && !isGameOver) {
                    spawnNewPiece(pile, pieces[0]); // Spawn the first piece on receiving pieces only if game is not over
                }
            });
            return () => {
                socket.off('gamePieces');
            };
        }
    }, [socket, isInteractable, spawnNewPiece, isGameOver, isGameLost, pile]); // Added isGameLost to dependencies

    // Move the piece down every 'dropInterval'
    useEffect(() => {
        const dropPiece = () => {
            if (!currentPiece || isGameLost || isGameOver) return; // No piece to move or game over

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
    }, [currentPosition, currentPiece, isGameOver, isGameLost, dropInterval, checkCollision, mergePieceToPile, pile]); // Dropping logic depends on position and piece

    // Handle keyboard input for piece movement
    useEffect(() => {
        const moveLeft = (pile) => {
            if (!isGameLost && !isGameOver && !checkCollision(pile, currentPosition.row, currentPosition.col - 1, currentPiece)) {
                setCurrentPosition((pos) => ({ ...pos, col: pos.col - 1 }));
            }
        };

        const moveRight = (pile) => {
            if (!isGameLost && !isGameOver  && !checkCollision(pile, currentPosition.row, currentPosition.col + 1, currentPiece)) {
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
            if (!isGameLost && !isGameOver  && !checkCollision(pile, currentPosition.row, currentPosition.col, rotatedPiece)) {
                setCurrentPiece(rotatedPiece);
            }
        };

        const fastDrop = (pile) => {
            if (isGameLost || isGameOver) return; // Do nothing if the game is over

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
            if (isGameLost || isGameOver) return; // Do nothing if the game is over
            
            let newRow = currentPosition.row;
    
            while (!checkCollision(pile, newRow + 1, currentPosition.col, currentPiece)) {
                newRow++;
            }
            setCurrentPosition({ row: newRow, col: currentPosition.col });
            mergePieceToPile({ row: newRow, col: currentPosition.col }); // Pass final position
        };

        const handleKeyDown = (event) => {
            if (!currentPiece) return;
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
    }, [currentPosition, currentPiece, isGameOver, isGameLost, checkCollision, mergePieceToPile, pile]); // Dependencies remain the same

    // Handle scoring from other players
    useEffect(() => {
        socket.on('gameScored', ({ scoredPlayerGame, lines }) => {
            if (scoredPlayerGame !== playerName && lines > 1) {
                const newPile = [...pile]; // Create a shallow copy of the current pile
                for (let i = 0; i < lines; i++) {
                    newPile.push(Array(numCols).fill('M')); // Add new malus line
                }
                for (let i = 0; i < lines; i++) {
                    newPile.shift(); // Remove the top row
                }
                setPile(newPile);
                socket.emit('updatedGame', { roomName: room, playerName, grid: newPile }); // Emit the updated grid
            }
        });
        return () => {
            socket.off('gameScored');
        };
    }, [socket, playerName, room, pile, numCols]);    

    const renderGrid = () => {
        if (otherPlayer && otherGrid) {
            const newPile = otherGrid.map((row) => [...row]);
            return newPile;
        }
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
            <div className={`grid ${!isInteractable || isGameLost || isGameOver || otherLost ? 'grid-non-interactable' : ''} ${otherPlayer ? 'grid-other' : ''}`}>
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
                {isGameLost && (
                    <div className="grid-lost">
                        <h3 className='text-center'>You've been eliminated!</h3>
                    </div>
                )}
                {otherLost && (
                    <div className="grid-lost">
                        <h4 className='text-center'>Eliminated</h4>
                    </div>
                )}
            </div>
            {isInteractable && (
                <div className="queue-and-score d-flex flex-column align-items-center">
                    <Queue pieceQueue={queue} getCellClassName={getCellClassName} isGameLost={isGameLost} isGameOver={isGameOver}s/>
                    <h3 className="mt-3">Score {playerScore}</h3>
                </div>
            )}
        </div>
    );
    
};

export default Grid;
