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

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from './../configs/axiosConfig';

// +--------------------- APP ----------------------+
const Logout = () => {
    const navigate = useNavigate(); // Updated hook

    useEffect(() => {
    const logout = async () => {
        try {
        await axios.get('/auth/logout');
        navigate('/');
        } catch (err) {
        console.error(err);
        }
    };

    logout();
    }, [navigate]);

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
