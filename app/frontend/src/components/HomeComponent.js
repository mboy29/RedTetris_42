// +------------------------------------------------+
// |            REDTETRIS HOME COMPONENT            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+
/*
    This module defines the `Home` component for the
    RedTetris frontend. The component provides a 
    landing page with links to the login and logout
    pages.
*/

// +----------------- REQUIREMENTS -----------------+

import React from 'react';
import { Link } from 'react-router-dom';
import { SessionContext } from '../contexts/sessionContext';
import { useContext } from 'react';

// +------------------- COMPONENT ------------------+

const Home = () => {
    const session = useContext(SessionContext);

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-4">
                <h2>Home</h2>
                {session && session.user ? (
                    <>
                        <p>Welcome, {session.user.username}!</p>
                        <Link to="/logout" className="btn btn-primary">Logout</Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-primary">Login</Link>
                        <Link to="/register" className="btn btn-secondary ml-2">Register</Link>
                    </>
                )}
            </div>
        </div>
    );
};

// +------------------- EXPORTS --------------------+
export default Home;
