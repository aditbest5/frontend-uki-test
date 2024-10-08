import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

type ProtectedRouteProps = {
    element: JSX.Element;
};

const ProtectedRoute = ({ element }: ProtectedRouteProps): JSX.Element => {
    const token = Cookies.get('token');

    if (token === undefined) {
        return <Navigate to="/auth/login" />;
    }

    return element || <div />;
};

export default ProtectedRoute;
