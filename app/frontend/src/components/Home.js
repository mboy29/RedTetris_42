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
    const { session } = useContext(SessionContext);

    if (!session) {
        return <Navigate to="/login" />;
    }
    return (
        <div className="home-container">
            <NavBar />
        </div>
    );
};

// +------------------- EXPORTS ---------------------+

export default Home;
