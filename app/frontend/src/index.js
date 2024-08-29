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
import { SessionProvider } from './contexts/sessionContext';

// +------------------- FUNCTIONS ------------------+

ReactDOM.render(
    <BrowserRouter>
        <SessionProvider>
            <App />
        </SessionProvider>
    </BrowserRouter>,
    document.getElementById('root')
);
