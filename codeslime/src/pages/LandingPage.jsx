import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Grid, Card, CardContent } from '@mui/material';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/LandingPage.css';

AOS.init();

const LandingPage = () => {
    return (
        <div className="landing-container">
            <Grid container spacing={2} className="hero-section">
                <Grid item xs={12}>
                    <Typography variant="h2" gutterBottom>
                        Welcome to CodeSlime
                    </Typography>
                    <Typography variant="subtitle1">
                        Explore, Share, and Grow your programming knowledge.
                    </Typography>
                    <Button variant="contained" color="primary" component={Link} to="/login">
                        Get Started
                    </Button>
                </Grid>
            </Grid>
            <Grid container spacing={2} className="features-section">
                <Grid item xs={12}>
                    <Typography variant="h4" gutterBottom>
                        Why Choose CodeSlime?
                    </Typography>
                </Grid>
                {['Community Driven', 'Expert Answers', 'Stay Updated'].map((feature, index) => (
                    <Grid item xs={12} sm={4} key={index} data-aos="fade-up">
                        <Card>
                            <CardContent>
                                <Typography variant="h5">{feature}</Typography>
                                <Typography variant="body2">
                                    {feature === 'Community Driven' && 'Learn and share with a growing community of developers.'}
                                    {feature === 'Expert Answers' && 'Get answers from experienced professionals.'}
                                    {feature === 'Stay Updated' && 'Keep up with the latest trends in technology and programming.'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default LandingPage;
