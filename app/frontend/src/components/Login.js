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

import axios from 'axios';
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

import { SessionContext } from '../contexts/sessionContext';
import './../css/auth.css';

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
        <Container fluid className="auth-container">
            <div className="auth-logo-container">
                <div className="auth-logo"></div>
            </div>
            <div className="auth-form-container">
                <h2 className="text-center">Login</h2>
                {errors.length > 0 && (
                    <Alert variant="danger">
                        {errors.map((error, index) => (
                            <p key={index} className="text-center">{error}</p>
                        ))}
                    </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            id="username"
                            value={username}
                            className="auth-form-control"
                            placeholder="Username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="password"
                            id="password"
                            value={password}
                            className="auth-form-control"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100 auth-btn">
                        Login
                    </Button>
                </Form>
                <p className="mt-3 text-center">
                    Don't have an account? <Link to="/register" className="auth-link">Register here</Link>.
                </p>
            </div>
        </Container>
    );
};


// +------------------- EXPORTS --------------------+

export default Login;
