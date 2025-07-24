// src/components/layout/Header.jsx

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Sun, Moon, Settings } from 'lucide-react'; // Using lucide-react for icons

const Header = () => {
    const { theme, toggleTheme } = useContext(AppContext);

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    WeatherNow
                </Link>
                <div className="flex items-center space-x-4">
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <Link to="/settings" className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Settings size={20} />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;