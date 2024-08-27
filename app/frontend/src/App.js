// +------------------------------------------------+
// |             REDTETRIS FRONTEND APP             |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the main application component 
    for the RedTetris frontend. The component includes 
    routing logic to display different views based on 
    the current URL path.
*/

// +----------------- REQUIREMENTS -----------------+

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './components/HomeComponent';
import Register from './components/RegisterComponent';
import Login from './components/LoginComponent';
import Logout from './components/LogoutComponent';
import { SessionProvider } from './contexts/sessionContext';

// +--------------------- APP ----------------------+

const App = () => {
    return (
        <SessionProvider>
            <div className="container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                </Routes>
            </div>
        </SessionProvider>
    );
};

// +------------------- EXPORTS --------------------+

export default App;
