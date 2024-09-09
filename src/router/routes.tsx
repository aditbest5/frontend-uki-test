import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';

// Define a new type that extends RouteObject and adds the layout property
type CustomRouteObject = RouteObject & {
  layout?: 'blank' | 'default';
};

const Index = lazy(() => import('../pages/Apps/Currency'));
const Error = lazy(() => import('../pages/Error404'));
const AccountSetting = lazy(() => import('../pages/Users/AccountSetting'));
const ListUser = lazy(() => import('../pages/Users/ListUser'));
const Login = lazy(() => import('../pages/Authentication/Login'));
const Register = lazy(() => import('../pages/Authentication/Register'));

const routes: CustomRouteObject[] = [
    {
        path: '/',
        element: <ProtectedRoute element={<Index />} />,
        layout: 'default', // Add layout property here
    },
    {
        path: '/users/list',
        element: <ProtectedRoute element={<ListUser />} />,
        layout: 'default',
    },
    {
        path: '/users/profile',
        element: <ProtectedRoute element={<AccountSetting />} />,
        layout: 'default',
    },
    {
        path: '/auth/login',
        element: <PublicRoute element={<Login />} />,
        layout: 'blank',
    },
    {
        path: '/auth/register',
        element: <PublicRoute element={<Register />} />,
        layout: 'blank',
    },
    {
        path: '*',
        element: <Error />,
        layout: 'blank',
    },
];

export { routes };
