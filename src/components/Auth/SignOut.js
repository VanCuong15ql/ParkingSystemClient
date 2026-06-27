import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignOut = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear all auth data from localStorage
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('isAuth');

        // Show success message
        if (window.FuiToast) {
            window.FuiToast.success('Sign out successful');
        }

        // Redirect to login page
        setTimeout(() => {
            navigate('/login');
        }, 500);
    }, [navigate]);

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Signing out...</h2>
            <p>Please wait while we sign you out.</p>
        </div>
    );
};

export default SignOut;
