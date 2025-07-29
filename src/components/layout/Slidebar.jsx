import React, { useState } from 'react';
import {
    Home,
    Calendar,
    Wind,
    Map,
    Bell,
    BarChart3,
    BookOpen,
    User,
    Settings,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    Cloud,
    History,
    Globe,
    Heart
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onToggle, className = '' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        {
            category: 'Main',
            items: [
                { id: 'home', label: 'Dashboard', icon: Home, path: '/', badge: null },
                { id: 'forecast', label: '5-Day Forecast', icon: Calendar, path: '/forecast', badge: null },
                { id: 'air-quality', label: 'Air Quality', icon: Wind, path: '/air-quality', badge: 'AQI' },
                { id: 'map', label: 'Weather Map', icon: Map, path: '/map', badge: null }
            ]
        },
        {
            category: 'Tools',
            items: [
                { id: 'alerts', label: 'Weather Alerts', icon: Bell, path: '/alerts', badge: '3' },
                { id: 'compare', label: 'City Comparison', icon: BarChart3, path: '/compare', badge: null },
                { id: 'journal', label: 'Weather Journal', icon: BookOpen, path: '/journal', badge: null },
                { id: 'history', label: 'History', icon: History, path: '/history', badge: null }
            ]
        },
        {
            category: 'Personal',
            items: [
                { id: 'favorites', label: 'Favorite Cities', icon: Heart, path: '/favorites', badge: '5' },
                { id: 'profile', label: 'Profile', icon: User, path: '/profile', badge: null },
                { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', badge: null }
            ]
        }
    ];

    const recentSearches = [
        { city: 'New York', country: 'US', temp: '22°C' },
        { city: 'London', country: 'UK', temp: '18°C' },
        { city: 'Tokyo', country: 'JP', temp: '25°C' },
        { city: 'Sydney', country: 'AU', temp: '20°C' }
    ];

    const handleItemClick = (path) => {
        navigate(path);
        if (window.innerWidth < 768) {
            onToggle();
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
        transform transition-all duration-300 z-50 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${className}
      `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                <Cloud className="text-white" size={20} />
                            </div>
                            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WeatherApp
              </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden md:flex p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>

                        <button
                            onClick={onToggle}
                            className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Quick Search */}
                {!isCollapsed && (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search cities..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {menuItems.map((category) => (
                        <div key={category.category}>
                            {!isCollapsed && (
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                    {category.category}
                                </h3>
                            )}

                            <nav className="space-y-1">
                                {category.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleItemClick(item.path)}
                                            className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                        ${active
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                                            title={isCollapsed ? item.label : ''}
                                        >
                                            <Icon size={20} className={active ? 'text-white' : ''} />

                                            {!isCollapsed && (
                                                <>
                                                    <span className="flex-1 text-left font-medium">{item.label}</span>
                                                    {item.badge && (
                                                        <span className={`
                              text-xs px-2 py-0.5 rounded-full font-semibold
                              ${active
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                                        }
                            `}>
                              {item.badge}
                            </span>
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                {/* Recent Searches */}
                {!isCollapsed && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="mb-3 flex items-center gap-2">
                            <Globe size={16} className="text-gray-500" />
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent</h3>
                        </div>

                        <div className="space-y-2">
                            {recentSearches.slice(0, 3).map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleItemClick('/')}
                                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                                >
                                    <div className="text-left">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {search.city}
                                        </div>
                                        <div className="text-xs text-gray-500">{search.country}</div>
                                    </div>
                                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                        {search.temp}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weather Summary Widget */}
                {!isCollapsed && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm opacity-90">Current Location</div>
                                <Cloud size={16} />
                            </div>
                            <div className="text-2xl font-bold mb-1">22°C</div>
                            <div className="text-sm opacity-90">Partly Cloudy</div>
                            <div className="flex justify-between mt-3 text-xs opacity-75">
                                <span>H: 25°C</span>
                                <span>L: 18°C</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Sidebar;