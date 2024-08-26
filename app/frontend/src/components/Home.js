// +------------------------------------------------+
// |            REDTETRIS HOME COMPONENT            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+
/*
    This module defines the `Home` component for the RedTetris
    frontend. The component provides a landing page with links
    to the login and logout pages.
*/
// +----------------- REQUIREMENTS -----------------+

import React from 'react';
import { Link } from 'react-router-dom';

// +--------------------- APP ----------------------+

const Home = () => {
    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-4">
                <h2>Home</h2>
                <Link to="/login" className="btn btn-primary">Login</Link>
            </div>
        </div>
    );
};

// +------------------- EXPORTS --------------------+
export default Home;
