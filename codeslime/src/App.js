import React, { useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider} from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import AdminPanel from './components/AdminPanel';
import './styles/App.css';

function App() {

    const [showChannelForm, setShowChannelForm] = useState(false);

    const toggleChannelForm = () => {
        console.log("Toggling channel form");
        setShowChannelForm(prevState => !prevState);
    };

    return (
        <Router>
            <AuthProvider>
                <Navbar onShowChannelForm={toggleChannelForm} />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<HomePage showChannelForm={showChannelForm} setShowChannelForm={setShowChannelForm} />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/admin" element={<AdminPanel />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;

