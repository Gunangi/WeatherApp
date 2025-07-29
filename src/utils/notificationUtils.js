// src/utils/notificationUtils.js
import { NOTIFICATION_TYPES, ALERT_SEVERITIES } from './constants.js';
import { getNotificationSettings } from './storageUtils.js';

class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.isSupported = 'Notification' in window;
        this.activeNotifications = new Map();
        this.init();
    }

    async init() {
        if (this.isSupported) {
            this.permission = Notification.permission;
        }
    }

    /**
     * Request notification permission
     * @returns {Promise<string>} Permission status
     */
    async requestPermission() {
        if (!this.isSupported) {
            throw new Error('Notifications are not supported in this browser');
        }

        if (this.permission === 'granted') {
            return 'granted';
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    }

    /**
     * Show a notification
     * @param {string} title - Notification title
     * @param {Object} options - Notification options
     * @returns {Notification|null} Notification instance
     */
    async showNotification(title, options = {}) {
        if (!this.isSupported) {
            console.warn('Notifications not supported');
            return null;
        }

        if (this.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        try {
            const notification = new Notification(title, {
                icon: '/icons/weather-icon-32.png',
                badge: '/icons/weather-badge-32.png',
                tag: options.tag || 'weather-app',
                requireInteraction: options.requireInteraction || false,
                silent: options.silent || false,
                ...options
            });

            // Store notification reference
            if (options.tag) {
                this.activeNotifications.set(options.tag, notification);
            }

            // Auto-close after delay
            if (options.autoClose !== false) {
                const delay = options.autoCloseDelay || 5000;
                setTimeout(() => {
                    notification.close();
                    if (options.tag) {
                        this.activeNotifications.delete(options.tag);
                    }
                }, delay);
            }

            // Handle click events
            notification.onclick = (event) => {
                event.preventDefault();
                window.focus();
                if (options.onClick) {
                    options.onClick(event);
                }
                notification.close();
                if (options.tag) {
                    this.activeNotifications.delete(options.tag);
                }
            };

            // Handle close events
            notification.onclose = () => {
                if (options.tag) {
                    this.activeNotifications.delete(options.tag);
                }
                if (options.onClose) {
                    options.onClose();
                }
            };

            return notification;
        } catch (error) {
            console.error('Error showing notification:', error);
            return null;
        }
    }

    /**
     * Close notification by tag
     * @param {string} tag - Notification tag
     */
    closeNotification(tag) {
        const notification = this.activeNotifications.get(tag);
        if (notification) {
            notification.close();
            this.activeNotifications.delete(tag);
        }
    }

    /**
     * Close all active notifications
     */
    closeAllNotifications() {
        this.activeNotifications.forEach((notification) => {
            notification.close();
        });
        this.activeNotifications.clear();
    }

    /**
     * Check if notifications are enabled for a specific type
     * @param {string} type - Notification type
     * @returns {boolean} True if enabled
     */
    isNotificationEnabled(type) {
        const settings = getNotificationSettings();
        return settings[type] === true;
    }

    /**
     * Show weather alert notification
     * @param {Object} alert - Weather alert data
     */
    async showWeatherAlert(alert) {
        if (!this.isNotificationEnabled('weather_alerts')) return;

        const severity = ALERT_SEVERITIES[alert.severity] || ALERT_SEVERITIES.MINOR;

        await this.showNotification(
            `Weather Alert: ${alert.event}`,
            {
                body: alert.description,
                icon: this.getAlertIcon(alert.severity),
                tag: `weather-alert-${alert.id}`,
                requireInteraction: severity.level >= 3,
                data: alert,
                actions: [
                    {
                        action: 'view',
                        title: 'View Details',
                        icon: '/icons/view-icon.png'
                    },
                    {
                        action: 'dismiss',
                        title: 'Dismiss',
                        icon: '/icons/dismiss-icon.png'
                    }
                ]
            }
        );
    }

    /**
     * Show rain alert notification
     * @param {Object} rainData - Rain forecast data
     */
    async showRainAlert(rainData) {
        if (!this.isNotificationEnabled('rain_alerts')) return;

        const message = rainData.intensity > 0.5
            ? 'Heavy rain expected in the next hour'
            : 'Light rain expected in the next hour';

        await this.showNotification(
            '🌧️ Rain Alert',
            {
                body: message,
                tag: 'rain-alert',
                data: rainData,
                onClick: () => {
                    // Navigate to hourly forecast
                    window.location.hash = '#/forecast/hourly';
                }
            }
        );
    }

    /**
     * Show temperature alert notification
     * @param {Object} tempData - Temperature data
     */
    async showTemperatureAlert(tempData) {
        if (!this.isNotificationEnabled('temperature_alerts')) return;

        const { current, threshold, type } = tempData;
        const message = type === 'high'
            ? `Temperature has reached ${current}°C, above your threshold of ${threshold}°C`
            : `Temperature has dropped to ${current}°C, below your threshold of ${threshold}°C`;

        await this.showNotification(
            '🌡️ Temperature Alert',
            {
                body: message,
                tag: 'temperature-alert',
                data: tempData
            }
        );
    }

    /**
     * Show air quality alert notification
     * @param {Object} aqiData - Air quality data
     */
    async showAirQualityAlert(aqiData) {
        if (!this.isNotificationEnabled('air_quality_alerts')) return;

        const { aqi, level, location } = aqiData;

        await this.showNotification(
            '💨 Air Quality Alert',
            {
                body: `Air quality in ${location} is ${level} (AQI: ${aqi})`,
                tag: 'air-quality-alert',
                data: aqiData,
                onClick: () => {
                    // Navigate to air quality page
                    window.location.hash = '#/air-quality';
                }
            }
        );
    }

    /**
     * Show severe weather notification
     * @param {Object} weatherData - Severe weather data
     */
    async showSevereWeatherAlert(weatherData) {
        const { event, severity, description, location } = weatherData;

        await this.showNotification(
            `⚠️ Severe Weather: ${event}`,
            {
                body: `${description} in ${location}`,
                icon: this.getAlertIcon(severity),
                tag: 'severe-weather',
                requireInteraction: true,
                data: weatherData,
                vibrate: [200, 100, 200], // Vibration pattern for mobile
                actions: [
                    {
                        action: 'details',
                        title: 'View Details'
                    },
                    {
                        action: 'safety',
                        title: 'Safety Tips'
                    }
                ]
            }
        );
    }

    /**
     * Show daily weather summary notification
     * @param {Object} weatherData - Daily weather summary
     */
    async showDailySummary(weatherData) {
        const { location, condition, temp, forecast } = weatherData;

        await this.showNotification(
            `🌤️ Today's Weather in ${location}`,
            {
                body: `${condition}, ${temp}°C. ${forecast}`,
                tag: 'daily-summary',
                autoClose: true,
                autoCloseDelay: 8000,
                data: weatherData
            }
        );
    }

    /**
     * Show reminder notification
     * @param {Object} reminder - Reminder data
     */
    async showReminder(reminder) {
        const { type, message, action } = reminder;

        await this.showNotification(
            this.getReminderTitle(type),
            {
                body: message,
                tag: `reminder-${type}`,
                data: reminder,
                onClick: () => {
                    if (action) {
                        action();
                    }
                }
            }
        );
    }

    /**
     * Get appropriate icon for alert severity
     * @param {string} severity - Alert severity
     * @returns {string} Icon path
     */
    getAlertIcon(severity) {
        const icons = {
            MINOR: '/icons/alert-minor.png',
            MODERATE: '/icons/alert-moderate.png',
            SEVERE: '/icons/alert-severe.png',
            EXTREME: '/icons/alert-extreme.png'
        };
        return icons[severity] || icons.MINOR;
    }

    /**
     * Get reminder title based on type
     * @param {string} type - Reminder type
     * @returns {string} Title
     */
    getReminderTitle(type) {
        const titles = {
            umbrella: '☂️ Don\'t Forget Your Umbrella',
            jacket: '🧥 Wear a Jacket',
            sunscreen: '☀️ Apply Sunscreen',
            hat: '👒 Wear a Hat',
            layers: '👕 Dress in Layers'
        };
        return titles[type] || '📝 Weather Reminder';
    }

    /**
     * Schedule a notification for later
     * @param {Date} scheduledTime - When to show the notification
     * @param {string} title - Notification title
     * @param {Object} options - Notification options
     * @returns {number} Timeout ID
     */
    scheduleNotification(scheduledTime, title, options = {}) {
        const delay = scheduledTime.getTime() - Date.now();

        if (delay <= 0) {
            // Show immediately if time has passed
            this.showNotification(title, options);
            return null;
        }

        return setTimeout(() => {
            this.showNotification(title, options);
        }, delay);
    }

    /**
     * Cancel scheduled notification
     * @param {number} timeoutId - Timeout ID from scheduleNotification
     */
    cancelScheduledNotification(timeoutId) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Test notification system
     */
    async testNotification() {
        await this.showNotification(
            'Weather App Test',
            {
                body: 'Notifications are working correctly!',
                tag: 'test-notification',
                autoClose: true,
                autoCloseDelay: 3000
            }
        );
    }
}

// Create singleton instance
const notificationManager = new NotificationManager();

// Export notification functions
export const requestPermission = () => notificationManager.requestPermission();
export const showNotification = (title, options) => notificationManager.showNotification(title, options);
export const closeNotification = (tag) => notificationManager.closeNotification(tag);
export const closeAllNotifications = () => notificationManager.closeAllNotifications();

export const showWeatherAlert = (alert) => notificationManager.showWeatherAlert(alert);
export const showRainAlert = (rainData) => notificationManager.showRainAlert(rainData);
export const showTemperatureAlert = (tempData) => notificationManager.showTemperatureAlert(tempData);
export const showAirQualityAlert = (aqiData) => notificationManager.showAirQualityAlert(aqiData);
export const showSevereWeatherAlert = (weatherData) => notificationManager.showSevereWeatherAlert(weatherData);
export const showDailySummary = (weatherData) => notificationManager.showDailySummary(weatherData);
export const showReminder = (reminder) => notificationManager.showReminder(reminder);

export const scheduleNotification = (time, title, options) => notificationManager.scheduleNotification(time, title, options);
export const cancelScheduledNotification = (id) => notificationManager.cancelScheduledNotification(id);

export const isNotificationEnabled = (type) => notificationManager.isNotificationEnabled(type);
export const testNotification = () => notificationManager.testNotification();

export const getNotificationPermission = () => notificationManager.permission;
export const isNotificationSupported = () => notificationManager.isSupported;

export default notificationManager;