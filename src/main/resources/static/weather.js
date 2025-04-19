// src/main/resources/static/js/weather.js
// Constants
const API_KEY = "38b64d931ea106a38a71f9ec1643ba9d";
const MAX_RECENT_SEARCHES = 5;

// DOM Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");
const forecastResult = document.getElementById("forecastResult");
const recentSearchesContainer = document.querySelector(".recent-searches");
const loadingIndicator = document.querySelector(".loading");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeModalBtn = document.querySelector(".close-modal");

// State
let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
let currentWeatherData = null;
let userPreferences = {
    temperatureUnit: 'celsius',
    windSpeedUnit: 'm/s',
    timeFormat: '24h',
    theme: 'system',
    defaultLocation: '',
    notificationsEnabled: false,
    forecastDays: 5
};

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    loadUserPreferences();
    applyTheme();
    updateRecentSearches();

    // Get user's location if permission is granted
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                // Default to user's preferred location or London
                const defaultLocation = userPreferences.defaultLocation || "London";
                getWeather(defaultLocation);
            }
        );
    } else {
        const defaultLocation = userPreferences.defaultLocation || "London";
        getWeather(defaultLocation);
    }

    // Initialize React components
    initReactComponents();
});

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
});

settingsBtn.addEventListener("click", () => {
    settingsModal.classList.add("show");
});

closeModalBtn.addEventListener("click", () => {
    settingsModal.classList.remove("show");
});

window.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove("show");
    }
});

// Custom event listener for preference changes
window.addEventListener("preferencesUpdated", (e) => {
    userPreferences = e.detail;
    saveUserPreferences();
    applyTheme();

    // If we have current weather data, update displays with new units
    if (currentWeatherData) {
        displayWeather(currentWeatherData);

        // Refresh forecast with new units
        getForecast(currentWeatherData.name);
    }
});

// Functions
function showLoading() {
    loadingIndicator.style.display = "flex";
}

function hideLoading() {
    loadingIndicator.style.display = "none";
}

function loadUserPreferences() {
    try {
        const savedPreferences = localStorage.getItem("userPreferences");
        if (savedPreferences) {
            userPreferences = JSON.parse(savedPreferences);
        }
    } catch (error) {
        console.error("Failed to load user preferences:", error);
    }
}

function saveUserPreferences() {
    try {
        localStorage.setItem("userPreferences", JSON.stringify(userPreferences));
    } catch (error) {
        console.error("Failed to save user preferences:", error);
    }
}

function applyTheme() {
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply theme based on user preference
    if (userPreferences.theme === 'dark' || (userPreferences.theme === 'system' && prefersDarkMode)) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function getWeatherByCoordinates(lat, lon) {
    showLoading();
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                throw new Error(data.message || "Error fetching weather data.");
            }

            currentWeatherData = data;
            displayWeather(data);
            getForecast(data.name);
            addToRecentSearches(data.name);

            // Trigger React components to update
            updateReactComponents(data);
        })
        .catch(err => {
            weatherResult.innerHTML = `<div class="weather-card"><p style="color:red;text-align:center;">${err.message}</p></div>`;
        })
        .finally(() => {
            hideLoading();
        });
}

function getWeather(city) {
    showLoading();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                throw new Error(data.message || "Error fetching weather data.");
            }

            currentWeatherData = data;
            displayWeather(data);
            getForecast(city);
            addToRecentSearches(city);

            // Trigger React components to update
            updateReactComponents(data);
        })
        .catch(err => {
            weatherResult.innerHTML = `<div class="weather-card"><p style="color:red;text-align:center;">${err.message}</p></div>`;
        })
        .finally(() => {
            hideLoading();
        });
}

function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== "200") {
                throw new Error(data.message || "Error fetching forecast data.");
            }

            displayForecast(data);
        })
        .catch(err => {
            forecastResult.innerHTML = `<p style="color:red;text-align:center;">${err.message}</p>`;
        });
}

function displayWeather(data) {
    const now = new Date();
    const dateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    const timeOptions = userPreferences.timeFormat === '12h'
        ? { hour: 'numeric', minute: 'numeric', hour12: true }
        : { hour: 'numeric', minute: 'numeric', hour24: true };

    const weatherIcon = getWeatherIcon(data.weather[0].icon);
    const temperature = formatTemperature(data.main.temp);
    const feelsLike = formatTemperature(data.main.feels_like);
    const windSpeed = formatWindSpeed(data.wind.speed);

    weatherResult.innerHTML = `
        <div class="weather-card">
            <div class="weather-header">
                <div class="city-name">${data.name}, ${data.sys.country}</div>
                <div class="current-date">${now.toLocaleDateString('en-US', dateOptions)} ${now.toLocaleTimeString('en-US', timeOptions)}</div>
            </div>
            <div class="weather-icon">${weatherIcon}</div>
            <div class="temperature">${temperature}</div>
            <div class="weather-condition">${data.weather[0].description}</div>
            <div class="weather-info">
                <div class="info-item">
                    <span class="info-label">Feels Like</span>
                    <span class="info-value">${feelsLike}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Humidity</span>
                    <span class="info-value">${data.main.humidity}%</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Wind Speed</span>
                    <span class="info-value">${windSpeed}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Pressure</span>
                    <span class="info-value">${data.main.pressure} hPa</span>
                </div>
            </div>
        </div>
    `;
}

function displayForecast(data) {
    // Process forecast data to get one forecast per day
    const dailyForecasts = {};
    // Use user's preference for how many days to display
    const forecastDays = userPreferences.forecastDays || 5;

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });

        if (!dailyForecasts[day] || new Date(dailyForecasts[day].dt * 1000).getHours() !== 12) {
            // Prefer forecast for 12:00 (noon)
            if (date.getHours() === 12) {
                dailyForecasts[day] = item;
            } else if (!dailyForecasts[day]) {
                dailyForecasts[day] = item;
            }
        }
    });

    // Convert to array and limit to user's preferred days
    const forecastArray = Object.values(dailyForecasts).slice(0, forecastDays);

    let forecastHTML = '';
    forecastArray.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const icon = getWeatherIcon(item.weather[0].icon);
        const temperature = formatTemperature(item.main.temp);

        forecastHTML += `
            <div class="forecast-day">
                <div class="day-name">${day}</div>
                <div class="day-icon">${icon}</div>
                <div class="day-temp">${temperature}</div>
                <div class="day-desc">${item.weather[0].description}</div>
            </div>
        `;
    });

    forecastResult.innerHTML = forecastHTML;
}

function formatTemperature(tempCelsius) {
    if (userPreferences.temperatureUnit === 'fahrenheit') {
        // Convert to Fahrenheit
        const tempF = (tempCelsius * 9/5) + 32;
        return `${Math.round(tempF)}°F`;
    }
    // Default to Celsius
    return `${Math.round(tempCelsius)}°C`;
}

function formatWindSpeed(speedMs) {
    switch (userPreferences.windSpeedUnit) {
        case 'km/h':
            // Convert m/s to km/h
            return `${Math.round(speedMs * 3.6)} km/h`;
        case 'mph':
            // Convert m/s to mph
            return `${Math.round(speedMs * 2.237)} mph`;
        default:
            // Default to m/s
            return `${speedMs} m/s`;
    }
}

function addToRecentSearches(city) {
    // Remove city if it already exists
    recentSearches = recentSearches.filter(item => item.toLowerCase() !== city.toLowerCase());

    // Add to beginning of array
    recentSearches.unshift(city);

    // Limit to MAX_RECENT_SEARCHES
    if (recentSearches.length > MAX_RECENT_SEARCHES) {
        recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
    }

    // Save to localStorage
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));

    // Update UI
    updateRecentSearches();
}

function updateRecentSearches() {
    let html = '';
    recentSearches.forEach(city => {
        html += `<div class="recent-item" onclick="getWeather('${city}')">${city}</div>`;
    });

    recentSearchesContainer.innerHTML = `<span style="color:#777;margin-right:5px;">Recent:</span>${html}`;
}

function getWeatherIcon(iconCode) {
    // Map OpenWeatherMap icon codes to Font Awesome icons
    const iconMap = {
        '01d': '<i class="fas fa-sun"></i>',                     // clear sky day
        '01n': '<i class="fas fa-moon"></i>',                    // clear sky night
        '02d': '<i class="fas fa-cloud-sun"></i>',               // few clouds day
        '02n': '<i class="fas fa-cloud-moon"></i>',              // few clouds night
        '03d': '<i class="fas fa-cloud"></i>',                   // scattered clouds
        '03n': '<i class="fas fa-cloud"></i>',                   // scattered clouds
        '04d': '<i class="fas fa-cloud"></i>',                   // broken clouds
        '04n': '<i class="fas fa-cloud"></i>',                   // broken clouds
        '09d': '<i class="fas fa-cloud-showers-heavy"></i>',     // shower rain
        '09n': '<i class="fas fa-cloud-showers-heavy"></i>',     // shower rain
        '10d': '<i class="fas fa-cloud-sun-rain"></i>',          // rain day
        '10n': '<i class="fas fa-cloud-moon-rain"></i>',         // rain night
        '11d': '<i class="fas fa-bolt"></i>',                    // thunderstorm
        '11n': '<i class="fas fa-bolt"></i>',                    // thunderstorm
        '13d': '<i class="fas fa-snowflake"></i>',               // snow
        '13n': '<i class="fas fa-snowflake"></i>',               // snow
        '50d': '<i class="fas fa-smog"></i>',                    // mist
        '50n': '<i class="fas fa-smog"></i>'                     // mist
    };

    return iconMap[iconCode] || '<i class="fas fa-cloud"></i>';
}

function initReactComponents() {
    // This will be called by app.js
    console.log("Ready to initialize React components");
}

function updateReactComponents(weatherData) {
    // Dispatch event for React components to update
    if (weatherData && weatherData.coord) {
        const event = new CustomEvent("weatherDataUpdated", {
            detail: {
                city: weatherData.name,
                lat: weatherData.coord.lat,
                lon: weatherData.coord.lon,
                preferences: userPreferences
            }
        });
        window.dispatchEvent(event);
    }
}

// Make getWeather globally available for recent searches
window.getWeather = getWeather;