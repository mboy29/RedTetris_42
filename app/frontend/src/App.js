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
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import { SessionContext } from './contexts/sessionContext';

import 'bootstrap/dist/css/bootstrap.min.css';
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

// +--------------------- APP ----------------------+

const App = () => {
    return (
        <div>
            {/* Background Image Wrapper */}
            <div className="app-bg-wrapper">
                <div className="app-bg-image"></div>
            </div>

            {/* Main Content */}
            <Container fluid>
                <Routes>
                    <Route path="/" element={<RedirectIfLoggedIn element={<Register />} />} />
                    <Route path="/register" element={<RedirectIfLoggedIn element={<Register />} />} />
                    <Route path="/login" element={<RedirectIfLoggedIn element={<Login />} />} />
                    <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
                    <Route path="/logout" element={<Logout />} />
                </Routes>
            </Container>
        </div>
    );
};
// +------------------- EXPORTS --------------------+

export default App;
