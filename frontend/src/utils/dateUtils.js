// dateUtils.js - Date/time formatting utilities

class DateUtils {
    constructor() {
        this.defaultLocale = 'en-US';
        this.defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    /**
     * Format time from Unix timestamp
     * @param {number} timestamp - Unix timestamp in seconds
     * @param {number} timezoneOffset - Timezone offset in seconds
     * @param {Object} options - Formatting options
     * @returns {string} Formatted time
     */
    formatTime(timestamp, timezoneOffset = 0, options = {}) {
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        const finalOptions = { ...defaultOptions, ...options };
        const date = new Date((timestamp + timezoneOffset) * 1000);

        return date.toLocaleTimeString(this.defaultLocale, finalOptions);
    }

    /**
     * Format date from Unix timestamp
     * @param {number} timestamp - Unix timestamp in seconds
     * @param {Object} options - Formatting options
     * @returns {string} Formatted date
     */
    formatDate(timestamp, options = {}) {
        const defaultOptions = {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        };

        const finalOptions = { ...defaultOptions, ...options };
        const date = new Date(timestamp * 1000);

        return date.toLocaleDateString(this.defaultLocale, finalOptions);
    }

    /**
     * Format full date and time
     * @param {number} timestamp - Unix timestamp in seconds
     * @param {number} timezoneOffset - Timezone offset in seconds
     * @param {Object} options - Formatting options
     * @returns {string} Formatted date and time
     */
    formatDateTime(timestamp, timezoneOffset = 0, options = {}) {
        const defaultOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        const finalOptions = { ...defaultOptions, ...options };
        const date = new Date((timestamp + timezoneOffset) * 1000);

        return date.toLocaleDateString(this.defaultLocale, finalOptions);
    }

    /**
     * Get current time formatted
     * @param {Object} options - Formatting options
     * @returns {string} Current time
     */
    getCurrentTime(options = {}) {
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };

        const finalOptions = { ...defaultOptions, ...options };
        return new Date().toLocaleTimeString(this.defaultLocale, finalOptions);
    }

    /**
     * Get current date formatted
     * @param {Object} options - Formatting options
     * @returns {string} Current date
     */
    getCurrentDate(options = {}) {
        const defaultOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        const finalOptions = { ...defaultOptions, ...options };
        return new Date().toLocaleDateString(this.defaultLocale, finalOptions);
    }

    /**
     * Get day of week from timestamp
     * @param {number} timestamp - Unix timestamp in seconds
     * @param {string} format - 'short', 'long', or 'narrow'
     * @returns {string} Day of week
     */
    getDayOfWeek(timestamp, format = 'long') {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString(this.defaultLocale, { weekday: format });
    }

    /**
     * Get month name from timestamp
     * @param {number} timestamp - Unix timestamp in seconds
     * @param {string} format - 'short', 'long', or 'narrow'
     * @returns {string} Month name
     */
    getMonthName(timestamp, format = 'long') {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString(this.defaultLocale, { month: format });
    }

    /**
     * Format relative time (e.g., "2 hours ago", "in 3 days")
     * @param {number} timestamp - Unix timestamp in seconds
     * @returns {string} Relative time
     */
    getRelativeTime(timestamp) {
        const now = Date.now();
        const targetTime = timestamp * 1000;
        const diffMs = targetTime - now;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (Math.abs(diffSeconds) < 60) {
            return diffSeconds === 0 ? 'now' :
                diffSeconds > 0 ? `in ${diffSeconds} seconds` : `${Math.abs(diffSeconds)} seconds ago`;
        } else if (Math.abs(diffMinutes) < 60) {
            return diffMinutes > 0 ? `in ${diffMinutes} minutes` : `${Math.abs(diffMinutes)} minutes ago`;
        } else if (Math.abs(diffHours) < 24) {
            return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
        } else if (Math.abs(diffDays) < 7) {
            return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
        } else {
            return this.formatDate(timestamp);
        }
    }

    /**
     * Check if timestamp is today
     * @param {number} timestamp - Unix timestamp in seconds
     * @returns {boolean} True if today
     */
    isToday(timestamp) {
        const today = new Date();
        const targetDate = new Date(timestamp * 1000);

        return today.toDateString() === targetDate.toDateString();
    }

    /**
     * Check if timestamp is tomorrow
     * @param {number} timestamp - Unix timestamp in seconds
     * @returns {boolean} True if tomorrow
     */
    isTomorrow(timestamp) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const targetDate = new Date(timestamp * 1000);

        return tomorrow.toDateString() === targetDate.toDateString();
    }

    /**
     * Check if timestamp is yesterday
     * @param {number} timestamp - Unix timestamp in seconds
     * @returns {boolean} True if yesterday
     */
    isYesterday(timestamp) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const targetDate = new Date(timestamp * 1000);

        return yesterday.toDateString() === targetDate.toDateString();
    }

    /**
     * Get smart date label (Today, Tomorrow, Yesterday, or date)
     * @param {number} timestamp - Unix timestamp in seconds
     * @param {Object} options - Formatting options for regular dates
     * @returns {string} Smart date label
     */
    getSmartDateLabel(timestamp, options = {}) {
        if (this.isToday(timestamp)) {
            return 'Today';
        } else if (this.isTomorrow(timestamp)) {
            return 'Tomorrow';
        } else if (this.isYesterday(timestamp)) {
            return 'Yesterday';
        } else {
            return this.formatDate(timestamp, options);
        }
    }

    /**
     * Format sunrise/sunset times
     * @param {number} sunrise - Sunrise timestamp in seconds
     * @param {number} sunset - Sunset timestamp in seconds
     * @param {number} timezoneOffset - Timezone offset in seconds
     * @returns {Object} Formatted sunrise and sunset times
     */
    formatSunTimes(sunrise, sunset, timezoneOffset = 0) {
        return {
            sunrise: this.formatTime(sunrise, timezoneOffset),
            sunset: this.formatTime(sunset, timezoneOffset),
            dayLength: this.calculateDayLength(sunrise, sunset)
        };
    }

    /**
     * Calculate day length from sunrise and sunset
     * @param {number} sunrise - Sunrise timestamp in seconds
     * @param {number} sunset - Sunset timestamp in seconds
     * @returns {string} Day length formatted as "Xh Ym"
     */
    calculateDayLength(sunrise, sunset) {
        const diffSeconds = sunset - sunrise;
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);

        return `${hours}h ${minutes}m`;
    }

    /**
     * Format duration in seconds to human readable format
     * @param {number} seconds - Duration in seconds
     * @returns {string} Formatted duration
     */
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${remainingSeconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    }

    /**
     * Get time zone name from offset
     * @param {number} timezoneOffset - Timezone offset in seconds
     * @returns {string} Timezone abbreviation
     */
    getTimezoneAbbreviation(timezoneOffset) {
        const offsetHours = timezoneOffset / 3600;
        const sign = offsetHours >= 0 ? '+' : '-';
        const absHours = Math.abs(offsetHours);
        const hours = Math.floor(absHours);
        const minutes = Math.floor((absHours - hours) * 60);

        return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    /**
     * Convert 24-hour time to 12-hour format
     * @param {string} time24 - Time in 24-hour format (HH:MM)
     * @returns {string} Time in 12-hour format
     */
    convertTo12Hour(time24) {
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;

        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    /**
     * Convert 12-hour time to 24-hour format
     * @param {string} time12 - Time in 12-hour format (H:MM AM/PM)
     * @returns {string} Time in 24-hour format
     */
    convertTo24Hour(time12) {
        const [time, period] = time12.split(' ');
        const [hours, minutes] = time.split(':').map(Number);

        let hours24 = hours;
        if (period === 'PM' && hours !== 12) {
            hours24 += 12;
        } else if (period === 'AM' && hours === 12) {
            hours24 = 0;
        }

        return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    /**
     * Get week number of the year
     * @param {number} timestamp - Unix timestamp in seconds
     * @returns {number} Week number
     */
    getWeekNumber(timestamp) {
        const date = new Date(timestamp * 1000);
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;

        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    /**
     * Get start and end of day for a timestamp
     * @param {number} timestamp - Unix timestamp in seconds
     * @returns {Object} Start and end of day timestamps
     */
    getDayBounds(timestamp) {
        const date = new Date(timestamp * 1000);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

        return {
            start: Math.floor(startOfDay.getTime() / 1000),
            end: Math.floor(endOfDay.getTime() / 1000)
        };
    }

    /**
     * Get timestamps for next N days
     * @param {number} days - Number of days
     * @param {number} startTimestamp - Starting timestamp (optional, defaults to now)
     * @returns {Array} Array of timestamps
     */
    getNextDays(days, startTimestamp = null) {
        const start = startTimestamp ? new Date(startTimestamp * 1000) : new Date();
        const timestamps = [];

        for (let i = 0; i < days; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            timestamps.push(Math.floor(date.getTime() / 1000));
        }

        return timestamps;
    }

    /**
     * Get timestamps for previous N days
     * @param {number} days - Number of days
     * @param {number} startTimestamp - Starting timestamp (optional, defaults to now)
     * @returns {Array} Array of timestamps
     */
    getPreviousDays(days, startTimestamp = null) {
        const start = startTimestamp ? new Date(startTimestamp * 1000) : new Date();
        const timestamps = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(start);
            date.setDate(date.getDate() - i);
            timestamps.push(Math.floor(date.getTime() / 1000));
        }

        return timestamps;
    }

    /**
     * Format timestamp for different contexts
     * @param {number} timestamp - Unix timestamp in seconds
     * @param {string} context - Context: 'short', 'medium', 'long', 'full'
     * @param {number} timezoneOffset - Timezone offset in seconds
     * @returns {string} Formatted timestamp
     */
    formatByContext(timestamp, context = 'medium', timezoneOffset = 0) {
        const date = new Date((timestamp + timezoneOffset) * 1000);

        const formats = {
            short: {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            },
            medium: {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            },
            long: {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            },
            full: {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            }
        };

        return date.toLocaleDateString(this.defaultLocale, formats[context] || formats.medium);
    }

    /**
     * Get age of timestamp in human readable format
     * @param {number} timestamp - Unix timestamp in seconds
     * @returns {string} Age description
     */
    getAge(timestamp) {
        const now = Math.floor(Date.now() / 1000);
        const age = now - timestamp;

        if (age < 60) return 'Just now';
        if (age < 3600) return `${Math.floor(age / 60)}m ago`;
        if (age < 86400) return `${Math.floor(age / 3600)}h ago`;
        if (age < 2592000) return `${Math.floor(age / 86400)}d ago`;
        if (age < 31536000) return `${Math.floor(age / 2592000)}mo ago`;
        return `${Math.floor(age / 31536000)}y ago`;
    }

    /**
     * Validate timestamp
     * @param {number} timestamp - Unix timestamp in seconds
     * @returns {boolean} True if valid
     */
    isValidTimestamp(timestamp) {
        const date = new Date(timestamp * 1000);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Convert Date object to Unix timestamp
     * @param {Date} date - Date object
     * @returns {number} Unix timestamp in seconds
     */
    dateToTimestamp(date) {
        return Math.floor(date.getTime() / 1000);
    }

    /**
     * Convert Unix timestamp to Date object
     * @param {number} timestamp - Unix timestamp in seconds
     * @returns {Date} Date object
     */
    timestampToDate(timestamp) {
        return new Date(timestamp * 1000);
    }

    /**
     * Set default locale
     * @param {string} locale - Locale string (e.g., 'en-US', 'es-ES')
     */
    setDefaultLocale(locale) {
        this.defaultLocale = locale;
    }

    /**
     * Get supported locales
     * @returns {Array} Array of supported locales
     */
    getSupportedLocales() {
        return [
            'en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT',
            'pt-BR', 'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN', 'ar-SA'
        ];
    }
}

// Export singleton instance
const dateUtils = new DateUtils();
export default dateUtils;
export { dateUtils };