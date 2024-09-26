// +------------------------------------------------+
// |          REDTETRIS GRID GAME COMPONENT         |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+
/*
    This module defines the `Grid` component for the
    RedTetris frontend. It displays the game grid and
    handles the logic for the game pieces :
    - Moving horizontally
    - Rotating
    - Dropping to the bottom
    - Fast dropping
    - Merging piece to pile
    - Updating grid with piece and pile
    - Handling game pieces from the server
    - Handling key events
    - Handling shadow cells
    - Displaying the next 4 pieces in the queue
*/

// +----------------- REQUIREMENTS -----------------+

import React, { useEffect, useState, useCallback } from 'react';
import Queue from './Queue';

import './../../css/grid.css';

// +------------------- COMPONENT -------------------+

const Grid = ({ socket, isInteractable, room, playerName, otherPlayer = null, otherGrid = null}) => {
    const numRows = 20;
    const numCols = 10;
    const [grid, setGrid] = useState(Array(numRows).fill().map(() => Array(numCols).fill(null)));
    const [currentPiece, setCurrentPiece] = useState(null);
    const [piecePosition, setPiecePosition] = useState({ x: 0, y: 0 });
    const [pile, setPile] = useState(Array(numRows).fill().map(() => Array(numCols).fill(null)));
    const [isGameOver, setIsGameOver] = useState(false);
    const [isFastDropping, setIsFastDropping] = useState(false);
    const [pieceQueue, setPieceQueue] = useState([]); // Updated for queue system
    const [shadowPosition, setShadowPosition] = useState({ x: 0, y: 0 });

    // Check if a piece can be placed at a given position
    const canPlacePiece = useCallback((piece, posX, posY) => {
        for (let row = 0; row < piece.length; row++) {
            for (let col = 0; col < piece[row].length; col++) {
                if (piece[row][col]) {
                    const newRow = posX + row;
                    const newCol = posY + col;
                    if (
                        newRow >= numRows ||
                        newCol < 0 ||
                        newCol >= numCols ||
                        (newRow >= 0 && pile[newRow][newCol])
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    }, [numRows, numCols, pile]);

    // Merge the current piece to the pile
    const mergePieceToPile = useCallback((piece, posX, posY) => {
        const newPile = pile.map(row => [...row]);
        let linesCleared = 0;
    
        for (let row = 0; row < piece.length; row++) {
            for (let col = 0; col < piece[row].length; col++) {
                if (piece[row][col]) {
                    newPile[posX + row][posY + col] = currentPiece.type;
                }
            }
        }
        for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
            if (newPile[rowIndex].every(cell => cell) && !newPile[rowIndex].includes('M')) {
                linesCleared++;
                newPile.splice(rowIndex, 1);
                newPile.unshift(Array(numCols).fill(null)); // Add a new empty row at the top
            }
        }
    
        if (linesCleared > 0) {
            socket.emit('scoreGame', { roomName: room, playerName: playerName, lines: linesCleared });
        }
        setPile(newPile);
        socket.emit('updatedGame', { roomName: room, playerName: playerName, grid: newPile });
    }, [pile, currentPiece, room, socket, playerName]);
    

    // Update the grid to reflect the current piece and pile state
    const updateGridWithPieceAndPile = useCallback((piece, posX, posY) => {
        const newGrid = Array(numRows).fill().map(() => Array(numCols).fill(null));
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                newGrid[row][col] = pile[row][col];
            }
        }
        for (let row = 0; row < piece.length; row++) {
            for (let col = 0; col < piece[row].length; col++) {
                if (piece[row][col]) {
                    newGrid[posX + row][posY + col] = currentPiece.type;
                }
            }
        }
        setGrid(newGrid);
    }, [numRows, numCols, pile, currentPiece]);

    // Rotate the current piece
    const rotatePiece = useCallback(() => {
        if (!currentPiece) return;
        const rotatedPiece = currentPiece.piece[0].map((_, index) =>
            currentPiece.piece.map(row => row[index]).reverse()
        );
        if (canPlacePiece(rotatedPiece, piecePosition.x, piecePosition.y)) {
            setCurrentPiece({ ...currentPiece, piece: rotatedPiece });
        }
    }, [currentPiece, piecePosition, canPlacePiece]);

    // Drop the current piece to the bottom of the grid
    const dropPieceToBottom = useCallback(() => {
        if (!currentPiece) return;
        let dropX = piecePosition.x;
        while (canPlacePiece(currentPiece.piece, dropX + 1, piecePosition.y)) {
            dropX += 1;
        }
        setPiecePosition({ x: dropX, y: piecePosition.y });
        mergePieceToPile(currentPiece.piece, dropX, piecePosition.y);

        const [nextPiece, ...remainingQueue] = pieceQueue;
        setPieceQueue(remainingQueue);

        if (nextPiece) {
            setCurrentPiece(nextPiece);
            setPiecePosition({
                x: 0,
                y: Math.floor(numCols / 2) - Math.floor(nextPiece.piece[0].length / 2)
            });
        } else {
            setCurrentPiece(null);
        }
    }, [currentPiece, piecePosition, pieceQueue, mergePieceToPile, canPlacePiece, numCols]);
    
    // Move the current piece horizontally
    const movePieceHorizontally = useCallback((direction) => {
        if (!currentPiece) return;
        const newY = piecePosition.y + direction;
        if (canPlacePiece(currentPiece.piece, piecePosition.x, newY)) {
            setPiecePosition(prevPosition => ({
                ...prevPosition,
                y: newY,
            }));
        }
    }, [currentPiece, piecePosition, canPlacePiece]);

    // Automatically drop the piece down or merge it to the pile if it can't move further
    // Automatically drop the piece down or merge it to the pile if it can't move further
    useEffect(() => {
        if (!currentPiece) return;
        const interval = setInterval(() => {
            if (canPlacePiece(currentPiece.piece, piecePosition.x + 1, piecePosition.y)) {
                setPiecePosition(prevPosition => ({
                    x: prevPosition.x + 1,
                    y: prevPosition.y,
                }));
            } else {
                mergePieceToPile(currentPiece.piece, piecePosition.x, piecePosition.y);
                const [nextPiece, ...remainingQueue] = pieceQueue;
                setPieceQueue(remainingQueue);

                if (nextPiece) {
                    setCurrentPiece(nextPiece);
                    setPiecePosition({
                        x: 0,
                        y: Math.floor(numCols / 2) - Math.floor(nextPiece.piece[0].length / 2)
                    });
                } else {
                    setCurrentPiece(null);
                }
            }
        }, isFastDropping ? 100 : 1000);
        return () => clearInterval(interval);
    }, [currentPiece, piecePosition, isFastDropping, pieceQueue, canPlacePiece, mergePieceToPile, numCols]);
    
    useEffect(() => {
        if (currentPiece) {
            updateGridWithPieceAndPile(currentPiece.piece, piecePosition.x, piecePosition.y);
        }
    }, [currentPiece, piecePosition, pile, updateGridWithPieceAndPile]);

    useEffect(() => {
        if (socket && isInteractable) {
            socket.on('gamePieces', (pieces) => {
                if (pieces.length) {
                    setPieceQueue(prevQueue => [...prevQueue, ...pieces]);
                    if (!currentPiece) {
                        const [firstPiece, ...remainingQueue] = pieces;
                        setPieceQueue(remainingQueue);
                        setCurrentPiece(firstPiece);
                        setPiecePosition({
                            x: 0,
                            y: Math.floor(numCols / 2) - Math.floor(firstPiece.piece[0].length / 2)
                        });
                    }
                }
            });
            return () => {
                socket.off('gamePieces');
            };
        }
    }, [socket, numCols, currentPiece, isInteractable]);

    // Handle keyboard input for piece movement
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!currentPiece || isGameOver) return; // Disable controls if game is over
            switch (event.key) {
                case 'ArrowLeft':
                    movePieceHorizontally(-1);
                    break;
                case 'ArrowRight':
                    movePieceHorizontally(1);
                    break;
                case 'ArrowUp':
                    rotatePiece();
                    break;
                case 'ArrowDown':
                    setIsFastDropping(true);
                    break;
                case ' ':
                    dropPieceToBottom();
                    break;
                default:
                    break;
            }
        };
    
        const handleKeyUp = (event) => {
            if (event.key === 'ArrowDown') {
                setIsFastDropping(false);
            }
        };
    
        if (!isGameOver) {
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [currentPiece, piecePosition, movePieceHorizontally, rotatePiece, dropPieceToBottom, isGameOver]);
    
    // Update shadow position of the piece
    useEffect(() => {
        if (!currentPiece) return;
        let dropY = piecePosition.y;
        let dropX = piecePosition.x;

        while (canPlacePiece(currentPiece.piece, dropX + 1, dropY)) {
            dropX += 1;
        }

        setShadowPosition({ x: dropX, y: dropY });
    }, [currentPiece, piecePosition, canPlacePiece]);


    // Merge the other player's grid with the current player's grid
    useEffect(() => {
        if (otherPlayer && otherPlayer !== playerName && otherGrid) {
            setGrid(prevGrid => {
                const newGrid = prevGrid.map((row, rowIndex) => {
                    return row.map((cell, colIndex) => {
                        return otherGrid[rowIndex][colIndex] || cell;
                    });
                });
                return newGrid;
            });
        }
    }, [otherPlayer, otherGrid, playerName]);

    useEffect(() => {
        socket.on('gameScored', ({ scoredPlayerGame, lines }) => {
            if (scoredPlayerGame !== playerName) {
                setPile(prevPile => {
                    let newPile = [...prevPile];
    
                    for (let i = 0; i < lines; i++) {
                        newPile.shift();
                        newPile.push(Array(numCols).fill('M'));
                    }
    
                    const newGrid = Array(numRows).fill().map(() => Array(numCols).fill(null));
                    for (let row = 0; row < numRows; row++) {
                        for (let col = 0; col < numCols; col++) {
                            newGrid[row][col] = newPile[row][col];
                        }
                    }
                    if (currentPiece) {
                        const { piece, type } = currentPiece;
                        for (let row = 0; row < piece.length; row++) {
                            for (let col = 0; col < piece[row].length; col++) {
                                if (piece[row][col]) {
                                    newGrid[piecePosition.x + row][piecePosition.y + col] = type;
                                }
                            }
                        }
                    }
                    socket.emit('updatedGame', { roomName: room, playerName: playerName, grid: newGrid });
                    return newPile;
                });
            }
        });
        return () => {
            socket.off('gameScored');
        };
    }, [socket, playerName, numCols, currentPiece, piecePosition, room, numRows]);

       


    const getCellClassName = (value, isShadow = false) => {
        if (isShadow) {
            return 'cell-shadow';
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

    const isShadowCell = (rowIndex, colIndex) => {
        if (!currentPiece) return false;
        const piece = currentPiece.piece;
        const shadowX = shadowPosition.x;
        const shadowY = shadowPosition.y;

        if (piece[rowIndex - piecePosition.x]?.[colIndex - piecePosition.y]) {
            return false;
        }
        return piece[rowIndex - shadowX]?.[colIndex - shadowY] ? true : false;
    };

    return (
        <div className="grid-container">
            <div className={`grid ${!isInteractable ? 'grid-non-interactable' : ''}`}>
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid-row">
                        {row.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                className={`grid-cell ${getCellClassName(cell)} ${
                                    isShadowCell(rowIndex, colIndex) ? getCellClassName(currentPiece?.type, true) : ''
                                }`}
                            ></div>
                        ))}
                    </div>
                ))}
            </div>
    
            {isInteractable && (
                <Queue pieceQueue={pieceQueue} getCellClassName={getCellClassName} />
            )}
        </div>
    );
};

// +------------------- EXPORTS ---------------------+

export default Grid;
