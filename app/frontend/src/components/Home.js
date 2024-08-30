// +------------------------------------------------+
// |           REDTETRIS SESSION CONTEXT            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `SessionContext` and 
    `SessionProvider` components for the RedTetris 
    frontend. The context provides the current user 
    session state to all components in the app.
*/

// +----------------- REQUIREMENTS -----------------+

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { SessionContext } from './../contexts/sessionContext';

// +------------------- COMPONENT -------------------+

const Home = () => {
    const { session } = useContext(SessionContext); 

    return (
        <div>
            {session ? (
                <div>
                    <h1>Welcome, {session.username}</h1>
                    <Link to="/logout" className="btn btn-primary">Logout</Link>
                </div>
            ) : (
                <div>
                    <h1>Red Tetris</h1>
                    <Link to="/login" className="btn btn-primary">Login</Link>
                    <Link to="/register" className="btn btn-primary">Register</Link>
                </div>
            )}
        </div>
    );
};

// +------------------- EXPORTS ---------------------+

export default Home;
