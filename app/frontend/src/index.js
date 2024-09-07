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
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { SessionProvider } from './contexts/sessionContext';
import './css/global.css';

// +------------------- FUNCTIONS ------------------+

ReactDOM.render(
    <BrowserRouter>
        <SessionProvider>
            <App />
        </SessionProvider>
    </BrowserRouter>,
    document.getElementById('root')
);
