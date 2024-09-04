// +------------------------------------------------+
// |           REDTETRIS LOGOUT COMPONENT           |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Logout` component for 
    the RedTetris frontend. The component logs the 
    user out of the game and redirects them to the 
    login page.
*/

// +----------------- REQUIREMENTS -----------------+

import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SessionContext } from './../../contexts/sessionContext'; 

// +--------------------- COMPONENT ----------------------+

const Logout = () => {
    const { setSession } = useContext(SessionContext);
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try {
                await axios.post('/auth/logout'); // Change GET to POST
                setSession(null);
                navigate('/login');
            } catch (error) {
                console.error('[LOGOUT] Failed:', error.response?.data?.message || error.message);
            }
        };

        logout();
    }, [navigate, setSession]);

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-4">
                <h2>Logging out...</h2>
            </div>
        </div>
    );
};

// +------------------- EXPORTS --------------------+

export default Logout;
