import React, { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, themes, setTheme, isDark, isAuto } = useTheme();
    const [showOptions, setShowOptions] = useState(false);

    const themeOptions = [
        {
            value: themes.LIGHT,
            label: 'Light',
            icon: Sun,
            description: 'Light theme'
        },
        {
            value: themes.DARK,
            label: 'Dark',
            icon: Moon,
            description: 'Dark theme'
        },
        {
            value: themes.AUTO,
            label: 'Auto',
            icon: Monitor,
            description: 'Follow system'
        }
    ];

    const currentThemeOption = themeOptions.find(option => option.value === theme);
    const CurrentIcon = currentThemeOption?.icon || Sun;

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setShowOptions(false);
    };

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setShowOptions(!showOptions)}
                className={`
          p-2 rounded-lg transition-all duration-200
          ${isDark
                    ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }
          focus:outline-none focus:ring-2 focus:ring-blue-500/20
        `}
                title={`Current theme: ${currentThemeOption?.label}`}
            >
                <CurrentIcon className="w-5 h-5" />
            </button>

            {/* Options Dropdown */}
            {showOptions && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowOptions(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className={`
            absolute right-0 top-full mt-2 w-48 rounded-lg border shadow-lg z-50
            ${isDark
                        ? 'bg-gray-800/95 border-gray-600'
                        : 'bg-white/95 border-gray-200'
                    }
            backdrop-blur-md
          `}>
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600 mb-2">
                                Theme Settings
                            </div>

                            {themeOptions.map((option) => {
                                const Icon = option.icon;
                                const isSelected = theme === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => handleThemeChange(option.value)}
                                        className={`
                      w-full flex items-center px-3 py-2 text-left rounded-md transition-all duration-200
                      ${isSelected
                                            ? (isDark
                                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                                            )
                                            : (isDark
                                                    ? 'hover:bg-gray-700 text-gray-300'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                            )
                                        }
                    `}
                                    >
                                        <Icon className={`
                      w-4 h-4 mr-3
                      ${isSelected
                                            ? (isDark ? 'text-blue-400' : 'text-blue-600')
                                            : 'text-gray-400'
                                        }
                    `} />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">
                                                {option.label}
                                            </div>
                                            <div className="text-xs opacity-75">
                                                {option.description}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className={`
                        w-2 h-2 rounded-full
                        ${isDark ? 'bg-blue-400' : 'bg-blue-600'}
                      `} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-600">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {isAuto && (
                                    <div className="flex items-center">
                                        <div className={`
                      w-2 h-2 rounded-full mr-2
                      ${isDark ? 'bg-yellow-400' : 'bg-blue-500'}
                    `} />
                                        Using {isDark ? 'dark' : 'light'} mode
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ThemeToggle;