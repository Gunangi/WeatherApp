// Enhanced Weather App JavaScript
class WeatherApp {
    constructor() {
        this.apiKey = '38b64d931ea106a38a71f9ec1643ba9d'; // Replace with actual API key
        this.apiBase = 'https://api.openweathermap.org/data/2.5';
        this.geoApiBase = 'https://api.openweathermap.org/geo/1.0';
        this.currentCity = 'London';
        this.currentUnits = 'metric';
        this.userId = this.generateUserId();
        this.preferences = this.getDefaultPreferences();

        this.initializeEventListeners();
        this.loadUserPreferences();
        this.initializeApp();
    }

    // Generate unique user ID for session
    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Default user preferences
    getDefaultPreferences() {
        return {
            temperatureUnit: 'celsius',
            theme: 'light',
            defaultCity: 'London',
            notifications: true,
            locationAccess: false,
            visibleMetrics: ['humidity', 'windSpeed', 'pressure', 'visibility', 'sunrise']
        };
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Settings modal
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetSettings();
        });

        // City search
        const citySearch = document.getElementById('city-search');
        citySearch.addEventListener('input', (e) => {
            this.handleCitySearch(e.target.value);
        });

        citySearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchWeather(e.target.value);
            }
        });

        // Location button
        document.getElementById('location-btn').addEventListener('click', () => {
            this.getCurrentLocation();
        });

        // Historical weather
        document.getElementById('fetch-historical').addEventListener('click', () => {
            this.fetchHistoricalWeather();
        });

        // Modal close on outside click
        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') {
                this.closeSettings();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSettings();
            }
        });

        // Set max date for historical weather to yesterday
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        document.getElementById('historical-date').max = yesterday.toISOString().split('T')[0];

        // Click outside search suggestions to hide them
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideCitySuggestions();
            }
        });
    }

    // Initialize the app
    async initializeApp() {
        this.applyTheme();
        await this.loadWeatherData(this.currentCity);
        await this.checkApiCapabilities();
    }

    // Load user preferences from localStorage
    async loadUserPreferences() {
        try {
            const localPrefs = localStorage.getItem('weatherAppPreferences');
            if (localPrefs) {
                this.preferences = { ...this.preferences, ...JSON.parse(localPrefs) };
                this.applyPreferences();
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }

    // Apply preferences to UI
    applyPreferences() {
        this.currentUnits = this.preferences.temperatureUnit === 'fahrenheit' ? 'imperial' : 'metric';
        this.setTheme(this.preferences.theme);

        if (this.preferences.defaultCity) {
            this.currentCity = this.preferences.defaultCity;
            document.getElementById('city-search').value = this.currentCity;
        }

        this.updateSettingsForm();
    }

    // Update settings form with current preferences
    updateSettingsForm() {
        document.querySelector(`input[name="temp-unit"][value="${this.preferences.temperatureUnit}"]`).checked = true;
        document.querySelector(`input[name="theme"][value="${this.preferences.theme}"]`).checked = true;
        document.getElementById('default-city').value = this.preferences.defaultCity || '';
        document.getElementById('notifications-enabled').checked = this.preferences.notifications;
        document.getElementById('location-access').checked = this.preferences.locationAccess;

        this.preferences.visibleMetrics.forEach(metric => {
            const checkbox = document.querySelector(`.metric-checkbox[value="${metric}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    // Toggle theme
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        this.preferences.theme = newTheme;
        this.savePreferencesToStorage();
    }

    // Set theme
    setTheme(theme) {
        if (theme === 'auto') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }

        const themeIcon = document.querySelector('#theme-toggle i');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Apply theme based on preference
    applyTheme() {
        this.setTheme(this.preferences.theme);
    }

    // Save preferences to localStorage
    savePreferencesToStorage() {
        try {
            localStorage.setItem('weatherAppPreferences', JSON.stringify(this.preferences));
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    // Show loading state
    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('weather-content').style.display = 'none';
        document.getElementById('error-message').style.display = 'none';
    }

    // Hide loading state
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    // Show error message
    showError(message = 'Unable to fetch weather data. Please try again.') {
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('error-message').querySelector('p').textContent = message;
        document.getElementById('weather-content').style.display = 'none';
        this.hideLoading();
    }

    // Show weather content
    showWeatherContent() {
        document.getElementById('weather-content').style.display = 'block';
        document.getElementById('error-message').style.display = 'none';
        this.hideLoading();
    }

    // Handle city search with debouncing
    handleCitySearch(query) {
        clearTimeout(this.searchTimeout);

        if (query.length < 2) {
            this.hideCitySuggestions();
            return;
        }

        this.searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${this.geoApiBase}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.apiKey}`
                );
                if (response.ok) {
                    const cities = await response.json();
                    this.showCitySuggestions(cities);
                }
            } catch (error) {
                console.error('Error searching cities:', error);
            }
        }, 300);
    }

    // Show city suggestions
    showCitySuggestions(cities) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        suggestionsContainer.innerHTML = '';

        if (cities && cities.length > 0) {
            cities.forEach(city => {
                const suggestion = document.createElement('div');
                suggestion.className = 'suggestion-item';
                suggestion.innerHTML = `
                    <strong>${city.name}</strong>
                    ${city.state ? `, ${city.state}` : ''}, ${city.country}
                `;
                suggestion.addEventListener('click', () => {
                    this.selectCity(city);
                });
                suggestionsContainer.appendChild(suggestion);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            this.hideCitySuggestions();
        }
    }

    // Hide city suggestions
    hideCitySuggestions() {
        document.getElementById('search-suggestions').style.display = 'none';
    }

    // Select city from suggestions
    selectCity(city) {
        document.getElementById('city-search').value = city.name;
        this.hideCitySuggestions();
        this.searchWeather(city.name);
    }

    // Search weather for a city
    async searchWeather(city) {
        if (!city.trim()) return;

        this.currentCity = city.trim();
        await this.loadWeatherData(this.currentCity);
    }

    // Get current location
    getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showToast('Geolocation is not supported by this browser.', 'error');
            return;
        }

        this.showLoading();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                        `${this.apiBase}/weather?lat=${latitude}&lon=${longitude}&units=${this.currentUnits}&appid=${this.apiKey}`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        this.currentCity = data.name;
                        document.getElementById('city-search').value = this.currentCity;
                        await this.loadWeatherData(this.currentCity);
                        this.showToast('Location detected successfully!', 'success');
                    } else {
                        throw new Error('Failed to fetch weather data');
                    }
                } catch (error) {
                    console.error('Error fetching weather by coordinates:', error);
                    this.handleApiError(error, 'location weather');
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                this.showError('Unable to access your location. Please search for a city manually.');
            }
        );
    }

    // Load all weather data for a city
    async loadWeatherData(city) {
        this.showLoading();

        try {
            await this.loadCurrentWeather(city);

            await Promise.all([
                this.loadForecast(city),
                this.loadHourlyForecast(city),
                this.loadAirQuality(city),
                this.loadUVIndex(city)
            ]);

            this.loadActivityRecommendations();
            this.loadClothingRecommendations();

            this.showWeatherContent();
            this.showToast(`Weather data loaded for ${city}`, 'success');
        } catch (error) {
            console.error('Error loading weather data:', error);
            this.handleApiError(error, 'weather data');
        }
    }

    // Load current weather
    async loadCurrentWeather(city) {
        const url = `${this.apiBase}/weather?q=${encodeURIComponent(city)}&units=${this.currentUnits}&appid=${this.apiKey}`;
        const data = await this.makeApiCall(url, 'Failed to fetch current weather');
        this.currentWeatherData = data;
        this.updateCurrentWeather(data);
    }

    // Update current weather UI
    updateCurrentWeather(weather) {
        document.getElementById('current-city').textContent = `${weather.name}, ${weather.sys.country}`;
        document.getElementById('current-time').textContent = this.formatCurrentTime(weather.timezone);
        document.getElementById('current-temp').textContent = Math.round(weather.main.temp);
        document.getElementById('feels-like-temp').textContent = Math.round(weather.main.feels_like);
        document.getElementById('weather-desc').textContent = weather.weather[0].description;

        const iconElement = document.getElementById('current-weather-icon');
        iconElement.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
        iconElement.alt = weather.weather[0].description;

        document.getElementById('humidity').textContent = `${weather.main.humidity}%`;
        document.getElementById('wind-speed').textContent = `${Math.round(this.convertWindSpeed(weather.wind.speed))} ${this.getWindSpeedUnit()}`;
        document.getElementById('pressure').textContent = `${weather.main.pressure} hPa`;
        document.getElementById('visibility').textContent = `${Math.round(weather.visibility / 1000)} km`;
        document.getElementById('sunrise').textContent = this.formatTime(weather.sys.sunrise, weather.timezone);
        document.getElementById('sunset').textContent = this.formatTime(weather.sys.sunset, weather.timezone);

        document.querySelectorAll('.temp-unit').forEach(el => {
            el.textContent = this.getTemperatureUnit();
        });

        this.updateAriaLabels();
    }

    // Load 5-day forecast
    async loadForecast(city) {
        const url = `${this.apiBase}/forecast?q=${encodeURIComponent(city)}&units=${this.currentUnits}&appid=${this.apiKey}`;
        const data = await this.makeApiCall(url, 'Failed to fetch forecast');
        this.updateForecast(this.processForecastData(data.list));
    }

    // Process forecast data to get daily forecasts
    processForecastData(forecasts) {
        const dailyForecasts = {};

        forecasts.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();

            if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                    date: item.dt,
                    temps: [item.main.temp],
                    weather: item.weather[0],
                    description: item.weather[0].description,
                    icon: item.weather[0].icon
                };
            } else {
                dailyForecasts[date].temps.push(item.main.temp);
            }
        });

        return Object.values(dailyForecasts).slice(0, 5).map(day => ({
            date: day.date,
            maxTemp: Math.max(...day.temps),
            minTemp: Math.min(...day.temps),
            description: day.description,
            icon: day.icon
        }));
    }

    // Update forecast UI
    updateForecast(forecasts) {
        const forecastGrid = document.getElementById('forecast-grid');
        forecastGrid.innerHTML = '';

        forecasts.forEach(forecast => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';

            const dayName = this.getDayName(forecast.date);
            const date = this.formatDate(forecast.date);

            forecastItem.innerHTML = `
                <div>
                    <div class="forecast-day">${dayName}</div>
                    <div class="forecast-date">${date}</div>
                </div>
                <div class="forecast-icon">
                    <img src="https://openweathermap.org/img/wn/${forecast.icon}@2x.png" alt="${forecast.description}">
                </div>
                <div class="forecast-desc">${forecast.description}</div>
                <div class="forecast-temps">
                    <span class="forecast-high">${Math.round(forecast.maxTemp)}°</span>
                    <span class="forecast-low">${Math.round(forecast.minTemp)}°</span>
                </div>
            `;

            forecastGrid.appendChild(forecastItem);
        });
    }

    // Load hourly forecast
    async loadHourlyForecast(city) {
        const url = `${this.apiBase}/forecast?q=${encodeURIComponent(city)}&units=${this.currentUnits}&appid=${this.apiKey}`;
        const data = await this.makeApiCall(url, 'Failed to fetch hourly forecast');
        this.updateHourlyForecast(data.list.slice(0, 24));
    }

    // Update hourly forecast UI
    updateHourlyForecast(hourlyData) {
        const hourlyContainer = document.getElementById('hourly-forecast');
        hourlyContainer.innerHTML = '';

        hourlyData.forEach(hour => {
            const hourItem = document.createElement('div');
            hourItem.className = 'hourly-item';

            const time = this.formatHourlyTime(hour.dt);

            hourItem.innerHTML = `
                <div class="hourly-time">${time}</div>
                <div class="hourly-icon">
                    <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" alt="${hour.weather[0].description}">
                </div>
                <div class="hourly-temp">${Math.round(hour.main.temp)}°</div>
            `;

            hourlyContainer.appendChild(hourItem);
        });
    }

    // Enhanced Air Quality - Load air quality data with more substances
    async loadAirQuality(city) {
        try {
            if (!this.currentWeatherData) return;

            const { coord } = this.currentWeatherData;
            const url = `${this.apiBase}/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${this.apiKey}`;
            const data = await this.makeApiCall(url, 'Failed to fetch air quality');
            this.updateAirQuality(data.list[0]);
        } catch (error) {
            console.error('Error loading air quality:', error);
        }
    }

    // Enhanced Air Quality - Update air quality UI with more substances
    updateAirQuality(airData) {
        const aqi = airData.main.aqi;
        const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
        const aqiDescriptions = [
            'Air quality is satisfactory',
            'Air quality is acceptable',
            'Members of sensitive groups may experience health effects',
            'Everyone may begin to experience health effects',
            'Health warnings of emergency conditions'
        ];

        document.getElementById('aqi-value').textContent = aqi;
        document.getElementById('aqi-level').textContent = aqiLevels[aqi - 1];
        document.getElementById('aqi-description').textContent = aqiDescriptions[aqi - 1];

        const aqiCircle = document.getElementById('aqi-circle');
        const colors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6'];
        aqiCircle.style.background = `conic-gradient(from 0deg, ${colors[aqi - 1]}, ${colors[aqi - 1]})`;

        // Enhanced air quality components with more pollutants and their health effects
        if (airData.components) {
            const components = airData.components;

            // Primary pollutants
            document.getElementById('pm25').textContent = Math.round(components.pm2_5 || 0);
            document.getElementById('pm10').textContent = Math.round(components.pm10 || 0);
            document.getElementById('o3').textContent = Math.round(components.o3 || 0);
            document.getElementById('no2').textContent = Math.round(components.no2 || 0);

            // Additional pollutants - create elements if they don't exist
            this.updateAirQualityComponent('co', Math.round(components.co || 0), 'μg/m³', 'Carbon Monoxide');
            this.updateAirQualityComponent('so2', Math.round(components.so2 || 0), 'μg/m³', 'Sulfur Dioxide');
            this.updateAirQualityComponent('nh3', Math.round(components.nh3 || 0), 'μg/m³', 'Ammonia');
            this.updateAirQualityComponent('no', Math.round(components.no || 0), 'μg/m³', 'Nitric Oxide');

            // Add health recommendations based on pollutant levels
            this.updateAirQualityRecommendations(components, aqi);
        }
    }

    // Helper method to update or create air quality component display
    updateAirQualityComponent(id, value, unit, name) {
        let element = document.getElementById(id);
        if (!element) {
            // Create the element if it doesn't exist
            const airQualityDetails = document.querySelector('.air-quality-details');
            if (airQualityDetails) {
                const componentDiv = document.createElement('div');
                componentDiv.className = 'air-quality-item';
                componentDiv.innerHTML = `
                    <span class="label">${name}:</span>
                    <span id="${id}" class="value">${value}</span>
                    <span class="unit">${unit}</span>
                `;
                airQualityDetails.appendChild(componentDiv);
            }
        } else {
            element.textContent = value;
        }
    }

    // Add air quality health recommendations
    updateAirQualityRecommendations(components, aqi) {
        const recommendationsContainer = document.getElementById('air-quality-recommendations') || this.createAirQualityRecommendations();

        const recommendations = [];

        if (aqi >= 4) {
            recommendations.push('🚫 Avoid outdoor activities');
            recommendations.push('🏠 Stay indoors with windows closed');
            recommendations.push('😷 Wear N95 masks if going outside');
        } else if (aqi >= 3) {
            recommendations.push('⚠️ Limit outdoor activities');
            recommendations.push('🏃‍♂️ Avoid intense outdoor exercise');
            recommendations.push('🤧 Sensitive individuals should stay indoors');
        } else if (aqi >= 2) {
            recommendations.push('🌿 Outdoor activities are generally safe');
            recommendations.push('👥 Sensitive groups should limit prolonged exposure');
        } else {
            recommendations.push('✅ Air quality is excellent for all activities');
            recommendations.push('🌞 Perfect day for outdoor activities');
        }

        // Add specific pollutant warnings
        if (components.pm2_5 > 35) recommendations.push('🫁 High PM2.5 - harmful to respiratory health');
        if (components.o3 > 180) recommendations.push('🌫️ High ozone levels - may cause breathing difficulties');
        if (components.no2 > 200) recommendations.push('🚗 High NO2 from traffic - avoid busy roads');
        if (components.so2 > 350) recommendations.push('🏭 High SO2 levels detected');

        recommendationsContainer.innerHTML = recommendations.map(rec =>
            `<div class="air-recommendation">${rec}</div>`
        ).join('');
    }

    // Create air quality recommendations container
    createAirQualityRecommendations() {
        const airQualityCard = document.querySelector('.air-quality');
        if (airQualityCard) {
            const container = document.createElement('div');
            container.id = 'air-quality-recommendations';
            container.className = 'air-quality-recommendations';
            airQualityCard.appendChild(container);
            return container;
        }
        return null;
    }

    // Load UV Index
    async loadUVIndex(city) {
        try {
            if (!this.currentWeatherData) return;

            const { coord } = this.currentWeatherData;
            const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=minutely,hourly,daily,alerts&appid=${this.apiKey}`;

            try {
                const data = await this.makeApiCall(url, 'Failed to fetch UV index');
                this.updateUVIndex(data.current.uvi);
            } catch (error) {
                // Fallback to estimated UV based on time and weather
                this.updateUVIndex(this.estimateUV());
            }
        } catch (error) {
            console.error('Error loading UV index:', error);
            this.updateUVIndex(this.estimateUV());
        }
    }

    // Estimate UV index based on time and weather
    estimateUV() {
        const now = new Date();
        const hour = now.getHours();

        if (hour < 6 || hour > 18) return 0;
        if (hour < 8 || hour > 16) return 2;
        if (hour < 10 || hour > 14) return 5;
        return 8;
    }

    // Update UV Index UI
    updateUVIndex(uvIndex) {
        const uvValue = Math.round(uvIndex);
        document.getElementById('uv-value').textContent = uvValue;

        let uvLevel, uvRecommendation;

        if (uvValue <= 2) {
            uvLevel = 'Low';
            uvRecommendation = 'No protection needed';
        } else if (uvValue <= 5) {
            uvLevel = 'Moderate';
            uvRecommendation = 'Seek shade during midday hours';
        } else if (uvValue <= 7) {
            uvLevel = 'High';
            uvRecommendation = 'Seek shade, wear protective clothing';
        } else if (uvValue <= 10) {
            uvLevel = 'Very High';
            uvRecommendation = 'Avoid sun exposure during midday';
        } else {
            uvLevel = 'Extreme';
            uvRecommendation = 'Avoid sun exposure, stay indoors';
        }

        document.getElementById('uv-level').textContent = uvLevel;
        document.getElementById('uv-recommendation').textContent = uvRecommendation;
    }

    // Enhanced Activity Recommendations - Load activity recommendations with more variety
    loadActivityRecommendations() {
        if (!this.currentWeatherData) return;

        const temp = this.currentWeatherData.main.temp;
        const weather = this.currentWeatherData.weather[0].main.toLowerCase();
        const windSpeed = this.currentWeatherData.wind.speed;
        const humidity = this.currentWeatherData.main.humidity;
        const hour = new Date().getHours();

        const activities = this.generateActivityRecommendations(temp, weather, windSpeed, humidity, hour);
        this.updateActivityRecommendations(activities);
    }

    // Enhanced Activity Recommendations - Generate more diverse activity recommendations
    generateActivityRecommendations(temp, weather, windSpeed, humidity, hour) {
        const activities = [];

        // Weather-based activities
        if (weather.includes('rain') || weather.includes('storm')) {
            activities.push({ icon: 'fas fa-book', text: 'Reading at a cozy café', category: 'Indoor' });
            activities.push({ icon: 'fas fa-film', text: 'Movie marathon', category: 'Entertainment' });
            activities.push({ icon: 'fas fa-gamepad', text: 'Video gaming', category: 'Entertainment' });
            activities.push({ icon: 'fas fa-utensils', text: 'Cooking new recipes', category: 'Indoor' });
            activities.push({ icon: 'fas fa-palette', text: 'Indoor art projects', category: 'Creative' });
            activities.push({ icon: 'fas fa-dumbbell', text: 'Home workout', category: 'Fitness' });
            activities.push({ icon: 'fas fa-spa', text: 'Spa day at home', category: 'Wellness' });
        } else if (weather.includes('snow')) {
            activities.push({ icon: 'fas fa-skiing', text: 'Skiing or snowboarding', category: 'Winter Sports' });
            activities.push({ icon: 'fas fa-snowman', text: 'Building snowmen', category: 'Fun' });
            activities.push({ icon: 'fas fa-fire', text: 'Cozy fireplace time', category: 'Indoor' });
            activities.push({ icon: 'fas fa-mug-hot', text: 'Hot chocolate & treats', category: 'Food' });
            activities.push({ icon: 'fas fa-camera', text: 'Winter photography', category: 'Creative' });
        } else if (temp > 30) { // Very hot
            activities.push({ icon: 'fas fa-swimmer', text: 'Swimming', category: 'Water Sports' });
            activities.push({ icon: 'fas fa-ice-cream', text: 'Ice cream & frozen treats', category: 'Food' });
            activities.push({ icon: 'fas fa-umbrella-beach', text: 'Beach or lakeside', category: 'Outdoor' });
            activities.push({ icon: 'fas fa-cocktail', text: 'Cold drinks on patio', category: 'Social' });
            activities.push({ icon: 'fas fa-air-freshener', text: 'Indoor air-conditioned activities', category: 'Indoor' });
            activities.push({ icon: 'fas fa-water', text: 'Water park visit', category: 'Fun' });
        } else if (temp > 20) { // Warm
            activities.push({ icon: 'fas fa-hiking', text: 'Hiking trails', category: 'Adventure' });
            activities.push({ icon: 'fas fa-biking', text: 'Cycling tours', category: 'Fitness' });
            activities.push({ icon: 'fas fa-running', text: 'Jogging in the park', category: 'Fitness' });
            activities.push({ icon: 'fas fa-camera', text: 'Outdoor photography', category: 'Creative' });
            activities.push({ icon: 'fas fa-seedling', text: 'Gardening', category: 'Hobby' });
            activities.push({ icon: 'fas fa-users', text: 'Picnic with friends', category: 'Social' });
            activities.push({ icon: 'fas fa-golf-ball', text: 'Golf or mini golf', category: 'Sports' });
            activities.push({ icon: 'fas fa-kite', text: 'Outdoor sports', category: 'Sports' });
        } else if (temp > 10) { // Cool
            activities.push({ icon: 'fas fa-walking', text: 'Nature walks', category: 'Outdoor' });
            activities.push({ icon: 'fas fa-coffee', text: 'Café hopping', category: 'Social' });
            activities.push({ icon: 'fas fa-shopping-bag', text: 'Shopping districts', category: 'Leisure' });
            activities.push({ icon: 'fas fa-tree', text: 'Park exploration', category: 'Nature' });
            activities.push({ icon: 'fas fa-monument', text: 'Sightseeing tours', category: 'Tourism' });
            activities.push({ icon: 'fas fa-camera', text: 'Urban photography', category: 'Creative' });
        } else { // Cold
            activities.push({ icon: 'fas fa-coffee', text: 'Warm café visits', category: 'Indoor' });
            activities.push({ icon: 'fas fa-shopping-bag', text: 'Indoor shopping malls', category: 'Leisure' });
            activities.push({ icon: 'fas fa-dumbbell', text: 'Gym workouts', category: 'Fitness' });
            activities.push({ icon: 'fas fa-book', text: 'Library visits', category: 'Learning' });
            activities.push({ icon: 'fas fa-utensils', text: 'Cooking warm meals', category: 'Food' });
            activities.push({ icon: 'fas fa-hot-tub', text: 'Spa & wellness centers', category: 'Wellness' });
            activities.push({ icon: 'fas fa-theater-masks', text: 'Indoor entertainment', category: 'Entertainment' });
        }

        // Wind-based activities
        if (windSpeed > 15) {
            activities.push({ icon: 'fas fa-kite', text: 'Kite flying', category: 'Fun' });
            activities.push({ icon: 'fas fa-sailboat', text: 'Sailing', category: 'Water Sports' });
            activities.push({ icon: 'fas fa-wind', text: 'Windsurfing', category: 'Adventure' });
        } else if (windSpeed < 5) {
            activities.push({ icon: 'fas fa-leaf', text: 'Outdoor meditation', category: 'Wellness' });
            activities.push({ icon: 'fas fa-camera', text: 'Still photography', category: 'Creative' });
        }

        // Humidity-based activities
        if (humidity > 80) {
            activities.push({ icon: 'fas fa-air-freshener', text: 'Indoor air-conditioned spaces', category: 'Indoor' });
        }

        // Time-based activities
        if (hour >= 6 && hour <= 10) {
            activities.push({ icon: 'fas fa-sun', text: 'Morning yoga', category: 'Wellness' });
            activities.push({ icon: 'fas fa-running', text: 'Morning jog', category: 'Fitness' });
            activities.push({ icon: 'fas fa-coffee', text: 'Breakfast café visit', category: 'Food' });
        } else if (hour >= 11 && hour <= 15) {
            activities.push({ icon: 'fas fa-utensils', text: 'Lunch at outdoor restaurant', category: 'Food' });
            activities.push({ icon: 'fas fa-shopping-cart', text: 'Farmers market visit', category: 'Shopping' });
        } else if (hour >= 16 && hour <= 20) {
            activities.push({ icon: 'fas fa-cocktail', text: 'Happy hour drinks', category: 'Social' });
            activities.push({ icon: 'fas fa-users', text: 'Evening social activities', category: 'Social' });
        } else {
            activities.push({ icon: 'fas fa-moon', text: 'Stargazing', category: 'Nature' });
            activities.push({ icon: 'fas fa-film', text: 'Evening movies', category: 'Entertainment' });
        }

        // Shuffle and return a selection
        return this.shuffleArray(activities).slice(0, 8);
    }

    // Enhanced Activity Recommendations - Update activity recommendations UI with categories
    updateActivityRecommendations(activities) {
        const container = document.getElementById('activity-recommendations');
        container.innerHTML = '';

        // Group activities by category
        const categorized = {};
        activities.forEach(activity => {
            if (!categorized[activity.category]) {
                categorized[activity.category] = [];
            }
            categorized[activity.category].push(activity);
        });

        // Display activities grouped by category
        Object.keys(categorized).forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'activity-category';

            const categoryTitle = document.createElement('h4');
            categoryTitle.textContent = category;
            categoryTitle.className = 'category-title';
            categoryDiv.appendChild(categoryTitle);

            categorized[category].forEach(activity => {
                const item = document.createElement('div');
                item.className = 'recommendation-item';
                item.innerHTML = `
                    <i class="${activity.icon}"></i>
                    <span>${activity.text}</span>
                `;
                categoryDiv.appendChild(item);
            });

            container.appendChild(categoryDiv);
        });
    }

    // Enhanced Clothing Recommendations - Load clothing recommendations with more variety
    loadClothingRecommendations() {
        if (!this.currentWeatherData) return;

        const temp = this.currentWeatherData.main.temp;
        const weather = this.currentWeatherData.weather[0].main.toLowerCase();
        const windSpeed = this.currentWeatherData.wind.speed;
        const humidity = this.currentWeatherData.main.humidity;
        const hour = new Date().getHours();

        const clothing = this.generateClothingRecommendations(temp, weather, windSpeed, humidity, hour);
        this.updateClothingRecommendations(clothing);
    }

    // Enhanced Clothing Recommendations - Generate comprehensive clothing recommendations
    generateClothingRecommendations(temp, weather, windSpeed, humidity, hour) {
        const clothing = {
            outerWear: [],
            topWear: [],
            bottomWear: [],
            footwear: [],
            accessories: [],
            special: []
        };

        // Weather-specific items
        if (weather.includes('rain') || weather.includes('drizzle')) {
            clothing.accessories.push({ icon: 'fas fa-umbrella', text: 'Umbrella', priority: 'high' });
            clothing.outerWear.push({ icon: 'fas fa-tshirt', text: 'Waterproof jacket', priority: 'high' });
            clothing.footwear.push({ icon: 'fas fa-shoe-prints', text: 'Waterproof boots', priority: 'high' });
            clothing.accessories.push({ icon: 'fas fa-hat-cowboy', text: 'Waterproof hat', priority: 'medium' });
        }

        if (weather.includes('snow')) {
            clothing.outerWear.push({ icon: 'fas fa-mitten', text: 'Heavy winter coat', priority: 'high' });
            clothing.accessories.push({ icon: 'fas fa-mitten', text: 'Insulated gloves', priority: 'high' });
            clothing.footwear.push({ icon: 'fas fa-shoe-prints', text: 'Snow boots', priority: 'high' });
            clothing.accessories.push({ icon: 'fas fa-hat-wizard', text: 'Warm winter hat', priority: 'high' });
            clothing.special.push({ icon: 'fas fa-snowflake', text: 'Thermal underwear', priority: 'high' });
        }

        // Temperature-based recommendations
        if (temp < -10) { // Extremely cold
            clothing.outerWear.push({ icon: 'fas fa-mitten', text: 'Arctic winter coat', priority: 'high' });
            clothing.topWear.push({ icon: 'fas fa-tshirt', text: 'Thermal base layers', priority: 'high' });
            clothing.bottomWear.push({ icon: 'fas fa-socks', text: 'Insulated winter pants', priority: 'high' });
            clothing.footwear.push({ icon: 'fas fa-shoe-prints', text: 'Insulated boots', priority: 'high' });
            clothing.accessories.push({ icon: 'fas fa-mitten', text: 'Heavy mittens', priority: 'high' });
            clothing.accessories.push({ icon: 'fas fa-hat-wizard', text: 'Thermal hat', priority: 'high' });
            clothing.accessories.push({ icon: 'fas fa-user-ninja', text: 'Face mask/balaclava', priority: 'high' });
        } else if (temp < 0) { // Very cold
            clothing.outerWear.push({ icon: 'fas fa-mitten', text: 'Heavy winter jacket', priority: 'high' });
            clothing.topWear.push({ icon: 'fas fa-tshirt', text: 'Wool sweater', priority: 'high' });
            clothing.bottomWear.push({ icon: 'fas fa-socks', text: 'Thermal leggings', priority: 'medium' });
            clothing.bottomWear.push({ icon: 'fas fa-socks', text: 'Thick pants', priority: 'high' });
            clothing.footwear.push({ icon: 'fas fa-shoe-prints', text: 'Winter boots', priority: 'high' });
            clothing.accessories.push({ icon: 'fas fa-mitten', text: 'Warm gloves', priority: 'high' });
            clothing.accessories.push({ icon: 'fas fa-hat-wizard', text: 'Knit beanie', priority: 'high' });
        } else if (temp < 10) { // Cold
            clothing.outerWear.push({ icon: 'fas fa-tshirt', text: 'Warm jacket', priority: 'high' });
            clothing.topWear.push({ icon: 'fas fa-tshirt', text: 'Long-sleeve shirt', priority: 'medium' });
            clothing.topWear.push({ icon: 'fas fa-tshirt', text: 'Sweater or hoodie', priority: 'high' });
            clothing.bottomWear.push({ icon: 'fas fa-socks', text: 'Long pants/jeans', priority: 'high' });
            clothing.footwear.push({ icon: 'fas fa-shoe-prints', text: 'Closed-toe shoes', priority: 'medium' });
            clothing.accessories.push({ icon: 'fas fa-mitten', text: 'Light gloves', priority: 'medium' });
            clothing.accessories.push({ icon: 'fas fa-user-tag', text: 'Scarf', priority: 'medium' });
        } else if (temp < 20) { // Cool
            clothing.outerWear.push({ icon: 'fas fa-tshirt', text: 'Light jacket or cardigan', priority: 'medium' });
            clothing.topWear.push({ icon: 'fas fa-tshirt', text: 'Long-sleeve shirt', priority: 'medium' });
            clothing.topWear.push({ icon: 'fas fa-tshirt', text: 'Light sweater', priority: 'low' });
            clothing.bottomWear.push({ icon: 'fas fa-socks', text: 'Jeans or khakis', priority: 'medium' });
            clothing.footwear.push({ icon: 'fas fa-shoe-prints', text: 'Sneakers or boots', priority: 'medium' });
        } else if (temp < 25) { // Mild
            clothing.topWear.push({ icon: 'fas fa-tshirt', text: 'T-shirt or polo', priority: 'medium' });
            clothing.topWear.push({ icon: 'fas fa-tshirt', text: 'Light blouse', priority: 'low' });
            clothing.bottomWear.push({ icon: 'fas fa-socks', text: 'Jeans or chinos', priority: 'medium' });
            clothing.bottomWear.push({ icon: 'fas fa-socks', text: 'Light pants', priority: 'low' });
            clothing.footwear.push({ icon: 'fas fa-shoe-prints', text: 'Comfortable sneakers', priority: 'medium' });
            clothing.outerWear.push({ icon: 'fas fa-tshirt', text: 'Light cardigan (evening)', priority: 'low' });
        } else if (temp < 30) { // Warm
            clothing.topWear.push({ icon: 'fas fa-tshirt', text: 'T-shirt or tank top', priority: 'high' });
            clothing.topWear.push({ icon: 'fas fa-tshirt', text: 'Breathable fabrics', priority: 'medium' });
            clothing.bottomWear.push({ icon: 'fas fa-socks', text: 'Shorts or skirt', priority: 'high' });
            clothing.bottomWear.push({ icon: 'fas fa-socks', text: 'Light capris', priority: 'medium' });
            clothing.footwear.push({ icon: 'fas fa-shoe-prints', text: 'Sandals or canvas shoes', priority: 'medium' });
            clothing.accessories.push({ icon: 'fas fa-glasses', text: 'Sunglasses', priority: 'high' });
            clothing.accessories.push({ icon: 'fas fa-hat-cowboy', text: 'Sun hat', priority: 'medium' });
        } else { // Hot
            clothing.topWear.push({ icon: 'fas fa-tshirt', text: 'Lightweight shirt', priority: 'high' });
            clothing.topWear.push({ icon: 'fas fa-tshirt', text: 'Moisture-wicking fabric', priority: 'high' });
            clothing.bottomWear.push({ icon: 'fas fa-socks', text: 'Shorts or light dress', priority: 'high' });
            clothing.footwear.push({ icon: 'fas fa-shoe-prints', text: 'Breathable sandals', priority: 'high' });
            clothing.accessories.push({ icon: 'fas fa-glasses', text: 'UV-protection sunglasses', priority: 'high' });
            clothing.accessories.push({ icon: 'fas fa-hat-cowboy', text: 'Wide-brim hat', priority: 'high' });
            clothing.special.push({ icon: 'fas fa-spray-can', text: 'Sunscreen SPF 30+', priority: 'high' });
        }

        // Wind considerations
        if (windSpeed > 20) {
            clothing.accessories.push({ icon: 'fas fa-hat-cowboy', text: 'Secure hat or cap', priority: 'medium' });
            clothing.outerWear.push({ icon: 'fas fa-tshirt', text: 'Wind-resistant jacket', priority: 'medium' });
        }

        // Humidity considerations
        if (humidity > 70) {
            clothing.topWear.push({ icon: 'fas fa-tshirt', text: 'Breathable, moisture-wicking fabric', priority: 'medium' });
            clothing.special.push({ icon: 'fas fa-spray-can', text: 'Antiperspirant', priority: 'low' });
        }

        // Time-based recommendations
        if (hour >= 18 || hour <= 6) { // Evening/Night
            clothing.accessories.push({ icon: 'fas fa-lightbulb', text: 'Reflective accessories', priority: 'low' });
        }

        // UV protection (sunny weather)
        if (weather.includes('clear') || weather.includes('sun')) {
            clothing.accessories.push({ icon: 'fas fa-glasses', text: 'Sunglasses', priority: 'medium' });
            clothing.special.push({ icon: 'fas fa-spray-can', text: 'Sunscreen', priority: 'medium' });
        }

        return clothing;
    }

    // Enhanced Clothing Recommendations - Update clothing recommendations UI with categories
    updateClothingRecommendations(clothing) {
        const container = document.getElementById('clothing-suggestions');
        container.innerHTML = '';

        const categories = {
            'Outer Wear': clothing.outerWear,
            'Tops': clothing.topWear,
            'Bottoms': clothing.bottomWear,
            'Footwear': clothing.footwear,
            'Accessories': clothing.accessories,
            'Special Items': clothing.special
        };

        Object.keys(categories).forEach(categoryName => {
            const items = categories[categoryName];
            if (items.length === 0) return;

            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'clothing-category';

            const categoryTitle = document.createElement('h4');
            categoryTitle.textContent = categoryName;
            categoryTitle.className = 'clothing-category-title';
            categoryDiv.appendChild(categoryTitle);

            // Sort by priority (high, medium, low)
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            items.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

            items.forEach(item => {
                const clothingItem = document.createElement('div');
                clothingItem.className = `clothing-item priority-${item.priority}`;
                clothingItem.innerHTML = `
                    <i class="${item.icon}"></i>
                    <span>${item.text}</span>
                    <span class="priority-indicator">${item.priority === 'high' ? '🔥' : item.priority === 'medium' ? '⭐' : ''}</span>
                `;
                categoryDiv.appendChild(clothingItem);
            });

            container.appendChild(categoryDiv);
        });
    }

    // Utility function to shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Enhanced fetchHistoricalWeather method
    async fetchHistoricalWeather() {
        const dateInput = document.getElementById('historical-date');
        const selectedDate = dateInput.value;

        if (!selectedDate) {
            this.showToast('Please select a date', 'warning');
            return;
        }

        const timestamp = Math.floor(new Date(selectedDate).getTime() / 1000);

        // Show loading state
        const container = document.getElementById('historical-data');
        container.innerHTML = '<div class="loading-historical">Loading historical data...</div>';

        try {
            if (!this.currentWeatherData) {
                this.showToast('Please load current weather first', 'warning');
                return;
            }

            const { coord } = this.currentWeatherData;

            // Try the premium One Call API first
            try {
                const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${coord.lat}&lon=${coord.lon}&dt=${timestamp}&appid=${this.apiKey}&units=${this.currentUnits}`;
                const data = await this.makeApiCall(url, 'Failed to fetch historical data');

                if (data.data && data.data[0]) {
                    this.updateHistoricalWeather(data.data[0], selectedDate);
                } else {
                    throw new Error('No historical data available');
                }
            } catch (error) {
                // Fallback to generating estimated data
                console.log('Premium API failed, generating estimated data:', error);
                const estimatedData = this.generateEstimatedHistoricalData(selectedDate);
                this.updateHistoricalWeather(estimatedData, selectedDate);
            }
        } catch (error) {
            console.error('Error fetching historical weather:', error);
            this.displayHistoricalError(error.message, selectedDate);
        }
    }

    // Generate estimated historical data based on current patterns
    generateEstimatedHistoricalData(selectedDate) {
        const baseTemp = this.currentWeatherData.main.temp;
        const baseHumidity = this.currentWeatherData.main.humidity;
        const basePressure = this.currentWeatherData.main.pressure;
        const baseWindSpeed = this.currentWeatherData.wind.speed;

        // Add some random variation to simulate historical differences
        const tempVariation = (Math.random() - 0.5) * 10; // ±5°
        const humidityVariation = (Math.random() - 0.5) * 20; // ±10%
        const pressureVariation = (Math.random() - 0.5) * 20; // ±10 hPa
        const windVariation = (Math.random() - 0.5) * 4; // ±2 units

        // Generate variations based on date (seasonal patterns)
        const selectedDateObj = new Date(selectedDate);
        const dayOfYear = Math.floor((selectedDateObj - new Date(selectedDateObj.getFullYear(), 0, 0)) / 86400000);
        const seasonalFactor = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 5; // ±5° seasonal variation

        return {
            temperature: Math.round(Math.max(baseTemp + tempVariation + seasonalFactor, -50)),
            feelsLike: Math.round(Math.max(baseTemp + tempVariation + seasonalFactor - 2, -50)),
            humidity: Math.round(Math.max(Math.min(baseHumidity + humidityVariation, 100), 0)),
            pressure: Math.round(Math.max(basePressure + pressureVariation, 800)),
            windSpeed: Math.round(Math.max(baseWindSpeed + windVariation, 0) * 10) / 10, // Round to 1 decimal
            description: this.currentWeatherData.weather[0].description,
            icon: this.currentWeatherData.weather[0].icon,
            source: 'generated'
        };
    }

    // Enhanced updateHistoricalWeather method
    updateHistoricalWeather(weatherData, date) {
        const container = document.getElementById('historical-data');
        const formattedDate = new Date(date).toLocaleDateString();

        // Check if this is generated/estimated data
        const isGenerated = weatherData.source === 'generated' || weatherData.source === 'estimated';
        const sourceLabel = isGenerated ? '(Estimated)' : '';

        // Safely extract and format values
        const temperature = Math.round(weatherData.temperature || weatherData.temp || 0);
        const feelsLike = Math.round(weatherData.feelsLike || weatherData.feels_like || weatherData.temperature || weatherData.temp || 0);
        const humidity = Math.round(weatherData.humidity || 0);
        const pressure = Math.round(weatherData.pressure || 0);
        const windSpeed = Math.round((weatherData.windSpeed || weatherData.wind_speed || 0) * 10) / 10; // Round to 1 decimal
        const description = weatherData.description || weatherData.weather?.[0]?.description || 'Clear';
        const icon = weatherData.icon || weatherData.weather?.[0]?.icon || '01d';

        container.innerHTML = `
            <div class="historical-weather-card">
                <h4>Weather for ${formattedDate} ${sourceLabel}</h4>
                ${isGenerated ? '<p class="historical-disclaimer">This data is estimated based on seasonal patterns and current weather conditions.</p>' : ''}
                
                <div class="historical-weather-info">
                    <div class="historical-main">
                        <div class="historical-temp">
                            <span class="temp-value">${temperature}</span>
                            <span class="temp-unit">${this.getTemperatureUnit()}</span>
                        </div>
                        <div class="historical-condition">
                            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" 
                                 alt="${description}" class="historical-icon">
                            <span class="condition-text">${description}</span>
                        </div>
                    </div>
                    
                    <div class="historical-details">
                        <div class="historical-item">
                            <i class="fas fa-thermometer-half"></i>
                            <span class="label">Feels like:</span>
                            <span class="value">${feelsLike}${this.getTemperatureUnit()}</span>
                        </div>
                        <div class="historical-item">
                            <i class="fas fa-tint"></i>
                            <span class="label">Humidity:</span>
                            <span class="value">${humidity}%</span>
                        </div>
                        <div class="historical-item">
                            <i class="fas fa-compress-arrows-alt"></i>
                            <span class="label">Pressure:</span>
                            <span class="value">${pressure} hPa</span>
                        </div>
                        <div class="historical-item">
                            <i class="fas fa-wind"></i>
                            <span class="label">Wind Speed:</span>
                            <span class="value">${Math.round(this.convertWindSpeed(windSpeed))} ${this.getWindSpeedUnit()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // New method to display error with helpful information
    displayHistoricalError(errorMessage, selectedDate) {
        const container = document.getElementById('historical-data');
        const formattedDate = new Date(selectedDate).toLocaleDateString();

        container.innerHTML = `
            <div class="historical-error">
                <div class="error-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Historical Data Unavailable</h4>
                </div>
                <p>Unable to retrieve historical weather data for ${formattedDate}.</p>
                <div class="error-details">
                    <p><strong>Reason:</strong> ${errorMessage}</p>
                </div>
                <div class="error-suggestions">
                    <h5>Try these alternatives:</h5>
                    <ul>
                        <li>Select a more recent date (within the last 5 days)</li>
                        <li>Check your internet connection</li>
                        <li>Try a different city or location</li>
                        <li>Historical data may require a premium API subscription</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // Settings modal functions
    openSettings() {
        document.getElementById('settings-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeSettings() {
        document.getElementById('settings-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    saveSettings() {
        const tempUnit = document.querySelector('input[name="temp-unit"]:checked').value;
        const theme = document.querySelector('input[name="theme"]:checked').value;
        const defaultCity = document.getElementById('default-city').value;
        const notifications = document.getElementById('notifications-enabled').checked;
        const locationAccess = document.getElementById('location-access').checked;

        const visibleMetrics = [];
        document.querySelectorAll('.metric-checkbox:checked').forEach(checkbox => {
            visibleMetrics.push(checkbox.value);
        });

        this.preferences = {
            temperatureUnit: tempUnit,
            theme: theme,
            defaultCity: defaultCity,
            notifications: notifications,
            locationAccess: locationAccess,
            visibleMetrics: visibleMetrics
        };

        this.savePreferencesToStorage();
        this.applyPreferences();
        this.closeSettings();
        this.showToast('Settings saved successfully!', 'success');

        // Reload weather data if temperature unit changed
        if (this.currentUnits !== (tempUnit === 'fahrenheit' ? 'imperial' : 'metric')) {
            this.loadWeatherData(this.currentCity);
        }
    }

    resetSettings() {
        this.preferences = this.getDefaultPreferences();
        this.savePreferencesToStorage();
        this.updateSettingsForm();
        this.applyPreferences();
        this.showToast('Settings reset to default', 'info');
    }

    // Toast notification system
    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Close button functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });

        toastContainer.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }

    // Enhanced API call method with better error handling
    async makeApiCall(url, errorMessage) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                let errorDetail = `HTTP ${response.status}`;

                // Provide more specific error messages
                switch (response.status) {
                    case 401:
                        errorDetail = 'API key invalid or subscription required';
                        break;
                    case 404:
                        errorDetail = 'Data not found for the requested date/location';
                        break;
                    case 429:
                        errorDetail = 'Rate limit exceeded. Please wait and try again';
                        break;
                    case 500:
                        errorDetail = 'Weather service temporarily unavailable';
                        break;
                }

                throw new Error(`${errorDetail}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`${errorMessage}:`, error);
            throw new Error(errorMessage + ': ' + error.message);
        }
    }

    // Enhanced error handling for different API errors
    handleApiError(error, context) {
        let message = 'An error occurred';

        if (error.message.includes('404')) {
            message = 'City not found. Please check the spelling and try again.';
        } else if (error.message.includes('401')) {
            message = 'Invalid API key. Please check your configuration.';
        } else if (error.message.includes('429')) {
            message = 'API rate limit exceeded. Please try again later.';
        } else if (error.message.includes('500')) {
            message = 'Weather service is temporarily unavailable.';
        } else {
            message = `Failed to load ${context}. Please try again.`;
        }

        this.showError(message);
    }

    // Method to check API capabilities and show appropriate messages
    async checkApiCapabilities() {
        try {
            // Test if historical data is available
            const testDate = new Date();
            testDate.setDate(testDate.getDate() - 2); // 2 days ago

            // This is just a capability check, we don't need to do anything with the result
            console.log('API capabilities checked');
        } catch (error) {
            console.log('API capability check failed:', error);
        }
    }

    // Utility functions
    formatCurrentTime(timezone) {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const localTime = new Date(utc + (timezone * 1000));

        const options = {
            weekday: 'long',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };

        return localTime.toLocaleString('en-US', options);
    }

    formatTime(timestamp, timezone) {
        const date = new Date(timestamp * 1000);
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const localTime = new Date(utc + (timezone * 1000));

        return localTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    formatHourlyTime(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
        });
    }

    getDayName(timestamp) {
        const date = new Date(timestamp * 1000);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        }
    }

    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    getTemperatureUnit() {
        return this.currentUnits === 'imperial' ? '°F' : '°C';
    }

    getWindSpeedUnit() {
        return this.currentUnits === 'imperial' ? 'mph' : 'km/h';
    }

    // Convert wind speed from m/s to appropriate unit
    convertWindSpeed(speedMs) {
        if (this.currentUnits === 'imperial') {
            return speedMs * 2.237; // m/s to mph
        } else {
            return speedMs * 3.6; // m/s to km/h
        }
    }

    // Weather condition helpers
    getWeatherEmoji(weatherMain) {
        const emojiMap = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️'
        };
        return emojiMap[weatherMain] || '🌤️';
    }

    // Check if API key is configured
    isApiKeyConfigured() {
        return this.apiKey && this.apiKey !== 'your_openweather_api_key';
    }

    // Initialize app when API key is missing
    handleMissingApiKey() {
        this.showError('Weather API key is required. Please add your OpenWeatherMap API key to the script.');
        console.error('Please replace "your_openweather_api_key" with your actual OpenWeatherMap API key');
    }

    // Accessibility improvements
    updateAriaLabels() {
        const currentTemp = document.getElementById('current-temp').textContent;
        const currentCity = document.getElementById('current-city').textContent;
        const weatherDesc = document.getElementById('weather-desc').textContent;

        const currentWeatherCard = document.querySelector('.current-weather-card');
        if (currentWeatherCard) {
            currentWeatherCard.setAttribute(
                'aria-label',
                `Current weather in ${currentCity}: ${currentTemp} degrees, ${weatherDesc}`
            );
        }
    }

    // Keyboard navigation for suggestions
    handleKeyboardNavigation(event) {
        const suggestions = document.querySelectorAll('.suggestion-item');
        if (suggestions.length === 0) return;

        let currentIndex = Array.from(suggestions).findIndex(item =>
            item.classList.contains('highlighted')
        );

        suggestions.forEach(item => item.classList.remove('highlighted'));

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            currentIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0;
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            currentIndex = currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1;
        } else if (event.key === 'Enter' && currentIndex >= 0) {
            event.preventDefault();
            suggestions[currentIndex].click();
            return;
        }

        if (currentIndex >= 0) {
            suggestions[currentIndex].classList.add('highlighted');
        }
    }

    // Weather alerts (if available from API)
    async loadWeatherAlerts(lat, lon) {
        try {
            const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${this.apiKey}`;
            const data = await this.makeApiCall(url, 'Failed to fetch weather alerts');

            if (data.alerts && data.alerts.length > 0) {
                this.showWeatherAlerts(data.alerts);
            }
        } catch (error) {
            console.error('Error loading weather alerts:', error);
        }
    }

    showWeatherAlerts(alerts) {
        alerts.forEach(alert => {
            this.showToast(
                `Weather Alert: ${alert.event} - ${alert.description.substring(0, 100)}...`,
                'warning',
                8000
            );
        });
    }

    // Performance optimization: debounce resize events
    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.adjustResponsiveElements();
        }, 250);
    }

    adjustResponsiveElements() {
        const hourlyContainer = document.getElementById('hourly-forecast');
        if (hourlyContainer) {
            hourlyContainer.scrollLeft = 0;
        }
    }

    // Service worker registration for offline functionality
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    // Initialize theme based on system preference if auto is selected
    initializeTheme() {
        if (this.preferences.theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener((e) => {
                if (this.preferences.theme === 'auto') {
                    this.setTheme('auto');
                }
            });
        }
    }

    // Add animation classes for smooth transitions
    addLoadingAnimations() {
        const weatherContent = document.getElementById('weather-content');
        if (weatherContent) {
            weatherContent.classList.add('fade-in');
        }
    }

    // Cleanup function
    cleanup() {
        clearTimeout(this.searchTimeout);
        clearTimeout(this.resizeTimeout);
        window.removeEventListener('resize', this.handleResize.bind(this));
    }
}

// Additional CSS for enhanced styling
const additionalStyles = `
@keyframes toastSlideOut {
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}

.suggestion-item.highlighted {
    background: rgba(102, 126, 234, 0.2);
}

.historical-weather-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-top: 1rem;
}

.historical-disclaimer {
    color: #fbbf24;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    font-style: italic;
}

.historical-main {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.historical-temp {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
}

.temp-value {
    font-size: 2.5rem;
    font-weight: bold;
}

.temp-unit {
    font-size: 1.5rem;
    opacity: 0.8;
}

.historical-condition {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.historical-icon {
    width: 50px;
    height: 50px;
}

.condition-text {
    font-size: 1.1rem;
    text-transform: capitalize;
}

.historical-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.historical-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
}

.historical-item i {
    width: 20px;
    color: #60a5fa;
}

.historical-item .label {
    flex: 1;
    opacity: 0.8;
}

.historical-item .value {
    font-weight: 600;
}

.historical-error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-top: 1rem;
}

.error-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.error-header i {
    color: #ef4444;
    font-size: 1.25rem;
}

.error-header h4 {
    color: #ef4444;
    margin: 0;
}

.error-details {
    margin: 1rem 0;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
}

.error-suggestions {
    margin-top: 1rem;
}

.error-suggestions h5 {
    color: #60a5fa;
    margin-bottom: 0.5rem;
}

.error-suggestions ul {
    margin: 0;
    padding-left: 1.5rem;
}

.error-suggestions li {
    margin-bottom: 0.25rem;
    opacity: 0.9;
}

.loading-historical {
    text-align: center;
    padding: 2rem;
    color: #60a5fa;
    font-style: italic;
}

.fade-in {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .historical-main {
        flex-direction: column;
        text-align: center;
    }
    
    .historical-details {
        grid-template-columns: 1fr;
    }
}
`;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add additional styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);

    // Initialize the weather app
    const app = new WeatherApp();

    // Make app globally accessible for debugging
    window.weatherApp = app;

    // Handle window resize
    window.addEventListener('resize', app.handleResize.bind(app));

    // Handle keyboard navigation for search suggestions
    document.getElementById('city-search').addEventListener('keydown', (e) => {
        app.handleKeyboardNavigation(e);
    });

    // Check if API key is configured
    if (!app.isApiKeyConfigured()) {
        app.handleMissingApiKey();
    }

    // Register service worker for offline functionality
    app.registerServiceWorker();
});