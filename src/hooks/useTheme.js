import { useState, useEffect, useContext, createContext } from 'react';

// Theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('system');
    const [actualTheme, setActualTheme] = useState('light');

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('weather-app-theme') || 'system';
        setTheme(savedTheme);
    }, []);

    // Update actual theme based on selected theme and system preference
    useEffect(() => {
        const updateActualTheme = () => {
            if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                setActualTheme(systemTheme);
            } else {
                setActualTheme(theme);
            }
        };

        updateActualTheme();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                updateActualTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;

        if (actualTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = actualTheme === 'dark' ? '#1f2937' : '#ffffff';
        }
    }, [actualTheme]);

    // Change theme function
    const changeTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('weather-app-theme', newTheme);

        // Dispatch custom event for theme change
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: newTheme, actualTheme: newTheme === 'system' ?
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : newTheme
            }
        }));
    };

    // Toggle between light and dark (skips system)
    const toggleTheme = () => {
        const newTheme = actualTheme === 'dark' ? 'light' : 'dark';
        changeTheme(newTheme);
    };

    // Get theme colors for dynamic styling
    const getThemeColors = () => {
        return {
            // Background colors
            background: actualTheme === 'dark' ? '#0f172a' : '#ffffff',
            backgroundSecondary: actualTheme === 'dark' ? '#1e293b' : '#f8fafc',
            backgroundTertiary: actualTheme === 'dark' ? '#334155' : '#e2e8f0',

            // Text colors
            textPrimary: actualTheme === 'dark' ? '#f8fafc' : '#0f172a',
            textSecondary: actualTheme === 'dark' ? '#cbd5e1' : '#475569',
            textTertiary: actualTheme === 'dark' ? '#94a3b8' : '#64748b',

            // Border colors
            border: actualTheme === 'dark' ? '#374151' : '#e5e7eb',
            borderSecondary: actualTheme === 'dark' ? '#4b5563' : '#d1d5db',

            // Weather condition colors
            sunny: actualTheme === 'dark' ? '#fbbf24' : '#f59e0b',
            cloudy: actualTheme === 'dark' ? '#9ca3af' : '#6b7280',
            rainy: actualTheme === 'dark' ? '#60a5fa' : '#3b82f6',
            stormy: actualTheme === 'dark' ? '#a78bfa' : '#8b5cf6',
            snowy: actualTheme === 'dark' ? '#e5e7eb' : '#f3f4f6',

            // Accent colors
            primary: actualTheme === 'dark' ? '#3b82f6' : '#2563eb',
            primaryHover: actualTheme === 'dark' ? '#2563eb' : '#1d4ed8',
            success: actualTheme === 'dark' ? '#10b981' : '#059669',
            warning: actualTheme === 'dark' ? '#f59e0b' : '#d97706',
            error: actualTheme === 'dark' ? '#ef4444' : '#dc2626',
            info: actualTheme === 'dark' ? '#06b6d4' : '#0891b2'
        };
    };

    // Get gradient backgrounds based on theme
    const getGradients = () => {
        const isDark = actualTheme === 'dark';

        return {
            page: isDark
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
                : 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #f0f9ff 100%)',

            card: isDark
                ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',

            weather: {
                sunny: isDark
                    ? 'linear-gradient(135deg, #451a03 0%, #92400e 100%)'
                    : 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
                cloudy: isDark
                    ? 'linear-gradient(135deg, #374151 0%, #6b7280 100%)'
                    : 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)',
                rainy: isDark
                    ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                    : 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
                stormy: isDark
                    ? 'linear-gradient(135deg, #581c87 0%, #8b5cf6 100%)'
                    : 'linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)',
                snowy: isDark
                    ? 'linear-gradient(135deg, #4b5563 0%, #9ca3af 100%)'
                    : 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)'
            }
        };
    };

    // Get theme-specific animation preferences
    const getAnimationSettings = () => {
        return {
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            duration: {
                fast: '150ms',
                normal: '300ms',
                slow: '500ms'
            },
            easing: {
                ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
                easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
                easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
                easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }
        };
    };

    const value = {
        theme,
        actualTheme,
        changeTheme,
        toggleTheme,
        getThemeColors,
        getGradients,
        getAnimationSettings,
        isDark: actualTheme === 'dark',
        isLight: actualTheme === 'light',
        isSystem: theme === 'system'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use theme
export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
};

// Hook for theme-aware styling
export const useThemeStyles = () => {
    const { actualTheme, getThemeColors, getGradients } = useTheme();

    const colors = getThemeColors();
    const gradients = getGradients();

    // Common style objects
    const styles = {
        // Card styles
        card: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.textPrimary,
            boxShadow: actualTheme === 'dark'
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
                : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        },

        // Button styles
        button: {
            primary: {
                backgroundColor: colors.primary,
                color: colors.background,
                borderColor: colors.primary
            },
            secondary: {
                backgroundColor: colors.backgroundSecondary,
                color: colors.textPrimary,
                borderColor: colors.border
            }
        },

        // Input styles
        input: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.textPrimary,
            '&:focus': {
                borderColor: colors.primary,
                boxShadow: `0 0 0 3px ${colors.primary}20`
            }
        },

        // Weather card styles based on condition
        weatherCard: (condition) => ({
            background: gradients.weather[condition] || gradients.card,
            color: colors.textPrimary,
            borderColor: colors.border
        })
    };

    return { colors, gradients, styles };
};

// Hook for theme-aware class names (for Tailwind CSS)
export const useThemeClasses = () => {
    const { actualTheme } = useTheme();

    const getClasses = (lightClasses, darkClasses) => {
        return actualTheme === 'dark' ? darkClasses : lightClasses;
    };

    const baseClasses = {
        // Background classes
        bg: {
            primary: getClasses('bg-white', 'bg-gray-800'),
            secondary: getClasses('bg-gray-50', 'bg-gray-700'),
            tertiary: getClasses('bg-gray-100', 'bg-gray-600')
        },

        // Text classes
        text: {
            primary: getClasses('text-gray-900', 'text-white'),
            secondary: getClasses('text-gray-700', 'text-gray-300'),
            tertiary: getClasses('text-gray-500', 'text-gray-400')
        },

        // Border classes
        border: {
            primary: getClasses('border-gray-200', 'border-gray-700'),
            secondary: getClasses('border-gray-300', 'border-gray-600')
        },

        // Button classes
        button: {
            primary: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500',
            secondary: getClasses(
                'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300',
                'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
            )
        }
    };

    return { getClasses, ...baseClasses };
};

// Hook for media query based theme detection
export const useSystemTheme = () => {
    const [systemTheme, setSystemTheme] = useState('light');

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateSystemTheme = () => {
            setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
        };

        updateSystemTheme();
        mediaQuery.addEventListener('change', updateSystemTheme);

        return () => mediaQuery.removeEventListener('change', updateSystemTheme);
    }, []);

    return systemTheme;
};

// Hook for theme persistence
export const useThemePersistence = () => {
    const { theme, changeTheme } = useTheme();

    const saveTheme = (newTheme) => {
        changeTheme(newTheme);

        // Also save to user preferences if logged in
        const userId = localStorage.getItem('userId');
        if (userId) {
            // In a real app, you'd save to your backend
            localStorage.setItem(`user-${userId}-theme`, newTheme);
        }
    };

    const loadUserTheme = (userId) => {
        const userTheme = localStorage.getItem(`user-${userId}-theme`);
        if (userTheme) {
            changeTheme(userTheme);
        }
    };

    return { saveTheme, loadUserTheme };
};

// Hook for theme-aware weather condition styling
export const useWeatherTheme = () => {
    const { actualTheme, getThemeColors } = useTheme();
    const colors = getThemeColors();

    const getWeatherStyles = (condition, temperature) => {
        const baseCondition = condition.toLowerCase();

        let conditionStyle = {};

        if (baseCondition.includes('clear') || baseCondition.includes('sunny')) {
            conditionStyle = {
                background: actualTheme === 'dark'
                    ? 'linear-gradient(135deg, #451a03 0%, #92400e 100%)'
                    : 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
                color: actualTheme === 'dark' ? '#fcd34d' : '#92400e'
            };
        } else if (baseCondition.includes('cloud')) {
            conditionStyle = {
                background: actualTheme === 'dark'
                    ? 'linear-gradient(135deg, #374151 0%, #6b7280 100%)'
                    : 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)',
                color: actualTheme === 'dark' ? '#d1d5db' : '#374151'
            };
        } else if (baseCondition.includes('rain') || baseCondition.includes('drizzle')) {
            conditionStyle = {
                background: actualTheme === 'dark'
                    ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                    : 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
                color: actualTheme === 'dark' ? '#93c5fd' : '#1e3a8a'
            };
        } else if (baseCondition.includes('storm') || baseCondition.includes('thunder')) {
            conditionStyle = {
                background: actualTheme === 'dark'
                    ? 'linear-gradient(135deg, #581c87 0%, #8b5cf6 100%)'
                    : 'linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)',
                color: actualTheme === 'dark' ? '#c4b5fd' : '#581c87'
            };
        } else if (baseCondition.includes('snow')) {
            conditionStyle = {
                background: actualTheme === 'dark'
                    ? 'linear-gradient(135deg, #4b5563 0%, #9ca3af 100%)'
                    : 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
                color: actualTheme === 'dark' ? '#e5e7eb' : '#4b5563'
            };
        }

        // Temperature-based color adjustments
        if (temperature !== undefined) {
            if (temperature > 30) {
                conditionStyle.background = actualTheme === 'dark'
                    ? 'linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #fecaca 0%, #f87171 100%)';
            } else if (temperature < 0) {
                conditionStyle.background = actualTheme === 'dark'
                    ? 'linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)'
                    : 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)';
            }
        }

        return conditionStyle;
    };

    const getTemperatureColor = (temp) => {
        if (temp >= 35) return colors.error;
        if (temp >= 25) return colors.warning;
        if (temp >= 15) return colors.success;
        if (temp >= 0) return colors.info;
        return colors.primary;
    };

    return { getWeatherStyles, getTemperatureColor };
};

export default useTheme;