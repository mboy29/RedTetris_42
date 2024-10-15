import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './../../css/grid.css';
import Queue from './Queue';

const Grid = ({ socket, isSprintMode, isGameOver, isInteractable, room, playerName, playerScore, otherPlayer = null, otherGrid = null, otherScore = null, otherLost = null}) => {
    const numRows = 20;
    const numCols = 10;
    const initialDropInterval = 1000;
    const minDropInterval = 100;
    const dropAcceleration = 100;
    const sprintInterval = 20000;

    const [queue, setQueue] = useState([]);
    const [currentPiece, setCurrentPiece] = useState(null);
    const [shadowPosition, setShadowPosition] = useState({ x: 0, y: 0 });
    const [currentPosition, setCurrentPosition] = useState({ row: 0, col: 0 }); // Initial spawn position
    const [pile, setPile] = useState(Array(numRows).fill().map(() => Array(numCols).fill(null)));
    const [isGameLost, setIsGameLost] = useState(false);
    const [dropInterval, setDropInterval] = useState(initialDropInterval); 
    

    const calculateLevel = useCallback((interval) => {
        if (!isSprintMode) {
            return 1;
        }
        const level = Math.max(1, Math.floor((initialDropInterval - interval) / dropAcceleration) + 1);
        return level;
    }, [isSprintMode, initialDropInterval, dropAcceleration]);

    const [level, setLevel] = useState(calculateLevel(dropInterval));

    // Check for collision with the pile or grid bottom
    const checkCollision = useCallback((newPile, newRow, newCol, piece) => {
        if (!piece || !piece.piece) {
            return true;
        }
        if (newRow >= numRows) return true; // Bottom of grid
        for (let row = 0; row < piece.piece.length; row++) {
            for (let col = 0; col < piece.piece[row].length; col++) {
                if (piece.piece[row][col] !== null) {
                    const targetRow = newRow + row;
                    const targetCol = newCol + col;
                    console.log("targetRow", targetRow);
                    if (targetRow >= numRows || targetCol < 0 || targetCol >= numCols || targetRow < 0 || newPile[targetRow][targetCol] !== null) {
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
        if (piece.type === "I") {
            initialPosition.row = -1;
        }
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
            } else {
                socket.emit('updatedGame', { roomName: room, playerName, grid: newPile });
            }
            setIsGameLost(true);
            setCurrentPiece(null);
            socket.emit('lostGame', { roomName: room, playerName });
            return false;
        }
        return true;
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
            socket.emit('scoreGame', { roomName: room, playerName, lines: linesCleared, level: level });
        }
    
        let ret = true;
        if (!isGameLost && !isGameOver && queue.length > 0) {
            const nextPiece = queue[0];
            setQueue(queue.slice(1));
            ret = spawnNewPiece(pileAfterClear, nextPiece);
        }
        if (ret) {
            socket.emit('updatedGame', { roomName: room, playerName, grid: pileAfterClear });
        }
    }, [queue, level, spawnNewPiece, isGameOver, isGameLost, updatePile, pile, playerName, room, socket]);
    

    // Fetch pieces from the server on mount
    useEffect(() => {
        if (socket && isInteractable) {
            socket.on('gamePieces', (pieces) => {
                setQueue([...queue, ...pieces]);
                if (!currentPiece && !isGameLost && !isGameOver) {
                    spawnNewPiece(pile, pieces[0]);
                }
            });
            return () => {
                socket.off('gamePieces');
            };
        }
    }, [socket, isInteractable, spawnNewPiece, isGameOver, isGameLost, pile, queue, currentPiece]); // Added isGameLost to dependencies

    // Move the piece down every 'initialDropInterval'
    useEffect(() => {
        const dropPiece = () => {
            if (!currentPiece || isGameLost || isGameOver) return;

            const newRow = currentPosition.row + 1;
            const newCol = currentPosition.col;

            if (checkCollision(pile, newRow, newCol, currentPiece)) {
                mergePieceToPile(currentPosition);
            } else {
                setCurrentPosition({ row: newRow, col: newCol });
            }
        };

        const interval = setInterval(dropPiece, dropInterval);
        return () => clearInterval(interval);
    }, [currentPosition, currentPiece, isGameOver, isGameLost, dropInterval, checkCollision, mergePieceToPile, pile]);

    // Update shadow position of the piece
    useEffect(() => {
        if (!currentPiece) return;

        let newRow = currentPosition.row;
        let newCol = currentPosition.col;

        while (!checkCollision(pile, newRow + 1, newCol, currentPiece)) {
            newRow++;
        }
        setShadowPosition({ row: newRow, col: newCol });
    }, [currentPosition, currentPiece, pile, checkCollision]);

    // Handle keyboard input for piece movement
    useEffect(() => {
        let keyPressed = {}; // Track keys pressed down
        let animationFrameId;
    
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
            if (!currentPiece) return;
    
            if (currentPiece.type === 'I') {
                if (currentPosition.row === -1) {
                    currentPosition.row = 0;
                }
                if (currentPosition.col < 0) {
                    currentPosition.col = 0;
                }
                if (currentPosition.col >= numCols - 2) {
                    currentPosition.col = numCols - 3;
                }
                setCurrentPosition(currentPosition);
            }
    
            const rotatedPiece = {
                ...currentPiece,
                piece: currentPiece.piece[0].map((_, index) => currentPiece.piece.map(row => row[index])).reverse()
            };
    
            const rowOffset = currentPosition.row;
            const colOffset = currentPosition.col;
    
            const rotationOffsets = [
                { row: 0, col: 0 }, // No offset
                { row: 0, col: -1 }, // Left kick
                { row: 0, col: 1 }, // Right kick
                { row: -1, col: 0 }, // Upward kick
                { row: 1, col: 0 } // Downward kick
            ];
    
            for (let offset of rotationOffsets) {
                const newRow = rowOffset + offset.row;
                const newCol = colOffset + offset.col;
    
                if (!checkCollision(pile, newRow, newCol, rotatedPiece)) {
                    if (currentPiece.type === 'I' && (newCol < 0 || newCol >= numCols)) {
                        if (newCol < 0) {
                            setCurrentPosition({ row: newRow, col: colOffset + 1 });
                        } else if (newCol >= numCols) {
                            setCurrentPosition({ row: newRow, col: colOffset - 1 });
                        }
                    } else {
                        setCurrentPiece(rotatedPiece);
                        setCurrentPosition({ row: newRow, col: newCol });
                        return;
                    }
                }
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
            if (!currentPiece || keyPressed[event.key]) return;
            keyPressed[event.key] = true;
    
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
    
        const handleKeyUp = (event) => {
            keyPressed[event.key] = false;
        };
    
        const gameLoop = () => {
            // Add custom logic here if you want to implement additional
            // animations or behaviors in your game loop
    
            animationFrameId = requestAnimationFrame(gameLoop);
        };
    
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    
        animationFrameId = requestAnimationFrame(gameLoop);
    
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, [currentPosition, currentPiece, isGameOver, isGameLost, checkCollision, mergePieceToPile, pile]);
    
    // Handle scoring from other players
    useEffect(() => {
        socket.on('gameScored', ({ scoredPlayerGame, lines }) => {
            if (scoredPlayerGame !== playerName && lines > 0) {
                const newPile = [...pile]; // Create a shallow copy of the current pile
                for (let i = 0; i < lines; i++) {
                    newPile.push(Array(numCols).fill('M')); // Add new malus line
                }
                for (let i = 0; i < lines; i++) {
                    newPile.shift(); // Remove the top row
                }
                setPile(newPile);
                if (newPile[currentPosition.row + 1].some(cell => cell === 'M')) {
                    setCurrentPosition({ row: currentPosition.row - lines + 1, col: currentPosition.col });
                }
                socket.emit('updatedGame', { roomName: room, playerName, grid: newPile }); // Emit the updated grid
            }
        });
        return () => {
            socket.off('gameScored');
        };
    }, [socket, playerName, room, pile, numCols, currentPiece, currentPosition]);    

    useEffect(() => {
        if (!isGameOver) {
            if (queue.length <= 8) {
                socket.emit('triggerGame', { roomName: room });
            }
        }
    }, [isGameOver, queue, socket, room, playerName]);

    // Sprint mode logic: Speed up the drop interval every X seconds
    useEffect(() => {
        if (isSprintMode) {
            const sprintTimer = setInterval(() => {
                setDropInterval((prevInterval) => Math.max(minDropInterval, prevInterval - dropAcceleration));
            }, sprintInterval);

            return () => clearInterval(sprintTimer); // Clean up the sprint timer on unmount
        }
    }, [isSprintMode, dropInterval]);

    // Update level whenever the drop interval changes
    useEffect(() => {
        if (isSprintMode) {
            setLevel(calculateLevel(dropInterval));
        }
    }, [dropInterval, calculateLevel, isSprintMode]);

    const isShadowCell = (row, col) => {
        if (!currentPiece) return false; // No current piece, no shadow
    
        // Get the shadow's position
        const shadowRow = shadowPosition.row;
        const shadowCol = shadowPosition.col;
    
        // Check if the given row and column match the shadow position
        for (let r = 0; r < currentPiece.piece.length; r++) {
            for (let c = 0; c < currentPiece.piece[r].length; c++) {
                if (currentPiece.piece[r][c] !== null) {
                    const targetRow = shadowRow + r; // Calculate the target row based on the shadow
                    const targetCol = shadowCol + c; // Calculate the target column based on the shadow
    
                    if (row === targetRow && col === targetCol) {
                        return true; // This cell is part of the shadow
                    }
                }
            }
        }
    
        return false; // The cell is not part of the shadow
    };
    
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
                        if (targetRow >= 0 && targetRow < numRows && targetCol >= 0 && targetCol < numCols) {
                            newGrid[targetRow][targetCol] = currentPiece.type;
                        }
                    }
                }
            }
        }
        

        return newGrid;
    };

    const getCellClassName = (value, isShadow = false) => {
        if (isShadow && value === null) {
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
            case 'H': return 'cell-hidden';
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
                                className={`grid-cell ${getCellClassName(cell, isShadowCell(rowIndex, colIndex))}`}
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
                    {isSprintMode ? (
                        <Container className="mt-3">
                            <Row className="justify-content-center text-center">
                                <Col xs="auto">
                                    <div className="p-3"> {/* Padding around the div */}
                                        <h3 className="mb-0">Level {level}</h3> {/* Remove bottom margin */}
                                        <p className="mb-0">Score {playerScore}</p> {/* Remove bottom margin */}
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    ) : (
                        <h3 className="mt-3">Score {playerScore}</h3>
                    )}
                </div>
            )}
        </div>
    );
    
};

export default Grid;
