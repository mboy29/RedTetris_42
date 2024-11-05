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

import React, { createContext, useEffect, useState } from 'react';
import axios from './../configs/axiosConfig';

// +------------------- CONTEXT --------------------+

export const SessionContext = createContext(null);

const SessionProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await axios.get('/session/get');
                setSession(response.data.user);
            } catch (error) {
                console.log('Error fetching session:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, []);

    return (
        <SessionContext.Provider value={{ session, setSession, loading }}>
            {loading ? null : children}
        </SessionContext.Provider>
    );
};
// +------------------- EXPORTS --------------------+

export { SessionProvider };
