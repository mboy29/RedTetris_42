// +------------------------------------------------+
// |           REDTETRIS LOGIN COMPONENT            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `Login` component for the 
    RedTetris frontend. The component provides a login 
    form for users to enter their username and 
    password. The component uses a socket connection
    to authenticate the user.
*/

// +----------------- REQUIREMENTS -----------------+

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import config from '../configs/config';

// +------------------- COMPONENT -------------------+

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
                socketConnection.off('login_success');
                socketConnection.off('login_error');
                socketConnection.disconnect();
            }
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors([]);

        if (username.trim() === '' || password.trim() === '') {
            setErrors(['Username and password are required.']);
            return;
        }

        if (socket) {
            socket.emit('login', { username, password });

            socket.on('login_success', () => {
                console.log('[LOGIN] Successful');
                navigate('/home');
            });

            socket.on('login_error', (errorMessages) => {
                console.error('[LOGIN] Failed:', errorMessages);
                setErrors(errorMessages);
            });
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
