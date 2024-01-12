import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { AppBar, Toolbar, Typography, Button, TextField, IconButton, Menu, MenuItem, Paper, List, ListItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import '../styles/Navbar.css';

const Navbar = ({ onShowChannelForm }) => {
    const { isAuthenticated, logout, isAdmin } = useAuth();
    console.log("isAdmin", isAdmin);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        const debouncedSearch = debounce(async (searchTerm) => {
            if (searchTerm) {
                try {
                    const response = await axios.post('http://localhost:5000/search', { searchTerm }, { withCredentials: true });
                    setSearchResults(response.data);
                } catch (error) {
                    console.error('Error performing search:', error);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        debouncedSearch(searchTerm);

        return () => {
            debouncedSearch.cancel();
        };
    }, [searchTerm]);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSearch = async () => {
        try {
            const response = await axios.post('http://localhost:5000/search', { searchTerm }, { withCredentials: true });
            setSearchResults(response.data);
            console.log('Search results:', response.data);
        } catch (error) {
            console.error('Error performing search:', error);
        }
    };

    const generateLinkUrl = (result) => {
        if (result.type === 'channel') {
            return `/channels/${result.id}`;
        } else if (result.type === 'message') {
            return `/channels/${result.channel_id}/messages/${result.id}`;
        }
        return '/';
    };

    return (
        <AppBar position="static">
            <Toolbar>
            <Typography variant="h6" component={Link} to={isAuthenticated ? "/home" : "/"} style={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                CodeSlime
            </Typography>
                {isAuthenticated && (
                    <>
                        <TextField
                            label="Search..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ marginRight: '10px' }}
                        />
                        <IconButton color="inherit" onClick={handleSearch}>
                            <SearchIcon />
                        </IconButton>
                        <Button color="inherit" onClick={() => onShowChannelForm()}>Create Channel</Button>
                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleClose}>Profile</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </>
                )}
                {isAdmin && (
            <Link to="/admin">Admin Panel</Link> // Add link to Admin Panel
        )}
                {!isAuthenticated && (
                    <Button color="inherit" component={Link} to="/login">Login / Sign Up</Button>
                )}
            </Toolbar>
            {searchResults.length > 0 && (
                <Paper style={{ position: 'absolute', width: '100%', zIndex: 1000, top: '64px', maxHeight: '300px', overflowY: 'auto'}}>
                    <List>
                        {searchResults.map((result, index) => (
                            <ListItem button component={Link} to={generateLinkUrl(result)} key={index}>
                                <Typography variant="body1">{result.name || 'Message'}</Typography>
                                <Typography variant="body2">{result.description || result.content}</Typography>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </AppBar>
    );
};

export default Navbar;
