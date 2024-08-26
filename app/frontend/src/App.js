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
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';

// +--------------------- APP ----------------------+

const App = () => {
    return (
        <Router>
            <div className="container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                </Routes>
            </div>
        </Router>
    );
};

// +------------------- EXPORTS --------------------+

export default App;
