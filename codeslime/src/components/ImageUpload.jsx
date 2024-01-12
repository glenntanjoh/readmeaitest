import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = ({ messageId, onUpload }) => {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!image || !messageId) return;

        const formData = new FormData();
        formData.append('image', image);
        formData.append('messageId', messageId); // Append messageId to FormData

        setUploading(true);
        try {
            const response = await axios.post('http://localhost:5000/upload', formData, { withCredentials: true });
            onUpload(response.data.imageUrl); // Pass the image URL back to the parent component
        } catch (error) {
            console.error('Error uploading image:', error);
            // Handle error
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
            />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
        </div>
    );
};

export default ImageUpload;
