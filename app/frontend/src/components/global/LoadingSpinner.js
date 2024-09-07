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

import React from 'react';
import Spinner from 'react-bootstrap/Spinner';
// import 'bootstrap/dist/css/bootstrap.min.css'; 

// +------------------- COMPONENT ------------------+

const LoadingSpinner = () => {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    );
};

// +------------------- EXPORTS --------------------+

export default LoadingSpinner;