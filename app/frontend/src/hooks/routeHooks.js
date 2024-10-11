// +------------------------------------------------+
// |           REDTETRIS APP ROUTE HOOKS            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines custom route hooks for the 
    RedTetris frontend. The hooks are used to protect 
    routes that require authentication, redirect users 
    if they are already logged in, and handle game 
    access.
*/

// +----------------- REQUIREMENTS -----------------+

import React, { useEffect, useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';

import Game from './../components/game/Game';
import Logout from './../components/auth/Logout';
import { SessionContext } from './../contexts/sessionContext';

import config from './../configs/config';

// +-------------------- HOOKS ---------------------+

const NotFound = () => {
    const navigate = useNavigate();
    const { session } = useContext(SessionContext);

    React.useEffect(() => {
        
        const isAuthenticated = session;
        if (isAuthenticated) {
            navigate('/home');
        } else {
            navigate('/login');
        }
    }, [session, navigate]);
    return null;
};

const ProtectedRoute = ({ element }) => {
    const { session } = useContext(SessionContext);
    return session ? element : <Navigate to="/login" />;
};

const RedirectIfLoggedIn = ({ element }) => {
    const { session } = useContext(SessionContext);
    return session ? <Navigate to="/home" /> : element;
};

const LogoutRoute = () => {
    const { session } = useContext(SessionContext);
    if (!session) {
        return <Navigate to="/login" />;
    }
    return <Logout />;
};

const GameRoute = ({ setGlobalError }) => {
    const { room, playerName } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const accessGame = async () => {
            try {
                const response = await fetch(`${config.api_url}/game/check?room=${room}&playerName=${playerName}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Access denied or game not found');
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || 'Access denied or game not found');
                }

                setLoading(false);
            } catch (err) {
                console.error('[GAME]', err);
                setGlobalError(err.message);
                navigate('/home');
            }
        };

        accessGame();
    }, [room, playerName, navigate, setGlobalError]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return <Game />;
};

// +------------------- EXPORTS --------------------+

export default {
    NotFound,
    ProtectedRoute,
    RedirectIfLoggedIn,
    LogoutRoute,
    GameRoute,
};