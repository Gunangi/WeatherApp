import React, { createContext, useContext, useState, useEffect, useReducer } from 'react';

// Initial state
const initialState = {
    notifications: [],
    settings: {
        browser: true,
        email: false,
        sms: false,
        sound: true,
        weatherAlerts: true,
        customAlerts: true,
        airQualityAlerts: true
    },
    permission: 'default', // 'default', 'granted', 'denied'
    isLoading: false,
    error: null
};

// Action types
const NOTIFICATION_ACTIONS = {
    ADD_NOTIFICATION: 'ADD_NOTIFICATION',
    REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
    MARK_AS_READ: 'MARK_AS_READ',
    MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
    UPDATE_SETTINGS: 'UPDATE_SETTINGS',
    SET_PERMISSION: 'SET_PERMISSION',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const notificationReducer = (state, action) => {
    switch (action.type) {
        case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
            return {
                ...state,
                notifications: [action.payload, ...state.notifications]
            };

        case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload)
            };

        case NOTIFICATION_ACTIONS.MARK_AS_READ:
            return {
                ...state,
                notifications: state.notifications.map(n =>
                    n.id === action.payload ? { ...n, read: true } : n
                )
            };

        case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
            return {
                ...state,
                notifications: state.notifications.map(n => ({ ...n, read: true }))
            };

        case NOTIFICATION_ACTIONS.UPDATE_SETTINGS:
            return {
                ...state,
                settings: { ...state.settings, ...action.payload }
            };

        case NOTIFICATION_ACTIONS.SET_PERMISSION:
            return {
                ...state,
                permission: action.payload
            };

        case NOTIFICATION_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };

        case NOTIFICATION_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };

        case NOTIFICATION_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
};

// Create context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
    const [state, dispatch] = useReducer(notificationReducer, initialState);

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('notification_settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                dispatch({
                    type: NOTIFICATION_ACTIONS.UPDATE_SETTINGS,
                    payload: settings
                });
            } catch (error) {
                console.error('Failed to load notification settings:', error);
            }
        }

        // Check current notification permission
        if ('Notification' in window) {
            dispatch({
                type: NOTIFICATION_ACTIONS.SET_PERMISSION,
                payload: Notification.permission
            });
        }
    }, []);

    // Save settings to localStorage when they change
    useEffect(() => {
        localStorage.setItem('notification_settings', JSON.stringify(state.settings));
    }, [state.settings]);

    // Request notification permission
    const requestPermission = async () => {
        if (!('Notification' in window)) {
            dispatch({
                type: NOTIFICATION_ACTIONS.SET_ERROR,
                payload: 'This browser does not support notifications'
            });
            return false;
        }

        dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });

        try {
            const permission = await Notification.requestPermission();
            dispatch({
                type: NOTIFICATION_ACTIONS.SET_PERMISSION,
                payload: permission
            });
            dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: false });
            return permission === 'granted';
        } catch (error) {
            dispatch({
                type: NOTIFICATION_ACTIONS.SET_ERROR,
                payload: 'Failed to request notification permission'
            });
            return false;
        }
    };

    // Show browser notification
    const showBrowserNotification = (title, options = {}) => {
        if (!state.settings.browser || state.permission !== 'granted') {
            return null;
        }

        try {
            const notification = new Notification(title, {
                icon: '/weather-icon.png',
                badge: '/weather-badge.png',
                ...options
            });

            // Play sound if enabled
            if (state.settings.sound) {
                const audio = new Audio('/notification-sound.mp3');
                audio.play().catch(() => {
                    // Ignore audio play errors
                });
            }

            return notification;
        } catch (error) {
            console.error('Failed to show notification:', error);
            return null;
        }
    };

    // Add notification to state
    const addNotification = (notification) => {
        const newNotification = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };

        dispatch({
            type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
            payload: newNotification
        });

        // Show browser notification if enabled
        if (state.settings.browser) {
            showBrowserNotification(notification.title, {
                body: notification.message,
                tag: notification.type,
                data: newNotification
            });
        }

        return newNotification.id;
    };

    // Create weather alert notification
    const createWeatherAlert = (alertData) => {
        if (!state.settings.weatherAlerts) return;

        const notification = {
            type: 'weather_alert',
            title: `Weather Alert - ${alertData.location}`,
            message: alertData.description,
            severity: alertData.severity,
            location: alertData.location,
            data: alertData
        };

        return addNotification(notification);
    };

    // Create custom alert notification
    const createCustomAlert = (alertData) => {
        if (!state.settings.customAlerts) return;

        const notification = {
            type: 'custom_alert',
            title: 'Custom Weather Alert',
            message: alertData.message,
            data: alertData
        };

        return addNotification(notification);
    };

    // Create air quality alert
    const createAirQualityAlert = (aqiData) => {
        if (!state.settings.airQualityAlerts) return;

        const notification = {
            type: 'air_quality',
            title: 'Air Quality Alert',
            message: `Air quality in ${aqiData.location} is ${aqiData.status}. AQI: ${aqiData.aqi}`,
            severity: aqiData.aqi > 150 ? 'high' : aqiData.aqi > 100 ? 'medium' : 'low',
            data: aqiData
        };

        return addNotification(notification);
    };

    // Remove notification
    const removeNotification = (id) => {
        dispatch({
            type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
            payload: id
        });
    };

    // Mark notification as read
    const markAsRead = (id) => {
        dispatch({
            type: NOTIFICATION_ACTIONS.MARK_AS_READ,
            payload: id
        });
    };

    // Mark all notifications as read
    const markAllAsRead = () => {
        dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });
    };

    // Update notification settings
    const updateSettings = (newSettings) => {
        dispatch({
            type: NOTIFICATION_ACTIONS.UPDATE_SETTINGS,
            payload: newSettings
        });
    };

    // Clear error
    const clearError = () => {
        dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ERROR });
    };

    // Get unread notifications count
    const getUnreadCount = () => {
        return state.notifications.filter(n => !n.read).length;
    };

    // Get notifications by type
    const getNotificationsByType = (type) => {
        return state.notifications.filter(n => n.type === type);
    };

    // Auto-dismiss notifications after delay
    useEffect(() => {
        const timers = [];

        state.notifications.forEach(notification => {
            if (!notification.read && notification.autoDismiss !== false) {
                const timer = setTimeout(() => {
                    removeNotification(notification.id);
                }, notification.duration || 10000); // Default 10 seconds

                timers.push(timer);
            }
        });

        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [state.notifications]);

    const value = {
        // State
        notifications: state.notifications,
        settings: state.settings,
        permission: state.permission,
        isLoading: state.isLoading,
        error: state.error,

        // Actions
        requestPermission,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        updateSettings,
        clearError,

        // Specialized creators
        createWeatherAlert,
        createCustomAlert,
        createAirQualityAlert,

        // Utilities
        getUnreadCount,
        getNotificationsByType,
        showBrowserNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook to use notification context
export const useNotifications = () => {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }

    return context;
};

// Hook for weather-specific notifications
export const useWeatherNotifications = () => {
    const { createWeatherAlert, createCustomAlert, createAirQualityAlert } = useNotifications();

    const checkWeatherConditions = (weatherData, thresholds) => {
        const alerts = [];

        // Temperature alerts
        if (thresholds.temperature) {
            if (weatherData.temp > thresholds.temperature.max) {
                alerts.push({
                    type: 'temperature',
                    severity: 'high',
                    location: weatherData.location,
                    description: `High temperature alert: ${weatherData.temp}°C (threshold: ${thresholds.temperature.max}°C)`
                });
            } else if (weatherData.temp < thresholds.temperature.min) {
                alerts.push({
                    type: 'temperature',
                    severity: 'medium',
                    location: weatherData.location,
                    description: `Low temperature alert: ${weatherData.temp}°C (threshold: ${thresholds.temperature.min}°C)`
                });
            }
        }

        // Wind alerts
        if (thresholds.windSpeed && weatherData.windSpeed > thresholds.windSpeed) {
            alerts.push({
                type: 'wind',
                severity: 'medium',
                location: weatherData.location,
                description: `High wind alert: ${weatherData.windSpeed} m/s (threshold: ${thresholds.windSpeed} m/s)`
            });
        }

        // Rain alerts
        if (thresholds.rain && weatherData.weather?.includes('rain')) {
            alerts.push({
                type: 'rain',
                severity: 'medium',
                location: weatherData.location,
                description: 'Rain detected in your area'
            });
        }

        // Create notifications for all alerts
        alerts.forEach(alert => {
            createWeatherAlert(alert);
        });

        return alerts;
    };

    return {
        checkWeatherConditions,
        createWeatherAlert,
        createCustomAlert,
        createAirQualityAlert
    };
};

export default NotificationContext;


