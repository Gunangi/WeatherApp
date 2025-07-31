import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state for user preferences
const initialUserState = {
    // Theme preferences
    theme: 'light', // 'light', 'dark', 'auto'

    // Unit preferences
    temperatureUnit: 'celsius', // 'celsius', 'fahrenheit'
    windSpeedUnit: 'ms', // 'ms', 'kmh', 'mph'
    pressureUnit: 'hpa', // 'hpa', 'mmhg', 'inHg'
    visibilityUnit: 'km', // 'km', 'mi'

    // Notification preferences
    notifications: {
        enabled: false,
        weatherAlerts: true,
        rainAlerts: true,
        temperatureThresholds: false,
        dailyForecast: false,
        uvIndexAlerts: false
    },

    // Temperature thresholds for notifications
    temperatureThresholds: {
        high: 35, // Celsius
        low: 5,   // Celsius
        enabled: false
    },

    // Display preferences
    displayPreferences: {
        show24HourTime: false,
        showFeelsLike: true,
        showWindDirection: true,
        showHumidity: true,
        showPressure: true,
        showVisibility: true,
        showUvIndex: true,
        showSunriseSunset: true,
        detailedForecast: true,
        animatedWeatherIcons: true
    },

    // Dashboard widget preferences
    widgets: {
        currentWeather: { enabled: true, order: 1 },
        forecast: { enabled: true, order: 2 },
        airQuality: { enabled: true, order: 3 },
        uvIndex: { enabled: true, order: 4 },
        weatherAlerts: { enabled: true, order: 5 },
        activitySuggestions: { enabled: false, order: 6 },
        clothingSuggestions: { enabled: false, order: 7 },
        weatherComparison: { enabled: false, order: 8 }
    },

    // Location preferences
    locationPreferences: {
        useCurrentLocation: true,
        autoRefresh: true,
        refreshInterval: 30, // minutes
        defaultLocation: null
    },

    // Privacy settings
    privacy: {
        shareLocation: true,
        saveSearchHistory: true,
        analytics: false
    },

    // User profile (if authenticated)
    profile: {
        isAuthenticated: false,
        userId: null,
        email: null,
        name: null
    },

    // App preferences
    appPreferences: {
        language: 'en',
        startupScreen: 'weather', // 'weather', 'forecast', 'dashboard'
        cacheExpiry: 10, // minutes
        offlineMode: true
    }
};

// Action types
const USER_ACTIONS = {
    SET_THEME: 'SET_THEME',
    SET_TEMPERATURE_UNIT: 'SET_TEMPERATURE_UNIT',
    SET_WIND_SPEED_UNIT: 'SET_WIND_SPEED_UNIT',
    SET_PRESSURE_UNIT: 'SET_PRESSURE_UNIT',
    SET_VISIBILITY_UNIT: 'SET_VISIBILITY_UNIT',
    UPDATE_NOTIFICATIONS: 'UPDATE_NOTIFICATIONS',
    UPDATE_TEMPERATURE_THRESHOLDS: 'UPDATE_TEMPERATURE_THRESHOLDS',
    UPDATE_DISPLAY_PREFERENCES: 'UPDATE_DISPLAY_PREFERENCES',
    UPDATE_WIDGETS: 'UPDATE_WIDGETS',
    REORDER_WIDGETS: 'REORDER_WIDGETS',
    UPDATE_LOCATION_PREFERENCES: 'UPDATE_LOCATION_PREFERENCES',
    UPDATE_PRIVACY_SETTINGS: 'UPDATE_PRIVACY_SETTINGS',
    SET_USER_PROFILE: 'SET_USER_PROFILE',
    LOGOUT_USER: 'LOGOUT_USER',
    UPDATE_APP_PREFERENCES: 'UPDATE_APP_PREFERENCES',
    RESET_TO_DEFAULTS: 'RESET_TO_DEFAULTS',
    IMPORT_SETTINGS: 'IMPORT_SETTINGS'
};

// User preferences reducer
const userReducer = (state, action) => {
    switch (action.type) {
        case USER_ACTIONS.SET_THEME:
            return {
                ...state,
                theme: action.payload
            };

        case USER_ACTIONS.SET_TEMPERATURE_UNIT:
            return {
                ...state,
                temperatureUnit: action.payload
            };

        case USER_ACTIONS.SET_WIND_SPEED_UNIT:
            return {
                ...state,
                windSpeedUnit: action.payload
            };

        case USER_ACTIONS.SET_PRESSURE_UNIT:
            return {
                ...state,
                pressureUnit: action.payload
            };

        case USER_ACTIONS.SET_VISIBILITY_UNIT:
            return {
                ...state,
                visibilityUnit: action.payload
            };

        case USER_ACTIONS.UPDATE_NOTIFICATIONS:
            return {
                ...state,
                notifications: {
                    ...state.notifications,
                    ...action.payload
                }
            };

        case USER_ACTIONS.UPDATE_TEMPERATURE_THRESHOLDS:
            return {
                ...state,
                temperatureThresholds: {
                    ...state.temperatureThresholds,
                    ...action.payload
                }
            };

        case USER_ACTIONS.UPDATE_DISPLAY_PREFERENCES:
            return {
                ...state,
                displayPreferences: {
                    ...state.displayPreferences,
                    ...action.payload
                }
            };

        case USER_ACTIONS.UPDATE_WIDGETS:
            return {
                ...state,
                widgets: {
                    ...state.widgets,
                    [action.payload.widgetId]: {
                        ...state.widgets[action.payload.widgetId],
                        ...action.payload.updates
                    }
                }
            };

        case USER_ACTIONS.REORDER_WIDGETS:
            const reorderedWidgets = { ...state.widgets };
            action.payload.forEach((widget, index) => {
                if (reorderedWidgets[widget.id]) {
                    reorderedWidgets[widget.id].order = index + 1;
                }
            });
            return {
                ...state,
                widgets: reorderedWidgets
            };

        case USER_ACTIONS.UPDATE_LOCATION_PREFERENCES:
            return {
                ...state,
                locationPreferences: {
                    ...state.locationPreferences,
                    ...action.payload
                }
            };

        case USER_ACTIONS.UPDATE_PRIVACY_SETTINGS:
            return {
                ...state,
                privacy: {
                    ...state.privacy,
                    ...action.payload
                }
            };

        case USER_ACTIONS.SET_USER_PROFILE:
            return {
                ...state,
                profile: {
                    ...state.profile,
                    ...action.payload,
                    isAuthenticated: true
                }
            };

        case USER_ACTIONS.LOGOUT_USER:
            return {
                ...state,
                profile: {
                    isAuthenticated: false,
                    userId: null,
                    email: null,
                    name: null
                }
            };

        case USER_ACTIONS.UPDATE_APP_PREFERENCES:
            return {
                ...state,
                appPreferences: {
                    ...state.appPreferences,
                    ...action.payload
                }
            };

        case USER_ACTIONS.RESET_TO_DEFAULTS:
            return {
                ...initialUserState,
                profile: state.profile // Keep authentication state
            };

        case USER_ACTIONS.IMPORT_SETTINGS:
            return {
                ...state,
                ...action.payload,
                profile: state.profile // Don't override authentication
            };

        default:
            return state;
    }
};

// Create User Context
const UserContext = createContext();

// User Provider Component
export const UserProvider = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, initialUserState);

    // Load user preferences from localStorage on mount
    useEffect(() => {
        try {
            const savedPreferences = localStorage.getItem('weatherApp_userPreferences');
            if (savedPreferences) {
                const preferences = JSON.parse(savedPreferences);
                dispatch({
                    type: USER_ACTIONS.IMPORT_SETTINGS,
                    payload: preferences
                });
            }
        } catch (error) {
            console.error('Error loading user preferences:', error);
        }
    }, []);

    // Save preferences to localStorage whenever state changes
    useEffect(() => {
        try {
            // Don't save profile data to localStorage for security
            const { profile, ...preferencesToSave } = state;
            localStorage.setItem('weatherApp_userPreferences', JSON.stringify(preferencesToSave));
        } catch (error) {
            console.error('Error saving user preferences:', error);
        }
    }, [state]);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        if (state.theme === 'dark') {
            root.classList.add('dark');
        } else if (state.theme === 'light') {
            root.classList.remove('dark');
        } else if (state.theme === 'auto') {
            // Auto theme based on system preference
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const updateTheme = (e) => {
                if (e.matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            };

            updateTheme(mediaQuery);
            mediaQuery.addEventListener('change', updateTheme);

            return () => mediaQuery.removeEventListener('change', updateTheme);
        }
    }, [state.theme]);

    // Context value with state and action dispatchers
    const contextValue = {
        // State
        ...state,

        // Theme actions
        setTheme: (theme) => dispatch({ type: USER_ACTIONS.SET_THEME, payload: theme }),

        // Unit preference actions
        setTemperatureUnit: (unit) => dispatch({ type: USER_ACTIONS.SET_TEMPERATURE_UNIT, payload: unit }),
        setWindSpeedUnit: (unit) => dispatch({ type: USER_ACTIONS.SET_WIND_SPEED_UNIT, payload: unit }),
        setPressureUnit: (unit) => dispatch({ type: USER_ACTIONS.SET_PRESSURE_UNIT, payload: unit }),
        setVisibilityUnit: (unit) => dispatch({ type: USER_ACTIONS.SET_VISIBILITY_UNIT, payload: unit }),

        // Notification actions
        updateNotifications: (settings) => dispatch({ type: USER_ACTIONS.UPDATE_NOTIFICATIONS, payload: settings }),
        updateTemperatureThresholds: (thresholds) => dispatch({ type: USER_ACTIONS.UPDATE_TEMPERATURE_THRESHOLDS, payload: thresholds }),

        // Display preference actions
        updateDisplayPreferences: (preferences) => dispatch({ type: USER_ACTIONS.UPDATE_DISPLAY_PREFERENCES, payload: preferences }),

        // Widget actions
        updateWidget: (widgetId, updates) => dispatch({
            type: USER_ACTIONS.UPDATE_WIDGETS,
            payload: { widgetId, updates }
        }),
        reorderWidgets: (widgets) => dispatch({ type: USER_ACTIONS.REORDER_WIDGETS, payload: widgets }),

        // Location preference actions
        updateLocationPreferences: (preferences) => dispatch({ type: USER_ACTIONS.UPDATE_LOCATION_PREFERENCES, payload: preferences }),

        // Privacy actions
        updatePrivacySettings: (settings) => dispatch({ type: USER_ACTIONS.UPDATE_PRIVACY_SETTINGS, payload: settings }),

        // User profile actions
        setUserProfile: (profile) => dispatch({ type: USER_ACTIONS.SET_USER_PROFILE, payload: profile }),
        logoutUser: () => dispatch({ type: USER_ACTIONS.LOGOUT_USER }),

        // App preference actions
        updateAppPreferences: (preferences) => dispatch({ type: USER_ACTIONS.UPDATE_APP_PREFERENCES, payload: preferences }),

        // Utility actions
        resetToDefaults: () => dispatch({ type: USER_ACTIONS.RESET_TO_DEFAULTS }),
        importSettings: (settings) => dispatch({ type: USER_ACTIONS.IMPORT_SETTINGS, payload: settings }),

        // Utility functions
        getEnabledWidgets: () => {
            return Object.entries(state.widgets)
                .filter(([_, widget]) => widget.enabled)
                .sort(([_, a], [__, b]) => a.order - b.order)
                .map(([id, widget]) => ({ id, ...widget }));
        },

        exportSettings: () => {
            const { profile, ...exportableSettings } = state;
            return JSON.stringify(exportableSettings, null, 2);
        },

        isDarkMode: () => {
            if (state.theme === 'dark') return true;
            if (state.theme === 'light') return false;
            // Auto mode - check system preference
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use user context
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};

export default UserContext;