import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Map,
    BarChart3,
    BookOpen,
    AlertTriangle,
    Settings,
    Menu,
    X,
    Users,
    History,
    Bell
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NavigationMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { theme } = useTheme();

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/map', icon: Map, label: 'Weather Map' },
        { path: '/comparison', icon: BarChart3, label: 'City Comparison' },
        { path: '/journal', icon: BookOpen, label: 'Weather Journal' },
        { path: '/alerts', icon: AlertTriangle, label: 'Alerts' },
        { path: '/history', icon: History, label: 'History' },
        { path: '/profile', icon: Users, label: 'Profile' },
        { path: '/notifications', icon: Bell, label: 'Notifications' },
        { path: '/settings', icon: Settings, label: 'Settings' }
    ];

    const isActive = (path) => location.pathname === path;

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMenu}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={toggleMenu}
                />
            )}

            {/* Navigation Menu */}
            <nav className={`
        fixed left-0 top-0 h-full w-64 z-40 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${theme === 'dark'
                ? 'bg-gray-900/95 border-gray-700'
                : 'bg-white/95 border-gray-200'
            }
        backdrop-blur-md border-r
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                            WeatherApp
                        </h1>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-1 py-6">
                        <ul className="space-y-2 px-4">
                            {navItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`
                      flex items-center px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive(item.path)
                                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                        }
                    `}
                                    >
                                        <item.icon className="w-5 h-5 mr-3" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                            <p>© 2024 WeatherApp</p>
                            <p>v1.0.0</p>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Spacer */}
            <div className="lg:ml-64" />
        </>
    );
};

export default NavigationMenu;