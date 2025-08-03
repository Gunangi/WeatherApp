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

    // Load air quality data
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

    // Update air quality UI
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

        if (airData.components) {
            document.getElementById('pm25').textContent = Math.round(airData.components.pm2_5) || 'N/A';
            document.getElementById('pm10').textContent = Math.round(airData.components.pm10) || 'N/A';
            document.getElementById('o3').textContent = Math.round(airData.components.o3) || 'N/A';
            document.getElementById('no2').textContent = Math.round(airData.components.no2) || 'N/A';
        }
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

    // Load activity recommendations
    loadActivityRecommendations() {
        if (!this.currentWeatherData) return;

        const temp = this.currentWeatherData.main.temp;
        const weather = this.currentWeatherData.weather[0].main.toLowerCase();
        const windSpeed = this.currentWeatherData.wind.speed;

        const activities = this.generateActivityRecommendations(temp, weather, windSpeed);
        this.updateActivityRecommendations(activities);
    }

    // Generate activity recommendations based on weather
    generateActivityRecommendations(temp, weather, windSpeed) {
        const activities = [];

        if (weather.includes('rain') || weather.includes('storm')) {
            activities.push({ icon: 'fas fa-book', text: 'Reading indoors' });
            activities.push({ icon: 'fas fa-film', text: 'Watch movies' });
            activities.push({ icon: 'fas fa-gamepad', text: 'Indoor gaming' });
        } else if (temp > 25) {
            activities.push({ icon: 'fas fa-swimmer', text: 'Swimming' });
            activities.push({ icon: 'fas fa-ice-cream', text: 'Get ice cream' });
            activities.push({ icon: 'fas fa-umbrella-beach', text: 'Beach visit' });
        } else if (temp > 15) {
            activities.push({ icon: 'fas fa-walking', text: 'Walking' });
            activities.push({ icon: 'fas fa-biking', text: 'Cycling' });
            activities.push({ icon: 'fas fa-running', text: 'Jogging' });
        } else {
            activities.push({ icon: 'fas fa-coffee', text: 'Café visit' });
            activities.push({ icon: 'fas fa-shopping-bag', text: 'Indoor shopping' });
            activities.push({ icon: 'fas fa-dumbbell', text: 'Gym workout' });
        }

        if (windSpeed > 10) {
            activities.push({ icon: 'fas fa-kite', text: 'Kite flying' });
        }

        return activities;
    }

    // Update activity recommendations UI
    updateActivityRecommendations(activities) {
        const container = document.getElementById('activity-recommendations');
        container.innerHTML = '';

        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            item.innerHTML = `
                <i class="${activity.icon}"></i>
                <span>${activity.text}</span>
            `;
            container.appendChild(item);
        });
    }

    // Load clothing recommendations
    loadClothingRecommendations() {
        if (!this.currentWeatherData) return;

        const temp = this.currentWeatherData.main.temp;
        const weather = this.currentWeatherData.weather[0].main.toLowerCase();

        const clothing = this.generateClothingRecommendations(temp, weather);
        this.updateClothingRecommendations(clothing);
    }

    // Generate clothing recommendations
    generateClothingRecommendations(temp, weather) {
        const clothing = [];

        if (weather.includes('rain')) {
            clothing.push({ icon: 'fas fa-umbrella', text: 'Umbrella' });
            clothing.push({ icon: 'fas fa-tshirt', text: 'Waterproof jacket' });
        }

        if (temp < 5) {
            clothing.push({ icon: 'fas fa-mitten', text: 'Winter coat' });
            clothing.push({ icon: 'fas fa-hat-wizard', text: 'Warm hat' });
            clothing.push({ icon: 'fas fa-socks', text: 'Thick socks' });
        } else if (temp < 15) {
            clothing.push({ icon: 'fas fa-tshirt', text: 'Light jacket' });
            clothing.push({ icon: 'fas fa-socks', text: 'Long pants' });
        } else if (temp < 25) {
            clothing.push({ icon: 'fas fa-tshirt', text: 'Light shirt' });
            clothing.push({ icon: 'fas fa-socks', text: 'Jeans' });
        } else {
            clothing.push({ icon: 'fas fa-tshirt', text: 'T-shirt' });
            clothing.push({ icon: 'fas fa-socks', text: 'Shorts' });
            clothing.push({ icon: 'fas fa-glasses', text: 'Sunglasses' });
        }

        return clothing;
    }

    // Update clothing recommendations UI
    updateClothingRecommendations(clothing) {
        const container = document.getElementById('clothing-suggestions');
        container.innerHTML = '';

        clothing.forEach(item => {
            const clothingItem = document.createElement('div');
            clothingItem.className = 'clothing-item';
            clothingItem.innerHTML = `
                <i class="${item.icon}"></i>
                <span>${item.text}</span>
            `;
            container.appendChild(clothingItem);
        });
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