// Notification types
export const NOTIFICATION_TYPES = {
    WEATHER_ALERT: 'weather_alert',
    RAIN_ALERT: 'rain_alert',
    TEMPERATURE_ALERT: 'temperature_alert',
    SEVERE_WEATHER: 'severe_weather',
    UV_INDEX: 'uv_index',
    AIR_QUALITY: 'air_quality',
    DAILY_FORECAST: 'daily_forecast',
    CUSTOM: 'custom'
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
};

// Weather condition icons for notifications
const WEATHER_ICONS = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    snowy: '🌨️',
    stormy: '⛈️',
    windy: '💨',
    hot: '🌡️',
    cold: '❄️',
    fog: '🌫️'
};

class NotificationManager {
    constructor() {
        this.permission = null;
        this.isSupported = 'Notification' in window;
        this.subscribers = new Map();
        this.activeNotifications = new Map();
        this.settings = this.loadSettings();
    }

    // Initialize notification system
    async init() {
        if (!this.isSupported) {
            console.warn('Notifications are not supported in this browser');
            return false;
        }

        try {
            this.permission = await this.requestPermission();
            return this.permission === 'granted';
        } catch (error) {
            console.error('Failed to initialize notifications:', error);
            return false;
        }
    }

    // Request notification permission
    async requestPermission() {
        if (!this.isSupported) return 'denied';

        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission;
        }

        this.permission = Notification.permission;
        return Notification.permission;
    }

    // Load notification settings from localStorage
    loadSettings() {
        try {
            const settings = localStorage.getItem('weatherapp_notification_settings');
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (error) {
            console.error('Failed to load notification settings:', error);
            return this.getDefaultSettings();
        }
    }

    // Get default notification settings
    getDefaultSettings() {
        return {
            enabled: true,
            types: {
                [NOTIFICATION_TYPES.WEATHER_ALERT]: true,
                [NOTIFICATION_TYPES.RAIN_ALERT]: true,
                [NOTIFICATION_TYPES.TEMPERATURE_ALERT]: false,
                [NOTIFICATION_TYPES.SEVERE_WEATHER]: true,
                [NOTIFICATION_TYPES.UV_INDEX]: false,
                [NOTIFICATION_TYPES.AIR_QUALITY]: true,
                [NOTIFICATION_TYPES.DAILY_FORECAST]: false,
                [NOTIFICATION_TYPES.CUSTOM]: true
            },
            sound: true,
            vibrate: true,
            showOnLockScreen: true,
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '07:00'
            },
            temperatureThresholds: {
                high: 35,
                low: 5
            },
            rainThreshold: 0.1,
            uvIndexThreshold: 6,
            aqiThreshold: 100
        };
    }

    // Save notification settings
    saveSettings(settings) {
        try {
            this.settings = { ...this.settings, ...settings };
            localStorage.setItem('weatherapp_notification_settings', JSON.stringify(this.settings));
            return true;
        } catch (error) {
            console.error('Failed to save notification settings:', error);
            return false;
        }
    }

    // Check if notifications are in quiet hours
    isQuietHours() {
        if (!this.settings.quietHours.enabled) return false;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [startHour, startMin] = this.settings.quietHours.start.split(':').map(Number);
        const [endHour, endMin] = this.settings.quietHours.end.split(':').map(Number);

        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        if (startTime <= endTime) {
            return currentTime >= startTime && currentTime <= endTime;
        } else {
            // Quiet hours span midnight
            return currentTime >= startTime || currentTime <= endTime;
        }
    }

    // Show notification
    async showNotification(type, title, message, options = {}) {
        if (!this.isSupported || this.permission !== 'granted') {
            console.warn('Notifications not available or permission denied');
            return null;
        }

        if (!this.settings.enabled || !this.settings.types[type]) {
            return null;
        }

        if (this.isQuietHours() && options.priority !== NOTIFICATION_PRIORITIES.URGENT) {
            return null;
        }

        const notificationOptions = {
            body: message,
            icon: options.icon || '/icons/weather-icon-192.png',
            badge: options.badge || '/icons/weather-badge-72.png',
            tag: options.tag || `weather-${type}-${Date.now()}`,
            renotify: options.renotify || false,
            requireInteraction: options.requireInteraction || false,
            silent: !this.settings.sound || options.silent,
            vibrate: this.settings.vibrate && options.vibrate !== false ? [200, 100, 200] : [],
            data: {
                type,
                timestamp: Date.now(),
                priority: options.priority || NOTIFICATION_PRIORITIES.NORMAL,
                ...options.data
            },
            actions: options.actions || []
        };

        try {
            const notification = new Notification(title, notificationOptions);

            // Store active notification
            this.activeNotifications.set(notification.tag, notification);

            // Set up event listeners
            notification.onclick = (event) => {
                event.preventDefault();
                this.handleNotificationClick(notification);
            };

            notification.onclose = () => {
                this.activeNotifications.delete(notification.tag);
            };

            notification.onerror = (error) => {
                console.error('Notification error:', error);
                this.activeNotifications.delete(notification.tag);
            };

            // Auto-close after timeout (except for urgent notifications)
            if (options.priority !== NOTIFICATION_PRIORITIES.URGENT) {
                setTimeout(() => {
                    if (this.activeNotifications.has(notification.tag)) {
                        notification.close();
                    }
                }, options.timeout || 10000);
            }

            return notification;
        } catch (error) {
            console.error('Failed to show notification:', error);
            return null;
        }
    }

    // Handle notification click
    handleNotificationClick(notification) {
        window.focus();

        // Emit event to subscribers
        this.emit('notificationClick', {
            type: notification.data.type,
            data: notification.data
        });

        notification.close();
    }

    // Weather-specific notification methods
    async showWeatherAlert(alertData) {
        const icon = this.getWeatherIcon(alertData.condition);
        return this.showNotification(
            NOTIFICATION_TYPES.WEATHER_ALERT,
            `Weather Alert - ${alertData.location}`,
            `${icon} ${alertData.description}`,
            {
                priority: alertData.severity === 'severe' ? NOTIFICATION_PRIORITIES.HIGH : NOTIFICATION_PRIORITIES.NORMAL,
                requireInteraction: alertData.severity === 'severe',
                data: { location: alertData.location, condition: alertData.condition }
            }
        );
    }

    async showRainAlert(location, rainData) {
        if (rainData.probability < this.settings.rainThreshold * 100) return null;

        return this.showNotification(
            NOTIFICATION_TYPES.RAIN_ALERT,
            `Rain Alert - ${location}`,
            `🌧️ ${rainData.probability}% chance of rain in the next hour`,
            {
                priority: NOTIFICATION_PRIORITIES.NORMAL,
                data: { location, rainProbability: rainData.probability }
            }
        );
    }

    async showTemperatureAlert(location, temperature, type) {
        const isHigh = type === 'high';
        const threshold = isHigh ? this.settings.temperatureThresholds.high : this.settings.temperatureThresholds.low;

        if ((isHigh && temperature < threshold) || (!isHigh && temperature > threshold)) {
            return null;
        }

        const icon = isHigh ? '🌡️' : '❄️';
        const message = `${icon} Temperature ${isHigh ? 'high' : 'low'}: ${temperature}°C`;

        return this.showNotification(
            NOTIFICATION_TYPES.TEMPERATURE_ALERT,
            `Temperature Alert - ${location}`,
            message,
            {
                priority: NOTIFICATION_PRIORITIES.NORMAL,
                data: { location, temperature, type }
            }
        );
    }

    async showSevereWeatherAlert(alertData) {
        return this.showNotification(
            NOTIFICATION_TYPES.SEVERE_WEATHER,
            `⚠️ Severe Weather Alert`,
            `${alertData.event} warning for ${alertData.location}. ${alertData.description}`,
            {
                priority: NOTIFICATION_PRIORITIES.URGENT,
                requireInteraction: true,
                data: { ...alertData }
            }
        );
    }

    async showUVIndexAlert(location, uvIndex) {
        if (uvIndex < this.settings.uvIndexThreshold) return null;

        return this.showNotification(
            NOTIFICATION_TYPES.UV_INDEX,
            `UV Index Alert - ${location}`,
            `☀️ High UV Index: ${uvIndex}. Use sun protection!`,
            {
                priority: NOTIFICATION_PRIORITIES.NORMAL,
                data: { location, uvIndex }
            }
        );
    }

    async showAirQualityAlert(location, aqi, pollutant) {
        if (aqi < this.settings.aqiThreshold) return null;

        return this.showNotification(
            NOTIFICATION_TYPES.AIR_QUALITY,
            `Air Quality Alert - ${location}`,
            `🏭 Poor air quality (AQI: ${aqi}). Main pollutant: ${pollutant}`,
            {
                priority: NOTIFICATION_PRIORITIES.HIGH,
                data: { location, aqi, pollutant }
            }
        );
    }

    async showDailyForecast(location, forecast) {
        const icon = this.getWeatherIcon(forecast.condition);
        return this.showNotification(
            NOTIFICATION_TYPES.DAILY_FORECAST,
            `Daily Forecast - ${location}`,
            `${icon} ${forecast.description}. High: ${forecast.maxTemp}°C, Low: ${forecast.minTemp}°C`,
            {
                priority: NOTIFICATION_PRIORITIES.LOW,
                data: { location, forecast }
            }
        );
    }

    // Get weather icon for condition
    getWeatherIcon(condition) {
        const conditionLower = condition.toLowerCase();

        if (conditionLower.includes('sun') || conditionLower.includes('clear')) return WEATHER_ICONS.sunny;
        if (conditionLower.includes('cloud')) return WEATHER_ICONS.cloudy;
        if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return WEATHER_ICONS.rainy;
        if (conditionLower.includes('snow')) return WEATHER_ICONS.snowy;
        if (conditionLower.includes('storm') || conditionLower.includes('thunder')) return WEATHER_ICONS.stormy;
        if (conditionLower.includes('wind')) return WEATHER_ICONS.windy;
        if (conditionLower.includes('fog') || conditionLower.includes('mist')) return WEATHER_ICONS.fog;

        return WEATHER_ICONS.cloudy;
    }

    // Event system for notifications
    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set());
        }
        this.subscribers.get(event).add(callback);
    }

    unsubscribe(event, callback) {
        if (this.subscribers.has(event)) {
            this.subscribers.get(event).delete(callback);
        }
    }

    emit(event, data) {
        if (this.subscribers.has(event)) {
            this.subscribers.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Notification callback error:', error);
                }
            });
        }
    }

    // Clear all active notifications
    clearAll() {
        this.activeNotifications.forEach(notification => {
            notification.close();
        });
        this.activeNotifications.clear();
    }

    // Clear notifications by type
    clearByType(type) {
        this.activeNotifications.forEach((notification, tag) => {
            if (notification.data && notification.data.type === type) {
                notification.close();
                this.activeNotifications.delete(tag);
            }
        });
    }

    // Get current settings
    getSettings() {
        return { ...this.settings };
    }

    // Check if notification type is enabled
    isEnabled(type) {
        return this.settings.enabled && this.settings.types[type];
    }
}

// Create singleton instance
const notificationManager = new NotificationManager();

// Export the manager and types
export { notificationManager as default, NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES };

// Convenience functions
export const initNotifications = () => notificationManager.init();
export const showWeatherAlert = (alertData) => notificationManager.showWeatherAlert(alertData);
export const showRainAlert = (location, rainData) => notificationManager.showRainAlert(location, rainData);
export const showTemperatureAlert = (location, temp, type) => notificationManager.showTemperatureAlert(location, temp, type);
export const showSevereWeatherAlert = (alertData) => notificationManager.showSevereWeatherAlert(alertData);
export const showUVIndexAlert = (location, uvIndex) => notificationManager.showUVIndexAlert(location, uvIndex);
export const showAirQualityAlert = (location, aqi, pollutant) => notificationManager.showAirQualityAlert(location, aqi, pollutant);
export const showDailyForecast = (location, forecast) => notificationManager.showDailyForecast(location, forecast);
export const getNotificationSettings = () => notificationManager.getSettings();
export const saveNotificationSettings = (settings) => notificationManager.saveSettings(settings);