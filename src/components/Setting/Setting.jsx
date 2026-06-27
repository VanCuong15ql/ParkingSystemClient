import React, { useState, useEffect } from 'react';
import './setting.css';

const Setting = () => {
    const [mapImage, setMapImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const userId = localStorage.getItem('userId');
    const urlServer = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

    useEffect(() => {
        // Load existing map when component mounts
        fetchUserMap();
    }, []);

    const fetchUserMap = async () => {
        try {
            const response = await fetch(`${urlServer}/users/${userId}/map`);
            if (response.ok) {
                const data = await response.json();
                if (data.map) {
                    setMapImage(data.map);
                }
            }
        } catch (error) {
            console.error('Error fetching map:', error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        try {
            // Convert image to base64
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Image = event.target.result;
                setMapImage(base64Image);

                // Upload to server
                const response = await fetch(`${urlServer}/users/${userId}/map`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ map: base64Image }),
                });

                if (response.ok) {
                    if (window.FuiToast) {
                        window.FuiToast.success('Map uploaded successfully');
                    }
                } else {
                    if (window.FuiToast) {
                        window.FuiToast.error('Failed to upload map');
                    }
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading map:', error);
            if (window.FuiToast) {
                window.FuiToast.error('Error uploading map');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="settings">
            <div className="settings-header">
                <h2>Settings</h2>
            </div>
            <div className="settings-content">
                <div className="setting-section">
                    <h3>Map Configuration</h3>
                    <div className="map-upload-container">
                        <label htmlFor="map-upload" className="upload-label">
                            {isLoading ? 'Uploading...' : 'Upload Parking Map'}
                        </label>
                        <input
                            id="map-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isLoading}
                            style={{ display: 'none' }}
                        />
                        {mapImage && (
                            <div className="map-preview">
                                <h4>Current Map:</h4>
                                <img src={mapImage} alt="Parking Map" style={{ maxWidth: '300px', maxHeight: '300px' }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Setting;