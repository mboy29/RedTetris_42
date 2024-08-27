// +------------------------------------------------+
// |            REDTETRIS INDEX.JS FILE             |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module is the entry point for the RedTetris
    frontend application. 
*/

// +----------------- REQUIREMENTS -----------------+

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// +------------------- FUNCTIONS ------------------+

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('root')
);
