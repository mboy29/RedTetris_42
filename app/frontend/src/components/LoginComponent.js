// +------------------------------------------------+
// |           REDTETRIS LOGIN COMPONENT            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Login` component for the 
    RedTetris frontend. The component provides a login 
    form for users to enter their username and 
    password.
*/

// +----------------- REQUIREMENTS -----------------+

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SessionContext } from '../contexts/sessionContext'; // Adjust path as needed

// +------------------- COMPONENT -------------------+

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState([]);
    const { setSession } = useContext(SessionContext); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        if (username.trim() === '' || password.trim() === '') {
            setErrors(['Username and password are required.']);
            return;
        }

        try {
            const response = await axios.post('/auth/login', { username, password });
            setSession(response.data.user);
            navigate('/home');
        } catch (error) {
            console.error('[LOGIN] Failed:', error.response?.data?.message || error.message);
            setErrors([error.response?.data?.message || 'Login failed.']);
        }
    };

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-4">
                <h2>LOGIN</h2>
                {errors.length > 0 && (
                    <div className="alert alert-danger">
                        <ul>
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
            </div>
        </div>
    );
};

// +------------------- EXPORTS --------------------+

export default Login;
