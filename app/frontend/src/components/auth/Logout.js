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

import io from 'socket.io-client';
import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SessionContext } from './../../contexts/sessionContext'; 

import './../../css/auth.css';
import config from './../../configs/config';

// +--------------------- COMPONENT ----------------------+

const socket = io(config.api_url);

const Logout = () => {
    const { session, setSession } = useContext(SessionContext);
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            if (session.roomName) {
                socket.emit('leaveGame', { roomName: session.roomName, playerName: session.username });
            }

            try {
                await axios.post('/auth/logout');
                setSession(null);
                navigate('/login');
            } catch (error) {
                console.error('[LOGOUT] Failed:', error.response?.data?.message || error.message);
            }
        };

        handleLogout();
    }, [navigate, setSession, session.roomName, session.username]);

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
