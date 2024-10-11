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

import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';


import Home from './components/Home';
import Register from './components/auth/Register';
import Login from './components/auth/Login';


import CreateGame from './components/game/CreateGame';
import JoinGame from './components/game/JoinGame';

import './css/app.css';
import routeHooks from './hooks/routeHooks';

// +--------------------- APP ----------------------+

const App = () => {
    const [globalError, setGlobalError] = useState(null);

    return (
        <div>
            <div className="app-bg-wrapper">
                <div className="app-bg-image"></div>
            </div>
            <Container fluid>
                {globalError && <div className="error-message">{globalError}</div>} {/* Display error message here */}
                <Routes>
                    <Route path="/" element={<routeHooks.RedirectIfLoggedIn element={<Register />} />} />
                    <Route path="/register" element={<routeHooks.RedirectIfLoggedIn element={<Register />} />} />
                    <Route path="/login" element={<routeHooks.RedirectIfLoggedIn element={<Login />} />} />
                    <Route path="/logout" element={<routeHooks.LogoutRoute />} />

                    <Route path="/home" element={<routeHooks.ProtectedRoute element={<Home globalError={globalError} />} />} />

                    <Route path="/game/create" element={<routeHooks.ProtectedRoute element={<CreateGame />} />} />
                    <Route path="/game/join" element={<routeHooks.ProtectedRoute element={<JoinGame />} />} />
                    <Route path="/:room/:playerName" element={<routeHooks.ProtectedRoute element={<routeHooks.GameRoute setGlobalError={setGlobalError} />} />} />

                    <Route path="*" element={<routeHooks.NotFound/>} />
                </Routes>
            </Container>
        </div>
    );
};

// +------------------- EXPORTS --------------------+

export default App;
