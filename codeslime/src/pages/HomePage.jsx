import React, { useState, useEffect } from 'react';
import ChannelCard from '../components/ChannelCard';
import ChannelForm from '../components/ChannelForm';
import axios from 'axios';

const HomePage = ({showChannelForm, setShowChannelForm}) => {
    const [channels, setChannels] = useState([]);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const response = await axios.get('http://localhost:5000/channels', { withCredentials: true });
            setChannels(response.data);
        } catch (error) {
            console.error('Error fetching channels:', error);
        }
    };

    const handleCreateChannel = async (channelData) => {
        try {
            await axios.post('http://localhost:5000/channels', channelData , { withCredentials: true });
            fetchChannels();
            setShowChannelForm(false);
        } catch (error) {
            console.error('Error creating channel:', error);
        }
    };

    return (
        <div>
            {showChannelForm && (
                <ChannelForm 
                    onSubmit={handleCreateChannel} 
                    onClose={() => setShowChannelForm(false)}
                />
            )}
            <div className="channels-container">
                {channels.map(channel => (
                    <ChannelCard key={channel.id} channel={channel} />
                ))}
            </div>
        </div>
    );
};

export default HomePage;
