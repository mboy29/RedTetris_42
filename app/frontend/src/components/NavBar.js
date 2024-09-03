// +------------------------------------------------+
// |                REDTETRIS NAVBAR                |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `NavBar` component for 
    the RedTetris frontend. The component provides a 
    navigation bar that includes the RedTetris logo, 
    a welcome message, and a logout option.
*/

// +----------------- REQUIREMENTS -----------------+

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { SessionContext } from './../contexts/sessionContext';
import './../css/navbar.css';

// +------------------- COMPONENT -------------------+

const NavBar = () => {
    const { session } = useContext(SessionContext);

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="auth-logo"></div>
                {session && (
                    <span className="welcome-message">Welcome, {session.username}</span>
                )}
            </div>
            {session && (
                <div className="navbar-right">
                    <Link to="/logout" className="logout-icon">
                        <img src="./../assets/icons/iconLogout.svg" alt="Logout" />
                    </Link>
                </div>
            )}
        </nav>
    );
};

// +------------------- EXPORTS ---------------------+

export default NavBar;
