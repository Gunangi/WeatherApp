import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getTheme, saveTheme } from '../utils/localStorage';

// Theme types
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
};

// Color schemes
export const COLOR_SCHEMES = {
    DEFAULT: 'default',
    BLUE: 'blue',
    GREEN: 'green',
    PURPLE: 'purple',
    ORANGE: 'orange'
};

// Initial state
const initialState = {
    theme: THEMES.LIGHT,
    colorScheme: COLOR_SCHEMES.DEFAULT,
    systemTheme: THEMES.LIGHT,
    isAutoTheme: false,
    preferences: {
        animationsEnabled: true,
        reducedMotion: false,
        highContrast: false,
        glassEffect: true,
        backgroundBlur: true,
        customColors: {
            primary: null,
            secondary: null,
            accent: null
        }
    },
    isLoading: true
};

// Action types
const THEME_ACTIONS = {
    SET_THEME: 'SET_THEME',
    SET_COLOR_SCHEME: 'SET_COLOR_SCHEME',
    SET_SYSTEM_THEME: 'SET_SYSTEM_THEME',
    TOGGLE_THEME: 'TOGGLE_THEME',
    SET_PREFERENCES: 'SET_PREFERENCES',
    UPDATE_PREFERENCE: 'UPDATE_PREFERENCE',
    SET_CUSTOM_COLOR: 'SET_CUSTOM_COLOR',
    RESET_THEME: 'RESET_THEME',
    SET_LOADING: 'SET_LOADING'
};

// Theme reducer
const themeReducer = (state, action) => {
    switch (action.type) {
        case THEME_ACTIONS.SET_THEME:
            return {
                ...state,
                theme: action.payload,
                isAutoTheme: action.payload === THEMES.AUTO
            };

        case THEME_ACTIONS.SET_COLOR_SCHEME:
            return {
                ...state,
                colorScheme: action.payload
            };

        case THEME_ACTIONS.SET_SYSTEM_THEME:
            return {
                ...state,
                systemTheme: action.payload
            };

        case THEME_ACTIONS.TOGGLE_THEME:
            const newTheme = state.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
            return {
                ...state,
                theme: newTheme,
                isAutoTheme: false
            };

        case THEME_ACTIONS.SET_PREFERENCES:
            return {
                ...state,
                preferences: {
                    ...state.preferences,
                    ...action.payload
                }
            };

        case THEME_ACTIONS.UPDATE_PREFERENCE:
            return {
                ...state,
                preferences: {
                    ...state.preferences,
                    [action.payload.key]: action.payload.value
                }
            };

        case THEME_ACTIONS.SET_CUSTOM_COLOR:
            return {
                ...state,
                preferences: {
                    ...state.preferences,
                    customColors: {
                        ...state.preferences.customColors,
                        [action.payload.color]: action.payload.value
                    }
                }
            };

        case THEME_ACTIONS.RESET_THEME:
            return {
                ...initialState,
                isLoading: false
            };

        case THEME_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };

        default:
            return state;
    }
};

// Create contexts
const ThemeContext = createContext();
const ThemeDispatchContext = createContext();

// Theme Provider component
export const ThemeProvider = ({ children }) => {
    const [state, dispatch] = useReducer(themeReducer, initialState);

    // Get effective theme (considering auto mode)
    const getEffectiveTheme = () => {
        if (state.theme === THEMES.AUTO) {
            return state.systemTheme;
        }
        return state.theme;
    };

    // Detect system theme preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemThemeChange = (e) => {
            dispatch({
                type: THEME_ACTIONS.SET_SYSTEM_THEME,
                payload: e.matches ? THEMES.DARK : THEMES.LIGHT
            });
        };

        // Set initial system theme
        dispatch({
            type: THEME_ACTIONS.SET_SYSTEM_THEME,
            payload: mediaQuery.matches ? THEMES.DARK : THEMES.LIGHT
        });

        // Listen for system theme changes
        mediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, []);

    // Detect reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        const handleReducedMotionChange = (e) => {
            dispatch({
                type: THEME_ACTIONS.UPDATE_PREFERENCE,
                payload: {
                    key: 'reducedMotion',
                    value: e.matches
                }
            });
        };

        // Set initial reduced motion preference
        dispatch({
            type: THEME_ACTIONS.UPDATE_PREFERENCE,
            payload: {
                key: 'reducedMotion',
                value: mediaQuery.matches
            }
        });

        mediaQuery.addEventListener('change', handleReducedMotionChange);

        return () => {
            mediaQuery.removeEventListener('change', handleReducedMotionChange);
        };
    }, []);

    // Load saved theme preferences
    useEffect(() => {
        const loadThemePreferences = async () => {
            try {
                const savedTheme = getTheme();

                if (savedTheme && typeof savedTheme === 'object') {
                    // Load full theme configuration
                    dispatch({
                        type: THEME_ACTIONS.SET_THEME,
                        payload: savedTheme.theme || THEMES.LIGHT
                    });

                    dispatch({
                        type: THEME_ACTIONS.SET_COLOR_SCHEME,
                        payload: savedTheme.colorScheme || COLOR_SCHEMES.DEFAULT
                    });

                    if (savedTheme.preferences) {
                        dispatch({
                            type: THEME_ACTIONS.SET_PREFERENCES,
                            payload: savedTheme.preferences
                        });
                    }
                } else if (typeof savedTheme === 'string') {
                    // Legacy theme format
                    dispatch({
                        type: THEME_ACTIONS.SET_THEME,
                        payload: savedTheme
                    });
                }
            } catch (error) {
                console.error('Failed to load theme preferences:', error);
            } finally {
                dispatch({
                    type: THEME_ACTIONS.SET_LOADING,
                    payload: false
                });
            }
        };

        loadThemePreferences();
    }, []);

    // Save theme preferences when state changes
    useEffect(() => {
        if (!state.isLoading) {
            const themeData = {
                theme: state.theme,
                colorScheme: state.colorScheme,
                preferences: state.preferences,
                timestamp: Date.now()
            };

            saveTheme(themeData);
        }
    }, [state.theme, state.colorScheme, state.preferences, state.isLoading]);

    // Apply theme to document
    useEffect(() => {
        const effectiveTheme = getEffectiveTheme();

        // Update document class
        document.documentElement.className = '';
        document.documentElement.classList.add(`theme-${effectiveTheme}`);
        document.documentElement.classList.add(`color-scheme-${state.colorScheme}`);

        // Add preference classes
        if (state.preferences.reducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        }

        if (state.preferences.highContrast) {
            document.documentElement.classList.add('high-contrast');
        }

        if (!state.preferences.glassEffect) {
            document.documentElement.classList.add('no-glass-effect');
        }

        if (!state.preferences.backgroundBlur) {
            document.documentElement.classList.add('no-background-blur');
        }

        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        const themeColor = effectiveTheme === THEMES.DARK ? '#1a1a1a' : '#ffffff';

        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', themeColor);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = themeColor;
            document.head.appendChild(meta);
        }

        // Apply custom colors if set
        if (state.preferences.customColors.primary) {
            document.documentElement.style.setProperty('--color-primary', state.preferences.customColors.primary);
        }

        if (state.preferences.customColors.secondary) {
            document.documentElement.style.setProperty('--color-secondary', state.preferences.customColors.secondary);
        }

        if (state.preferences.customColors.accent) {
            document.documentElement.style.setProperty('--color-accent', state.preferences.customColors.accent);
        }
    }, [state.theme, state.colorScheme, state.systemTheme, state.preferences]);

    // Theme action creators
    const setTheme = (theme) => {
        dispatch({
            type: THEME_ACTIONS.SET_THEME,
            payload: theme
        });
    };

    const setColorScheme = (scheme) => {
        dispatch({
            type: THEME_ACTIONS.SET_COLOR_SCHEME,
            payload: scheme
        });
    };

    const toggleTheme = () => {
        dispatch({
            type: THEME_ACTIONS.TOGGLE_THEME
        });
    };

    const updatePreference = (key, value) => {
        dispatch({
            type: THEME_ACTIONS.UPDATE_PREFERENCE,
            payload: { key, value }
        });
    };

    const setCustomColor = (color, value) => {
        dispatch({
            type: THEME_ACTIONS.SET_CUSTOM_COLOR,
            payload: { color, value }
        });
    };

    const resetTheme = () => {
        dispatch({
            type: THEME_ACTIONS.RESET_THEME
        });
    };

    // Theme utilities
    const isDarkTheme = () => getEffectiveTheme() === THEMES.DARK;
    const isLightTheme = () => getEffectiveTheme() === THEMES.LIGHT;
    const isAutoTheme = () => state.theme === THEMES.AUTO;

    const getThemeColors = () => {
        const effectiveTheme = getEffectiveTheme();
        const baseColors = {
            [THEMES.LIGHT]: {
                background: '#ffffff',
                surface: '#f8fafc',
                text: '#1a202c',
                textSecondary: '#4a5568',
                border: '#e2e8f0',
                shadow: 'rgba(0, 0, 0, 0.1)'
            },
            [THEMES.DARK]: {
                background: '#1a202c',
                surface: '#2d3748',
                text: '#f7fafc',
                textSecondary: '#cbd5e0',
                border: '#4a5568',
                shadow: 'rgba(0, 0, 0, 0.3)'
            }
        };

        return baseColors[effectiveTheme];
    };

    const contextValue = {
        ...state,
        effectiveTheme: getEffectiveTheme(),
        isDarkTheme: isDarkTheme(),
        isLightTheme: isLightTheme(),
        isAutoTheme: isAutoTheme(),
        colors: getThemeColors(),
        setTheme,
        setColorScheme,
        toggleTheme,
        updatePreference,
        setCustomColor,
        resetTheme
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            <ThemeDispatchContext.Provider value={dispatch}>
                {children}
            </ThemeDispatchContext.Provider>
        </ThemeContext.Provider>
    );
};

// Custom hooks
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const useThemeDispatch = () => {
    const context = useContext(ThemeDispatchContext);
    if (!context) {
        throw new Error('useThemeDispatch must be used within a ThemeProvider');
    }
    return context;
};

// Theme utilities for external use
export const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
    }
    return THEMES.LIGHT;
};

export const createThemeCSS = (theme, colorScheme = COLOR_SCHEMES.DEFAULT) => {
    const schemes = {
        [COLOR_SCHEMES.DEFAULT]: {
            primary: theme === THEMES.DARK ? '#60a5fa' : '#3b82f6',
            primaryHover: theme === THEMES.DARK ? '#93c5fd' : '#2563eb',
            secondary: theme === THEMES.DARK ? '#f59e0b' : '#f59e0b',
            accent: theme === THEMES.DARK ? '#10b981' : '#059669'
        },
        [COLOR_SCHEMES.BLUE]: {
            primary: theme === THEMES.DARK ? '#60a5fa' : '#3b82f6',
            primaryHover: theme === THEMES.DARK ? '#93c5fd' : '#2563eb',
            secondary: theme === THEMES.DARK ? '#38bdf8' : '#0ea5e9',
            accent: theme === THEMES.DARK ? '#06b6d4' : '#0891b2'
        },
        [COLOR_SCHEMES.GREEN]: {
            primary: theme === THEMES.DARK ? '#4ade80' : '#22c55e',
            primaryHover: theme === THEMES.DARK ? '#86efac' : '#16a34a',
            secondary: theme === THEMES.DARK ? '#10b981' : '#059669',
            accent: theme === THEMES.DARK ? '#34d399' : '#047857'
        },
        [COLOR_SCHEMES.PURPLE]: {
            primary: theme === THEMES.DARK ? '#a78bfa' : '#8b5cf6',
            primaryHover: theme === THEMES.DARK ? '#c4b5fd' : '#7c3aed',
            secondary: theme === THEMES.DARK ? '#f472b6' : '#ec4899',
            accent: theme === THEMES.DARK ? '#e879f9' : '#d946ef'
        },
        [COLOR_SCHEMES.ORANGE]: {
            primary: theme === THEMES.DARK ? '#fb923c' : '#f97316',
            primaryHover: theme === THEMES.DARK ? '#fdba74' : '#ea580c',
            secondary: theme === THEMES.DARK ? '#fbbf24' : '#f59e0b',
            accent: theme === THEMES.DARK ? '#f87171' : '#ef4444'
        }
    };

    return schemes[colorScheme] || schemes[COLOR_SCHEMES.DEFAULT];
};

export default ThemeContext;