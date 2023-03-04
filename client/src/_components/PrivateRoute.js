import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export function PrivateRoute({location}) {
    const auth = localStorage.getItem('user');
    return auth ? <Outlet /> : <Navigate to={{ pathname: '/login', state: { from: location } }} />;
}