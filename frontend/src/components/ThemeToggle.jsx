import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

const ThemeToggle = ({ onThemeChange, initialTheme = 'light' }) => {
    const [theme, setTheme] = useState(initialTheme);
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { id: 'light', name: 'Light', icon: Sun, color: 'text-yellow-500' },
        { id: 'dark', name: 'Dark', icon: Moon, color: 'text-blue-400' },
        { id: 'system', name: 'System', icon: Monitor, color: 'text-gray-500' }
    ];

    useEffect(() => {
        // Apply theme changes
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            onThemeChange && onThemeChange(systemTheme);
        } else {
            onThemeChange && onThemeChange(theme);
        }
    }, [theme, onThemeChange]);

    const handleThemeSelect = (selectedTheme) => {
        setTheme(selectedTheme);
        setIsOpen(false);
    };

    const currentTheme = themes.find(t => t.id === theme);
    const CurrentIcon = currentTheme?.icon || Sun;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                    isDark
                        ? 'bg-gray-900/30 border-gray-700/50 hover:bg-gray-800/40'
                        : 'bg-white/20 border-white/30 hover:bg-white/30'
                } shadow-lg hover:shadow-xl group`}
                title={`Current theme: ${currentTheme?.name}`}
            >
                <CurrentIcon
                    size={20}
                    className={`transition-all duration-300 group-hover:scale-110 ${
                        isDark ? 'text-white' : 'text-gray-800'
                    }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className={`absolute right-0 top-full mt-2 w-48 rounded-2xl backdrop-blur-md border overflow-hidden z-50 ${
                        isDark
                            ? 'bg-gray-900/90 border-gray-700/50'
                            : 'bg-white/90 border-white/30'
                    } shadow-2xl animate-in slide-in-from-top-2 duration-200`}>

                        <div className="p-2">
                            <div className={`px-3 py-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Choose Theme
                            </div>

                            {themes.map((themeOption) => {
                                const Icon = themeOption.icon;
                                const isSelected = theme === themeOption.id;

                                return (
                                    <button
                                        key={themeOption.id}
                                        onClick={() => handleThemeSelect(themeOption.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                                            isSelected
                                                ? isDark
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-blue-500/20 text-blue-600'
                                                : isDark
                                                    ? 'hover:bg-white/10 text-white'
                                                    : 'hover:bg-black/5 text-gray-800'
                                        }`}
                                    >
                                        <Icon
                                            size={18}
                                            className={`transition-colors ${
                                                isSelected ? themeOption.color : isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}
                                        />
                                        <span className="font-medium">{themeOption.name}</span>
                                        {isSelected && (
                                            <div className={`ml-auto w-2 h-2 rounded-full ${
                                                isDark ? 'bg-blue-400' : 'bg-blue-600'
                                            }`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* System Theme Info */}
                        {theme === 'system' && (
                            <div className={`px-3 py-2 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-200/30'}`}>
                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Following system preference: {
                                    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'
                                }
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ThemeToggle;