// +------------------------------------------------+
// |           REDTETRIS HOME COMPONENT             |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Home` component for the 
    RedTetris frontend. It displays a welcome message 
    or login/register options depending on the session state.
*/

// +----------------- REQUIREMENTS -----------------+

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { SessionContext } from '../contexts/sessionContext';

import NavBar from './NavBar'; 

// +------------------- COMPONENT -------------------+

const Home = () => {
    // if no session redirect to login
    // if session redirect to game
    const { session } = useContext(SessionContext);

    if (!session) {
        return <Navigate to="/login" />;
    }
    return (
        <div className="home-container">
            <NavBar />  {/* Include the NavBar component */}
        </div>
    );
};

// +------------------- EXPORTS ---------------------+

export default Home;
