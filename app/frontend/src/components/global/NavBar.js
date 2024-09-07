// +------------------------------------------------+
// |                REDTETRIS NAVBAR                |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module defines the `NavBar` component for 
    the RedTetris frontend. The component provides a 
    navigation bar that includes the RedTetris logo, 
    a welcome message, and a logout option.
*/

// +----------------- REQUIREMENTS -----------------+

import { Navbar, Container, Nav } from 'react-bootstrap';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { SessionContext } from '../../contexts/sessionContext';

import './../../css/navbar.css';

// +------------------- COMPONENT -------------------+

const NavBar = () => {
    const { session } = useContext(SessionContext);

    return (
        <Navbar className="navbar" fixed="top">
            <Container fluid>
                <Nav className="me-auto d-flex align-items-center">
                    <Navbar.Brand className="navbar-logo">
                    </Navbar.Brand>
                    <Navbar.Text className="navbar-message">
                        Welcome, {session.username}!
                    </Navbar.Text>
                </Nav>
                <Nav className="navbar-right">
                    <Nav.Link as={Link} to="/logout" className="navbar-icon-logout">
                        <i className="bi bi-box-arrow-right" style={{ fontSize: '24px' }}></i>
                    </Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    );
};


// +------------------- EXPORTS ---------------------+

export default NavBar;
