import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

type PublicRouteProps = {
    element: JSX.Element;
};

const PublicRoute = ({ element }: PublicRouteProps): JSX.Element => {
    const token = Cookies.get('token');

    if (token !== undefined) {
        return <Navigate to="/" />;
    }

    return element || <div />;
};

export default PublicRoute;
