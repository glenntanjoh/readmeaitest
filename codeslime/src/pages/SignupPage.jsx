import React from 'react';
import SignupForm from '../components/SignupForm';
import '../styles/AuthPage.css';

const SignupPage = () => {
    return (
        <div className="signup-page">
            <h2>Sign Up for CodeSlime</h2>
            <SignupForm />
        </div>
    );
};

export default SignupPage;
