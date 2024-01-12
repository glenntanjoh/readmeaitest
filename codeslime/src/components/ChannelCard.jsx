import React, { useState, useEffect } from 'react';
import Comments from './Comments';
import axios from 'axios';
import {Card, CardContent, Button, Typography, IconButton, TextField, Box } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import '../styles/ChannelCard.css';

const ChannelCard = ({ channel }) => {
    const [fetchedComments, setFetchedComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [userReaction, setUserReaction] = useState(null);
    const [error, setError] = useState(''); // State for tracking errors
    const [likesCount, setLikesCount] = useState(Number(channel.likesCount) || 0);
    const [dislikesCount, setDislikesCount] = useState(Number(channel.dislikesCount) || 0);

    useEffect(() => {
        const fetchUserReaction = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/channels/${channel.id}/reaction`, { withCredentials: true });
                setUserReaction(response.data.reaction);
            } catch (error) {
                setError('Error fetching user reaction.');
                console.error('Error fetching user reaction:', error);
            }
        };

        fetchUserReaction();
    }, [channel.id]);

    const handleViewComments = async () => {
        if (!showComments) {
            try {
                const response = await axios.get(`http://localhost:5000/messages/${channel.id}`, { withCredentials: true });
                setFetchedComments(response.data.map(comment => ({
                    ...comment,
                    authorDisplayName: comment.authorDisplayName
                })));
            } catch (error) {
                setError('Error fetching comments.');
                console.error('Error fetching comments:', error);
            }
        }
        setShowComments(!showComments);
    };

    const postComment = async () => {
        try {
            const response = await axios.post('http://localhost:5000/messages', {
                channel_id: channel.id,
                content: newComment
            }, { withCredentials: true });
            setNewComment('');
            handleViewComments();
        } catch (error) {
            setError('Error posting comment.');
            console.error('Error posting comment:', error);
        }
    };

    const handleReplySubmit = async (parentId, replyContent) => {
        try {
            await axios.post('http://localhost:5000/messages', {
                channel_id: channel.id,
                content: replyContent,
                reply_to: parentId
            }, { withCredentials: true });
            handleViewComments();
        } catch (error) {
            setError('Error posting reply.');
            console.error('Error posting reply:', error);
        }
    };

    const handleLike = async () => {
        try {
            await axios.post(`http://localhost:5000/channels/${channel.id}/like`, {}, { withCredentials: true });
            setUserReaction('like');
            setLikesCount(prev => isNaN(prev) ? 1 : prev + 1);
            if (userReaction === 'dislike') {
                setDislikesCount(prev => Math.max(prev - 1, 0)); // Ensure count doesn't go below zero
            }
        } catch (error) {
            setError('Error liking channel.');
            console.error('Error liking channel:', error);
        }
    };

    const handleDislike = async () => {
        try {
            await axios.post(`http://localhost:5000/channels/${channel.id}/dislike`, {}, { withCredentials: true });
            setUserReaction('dislike');
            setDislikesCount(prev => isNaN(prev) ? 1 : prev + 1);
            if (userReaction === 'like') {
                setLikesCount(prev => Math.max(prev - 1, 0)); // Ensure count doesn't go below zero
            }
        } catch (error) {
            setError('Error disliking channel.');
            console.error('Error disliking channel:', error);
        }
    };

    return (
        <Card className="channel-card" variant="outlined">
            <CardContent>
                <Typography variant="h5" component="h2">
                    {channel.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {channel.description}
                </Typography>
                <Box mt={2}>
                    <Button onClick={handleViewComments} variant="outlined">
                        {showComments ? 'Hide Comments' : 'Comments'}
                    </Button>
                    <IconButton onClick={handleLike} color={userReaction === 'like' ? 'primary' : 'default'}>
                        <ThumbUpIcon />
                    </IconButton>
                    <span>{likesCount}</span>
                    <IconButton onClick={handleDislike} color={userReaction === 'dislike' ? 'secondary' : 'default'}>
                        <ThumbDownIcon />
                    </IconButton>
                    <span>{dislikesCount}</span>
                </Box>
                {showComments && (
                    <Comments 
                        comments={fetchedComments} 
                        onReplySubmit={handleReplySubmit}
                        onClose={() => setShowComments(false)}
                    />
                )}
                <Box mt={2}>
                    <TextField
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        variant="outlined"
                        fullWidth
                        multiline
                    />
                    <Button onClick={postComment} variant="contained" color="primary" style={{ marginTop: '10px' }}>
                        Post Comment
                    </Button>
                </Box>
                {error && <Typography color="error">{error}</Typography>}
            </CardContent>
        </Card>
    );
};

export default ChannelCard;
