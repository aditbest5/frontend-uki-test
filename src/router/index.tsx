import { createBrowserRouter, RouteObject } from 'react-router-dom';
import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { routes } from './routes';

// Define a new type that extends RouteObject and adds the layout property
type CustomRouteObject = RouteObject & {
  layout?: 'blank' | 'default';
};

const finalRoutes = routes.map((route: CustomRouteObject) => {
    return {
        ...route,
        element: route.layout === 'blank' 
            ? <BlankLayout>{route.element}</BlankLayout> 
            : <DefaultLayout>{route.element}</DefaultLayout>,
    };
});

const router = createBrowserRouter(finalRoutes);

export default router;
