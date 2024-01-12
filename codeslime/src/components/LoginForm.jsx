import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/AuthForm.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [feedback, setFeedback] = useState(''); 
    const [isLoading, setIsLoading] = useState(false); 

    const validateForm = () => {
        let formIsValid = true;
        let errors = {};

        if (!username) {
            formIsValid = false;
            errors["username"] = "*Please enter your username.";
        }

        if (!password) {
            formIsValid = false;
            errors["password"] = "*Please enter your password.";
        }

        setErrors(errors);
        return formIsValid;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback('Logging in...');
        setIsLoading(true);
    
        if (validateForm()) {
            try {
                const response = await axios.post('http://localhost:5000/login', {
                    username,
                    password
                }, { withCredentials: true });
    
                setTimeout(() => {
                    login(response.data); // Update the authentication state
                    navigate('/home'); 
                    setIsLoading(false);
                }, 1200); // timeout duration
            } catch (error) {
                setFeedback(error.response ? error.response.data.error : 'Login failed. Please try again.');
                setIsLoading(false);
                setErrors({}); // Reset form errors
            }
        } else {
            setIsLoading(false);
        }
    };
    
    
    

    // Function to determine if the feedback is an error message
    const isErrorMessage = feedback.startsWith('*') || feedback.toLowerCase().includes('failed');
    

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
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                    <div className="error">{errors["password"]}</div>
                </div>
                <button type="submit">Login</button>
                {feedback && (
                    <div className={`feedback ${isErrorMessage ? 'error' : ''}`}>
                        {feedback}
                    </div>
                )}
            </form>
            <p className="auth-switch">
                New to CodeSlime? <Link to="/signup">Sign Up</Link>
            </p>
        </div>
    );
};

export default LoginForm;
