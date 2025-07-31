import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserContext } from '../context/UserContext';
import { useWeatherContext } from '../context/WeatherContext';

// Notification types
const NOTIFICATION_TYPES = {
    WEATHER_ALERT: 'weather_alert',
    RAIN_ALERT: 'rain_alert',
    TEMPERATURE_THRESHOLD: 'temperature_threshold',
    DAILY_FORECAST: 'daily_forecast',
    UV_INDEX_WARNING: 'uv_index_warning',
    AIR_QUALITY_ALERT: 'air_quality_alert',
    SEVERE_WEATHER: 'severe_weather'
};

// Notification priorities
const NOTIFICATION_PRIORITY = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
};

// Custom hook for managing notifications
export const useNotifications = () => {
    const { notifications, temperatureThresholds, temperatureUnit } = useUserContext();
    const { currentWeather, weatherAlerts, airQuality, uvIndex } = useWeatherContext();

    const [permission, setPermission] = useState('default');
    const [supported, setSupported] = useState(false);
    const [activeNotifications, setActiveNotifications] = useState([]);
    const [notificationQueue, setNotificationQueue] = useState([]);
    const [lastNotifications, setLastNotifications] = useState({});

    const serviceWorkerRef = useRef(null);
    const notificationTimeouts = useRef(new Map());

    // Check if notifications are supported
    useEffect(() => {
        setSupported('Notification' in window);
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    // Register service worker for persistent notifications
    useEffect(() => {
        if ('serviceWorker' in navigator && notifications.enabled) {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    serviceWorkerRef.current = registration;
                    console.log('Service Worker registered for notifications');
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }, [notifications.enabled]);

    // Request notification permission
    const requestPermission = useCallback(async () => {
        if (!supported) {
            return 'not-supported';
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            // Fallback for older browsers
            const result = await new Promise((resolve) => {
                Notification.requestPermission(resolve);
            });
            setPermission(result);
            return result;
        }
    }, [supported]);

    // Create notification object
    const createNotification = useCallback((type, title, message, options = {}) => {
        const notification = {
            id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            title,
            message,
            timestamp: Date.now(),
            priority: options.priority || NOTIFICATION_PRIORITY.NORMAL,
            persistent: options.persistent || false,
            actions: options.actions || [],
            data: options.data || {},
            icon: options.icon || '/icons/weather-icon-192.png',
            badge: options.badge || '/icons/weather-badge-72.png',
            tag: options.tag || type,
            requireInteraction: options.requireInteraction || false,
            silent: options.silent || false,
            vibrate: options.vibrate || [200, 100, 200]
        };

        return notification;
    }, []);

    // Show notification
    const showNotification = useCallback(async (notificationData) => {
        if (!notifications.enabled || !supported || permission !== 'granted') {
            return false;
        }

        try {
            const options = {
                body: notificationData.message,
                icon: notificationData.icon,
                badge: notificationData.badge,
                tag: notificationData.tag,
                requireInteraction: notificationData.requireInteraction,
                silent: notificationData.silent,
                vibrate: notificationData.vibrate,
                data: notificationData.data,
                actions: notificationData.actions
            };

            let notification;

            // Use service worker for persistent notifications
            if (serviceWorkerRef.current && notificationData.persistent) {
                await serviceWorkerRef.current.showNotification(notificationData.title, options);
            } else {
                // Use regular notification API
                notification = new Notification(notificationData.title, options);

                // Handle notification events
                notification.onclick = () => {
                    window.focus();
                    notification.close();

                    // Handle notification click based on type
                    if (notificationData.data.url) {
                        window.location.href = notificationData.data.url;
                    }
                };

                // Auto-close after delay for non-persistent notifications
                if (!notificationData.requireInteraction) {
                    setTimeout(() => {
                        notification.close();
                    }, 5000);
                }
            }

            // Add to active notifications
            setActiveNotifications(prev => [...prev, notificationData]);

            // Update last notification time for this type
            setLastNotifications(prev => ({
                ...prev,
                [notificationData.type]: Date.now()
            }));

            return true;
        } catch (error) {
            console.error('Error showing notification:', error);
            return false;
        }
    }, [notifications.enabled, supported, permission]);

    // Queue notification for later display
    const queueNotification = useCallback((notificationData) => {
        setNotificationQueue(prev => [...prev, notificationData]);
    }, []);

    // Process notification queue
    const processNotificationQueue = useCallback(async () => {
        if (notificationQueue.length === 0 || permission !== 'granted') {
            return;
        }

        // Process notifications with priority order
        const sortedQueue = [...notificationQueue].sort((a, b) => {
            const priorityOrder = {
                [NOTIFICATION_PRIORITY.URGENT]: 4,
                [NOTIFICATION_PRIORITY.HIGH]: 3,
                [NOTIFICATION_PRIORITY.NORMAL]: 2,
                [NOTIFICATION_PRIORITY.LOW]: 1
            };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        for (const notification of sortedQueue) {
            await showNotification(notification);
            // Small delay between notifications to avoid spam
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setNotificationQueue([]);
    }, [notificationQueue, permission, showNotification]);

    // Check if notification should be throttled
    const shouldThrottleNotification = useCallback((type, throttleMinutes = 30) => {
        const lastTime = lastNotifications[type];
        if (!lastTime) return false;

        const timeDiff = Date.now() - lastTime;
        const throttleTime = throttleMinutes * 60 * 1000;

        return timeDiff < throttleTime;
    }, [lastNotifications]);

    // Convert temperature based on user preference
    const convertTemperature = useCallback((tempCelsius) => {
        if (temperatureUnit === 'fahrenheit') {
            return (tempCelsius * 9/5) + 32;
        }
        return tempCelsius;
    }, [temperatureUnit]);

    // Check temperature thresholds
    const checkTemperatureThresholds = useCallback(() => {
        if (!notifications.temperatureThresholds ||
            !temperatureThresholds.enabled ||
            !currentWeather) {
            return;
        }

        const currentTemp = currentWeather.temperature;
        const highThreshold = convertTemperature(temperatureThresholds.high);
        const lowThreshold = convertTemperature(temperatureThresholds.low);
        const unit = temperatureUnit === 'fahrenheit' ? '°F' : '°C';

        // Check high temperature threshold
        if (currentTemp >= highThreshold && !shouldThrottleNotification('temp_high', 60)) {
            const notification = createNotification(
                NOTIFICATION_TYPES.TEMPERATURE_THRESHOLD,
                'High Temperature Alert',
                `Temperature has reached ${Math.round(currentTemp)}${unit}! Stay hydrated and seek shade.`,
                {
                    priority: NOTIFICATION_PRIORITY.HIGH,
                    icon: '/icons/temperature-high.png',
                    tag: 'temp_high',
                    data: { temperature: currentTemp, threshold: highThreshold }
                }
            );
            queueNotification(notification);
        }

        // Check low temperature threshold
        if (currentTemp <= lowThreshold && !shouldThrottleNotification('temp_low', 60)) {
            const notification = createNotification(
                NOTIFICATION_TYPES.TEMPERATURE_THRESHOLD,
                'Low Temperature Alert',
                `Temperature has dropped to ${Math.round(currentTemp)}${unit}! Dress warmly.`,
                {
                    priority: NOTIFICATION_PRIORITY.HIGH,
                    icon: '/icons/temperature-low.png',
                    tag: 'temp_low',
                    data: { temperature: currentTemp, threshold: lowThreshold }
                }
            );
            queueNotification(notification);
        }
    }, [
        notifications.temperatureThresholds,
        temperatureThresholds.enabled,
        currentWeather,
        convertTemperature,
        temperatureUnit,
        shouldThrottleNotification,
        createNotification,
        queueNotification
    ]);

    // Check for rain alerts
    const checkRainAlerts = useCallback(() => {
        if (!notifications.rainAlerts || !currentWeather) {
            return;
        }

        const condition = currentWeather.condition?.toLowerCase() || '';
        const isRaining = condition.includes('rain') || condition.includes('drizzle');
        const willRain = currentWeather.precipitationProbability > 70;

        if ((isRaining || willRain) && !shouldThrottleNotification('rain', 120)) {
            const message = isRaining
                ? 'It\'s currently raining in your area. Don\'t forget your umbrella!'
                : `High chance of rain (${currentWeather.precipitationProbability}%). Consider bringing an umbrella.`;

            const notification = createNotification(
                NOTIFICATION_TYPES.RAIN_ALERT,
                'Rain Alert',
                message,
                {
                    priority: NOTIFICATION_PRIORITY.NORMAL,
                    icon: '/icons/rain.png',
                    tag: 'rain_alert',
                    data: {
                        isCurrentlyRaining: isRaining,
                        precipitationProbability: currentWeather.precipitationProbability
                    }
                }
            );
            queueNotification(notification);
        }
    }, [
        notifications.rainAlerts,
        currentWeather,
        shouldThrottleNotification,
        createNotification,
        queueNotification
    ]);

    // Check UV index warnings
    const checkUvIndexWarnings = useCallback(() => {
        if (!notifications.uvIndexAlerts || !uvIndex) {
            return;
        }

        const uvValue = uvIndex.value || 0;

        // High UV index (8+)
        if (uvValue >= 8 && !shouldThrottleNotification('uv_high', 180)) {
            let level = 'Very High';
            let message = 'UV index is very high. Avoid sun exposure and use strong sun protection.';

            if (uvValue >= 11) {
                level = 'Extreme';
                message = 'UV index is extreme! Avoid all sun exposure if possible.';
            }

            const notification = createNotification(
                NOTIFICATION_TYPES.UV_INDEX_WARNING,
                `${level} UV Index Alert`,
                message,
                {
                    priority: NOTIFICATION_PRIORITY.HIGH,
                    icon: '/icons/uv-index.png',
                    tag: 'uv_warning',
                    data: { uvIndex: uvValue, level }
                }
            );
            queueNotification(notification);
        }
    }, [
        notifications.uvIndexAlerts,
        uvIndex,
        shouldThrottleNotification,
        createNotification,
        queueNotification
    ]);

    // Check air quality alerts
    const checkAirQualityAlerts = useCallback(() => {
        if (!airQuality || !airQuality.aqi) {
            return;
        }

        const aqi = airQuality.aqi;
        let alertLevel = null;
        let message = '';

        if (aqi >= 101 && aqi <= 150) {
            alertLevel = 'Unhealthy for Sensitive Groups';
            message = 'Air quality is unhealthy for sensitive groups. Consider reducing outdoor activities.';
        } else if (aqi >= 151 && aqi <= 200) {
            alertLevel = 'Unhealthy';
            message = 'Air quality is unhealthy. Everyone may experience health effects.';
        } else if (aqi >= 201 && aqi <= 300) {
            alertLevel = 'Very Unhealthy';
            message = 'Air quality is very unhealthy. Health alert for everyone.';
        } else if (aqi > 300) {
            alertLevel = 'Hazardous';
            message = 'Air quality is hazardous. Emergency conditions affecting everyone.';
        }

        if (alertLevel && !shouldThrottleNotification('air_quality', 240)) {
            const notification = createNotification(
                NOTIFICATION_TYPES.AIR_QUALITY_ALERT,
                `Air Quality Alert: ${alertLevel}`,
                message,
                {
                    priority: aqi > 200 ? NOTIFICATION_PRIORITY.HIGH : NOTIFICATION_PRIORITY.NORMAL,
                    icon: '/icons/air-quality.png',
                    tag: 'air_quality',
                    data: { aqi, level: alertLevel }
                }
            );
            queueNotification(notification);
        }
    }, [
        airQuality,
        shouldThrottleNotification,
        createNotification,
        queueNotification
    ]);

    // Check weather alerts
    const checkWeatherAlerts = useCallback(() => {
        if (!notifications.weatherAlerts || !weatherAlerts || weatherAlerts.length === 0) {
            return;
        }

        weatherAlerts.forEach(alert => {
            const alertId = `weather_alert_${alert.id}`;

            if (!shouldThrottleNotification(alertId, 60)) {
                const severity = alert.severity?.toLowerCase() || 'moderate';
                let priority = NOTIFICATION_PRIORITY.NORMAL;

                if (severity === 'severe' || severity === 'extreme') {
                    priority = NOTIFICATION_PRIORITY.URGENT;
                } else if (severity === 'moderate') {
                    priority = NOTIFICATION_PRIORITY.HIGH;
                }

                const notification = createNotification(
                    NOTIFICATION_TYPES.WEATHER_ALERT,
                    alert.title || 'Weather Alert',
                    alert.description || 'Severe weather conditions expected.',
                    {
                        priority,
                        persistent: severity === 'extreme',
                        requireInteraction: severity === 'extreme',
                        icon: '/icons/weather-alert.png',
                        tag: alertId,
                        data: {
                            alertId: alert.id,
                            severity: alert.severity,
                            startTime: alert.startTime,
                            endTime: alert.endTime
                        }
                    }
                );
                queueNotification(notification);
            }
        });
    }, [
        notifications.weatherAlerts,
        weatherAlerts,
        shouldThrottleNotification,
        createNotification,
        queueNotification
    ]);

    // Send daily forecast notification
    const sendDailyForecast = useCallback(() => {
        if (!notifications.dailyForecast || !currentWeather) {
            return;
        }

        // Check if already sent today
        const today = new Date().toDateString();
        const lastDaily = lastNotifications['daily_forecast'];
        const lastDailyDate = lastDaily ? new Date(lastDaily).toDateString() : null;

        if (lastDailyDate === today) {
            return; // Already sent today
        }

        const temp = Math.round(currentWeather.temperature);
        const condition = currentWeather.condition || 'Unknown';
        const unit = temperatureUnit === 'fahrenheit' ? '°F' : '°C';

        const notification = createNotification(
            NOTIFICATION_TYPES.DAILY_FORECAST,
            'Daily Weather Update',
            `Today: ${temp}${unit}, ${condition}. Have a great day!`,
            {
                priority: NOTIFICATION_PRIORITY.LOW,
                icon: '/icons/daily-forecast.png',
                tag: 'daily_forecast',
                data: {
                    temperature: temp,
                    condition,
                    date: today
                }
            }
        );
        queueNotification(notification);
    }, [
        notifications.dailyForecast,
        currentWeather,
        temperatureUnit,
        lastNotifications,
        createNotification,
        queueNotification
    ]);

    // Clear notification by ID
    const clearNotification = useCallback((notificationId) => {
        setActiveNotifications(prev =>
            prev.filter(notification => notification.id !== notificationId)
        );
    }, []);

    // Clear all notifications
    const clearAllNotifications = useCallback(() => {
        setActiveNotifications([]);
        setNotificationQueue([]);

        // Clear any pending timeouts
        notificationTimeouts.current.forEach(timeout => clearTimeout(timeout));
        notificationTimeouts.current.clear();
    }, []);

    // Schedule notification
    const scheduleNotification = useCallback((notificationData, delay) => {
        const timeoutId = setTimeout(() => {
            queueNotification(notificationData);
            notificationTimeouts.current.delete(timeoutId);
        }, delay);

        notificationTimeouts.current.set(timeoutId, notificationData);
        return timeoutId;
    }, [queueNotification]);

    // Cancel scheduled notification
    const cancelScheduledNotification = useCallback((timeoutId) => {
        clearTimeout(timeoutId);
        notificationTimeouts.current.delete(timeoutId);
    }, []);

    // Check all notification conditions
    const checkAllNotifications = useCallback(() => {
        if (!notifications.enabled || permission !== 'granted') {
            return;
        }

        checkTemperatureThresholds();
        checkRainAlerts();
        checkUvIndexWarnings();
        checkAirQualityAlerts();
        checkWeatherAlerts();
    }, [
        notifications.enabled,
        permission,
        checkTemperatureThresholds,
        checkRainAlerts,
        checkUvIndexWarnings,
        checkAirQualityAlerts,
        checkWeatherAlerts
    ]);

    // Process notification queue when it changes
    useEffect(() => {
        if (notificationQueue.length > 0) {
            processNotificationQueue();
        }
    }, [notificationQueue, processNotificationQueue]);

    // Check notifications when weather data changes
    useEffect(() => {
        checkAllNotifications();
    }, [currentWeather, weatherAlerts, airQuality, uvIndex, checkAllNotifications]);

    // Send daily forecast at 8 AM
    useEffect(() => {
        const now = new Date();
        const eightAM = new Date();
        eightAM.setHours(8, 0, 0, 0);

        // If it's past 8 AM today, schedule for tomorrow
        if (now > eightAM) {
            eightAM.setDate(eightAM.getDate() + 1);
        }

        const timeUntilEightAM = eightAM.getTime() - now.getTime();

        const dailyTimeout = setTimeout(() => {
            sendDailyForecast();

            // Set up daily interval
            const dailyInterval = setInterval(sendDailyForecast, 24 * 60 * 60 * 1000);

            return () => clearInterval(dailyInterval);
        }, timeUntilEightAM);

        return () => clearTimeout(dailyTimeout);
    }, [sendDailyForecast]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            notificationTimeouts.current.forEach(timeout => clearTimeout(timeout));
            notificationTimeouts.current.clear();
        };
    }, []);

    return {
        // State
        permission,
        supported,
        activeNotifications,
        notificationQueue,

        // Actions
        requestPermission,
        showNotification,
        queueNotification,
        clearNotification,
        clearAllNotifications,
        scheduleNotification,
        cancelScheduledNotification,

        // Manual checks
        checkTemperatureThresholds,
        checkRainAlerts,
        checkUvIndexWarnings,
        checkAirQualityAlerts,
        checkWeatherAlerts,
        checkAllNotifications,
        sendDailyForecast,

        // Utilities
        createNotification,
        shouldThrottleNotification,

        // Status
        isEnabled: notifications.enabled && permission === 'granted',
        canShowNotifications: supported && permission === 'granted',
        hasActiveNotifications: activeNotifications.length > 0,
        hasQueuedNotifications: notificationQueue.length > 0,

        // Constants
        NOTIFICATION_TYPES,
        NOTIFICATION_PRIORITY
    };
};

export default useNotifications;