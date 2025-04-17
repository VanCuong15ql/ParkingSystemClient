import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({children}) => {
    const isAuthenticated = localStorage.getItem('isAuth') === 'true';
    if(isAuthenticated){
        return children;
    }
    return <Navigate to="/login" />;
}

export default PrivateRoute;
