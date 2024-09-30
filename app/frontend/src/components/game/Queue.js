// +------------------------------------------------+
// |         REDTETRIS QUEUE GAME COMPONENT         |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    Queue component is a React component that displays
    the next 4 pieces that will be played in the game.

    It is used in the Game component to display the
    upcoming pieces in the game.
*/

// +----------------- REQUIREMENTS -----------------+

import React from 'react';
import './../../css/queue.css';

// +------------------- COMPONENT -------------------+

const Queue = ({ pieceQueue, getCellClassName }) => {

    function cleanPiece(piece) {
        piece = piece.filter(row => row.some(cell => cell !== null));
        const transposed = piece[0].map((_, colIndex) => piece.map(row => row[colIndex]));
        const cleanedTransposed = transposed.filter(col => col.some(cell => cell !== null));
        const cleaned = cleanedTransposed[0].map((_, colIndex) => cleanedTransposed.map(row => row[colIndex]));
        return cleaned;
    }
    
    return (
        <div className="queue-container">
            {pieceQueue.slice(0, 4).map((pieceObj, index) => {
                const cleanedPiece = cleanPiece(pieceObj.piece);
                return (
                    <div key={index} className="queue-piece">
                        {cleanedPiece.map((row, rowIndex) => (
                            <div key={rowIndex} className="queue-row">
                                {row.map((cell, colIndex) => (
                                    <div
                                        key={colIndex}
                                        className={`queue-cell ${cell ? getCellClassName(pieceObj.type) : 'cell-default'}`}
                                    ></div>
                                ))}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

// +------------------- EXPORT ---------------------+

export default Queue;