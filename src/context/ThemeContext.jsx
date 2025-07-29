import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme types
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
};

// Initial state
const initialState = {
    theme: THEMES.AUTO,
    effectiveTheme: THEMES.LIGHT, // The actual theme being applied
    themes: THEMES
};

// Context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(THEMES.AUTO);
    const [effectiveTheme, setEffectiveTheme] = useState(THEMES.LIGHT);

    // Check system preference
    const getSystemTheme = () => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
                ? THEMES.DARK
                : THEMES.LIGHT;
        }
        return THEMES.LIGHT;
    };

    // Update effective theme based on current theme setting
    const updateEffectiveTheme = (currentTheme) => {
        let newEffectiveTheme;

        if (currentTheme === THEMES.AUTO) {
            newEffectiveTheme = getSystemTheme();
        } else {
            newEffectiveTheme = currentTheme;
        }

        setEffectiveTheme(newEffectiveTheme);

        // Update document class
        if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(newEffectiveTheme);

            // Update meta theme-color
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute(
                    'content',
                    newEffectiveTheme === THEMES.DARK ? '#1F2937' : '#FFFFFF'
                );
            }
        }
    };

    // Load saved theme on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
            setTheme(savedTheme);
            updateEffectiveTheme(savedTheme);
        } else {
            updateEffectiveTheme(THEMES.AUTO);
        }
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (theme === THEMES.AUTO) {
                updateEffectiveTheme(THEMES.AUTO);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Update effective theme when theme changes
    useEffect(() => {
        updateEffectiveTheme(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Toggle between light and dark (skip auto)
    const toggleTheme = () => {
        setTheme(prev => {
            if (prev === THEMES.LIGHT) return THEMES.DARK;
            if (prev === THEMES.DARK) return THEMES.LIGHT;
            // If auto, go to opposite of current effective theme
            return effectiveTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        });
    };

    // Set specific theme
    const setSpecificTheme = (newTheme) => {
        if (Object.values(THEMES).includes(newTheme)) {
            setTheme(newTheme);
        }
    };

    // Get theme-aware colors
    const getThemeColors = () => {
        const isDark = effectiveTheme === THEMES.DARK;

        return {
            // Background colors
            bg: {
                primary: isDark ? '#111827' : '#FFFFFF',
                secondary: isDark ? '#1F2937' : '#F9FAFB',
                tertiary: isDark ? '#374151' : '#F3F4F6'
            },

            // Text colors
            text: {
                primary: isDark ? '#F9FAFB' : '#111827',
                secondary: isDark ? '#D1D5DB' : '#6B7280',
                tertiary: isDark ? '#9CA3AF' : '#9CA3AF'
            },

            // Border colors
            border: {
                primary: isDark ? '#374151' : '#E5E7EB',
                secondary: isDark ? '#4B5563' : '#D1D5DB'
            },

            // Accent colors
            accent: {
                blue: isDark ? '#3B82F6' : '#2563EB',
                green: isDark ? '#10B981' : '#059669',
                red: isDark ? '#EF4444' : '#DC2626',
                yellow: isDark ? '#F59E0B' : '#D97706',
                purple: isDark ? '#8B5CF6' : '#7C3AED'
            },

            // Glass effect
            glass: isDark
                ? 'rgba(31, 41, 55, 0.8)'
                : 'rgba(255, 255, 255, 0.8)'
        };
    };

    // Get CSS custom properties
    const getCSSProperties = () => {
        const colors = getThemeColors();
        const isDark = effectiveTheme === THEMES.DARK;

        return {
            '--color-bg-primary': colors.bg.primary,
            '--color-bg-secondary': colors.bg.secondary,
            '--color-bg-tertiary': colors.bg.tertiary,
            '--color-text-primary': colors.text.primary,
            '--color-text-secondary': colors.text.secondary,
            '--color-text-tertiary': colors.text.tertiary,
            '--color-border-primary': colors.border.primary,
            '--color-border-secondary': colors.border.secondary,
            '--color-glass': colors.glass,
            '--theme-transition': 'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease',
            '--glass-backdrop': isDark
                ? 'blur(10px) saturate(180%)'
                : 'blur(10px) saturate(180%)'
        };
    };

    // Apply CSS properties to document
    useEffect(() => {
        const properties = getCSSProperties();
        const root = document.documentElement;

        Object.entries(properties).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }, [effectiveTheme]);

    const value = {
        theme,
        effectiveTheme,
        themes: THEMES,
        isDark: effectiveTheme === THEMES.DARK,
        isLight: effectiveTheme === THEMES.LIGHT,
        isAuto: theme === THEMES.AUTO,
        toggleTheme,
        setTheme: setSpecificTheme,
        getThemeColors,
        getCSSProperties
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;