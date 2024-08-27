// +------------------------------------------------+
// |            SESSION CONTEXT COMPONENT           |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines a React context for managing 
    the user session in the RedTetris frontend 
    application.

    The context provides a `SessionProvider` component
    to wrap the application and a `useSession` hook to
    access the current session data.
*/

// +----------------- REQUIREMENTS -----------------+ 

import React, { createContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../configs/axiosConfig';

// +------------------- COMPONENT ------------------+

export const SessionContext = createContext();

const useSession = () => {
    const [session, setSession] = useState({ user: null });
    const location = useLocation(); 

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const { data } = await axios.get('/session', { withCredentials: true });
                setSession(data);
            } catch (err) {
                console.error('Error fetching session:', err);
            }
        };

        fetchSession();
    }, [location]);
    return session;
};


export const SessionProvider = ({ children }) => {
    const session = useSession();

    return (
        <SessionContext.Provider value={session}>
            {children}
        </SessionContext.Provider>
    );
};
