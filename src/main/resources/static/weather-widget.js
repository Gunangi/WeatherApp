/**
 * Weather Widget - A customizable weather widget for websites
 * This file provides the client-side implementation of the embeddable weather widget
 */

(function(window, document) {
    'use strict';

    // WeatherWidget namespace
    window.WeatherWidget = window.WeatherWidget || {};

    // API endpoints
    const API_BASE_URL = window.location.origin;
    const WEATHER_API_ENDPOINT = `${API_BASE_URL}/api/widget-weather`;

    // CSS styles for the widget
    const WIDGET_STYLES = `
        .weather-widget {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin: 0 auto;
        }
        
        .weather-widget * {
            box-sizing: border-box;
        }
        
        .widget-light {
            background: linear-gradient(to bottom right, #f7f9fc, #e3e9f3);
            color: #333;
        }
        
        .widget-dark {
            background: linear-gradient(to bottom right, #2c3e50, #1a202c);
            color: #fff;
        }
        
        .widget-header {
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .widget-dark .widget-header {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .widget-location {
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .widget-date {
            font-size: 0.8em;
            opacity: 0.8;
        }
        
        .widget-body {
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .widget-temp {
            font-size: 2.5em;
            font-weight: bold;
            margin-right: 10px;
        }
        
        .widget-icon {
            font-size: 2em;
            margin: 0 10px;
        }
        
        .widget-details {
            display: flex;
            flex-direction: column;
            margin-left: 10px;
            font-size: 0.85em;
        }
        
        .widget-condition {
            margin-bottom: 5px;
        }
        
        .widget-humidity, .widget-wind {
            opacity: 0.8;
        }
        
        .widget-footer {
            padding: 5px;
            text-align: center;
            font-size: 0.7em;
            opacity: 0.6;
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .widget-dark .widget-footer {
            background-color: rgba(255, 255, 255, 0.05);
        }
        
        /* Size variations */
        .widget-small {
            width: 200px;
            font-size: 0.8em;
        }
        
        .widget-medium {
            width: 300px;
            font-size: 1em;
        }
        
        .widget-large {
            width: 400px;
            font-size: 1.2em;
        }
        
        /* Weather icon styles */
        .wi {
            display: inline-block;
            font-family: 'weathericons';
            font-style: normal;
            font-weight: normal;
            line-height: 1;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
    `;

    // Weather icons mapping (simplified for this example)
    const WEATHER_ICONS = {
        '01d': '☀️', // Clear sky (day)
        '01n': '🌙', // Clear sky (night)
        '02d': '⛅', // Few clouds (day)
        '02n': '☁️', // Few clouds (night)
        '03d': '☁️', // Scattered clouds
        '03n': '☁️',
        '04d': '☁️', // Broken clouds
        '04n': '☁️',
        '09d': '🌧️', // Shower rain
        '09n': '🌧️',
        '10d': '🌦️', // Rain (day)
        '10n': '🌧️', // Rain (night)
        '11d': '⛈️', // Thunderstorm
        '11n': '⛈️',
        '13d': '❄️', // Snow
        '13n': '❄️',
        '50d': '🌫️', // Mist
        '50n': '🌫️'
    };

    // Initialize the widget
    WeatherWidget.init = function(selector, paramsString) {
        // Parse the parameters
        const params = new URLSearchParams(paramsString);
        const location = params.get('location');
        const type = params.get('type') || 'basic';
        const size = params.get('size') || 'medium';
        const theme = params.get('theme') || 'light';
        const widgetId = params.get('id');

        // Get the container element
        const container = document.querySelector(selector);
        if (!container) {
            console.error('Weather Widget: Container not found');
            return;
        }

        // Add the widget CSS
        addStyles();

        // Set widget classes
        container.className = `weather-widget widget-${size} widget-${theme}`;

        // Show loading state
        container.innerHTML = '<div style="padding: 20px; text-align: center;">Loading weather data...</div>';

        // Fetch weather data
        fetchWeatherData(location)
            .then(data => {
                renderWidget(container, data, type, theme);
            })
            .catch(error => {
                container.innerHTML = `<div style="padding: 20px; text-align: center; color: #e74c3c;">
                    Error loading weather data. Please try again later.
                </div>`;
                console.error('Weather Widget Error:', error);
            });
    };

    // Add CSS styles to the document
    function addStyles() {
        if (!document.getElementById('weather-widget-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'weather-widget-styles';
            styleElement.textContent = WIDGET_STYLES;
            document.head.appendChild(styleElement);
        }

        // Add Weather Icons if they're not already added
        if (!document.getElementById('weather-icons-css')) {
            const link = document.createElement('link');
            link.id = 'weather-icons-css';
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/weather-icons/2.0.10/css/weather-icons.min.css';
            document.head.appendChild(link);
        }
    }

    // Fetch weather data from the API
    function fetchWeatherData(location) {
        return fetch(`${WEATHER_API_ENDPOINT}?location=${encodeURIComponent(location)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            });
    }

    // Render the widget with weather data
    function renderWidget(container, data, type, theme) {
        const current = data.current;
        const weather = current.weather[0];
        const temp = Math.round(current.temp);
        const date = new Date();

        // Get weather icon
        const icon = weather.icon ? WEATHER_ICONS[weather.icon] : '☁️';

        // Create widget HTML structure
        let html = `
            <div class="widget-header">
                <div class="widget-location">${data.location.name}</div>
                ${type !== 'minimal' ? `<div class="widget-date">${date.toLocaleDateString()}</div>` : ''}
            </div>
            <div class="widget-body">
                <div class="widget-temp">${temp}°</div>
                <div class="widget-icon">${icon}</div>
        `;

        // Add details for detailed type
        if (type === 'detailed') {
            html += `
                <div class="widget-details">
                    <div class="widget-condition">${weather.main}</div>
                    <div class="widget-humidity">💧 ${current.humidity}%</div>
                    <div class="widget-wind">💨 ${Math.round(current.wind_speed)} km/h</div>
                </div>
            `;
        } else if (type === 'basic') {
            html += `<div class="widget-condition">${weather.main}</div>`;
        }

        html += `
            </div>
            <div class="widget-footer">
                <small>Weather data provided by WeatherApp</small>
            </div>
        `;

        container.innerHTML = html;
    }

})(window, document);