// index.js - React entry point

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Optional: Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
