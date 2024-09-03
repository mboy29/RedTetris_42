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

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';

import { SessionContext } from '../contexts/sessionContext';
import './../css/auth.css';

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
        <Container fluid className="auth-container">
            <div className="auth-logo-container">
                <div className="auth-logo"></div>
            </div>
            <div className="auth-form-container">
                <h2 className="text-center">Register</h2>
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
                    <Form.Group className="mb-4">
                        <Form.Control
                            type="password"
                            id="passwordConfirm"
                            value={passwordConfirm}
                            className="auth-form-control"
                            placeholder="Confirm Password"
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100 auth-btn">
                        Register
                    </Button>
                </Form>
                <p className="mt-3 text-center">
                    Already registered? <Link to="/login" className="auth-link">Login here</Link>
                </p>
            </div>
        </Container>
    );
};

// +------------------- EXPORTS --------------------+

export default Register;
