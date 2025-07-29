// src/hooks/useNotifications.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotifications as useNotificationContext } from '../context/NotificationContext.jsx';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

/**
 * Custom hook for managing weather-specific notifications
 * @param {Object} options - Hook options
 * @returns {Object} Notification methods and state
 */
export function useWeatherNotifications(options = {}) {
    const {
        enableTemperatureAlerts = false,
        temperatureThresholds = { high: 35, low: 0 },
        enableRainAlerts = true,
        enableAirQualityAlerts = true,
        enableSevereWeatherAlerts = true
    } = options;

    const notificationContext = useNotificationContext();

    const [lastAlerts, setLastAlerts] = useState({
        temperature: null,
        rain: null,
        airQuality: null,
        severeWeather: null
    });

    /**
     * Check and send temperature alerts
     */
    const checkTemperatureAlert = useCallback((currentTemp, location) => {
        if (!enableTemperatureAlerts) return;

        const { high, low } = temperatureThresholds;
        const now = Date.now();
        const cooldownPeriod = 30 * 60 * 1000; // 30 minutes

        // Check high temperature
        if (currentTemp >= high) {
            if (!lastAlerts.temperature ||
                now - lastAlerts.temperature.timestamp > cooldownPeriod ||
                lastAlerts.temperature.type !== 'high') {

                notificationContext.sendTemperatureAlert({
                    current: currentTemp,
                    threshold: high,
                    type: 'high',
                    location
                });

                setLastAlerts(prev => ({
                    ...prev,
                    temperature: { type: 'high', timestamp: now }
                }));
            }
        }
        // Check low temperature
        else if (currentTemp <= low) {
            if (!lastAlerts.temperature ||
                now - lastAlerts.temperature.timestamp > cooldownPeriod ||
                lastAlerts.temperature.type !== 'low') {

                notificationContext.sendTemperatureAlert({
                    current: currentTemp,
                    threshold: low,
                    type: 'low',
                    location
                });

                setLastAlerts(prev => ({
                    ...prev,
                    temperature: { type: 'low', timestamp: now }
                }));
            }
        }
    }, [enableTemperatureAlerts, temperatureThresholds, lastAlerts.temperature, notificationContext]);

    /**
     * Check and send rain alerts
     */
    const checkRainAlert = useCallback((weatherData, location) => {
        if (!enableRainAlerts) return;

        const now = Date.now();
        const cooldownPeriod = 60 * 60 * 1000; // 1 hour

        // Check current rain
        if (weatherData.rain && weatherData.rain['1h'] > 0) {
            if (!lastAlerts.rain || now - lastAlerts.rain.timestamp > cooldownPeriod) {
                notificationContext.sendRainAlert({
                    intensity: weatherData.rain['1h'],
                    location,
                    current: true
                });

                setLastAlerts(prev => ({
                    ...prev,
                    rain: { timestamp: now }
                }));
            }
        }
        // Check forecast for rain in next hour
        else if (weatherData.forecast) {
            const nextHour = weatherData.forecast.list?.[0];
            if (nextHour?.rain && nextHour.rain['1h'] > 0) {
                if (!lastAlerts.rain || now - lastAlerts.rain.timestamp > cooldownPeriod) {
                    notificationContext.sendRainAlert({
                        intensity: nextHour.rain['1h'],
                        location,
                        forecast: true,
                        time: nextHour.dt
                    });

                    setLastAlerts(prev => ({
                        ...prev,
                        rain: { timestamp: now }
                    }));
                }
            }
        }
    }, [enableRainAlerts, lastAlerts.rain, notificationContext]);

    /**
     * Check and send air quality alerts
     */
    const checkAirQualityAlert = useCallback((airQualityData, location) => {
        if (!enableAirQualityAlerts || !airQualityData) return;

        const aqi = airQualityData.list?.[0]?.main?.aqi;
        if (!aqi) return;

        const now = Date.now();
        const cooldownPeriod = 2 * 60 * 60 * 1000; // 2 hours

        // Alert for poor or very poor air quality (AQI 4 or 5)
        if (aqi >= 4) {
            if (!lastAlerts.airQuality ||
                now - lastAlerts.airQuality.timestamp > cooldownPeriod ||
                lastAlerts.airQuality.aqi !== aqi) {

                const levels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

                notificationContext.sendAirQualityAlert({
                    aqi,
                    level: levels[aqi] || 'Unknown',
                    location
                });

                setLastAlerts(prev => ({
                    ...prev,
                    airQuality: { aqi, timestamp: now }
                }));
            }
        }
    }, [enableAirQualityAlerts, lastAlerts.airQuality, notificationContext]);

    /**
     * Check and send severe weather alerts
     */
    const checkSevereWeatherAlert = useCallback((weatherData, location) => {
        if (!enableSevereWeatherAlerts) return;

        const alerts = weatherData.alerts || [];
        const now = Date.now();

        alerts.forEach(alert => {
            // Skip if we've already alerted for this event recently
            if (lastAlerts.severeWeather &&
                lastAlerts.severeWeather.event === alert.event &&
                now - lastAlerts.severeWeather.timestamp < 60 * 60 * 1000) { // 1 hour cooldown
                return;
            }

            notificationContext.sendSevereWeatherAlert({
                event: alert.event,
                severity: alert.severity || 'moderate',
                description: alert.description,
                location
            });

            setLastAlerts(prev => ({
                ...prev,
                severeWeather: { event: alert.event, timestamp: now }
            }));
        });
    }, [enableSevereWeatherAlerts, lastAlerts.severeWeather, notificationContext]);

    /**
     * Process weather data and check for all alert conditions
     */
    const processWeatherData = useCallback((weatherData, location) => {
        if (!weatherData || !location) return;

        // Current weather alerts
        if (weatherData.current) {
            const currentTemp = weatherData.current.main?.temp;
            if (currentTemp !== undefined) {
                checkTemperatureAlert(currentTemp, location);
            }

            checkRainAlert(weatherData.current, location);
            checkSevereWeatherAlert(weatherData.current, location);
        }

        // Air quality alerts
        if (weatherData.airQuality) {
            checkAirQualityAlert(weatherData.airQuality, location);
        }
    }, [checkTemperatureAlert, checkRainAlert, checkAirQualityAlert, checkSevereWeatherAlert]);

    return {
        // Methods
        processWeatherData,
        checkTemperatureAlert,
        checkRainAlert,
        checkAirQualityAlert,
        checkSevereWeatherAlert,

        // State
        lastAlerts,

        // Context methods
        ...notificationContext
    };
}

/**
 * Hook for managing notification queue and batching
 * @param {Object} options - Hook options
 * @returns {Object} Queue management methods
 */
export function useNotificationQueue(options = {}) {
    const {
        maxQueueSize = 10,
        batchDelay = 2000,
        enableBatching = true
    } = options;

    const [queue, setQueue] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const batchTimer = useRef(null);
    const notificationContext = useNotificationContext();

    /**
     * Add notification to queue
     */
    const enqueue = useCallback((notification) => {
        setQueue(prev => {
            const newQueue = [...prev, { ...notification, id: Date.now() + Math.random() }];
            return newQueue.slice(-maxQueueSize); // Keep only last N items
        });
    }, [maxQueueSize]);

    /**
     * Process notification queue
     */
    const processQueue = useCallback(async () => {
        if (queue.length === 0 || isProcessing) return;

        setIsProcessing(true);

        try {
            if (enableBatching && queue.length > 1) {
                // Batch multiple notifications
                const batchTitle = `${queue.length} Weather Updates`;
                const batchBody = queue.map(n => n.title || n.message).join(', ');

                await notificationContext.showNotification(batchTitle, {
                    body: batchBody,
                    tag: 'weather-batch',
                    data: queue
                });
            } else {
                // Process individual notifications
                for (const notification of queue) {
                    await new Promise(resolve => setTimeout(resolve, 500)); // Delay between notifications

                    switch (notification.type) {
                        case NOTIFICATION_TYPES.WEATHER_ALERT:
                            await notificationContext.sendWeatherAlert(notification.data);
                            break;
                        case NOTIFICATION_TYPES.RAIN_ALERT:
                            await notificationContext.sendRainAlert(notification.data);
                            break;
                        case NOTIFICATION_TYPES.TEMPERATURE_ALERT:
                            await notificationContext.sendTemperatureAlert(notification.data);
                            break;
                        case NOTIFICATION_TYPES.AIR_QUALITY_ALERT:
                            await notificationContext.sendAirQualityAlert(notification.data);
                            break;
                        default:
                            await notificationContext.showNotification(
                                notification.title || 'Weather Update',
                                notification
                            );
                            break;
                    }
                }
            }

            // Clear queue after processing
            setQueue([]);
        } catch (error) {
            console.error('Error processing notification queue:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [queue, isProcessing, enableBatching, notificationContext]);

    /**
     * Start batch timer
     */
    useEffect(() => {
        if (queue.length > 0 && !isProcessing) {
            if (batchTimer.current) {
                clearTimeout(batchTimer.current);
            }

            batchTimer.current = setTimeout(() => {
                processQueue();
            }, batchDelay);
        }

        return () => {
            if (batchTimer.current) {
                clearTimeout(batchTimer.current);
            }
        };
    }, [queue.length, isProcessing, batchDelay, processQueue]);

    /**
     * Clear queue
     */
    const clearQueue = useCallback(() => {
        setQueue([]);
        if (batchTimer.current) {
            clearTimeout(batchTimer.current);
        }
    }, []);

    /**
     * Remove specific notification from queue
     */
    const removeFromQueue = useCallback((id) => {
        setQueue(prev => prev.filter(item => item.id !== id));
    }, []);

    return {
        queue,
        enqueue,
        processQueue,
        clearQueue,
        removeFromQueue,
        isProcessing,
        queueSize: queue.length
    };
}

/**
 * Hook for managing notification scheduling
 * @returns {Object} Scheduling methods
 */
export function useNotificationScheduler() {
    const [scheduledNotifications, setScheduledNotifications] = useState(new Map());
    const notificationContext = useNotificationContext();

    /**
     * Schedule daily weather summary
     */
    const scheduleDailyWeatherSummary = useCallback((time = '08:00', location) => {
        const id = notificationContext.scheduleDailySummary(time);

        if (id) {
            setScheduledNotifications(prev => new Map(prev).set(id, {
                type: 'daily_summary',
                time,
                location,
                created: Date.now()
            }));
        }

        return id;
    }, [notificationContext]);

    /**
     * Schedule reminder based on weather conditions
     */
    const scheduleWeatherReminder = useCallback((condition, reminderTime, message) => {
        const scheduledTime = new Date();
        const [hours, minutes] = reminderTime.split(':').map(Number);
        scheduledTime.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (scheduledTime <= new Date()) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const id = notificationContext.scheduleNotificationLater(scheduledTime, {
            title: 'Weather Reminder',
            body: message,
            tag: `weather-reminder-${condition}`
        });

        if (id) {
            setScheduledNotifications(prev => new Map(prev).set(id, {
                type: 'weather_reminder',
                condition,
                time: reminderTime,
                message,
                scheduledTime: scheduledTime.toISOString(),
                created: Date.now()
            }));
        }

        return id;
    }, [notificationContext]);

    /**
     * Cancel scheduled notification
     */
    const cancelScheduled = useCallback((id) => {
        const success = notificationContext.cancelScheduled(id);
        if (success) {
            setScheduledNotifications(prev => {
                const newMap = new Map(prev);
                newMap.delete(id);
                return newMap;
            });
        }
        return success;
    }, [notificationContext]);

    /**
     * Get all scheduled notifications
     */
    const getScheduledNotifications = useCallback(() => {
        return Array.from(scheduledNotifications.entries()).map(([id, data]) => ({
            id,
            ...data
        }));
    }, [scheduledNotifications]);

    /**
     * Clear all scheduled notifications
     */
    const clearAllScheduled = useCallback(() => {
        scheduledNotifications.forEach((_, id) => {
            notificationContext.cancelScheduled(id);
        });
        setScheduledNotifications(new Map());
    }, [scheduledNotifications, notificationContext]);

    return {
        scheduleDailyWeatherSummary,
        scheduleWeatherReminder,
        cancelScheduled,
        getScheduledNotifications,
        clearAllScheduled,
        scheduledCount: scheduledNotifications.size
    };
}

export default useWeatherNotifications;