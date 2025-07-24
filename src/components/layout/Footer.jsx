// src/components/layout/Footer.jsx

import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-800 text-center py-4 text-sm text-gray-600 dark:text-gray-400">
            <p>WeatherNow &copy; {new Date().getFullYear()}. Powered by Spring Boot & React.</p>
        </footer>
    );
};

export default Footer;