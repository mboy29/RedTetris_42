// +------------------------------------------------+
// |          REDTETRIS REGISTER COMPONENT          |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Register` component for the RedTetris
    frontend. The component allows users to register for the game.
*/

// +----------------- REQUIREMENTS -----------------+

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import config from '../configs/config';

// +------------------- COMPONENT -------------------+

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [errors, setErrors] = useState([]);
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const socketConnection = io(config.api_url, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            secure: true,
        });

        setSocket(socketConnection);

        return () => {
            if (socketConnection) {
                socketConnection.off('register_success');
                socketConnection.off('register_error');
                socketConnection.disconnect();
            }
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors([]);

        if (socket) {
            socket.emit('register', { username, password, passwordConfirm });

            socket.on('register_success', () => {
                console.log('[REGISTER] Successful');
                navigate('/home');
            });

            socket.on('register_error', (errorMessages) => {
                console.error('[REGISTER] Failed:', errorMessages);
                setErrors(errorMessages); // Expecting an array of error messages
            });
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
            </div>
        </div>
    );
};

// +------------------- EXPORTS --------------------+

export default Register;
