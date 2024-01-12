import React from 'react';
import LoginForm from '../components/LoginForm';
import '../styles/AuthPage.css';

const LoginPage = () => {
    return (
        <div className="login-page">
            <h2>Login to CodeSlime</h2>
            <LoginForm />
        </div>
    );
};

export default LoginPage;
