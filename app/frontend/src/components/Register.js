// +------------------------------------------------+
// |          REDTETRIS REGISTER COMPONENT          |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Register` component for 
    the RedTetris frontend. The component allows users 
    to register for the game.
*/

// +----------------- REQUIREMENTS -----------------+

import axios from 'axios';
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { SessionContext } from '../contexts/sessionContext'; 

// +------------------- COMPONENT -------------------+


const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [errors, setErrors] = useState([]);
    const { setSession } = useContext(SessionContext); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        if (username.trim() === '' || password.trim() === '' || passwordConfirm.trim() === '') {
            setErrors(['All fields are required.']);
            return;
        }

        if (password !== passwordConfirm) {
            setErrors(['Passwords do not match.']);
            return;
        }

        try {
            const response = await axios.post('/auth/register', { username, password, passwordConfirm });
            setSession(response.data.user);
            navigate('/home');
        } catch (error) {
            console.error('[REGISTER] Failed:', error.response?.data?.message || error.message);
            setErrors([error.response?.data?.message || 'Registration failed.']);
        }
    };

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-4">
                <h2>REGISTER</h2>
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
                    <div className="form-group">
                        <label htmlFor="passwordConfirm">Confirm Password</label>
                        <input
                            type="password"
                            id="passwordConfirm"
                            className="form-control"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Register</button>
                </form>
                <p className="mt-3">
                    Already registered? <Link to="/login">Login here</Link>.
                </p>
            </div>
        </div>
    );
};


// +------------------- EXPORTS --------------------+

export default Register;
