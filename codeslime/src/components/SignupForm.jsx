import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthForm.css';

const SignupForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [display_name, setdisplay_name] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [feedback, setFeedback] = useState('');

    const validateForm = () => {
        let formIsValid = true;
        let errors = {};

        if (!username) {
            formIsValid = false;
            errors["username"] = "*Please enter your username.";
        }

        if (!display_name) {
            formIsValid = false;
            errors["display_name"] = "*Please enter your display name.";
        }

        if (!password) {
            formIsValid = false;
            errors["password"] = "*Please enter your password.";
        }

        if (!confirmPassword) {
            formIsValid = false;
            errors["confirmPassword"] = "*Please confirm your password.";
        }

        if (password !== confirmPassword) {
            formIsValid = false;
            errors["password"] = "*Passwords do not match.";
        }

        setErrors(errors);
        return formIsValid;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback(''); // Reset feedback message
        if (validateForm()) {
            try {
                const response = await axios.post('http://localhost:5000/signup', {
                    username,
                    display_name,
                    password
                });

                console.log('Signup successful:', response.data);
                setFeedback('Signup successful!'); // Set success message
                alert('Signup successful!');
                login(response.data); // Update AuthContext
                setTimeout(() => navigate('/login'), 800);
            } catch (error) {
                let errorMessage = 'Signup failed. Please try again.';
                if (error.response && error.response.data) {
                    errorMessage = error.response.data.message || errorMessage;
                }
                console.error('Signup failed:', errorMessage);
                setFeedback(errorMessage); // Set error message
                setErrors({}); // Reset form errors
            }
        }
    };

    // Function to determine if the feedback is an error message
    const isErrorMessage = feedback.toLowerCase().includes('failed');

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                    <div className="error">{errors["username"]}</div>
                </div>
                <div>
                    <label>Display Name</label>
                    <input 
                        type="text" 
                        value={display_name} 
                        onChange={(e) => setdisplay_name(e.target.value)} 
                    />
                    <div className="error">{errors["display_name"]}</div>
                </div>
                <div>
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                    <div className="error">{errors["password"]}</div>
                </div>
                <div>
                    <label>Confirm Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                    <div className="error">{errors["confirmPassword"]}</div>
                </div>
                {feedback && (
                    <div className={`feedback ${isErrorMessage ? 'error' : ''}`}>
                        {feedback}
                    </div>
                )}
                <button type="submit">Sign Up</button>
            </form>
            <p className="auth-switch">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );    
    
};

export default SignupForm;
