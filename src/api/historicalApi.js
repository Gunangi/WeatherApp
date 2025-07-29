import { cache } from '../utils/cacheUtils.js';

/**
 * Historical Weather API service
 * Fetches historical weather data and trends using OpenWeatherMap One Call API
 */

class HistoricalWeatherService {
    constructor() {
        this.apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY || 'your-api-key';
        this.baseUrl = 'https://api.openweathermap.org/data/3.0/onecall/timemachine';
        this.rateLimit = {
            requests: 0,
            resetTime: Date.now() + 60000
        };
    }

    /**
     * Check rate limit
     */
    checkRateLimit() {
        const now = Date.now();
        if (now > this.rateLimit.resetTime) {
            this.rateLimit.requests = 0;
            this.rateLimit.resetTime = now + 60000;
        }

        if (this.rateLimit.requests >= 1000) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }

        this.rateLimit.requests++;
    }

    /**
     * Get historical weather data for a specific date
     */
    async getHistoricalWeather(lat, lon, timestamp, units = 'metric') {
        try {
            this.checkRateLimit();

            const cacheKey = `historical_${lat}_${lon}_${timestamp}_${units}`;
            const cached = await cache.get(cacheKey);
            if (cached) {
                console.log('Historical weather cache hit');
                return cached;
            }

            const url = `${this.baseUrl}?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${this.apiKey}&units=${units}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Historical weather API failed: ${response.status}`);
            }

            const data = await response.json();

            const processedData = {
                location: { lat, lon },
                date: new Date(timestamp * 1000).toISOString().split('T')[0],
                timestamp,
                current: {
                    temperature: data.data[0].temp,
                    feelsLike: data.data[0].feels_like,
                    pressure: data.data[0].pressure,
                    humidity: data.data[0].humidity,
                    dewPoint: data.data[0].dew_point,
                    uvIndex: data.data[0].uvi || 0,
                    clouds: data.data[0].clouds,
                    visibility: data.data[0].visibility || 10000,
                    windSpeed: data.data[0].wind_speed,
                    windDirection: data.data[0].wind_deg,
                    windGust: data.data[0].wind_gust || 0,
                    weather: {
                        main: data.data[0].weather[0].main,
                        description: data.data[0].weather[0].description,
                        icon: data.data[0].weather[0].icon
                    }
                },
                sunrise: data.data[0].sunrise,
                sunset: data.data[0].sunset,
                timezone: data.timezone,
                timezoneOffset: data.timezone_offset
            };

            // Cache for 24 hours (historical data doesn't change)
            await cache.set(cacheKey, processedData, 86400);

            return processedData;
        } catch (error) {
            console.error('Historical weather error:', error);
            return this.getMockHistoricalData(lat, lon, timestamp);
        }
    }

    /**
     * Get historical weather data for a date range
     */
    async getHistoricalWeatherRange(lat, lon, startDate, endDate, units = 'metric') {
        try {
            const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
            const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
            const oneDayInSeconds = 86400;

            const promises = [];

            for (let timestamp = startTimestamp; timestamp <= endTimestamp; timestamp += oneDayInSeconds) {
                promises.push(this.getHistoricalWeather(lat, lon, timestamp, units));
            }

            const results = await Promise.allSettled(promises);

            return results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value)
                .sort((a, b) => a.timestamp - b.timestamp);
        } catch (error) {
            console.error('Historical weather range error:', error);
            return [];
        }
    }

    /**
     * Get weather statistics for a location over time
     */
    async getWeatherStatistics(lat, lon, year, month = null) {
        try {
            const cacheKey = `weather_stats_${lat}_${lon}_${year}_${month || 'all'}`;
            const cached = await cache.get(cacheKey);
            if (cached) {
                console.log('Weather statistics cache hit');
                return cached;
            }

            // Get data for the entire year or specific month
            let startDate, endDate;

            if (month) {
                startDate = new Date(year, month - 1, 1);
                endDate = new Date(year, month, 0); // Last day of the month
            } else {
                startDate = new Date(year, 0, 1);
                endDate = new Date(year, 11, 31);
            }

            const historicalData = await this.getHistoricalWeatherRange(lat, lon, startDate, endDate);

            if (historicalData.length === 0) {
                throw new Error('No historical data available');
            }

            const stats = this.calculateWeatherStatistics(historicalData);

            // Cache for 24 hours
            await cache.set(cacheKey, stats, 86400);

            return stats;
        } catch (error) {
            console.error('Weather statistics error:', error);
            return this.getMockWeatherStatistics();
        }
    }

    /**
     * Calculate weather statistics from historical data
     */
    calculateWeatherStatistics(data) {
        const temperatures = data.map(d => d.current.temperature);
        const humidity = data.map(d => d.current.humidity);
        const pressure = data.map(d => d.current.pressure);
        const windSpeeds = data.map(d => d.current.windSpeed);
        const conditions = data.map(d => d.current.weather.main);

        // Temperature statistics
        const tempStats = {
            min: Math.min(...temperatures),
            max: Math.max(...temperatures),
            average: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
            median: this.calculateMedian(temperatures)
        };

        // Humidity statistics
        const humidityStats = {
            min: Math.min(...humidity),
            max: Math.max(...humidity),
            average: humidity.reduce((a, b) => a + b, 0) / humidity.length
        };

        // Pressure statistics
        const pressureStats = {
            min: Math.min(...pressure),
            max: Math.max(...pressure),
            average: pressure.reduce((a, b) => a + b, 0) / pressure.length
        };

        // Wind statistics
        const windStats = {
            min: Math.min(...windSpeeds),
            max: Math.max(...windSpeeds),
            average: windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length
        };

        // Weather condition frequency
        const conditionCounts = conditions.reduce((acc, condition) => {
            acc[condition] = (acc[condition] || 0) + 1;
            return acc;
        }, {});

        const mostCommonCondition = Object.entries(conditionCounts)
            .sort(([,a], [,b]) => b - a)[0];

        return {
            period: {
                startDate: data[0].date,
                endDate: data[data.length - 1].date,
                totalDays: data.length
            },
            temperature: tempStats,
            humidity: humidityStats,
            pressure: pressureStats,
            wind: windStats,
            conditions: {
                mostCommon: mostCommonCondition[0],
                frequency: mostCommonCondition[1],
                distribution: conditionCounts
            },
            extremes: {
                hottestDay: data.find(d => d.current.temperature === tempStats.max),
                coldestDay: data.find(d => d.current.temperature === tempStats.min),
                windestDay: data.find(d => d.current.windSpeed === windStats.max)
            }
        };
    }

    /**
     * Calculate median value
     */
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);

        return sorted.length % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    /**
     * Get weather trends and patterns
     */
    async getWeatherTrends(lat, lon, years = 5) {
        try {
            const cacheKey = `weather_trends_${lat}_${lon}_${years}`;
            const cached = await cache.get(cacheKey);
            if (cached) {
                console.log('Weather trends cache hit');
                return cached;
            }

            const currentYear = new Date().getFullYear();
            const yearlyStats = [];

            // Get statistics for each year
            for (let i = 0; i < years; i++) {
                const year = currentYear - i - 1;
                try {
                    const stats = await this.getWeatherStatistics(lat, lon, year);
                    yearlyStats.push({ year, ...stats });
                } catch (error) {
                    console.warn(`Failed to get stats for year ${year}:`, error);
                }
            }

            const trends = this.analyzeTrends(yearlyStats);

            // Cache for 12 hours
            await cache.set(cacheKey, trends, 43200);

            return trends;
        } catch (error) {
            console.error('Weather trends error:', error);
            return this.getMockWeatherTrends();
        }
    }

    /**
     * Analyze weather trends from yearly statistics
     */
    analyzeTrends(yearlyStats) {
        if (yearlyStats.length < 2) {
            return { error: 'Insufficient data for trend analysis' };
        }

        const years = yearlyStats.map(s => s.year);
        const avgTemps = yearlyStats.map(s => s.temperature.average);
        const avgHumidity = yearlyStats.map(s => s.humidity.average);
        const avgPressure = yearlyStats.map(s => s.pressure.average);

        return {
            temperatureTrend: {
                direction: this.calculateTrendDirection(avgTemps),
                changePerYear: this.calculateAverageChange(avgTemps),
                data: years.map((year, i) => ({ year, value: avgTemps[i] }))
            },
            humidityTrend: {
                direction: this.calculateTrendDirection(avgHumidity),
                changePerYear: this.calculateAverageChange(avgHumidity),
                data: years.map((year, i) => ({ year, value: avgHumidity[i] }))
            },
            pressureTrend: {
                direction: this.calculateTrendDirection(avgPressure),
                changePerYear: this.calculateAverageChange(avgPressure),
                data: years.map((year, i) => ({ year, value: avgPressure[i] }))
            },
            summary: this.generateTrendSummary(yearlyStats)
        };
    }

    /**
     * Calculate trend direction
     */
    calculateTrendDirection(values) {
        if (values.length < 2) return 'stable';

        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.ceil(values.length / 2));

        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        const difference = secondAvg - firstAvg;

        if (Math.abs(difference) < 0.1) return 'stable';
        return difference > 0 ? 'increasing' : 'decreasing';
    }

    /**
     * Calculate average change per year
     */
    calculateAverageChange(values) {
        if (values.length < 2) return 0;

        const changes = [];
        for (let i = 1; i < values.length; i++) {
            changes.push(values[i] - values[i - 1]);
        }

        return changes.reduce((a, b) => a + b, 0) / changes.length;
    }

    /**
     * Generate trend summary
     */
    generateTrendSummary(yearlyStats) {
        const latestYear = yearlyStats[0];
        const oldestYear = yearlyStats[yearlyStats.length - 1];

        const tempChange = latestYear.temperature.average - oldestYear.temperature.average;
        const years = latestYear.year - oldestYear.year;

        return {
            period: `${oldestYear.year}-${latestYear.year}`,
            temperatureChange: tempChange,
            averageTemperatureChange: tempChange / years,
            significantChanges: this.identifySignificantChanges(yearlyStats)
        };
    }

    /**
     * Identify significant changes in weather patterns
     */
    identifySignificantChanges(yearlyStats) {
        const changes = [];

        // Check for temperature anomalies
        const temps = yearlyStats.map(s => s.temperature.average);
        const tempMean = temps.reduce((a, b) => a + b, 0) / temps.length;
        const tempStdDev = Math.sqrt(temps.reduce((sq, n) => sq + Math.pow(n - tempMean, 2), 0) / temps.length);

        yearlyStats.forEach(stats => {
            const tempDeviation = Math.abs(stats.temperature.average - tempMean) / tempStdDev;
            if (tempDeviation > 1.5) {
                changes.push({
                    year: stats.year,
                    type: 'temperature_anomaly',
                    description: `Unusual temperature in ${stats.year}: ${stats.temperature.average.toFixed(1)}°C`,
                    severity: tempDeviation > 2 ? 'high' : 'moderate'
                });
            }
        });

        return changes;
    }

    /**
     * Compare weather between two time periods
     */
    async compareWeatherPeriods(lat, lon, period1, period2) {
        try {
            const [stats1, stats2] = await Promise.all([
                this.getWeatherStatistics(lat, lon, period1.year, period1.month),
                this.getWeatherStatistics(lat, lon, period2.year, period2.month)
            ]);

            return {
                period1: { ...period1, stats: stats1 },
                period2: { ...period2, stats: stats2 },
                comparison: {
                    temperatureDiff: stats2.temperature.average - stats1.temperature.average,
                    humidityDiff: stats2.humidity.average - stats1.humidity.average,
                    pressureDiff: stats2.pressure.average - stats1.pressure.average,
                    windDiff: stats2.wind.average - stats1.wind.average
                }
            };
        } catch (error) {
            console.error('Weather comparison error:', error);
            return null;
        }
    }

    /**
     * Get seasonal patterns for a location
     */
    async getSeasonalPatterns(lat, lon, years = 3) {
        try {
            const cacheKey = `seasonal_patterns_${lat}_${lon}_${years}`;
            const cached = await cache.get(cacheKey);
            if (cached) return cached;

            const currentYear = new Date().getFullYear();
            const monthlyData = {};

            // Initialize monthly arrays
            for (let month = 1; month <= 12; month++) {
                monthlyData[month] = [];
            }

            // Collect data for each month across multiple years
            for (let year = currentYear - years; year < currentYear; year++) {
                for (let month = 1; month <= 12; month++) {
                    try {
                        const stats = await this.getWeatherStatistics(lat, lon, year, month);
                        monthlyData[month].push(stats);
                    } catch (error) {
                        console.warn(`Failed to get stats for ${year}-${month}:`, error);
                    }
                }
            }

            // Calculate seasonal averages
            const seasonalPatterns = {};
            for (let month = 1; month <= 12; month++) {
                const monthData = monthlyData[month];
                if (monthData.length > 0) {
                    seasonalPatterns[month] = {
                        month: month,
                        monthName: new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' }),
                        temperature: {
                            average: monthData.reduce((sum, d) => sum + d.temperature.average, 0) / monthData.length,
                            min: Math.min(...monthData.map(d => d.temperature.min)),
                            max: Math.max(...monthData.map(d => d.temperature.max))
                        },
                        humidity: {
                            average: monthData.reduce((sum, d) => sum + d.humidity.average, 0) / monthData.length
                        },
                        commonCondition: this.getMostCommonCondition(monthData)
                    };
                }
            }

            // Cache for 24 hours
            await cache.set(cacheKey, seasonalPatterns, 86400);

            return seasonalPatterns;
        } catch (error) {
            console.error('Seasonal patterns error:', error);
            return this.getMockSeasonalPatterns();
        }
    }

    /**
     * Get most common weather condition from monthly data
     */
    getMostCommonCondition(monthData) {
        const allConditions = monthData.flatMap(d =>
            Object.entries(d.conditions.distribution)
        );

        const conditionCounts = allConditions.reduce((acc, [condition, count]) => {
            acc[condition] = (acc[condition] || 0) + count;
            return acc;
        }, {});

        return Object.entries(conditionCounts)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Clear';
    }

    /**
     * Mock historical data for demo purposes
     */
    getMockHistoricalData(lat, lon, timestamp) {
        const date = new Date(timestamp * 1000);
        const baseTemp = 25 + Math.sin(date.getMonth() / 12 * 2 * Math.PI) * 10; // Seasonal variation

        return {
            location: { lat, lon },
            date: date.toISOString().split('T')[0],
            timestamp,
            current: {
                temperature: baseTemp + (Math.random() - 0.5) * 10,
                feelsLike: baseTemp + (Math.random() - 0.5) * 10 + 2,
                pressure: 1013 + (Math.random() - 0.5) * 50,
                humidity: 60 + (Math.random() - 0.5) * 40,
                dewPoint: baseTemp - 5,
                uvIndex: Math.max(0, 5 + (Math.random() - 0.5) * 6),
                clouds: Math.random() * 100,
                visibility: 8000 + Math.random() * 7000,
                windSpeed: Math.random() * 15,
                windDirection: Math.random() * 360,
                windGust: Math.random() * 20,
                weather: {
                    main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
                    description: 'mock weather condition',
                    icon: '01d'
                }
            },
            sunrise: timestamp - 6 * 3600,
            sunset: timestamp + 6 * 3600,
            timezone: 'UTC',
            timezoneOffset: 0
        };
    }

    /**
     * Mock weather statistics for demo
     */
    getMockWeatherStatistics() {
        return {
            period: {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                totalDays: 365
            },
            temperature: {
                min: 15,
                max: 35,
                average: 25,
                median: 24
            },
            humidity: {
                min: 30,
                max: 90,
                average: 65
            },
            pressure: {
                min: 980,
                max: 1040,
                average: 1013
            },
            wind: {
                min: 0,
                max: 25,
                average: 8
            },
            conditions: {
                mostCommon: 'Clear',
                frequency: 120,
                distribution: {
                    'Clear': 120,
                    'Clouds': 100,
                    'Rain': 80,
                    'Thunderstorm': 30
                }
            }
        };
    }

    /**
     * Mock weather trends for demo
     */
    getMockWeatherTrends() {
        return {
            temperatureTrend: {
                direction: 'increasing',
                changePerYear: 0.3,
                data: [
                    { year: 2020, value: 24.2 },
                    { year: 2021, value: 24.5 },
                    { year: 2022, value: 24.8 },
                    { year: 2023, value: 25.1 }
                ]
            },
            summary: {
                period: '2020-2023',
                temperatureChange: 0.9,
                averageTemperatureChange: 0.3,
                significantChanges: []
            }
        };
    }

    /**
     * Mock seasonal patterns for demo
     */
    getMockSeasonalPatterns() {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const patterns = {};

        months.forEach((monthName, index) => {
            const month = index + 1;
            const baseTemp = 20 + Math.sin((month - 1) / 12 * 2 * Math.PI) * 15;

            patterns[month] = {
                month,
                monthName,
                temperature: {
                    average: baseTemp,
                    min: baseTemp - 10,
                    max: baseTemp + 10
                },
                humidity: {
                    average: 65 + Math.sin((month - 1) / 12 * 2 * Math.PI) * 20
                },
                commonCondition: month >= 6 && month <= 9 ? 'Rain' : 'Clear'
            };
        });

        return patterns;
    }
}

// Create singleton instance
const historicalWeatherService = new HistoricalWeatherService();

// Export individual functions
export const getHistoricalWeather = (lat, lon, timestamp, units) =>
    historicalWeatherService.getHistoricalWeather(lat, lon, timestamp, units);

export const getHistoricalWeatherRange = (lat, lon, startDate, endDate, units) =>
    historicalWeatherService.getHistoricalWeatherRange(lat, lon, startDate, endDate, units);

export const getWeatherStatistics = (lat, lon, year, month) =>
    historicalWeatherService.getWeatherStatistics(lat, lon, year, month);

export const getWeatherTrends = (lat, lon, years) =>
    historicalWeatherService.getWeatherTrends(lat, lon, years);

export const compareWeatherPeriods = (lat, lon, period1, period2) =>
    historicalWeatherService.compareWeatherPeriods(lat, lon, period1, period2);

export const getSeasonalPatterns = (lat, lon, years) =>
    historicalWeatherService.getSeasonalPatterns(lat, lon, years);

export default historicalWeatherService;