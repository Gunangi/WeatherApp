// src/context/AppContext.js

import React, { createContext, useState, useEffect, useMemo } from 'react';

// Create the context
export const AppContext = createContext();

// Create the provider component
export const AppProvider = ({ children }) => {
    // State for theme
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    // State for temperature unit
    const [unit, setUnit] = useState(localStorage.getItem('unit') || 'celsius');
    // Dummy user ID for now. In a real app, this would come from an auth system.
    const [userId] = useState('dummyUser123');

    // Effect to apply the theme to the body
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Effect to save unit preference
    useEffect(() => {
        localStorage.setItem('unit', unit);
    }, [unit]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // The value that will be supplied to all consuming components
    const value = useMemo(() => ({
        theme,
        toggleTheme,
        unit,
        setUnit,
        userId
    }), [theme, unit, userId]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
