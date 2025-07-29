// Date and time utility functions for weather app

// Format date for display
export const formatDate = (date, format = 'default', locale = 'en-US') => {
    const d = new Date(date);

    const formats = {
        default: d.toLocaleDateString(locale),
        long: d.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        short: d.toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric'
        }),
        weekday: d.toLocaleDateString(locale, { weekday: 'long' }),
        monthDay: d.toLocaleDateString(locale, {
            month: 'long',
            day: 'numeric'
        }),
        iso: d.toISOString().split('T')[0],
        relative: getRelativeDate(d)
    };

    return formats[format] || formats.default;
};

// Format time for display
export const formatTime = (time, format = '12h', timezone = null) => {
    const t = new Date(time);

    const options = {
        '12h': { hour: '2-digit', minute: '2-digit', hour12: true },
        '24h': { hour: '2-digit', minute: '2-digit', hour12: false },
        'full': {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }
    };

    if (timezone) {
        options[format].timeZone = timezone;
    }

    return t.toLocaleTimeString('en-US', options[format]);
};

// Get relative date (Today, Yesterday, Tomorrow, etc.)
export const getRelativeDate = (date) => {
    const today = new Date();
    const targetDate = new Date(date);

    // Reset time to midnight for accurate day comparison
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

    return targetDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

// Get time with timezone adjustment
export const getTimeWithTimezone = (timestamp, timezoneOffset) => {
    const date = new Date((timestamp + timezoneOffset) * 1000);
    return date;
};

// Calculate sunrise/sunset times
export const calculateSunTimes = (lat, lng, date = new Date()) => {
    const dayOfYear = getDayOfYear(date);
    const P = Math.asin(0.39795 * Math.cos(0.98563 * (dayOfYear - 173) * Math.PI / 180));
    const argument = -Math.tan(lat * Math.PI / 180) * Math.tan(P);

    if (Math.abs(argument) > 1) {
        // Polar day or polar night
        return {
            sunrise: null,
            sunset: null,
            dayLength: argument > 1 ? 0 : 24 * 60 // minutes
        };
    }

    const hourAngle = Math.acos(argument) * 180 / Math.PI / 15;
    const sunrise = 12 - hourAngle - lng / 15;
    const sunset = 12 + hourAngle - lng / 15;

    return {
        sunrise: minutesToTime(sunrise * 60),
        sunset: minutesToTime(sunset * 60),
        dayLength: hourAngle * 2 * 4 // minutes
    };
};

// Get day of year
export const getDayOfYear = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

// Convert minutes to time format
export const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Get week boundaries
export const getWeekBoundaries = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        start: new Date(monday),
        end: new Date(sunday)
    };
};

// Get month boundaries
export const getMonthBoundaries = (date = new Date()) => {
    const d = new Date(date);
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    return {
        start: firstDay,
        end: lastDay
    };
};

// Check if date is in the past
export const isPastDate = (date) => {
    return new Date(date) < new Date();
};

// Check if date is today
export const isToday = (date) => {
    const today = new Date();
    const checkDate = new Date(date);

    return today.toDateString() === checkDate.toDateString();
};

// Check if date is tomorrow
export const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkDate = new Date(date);

    return tomorrow.toDateString() === checkDate.toDateString();
};

// Get age of timestamp in human readable format
export const getAge = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;

    return past.toLocaleDateString();
};

// Generate date range
export const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
};

// Get season based on date and hemisphere
export const getSeason = (date = new Date(), hemisphere = 'north') => {
    const month = date.getMonth() + 1; // 1-12

    const seasons = {
        north: {
            spring: [3, 4, 5],
            summer: [6, 7, 8],
            autumn: [9, 10, 11],
            winter: [12, 1, 2]
        },
        south: {
            autumn: [3, 4, 5],
            winter: [6, 7, 8],
            spring: [9, 10, 11],
            summer: [12, 1, 2]
        }
    };

    const seasonMap = seasons[hemisphere] || seasons.north;

    for (const [season, months] of Object.entries(seasonMap)) {
        if (months.includes(month)) {
            return season;
        }
    }

    return 'unknown';
};

// Format duration in human readable format
export const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

// Get timezone offset in hours
export const getTimezoneOffset = () => {
    return new Date().getTimezoneOffset() / -60;
};

// Convert timestamp to different timezone
export const convertTimezone = (timestamp, fromOffset, toOffset) => {
    const date = new Date(timestamp);
    const utc = date.getTime() + (fromOffset * 60 * 60 * 1000);
    const targetTime = utc + (toOffset * 60 * 60 * 1000);
    return new Date(targetTime);
};

// Get time until next occurrence
export const getTimeUntil = (targetTime) => {
    const now = new Date();
    const target = new Date(targetTime);

    if (target <= now) {
        // If target is in the past, assume it's for tomorrow
        target.setDate(target.getDate() + 1);
    }

    const diff = target - now;
    return formatDuration(diff);
};

// Create calendar grid for month view
export const createCalendarGrid = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);

    // Adjust to start from Sunday
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    const weeks = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
        const week = [];
        for (let i = 0; i < 7; i++) {
            week.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        weeks.push(week);

        if (current > lastDay && current.getDay() === 0) break;
    }

    return weeks;
};