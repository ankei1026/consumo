// resources/js/app.tsx
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { Toaster } from 'react-hot-toast';

// Import all named exports from routes
import * as routes from './routes';

const appName = import.meta.env.VITE_APP_NAME || 'CONSUMO';

// Make routes available globally
declare global {
    interface Window {
        routes: typeof routes;
    }
}

window.routes = routes;

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster position="top-right" />
            </>,
        );
    },
    progress: {
        color: '#2563eb',
    },
});
