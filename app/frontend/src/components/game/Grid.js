// +------------------------------------------------+
// |            REDTETRIS GRID COMPONENT            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Grid` component for 
    the RedTetris frontend. The component provides
    a grid for rendering the game board.
*/

// +----------------- REQUIREMENTS -----------------+


import React from 'react';
import './../../css/grid.css'; 

// +------------------- COMPONENT -------------------+

const Grid = () => {
    const numRows = 20;
    const numCols = 10;

    const grid = Array(numRows)
        .fill()
        .map(() => Array(numCols).fill(0));

    return (
        <div className="grid">
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="grid-row">
                    {row.map((col, colIndex) => (
                        <div key={colIndex} className="grid-cell">
                            {/* This is where you can render your tetrominoes */}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

// +------------------------------------------------+

export default Grid;
