import React, { useState } from 'react';
import ImageUpload from './ImageUpload'; // Import the ImageUpload component
import '../styles/ChannelForm.css';

const ChannelForm = ({ onSubmit, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState(''); // State to store the uploaded image URL
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let isValid = true;
        let errors = {};

        if (!name.trim()) {
            errors.name = 'Name is required';
            isValid = false;
        }

        if (!description.trim()) {
            errors.description = 'Description is required';
            isValid = false;
        }

        setErrors(errors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit({ name, description, image_url: imageUrl }); // Include the image URL in the submitted data
        }
    };

    const handleFormClose = () => {
        // Reset form fields, errors, and image URL
        setName('');
        setDescription('');
        setImageUrl('');
        setErrors({});
        onClose(); // Call the onClose prop function
    };

    return (
        <div className="channel-form-modal">
            <form onSubmit={handleSubmit}>
                <h2>Create Channel</h2>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input 
                        id="name"
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                    />
                    {errors.name && <div className="error">{errors.name}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea 
                        id="description"
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                    {errors.description && <div className="error">{errors.description}</div>}
                </div>
                <ImageUpload onUpload={setImageUrl} /> 
                <button type="submit">Create</button>
                <button type="button" onClick={handleFormClose}>Cancel</button>
            </form>
        </div>
    );
};

export default ChannelForm;
