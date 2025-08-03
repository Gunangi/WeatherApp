// weatherAPI.js - API calls to weather services

class WeatherAPI {
    constructor(apiKey = '38b64d931ea106a38a71f9ec1643ba9d') {
        this.API_KEY = apiKey;
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
        this.GEO_URL = 'https://api.openweathermap.org/geo/1.0';
        this.AIR_POLLUTION_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
        this.UV_URL = 'https://api.openweathermap.org/data/2.5/uvi';
    }

    /**
     * Get current weather by coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {string} units - Units (metric, imperial, kelvin)
     * @returns {Promise<Object>} Weather data
     */
    async getCurrentWeather(lat, lon, units = 'metric') {
        try {
            const response = await fetch(
                `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=${units}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.processWeatherData(data);
        } catch (error) {
            console.error('Error fetching current weather:', error);
            throw new Error('Failed to fetch current weather data');
        }
    }

    /**
     * Get weather forecast by coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {string} units - Units (metric, imperial, kelvin)
     * @returns {Promise<Object>} Forecast data
     */
    async getForecast(lat, lon, units = 'metric') {
        try {
            const response = await fetch(
                `${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=${units}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.processForecastData(data);
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw new Error('Failed to fetch forecast data');
        }
    }

    /**
     * Get weather by city name
     * @param {string} city - City name
     * @param {string} units - Units (metric, imperial, kelvin)
     * @returns {Promise<Object>} Weather data
     */
    async getWeatherByCity(city, units = 'metric') {
        try {
            const response = await fetch(
                `${this.BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${this.API_KEY}&units=${units}`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('City not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.processWeatherData(data);
        } catch (error) {
            console.error('Error fetching weather by city:', error);
            throw error;
        }
    }

    /**
     * Get air quality data
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<Object>} Air quality data
     */
    async getAirQuality(lat, lon) {
        try {
            const response = await fetch(
                `${this.AIR_POLLUTION_URL}?lat=${lat}&lon=${lon}&appid=${this.API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.processAirQualityData(data);
        } catch (error) {
            console.error('Error fetching air quality:', error);
            throw new Error('Failed to fetch air quality data');
        }
    }

    /**
     * Get UV index data
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<Object>} UV index data
     */
    async getUVIndex(lat, lon) {
        try {
            const response = await fetch(
                `${this.UV_URL}?lat=${lat}&lon=${lon}&appid=${this.API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                uvi: data.value,
                date: new Date(data.date * 1000),
                risk: this.getUVRiskLevel(data.value)
            };
        } catch (error) {
            console.error('Error fetching UV index:', error);
            throw new Error('Failed to fetch UV index data');
        }
    }

    /**
     * Search cities by name
     * @param {string} query - Search query
     * @param {number} limit - Maximum number of results
     * @returns {Promise<Array>} Array of cities
     */
    async searchCities(query, limit = 5) {
        try {
            const response = await fetch(
                `${this.GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${this.API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.map(city => ({
                name: city.name,
                country: city.country,
                state: city.state,
                lat: city.lat,
                lon: city.lon,
                displayName: `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`
            }));
        } catch (error) {
            console.error('Error searching cities:', error);
            throw new Error('Failed to search cities');
        }
    }

    /**
     * Get historical weather data (requires premium API key)
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {number} dt - Unix timestamp
     * @returns {Promise<Object>} Historical weather data
     */
    async getHistoricalWeather(lat, lon, dt) {
        try {
            const response = await fetch(
                `${this.BASE_URL}/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&appid=${this.API_KEY}&units=metric`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.processHistoricalData(data);
        } catch (error) {
            console.error('Error fetching historical weather:', error);
            throw new Error('Failed to fetch historical weather data');
        }
    }

    /**
     * Process raw weather data from API
     * @param {Object} data - Raw API response
     * @returns {Object} Processed weather data
     */
    processWeatherData(data) {
        return {
            id: data.id,
            name: data.name,
            country: data.sys.country,
            coordinates: {
                lat: data.coord.lat,
                lon: data.coord.lon
            },
            weather: {
                main: data.weather[0].main,
                description: data.weather[0].description,
                icon: data.weather[0].icon
            },
            temperature: {
                current: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                min: Math.round(data.main.temp_min),
                max: Math.round(data.main.temp_max)
            },
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            visibility: data.visibility,
            wind: {
                speed: data.wind.speed,
                direction: data.wind.deg,
                gust: data.wind.gust
            },
            clouds: data.clouds.all,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
            timezone: data.timezone,
            timestamp: data.dt
        };
    }

    /**
     * Process raw forecast data from API
     * @param {Object} data - Raw API response
     * @returns {Object} Processed forecast data
     */
    processForecastData(data) {
        const dailyForecasts = this.groupForecastByDay(data.list);

        return {
            city: {
                name: data.city.name,
                country: data.city.country,
                coordinates: {
                    lat: data.city.coord.lat,
                    lon: data.city.coord.lon
                },
                timezone: data.city.timezone
            },
            hourly: data.list.map(item => ({
                datetime: new Date(item.dt * 1000),
                temperature: Math.round(item.main.temp),
                feelsLike: Math.round(item.main.feels_like),
                weather: {
                    main: item.weather[0].main,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon
                },
                humidity: item.main.humidity,
                pressure: item.main.pressure,
                wind: {
                    speed: item.wind.speed,
                    direction: item.wind.deg
                },
                clouds: item.clouds.all,
                precipitation: item.rain ? item.rain['3h'] || 0 : 0
            })),
            daily: dailyForecasts
        };
    }

    /**
     * Process air quality data
     * @param {Object} data - Raw API response
     * @returns {Object} Processed air quality data
     */
    processAirQualityData(data) {
        const aqi = data.list[0].main.aqi;
        const components = data.list[0].components;

        return {
            aqi: aqi,
            aqiLevel: this.getAQILevel(aqi),
            components: {
                co: components.co,
                no: components.no,
                no2: components.no2,
                o3: components.o3,
                so2: components.so2,
                pm2_5: components.pm2_5,
                pm10: components.pm10,
                nh3: components.nh3
            },
            timestamp: data.list[0].dt
        };
    }

    /**
     * Group hourly forecast by day
     * @param {Array} hourlyData - Hourly forecast data
     * @returns {Array} Daily forecast data
     */
    groupForecastByDay(hourlyData) {
        const dailyMap = new Map();

        hourlyData.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();

            if (!dailyMap.has(dayKey)) {
                dailyMap.set(dayKey, {
                    date: date,
                    temperatures: [],
                    weather: item.weather[0],
                    humidity: [],
                    wind: [],
                    precipitation: 0
                });
            }

            const dayData = dailyMap.get(dayKey);
            dayData.temperatures.push(item.main.temp);
            dayData.humidity.push(item.main.humidity);
            dayData.wind.push(item.wind.speed);

            if (item.rain) {
                dayData.precipitation += item.rain['3h'] || 0;
            }
        });

        return Array.from(dailyMap.values()).map(day => ({
            date: day.date,
            temperature: {
                min: Math.round(Math.min(...day.temperatures)),
                max: Math.round(Math.max(...day.temperatures)),
                avg: Math.round(day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length)
            },
            weather: day.weather,
            humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
            windSpeed: Math.round(day.wind.reduce((a, b) => a + b, 0) / day.wind.length * 10) / 10,
            precipitation: Math.round(day.precipitation * 10) / 10
        }));
    }

    /**
     * Get AQI level description
     * @param {number} aqi - Air Quality Index
     * @returns {Object} AQI level information
     */
    getAQILevel(aqi) {
        const levels = {
            1: { level: 'Good', color: '#00e400', description: 'Air quality is satisfactory' },
            2: { level: 'Fair', color: '#ffff00', description: 'Air quality is acceptable' },
            3: { level: 'Moderate', color: '#ff7e00', description: 'Sensitive individuals may experience minor issues' },
            4: { level: 'Poor', color: '#ff0000', description: 'Health warnings for sensitive groups' },
            5: { level: 'Very Poor', color: '#8f3f97', description: 'Health warnings for everyone' }
        };

        return levels[aqi] || levels[1];
    }

    /**
     * Get UV risk level
     * @param {number} uvi - UV Index
     * @returns {Object} UV risk information
     */
    getUVRiskLevel(uvi) {
        if (uvi <= 2) return { level: 'Low', color: '#00e400' };
        if (uvi <= 5) return { level: 'Moderate', color: '#ffff00' };
        if (uvi <= 7) return { level: 'High', color: '#ff7e00' };
        if (uvi <= 10) return { level: 'Very High', color: '#ff0000' };
        return { level: 'Extreme', color: '#8f3f97' };
    }

    /**
     * Process historical weather data
     * @param {Object} data - Raw API response
     * @returns {Object} Processed historical data
     */
    processHistoricalData(data) {
        return {
            timezone: data.timezone,
            current: this.processWeatherData({
                ...data.current,
                coord: { lat: data.lat, lon: data.lon },
                name: 'Historical Location',
                sys: { country: 'XX' },
                weather: [data.current.weather[0]],
                main: {
                    temp: data.current.temp,
                    feels_like: data.current.feels_like,
                    temp_min: data.current.temp,
                    temp_max: data.current.temp,
                    pressure: data.current.pressure,
                    humidity: data.current.humidity
                },
                wind: data.current.wind_speed ? { speed: data.current.wind_speed, deg: data.current.wind_deg } : { speed: 0, deg: 0 },
                clouds: { all: data.current.clouds },
                visibility: data.current.visibility
            }),
            hourly: data.hourly?.map(hour => ({
                datetime: new Date(hour.dt * 1000),
                temperature: Math.round(hour.temp),
                weather: hour.weather[0],
                humidity: hour.humidity,
                pressure: hour.pressure,
                windSpeed: hour.wind_speed,
                clouds: hour.clouds
            })) || []
        };
    }
}

// Export singleton instance
const weatherAPI = new WeatherAPI();
export default weatherAPI;

export { weatherAPI };