import React from 'react';
import { Link } from 'react-router-dom';
import './styles/LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-container">
            <h1>Welcome to CodeSlime</h1>
            <p>Your go-to platform for programming questions and answers.</p>
            <div className="landing-actions">
                <Link to="/login" className="btn">Login</Link>
                <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </div>
        </div>
    );
};

export default LandingPage;
