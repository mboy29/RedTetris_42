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



import React, { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import Home from './components/Home';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Logout from './components/auth/Logout';


import CreateGame from './components/game/CreateGame';
import JoinGame from './components/game/JoinGame';
import Game from './components/game/Game';

import { SessionContext } from './contexts/sessionContext';

import './css/app.css';

// +------------------- COMPONENT ------------------+

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


// +--------------------- APP ----------------------+

const App = () => {
    return (
        <div>
            <div className="app-bg-wrapper">
                <div className="app-bg-image"></div>
            </div>
            <Container fluid>
                <Routes>
                    <Route path="/" element={<RedirectIfLoggedIn element={<Register />} />} />
                    <Route path="/register" element={<RedirectIfLoggedIn element={<Register />} />} />
                    <Route path="/login" element={<RedirectIfLoggedIn element={<Login />} />} />
                    <Route path="/logout" element={<LogoutRoute />} />

                    <Route path="/home" element={<ProtectedRoute element={<Home />} />} />

                    <Route path="/game/create" element={<ProtectedRoute element={<CreateGame />} />} />
                    <Route path="/game/join" element={<ProtectedRoute element={<JoinGame />} />} />
                    <Route path="/:room/:playerName" element={<ProtectedRoute element={<Game />} />} />

                </Routes>
            </Container>
        </div>
    );
};
// +------------------- EXPORTS --------------------+

export default App;
