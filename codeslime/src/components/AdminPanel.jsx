import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [channels, setChannels] = useState([]);
    const [messages, setMessages] = useState([]);
    const { isAdmin } = useAuth(); // Get isAdmin from useAuth
    const navigate = useNavigate(); // Get navigate from useNavigate

    useEffect(() => {
        if (!isAdmin) {
            navigate('/'); // Redirect non-admin users
            return;
        }

    // Fetch all necessary data
    const fetchData = async () => {
        try {
            const usersRes = await axios.get('http://localhost:5000/users', { withCredentials: true });
            const channelsRes = await axios.get('http://localhost:5000/channels', { withCredentials: true });
            const messagesRes = await axios.get('http://localhost:5000/messages', { withCredentials: true });
            setUsers(usersRes.data);
            setChannels(channelsRes.data);
            setMessages(messagesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    fetchData();
}, [isAdmin, navigate]);


    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await axios.delete(`http://localhost:5000/users/${userId}`, { withCredentials: true });
            setUsers(users.filter(user => user.id !== userId));
        }
    };

    const handleDeleteChannel = async (channelId) => {
        if (window.confirm('Are you sure you want to delete this channel?')) {
            await axios.delete(`http://localhost:5000/channels/${channelId}`, { withCredentials: true });
            setChannels(channels.filter(channel => channel.id !== channelId));
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            await axios.delete(`http://localhost:5000/messages/${messageId}`, { withCredentials: true });
            setMessages(messages.filter(message => message.id !== messageId));
        }
    };

    return (
        <div>
            <h1>Admin Panel</h1>
            <section>
                <h2>Users</h2>
                {users.map(user => (
                    <div key={user.id}>
                        {user.username} <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                    </div>
                ))}
            </section>
            <section>
                <h2>Channels</h2>
                {channels.map(channel => (
                    <div key={channel.id}>
                        {channel.name} <button onClick={() => handleDeleteChannel(channel.id)}>Delete</button>
                    </div>
                ))}
            </section>
            <section>
                <h2>Messages</h2>
                {messages.map(message => (
                    <div key={message.id}>
                        {message.content} <button onClick={() => handleDeleteMessage(message.id)}>Delete</button>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default AdminPanel;
