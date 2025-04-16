// src/main/resources/static/js/src/app.jsx
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import UserSettings from './components/UserSettings';
import AirPollutionDisplay from './components/AirPollutionDisplay';
import WeatherMap from './components/WeatherMap';

// Settings component that will be mounted in the modal
function SettingsComponent() {
    const [preferences, setPreferences] = useState({
        temperatureUnit: 'celsius',
        windSpeedUnit: 'm/s',
        timeFormat: '24h',
        theme: 'system',
        defaultLocation: '',
        notificationsEnabled: false,
        forecastDays: 5
    });

    useEffect(() => {
        try {
            // Load saved preferences
            const savedPreferences = localStorage.getItem("userPreferences");
            if (savedPreferences) {
                setPreferences(JSON.parse(savedPreferences));
            }
        } catch (error) {
            console.error("Failed to load user preferences:", error);
        }
    }, []);

    const handleSave = (updatedPreferences) => {
        // Close modal
        const modal = document.getElementById("settingsModal");
        modal.classList.remove("show");

        // Dispatch event to notify other components
        const event = new CustomEvent("preferencesUpdated", {
            detail: updatedPreferences
        });
        window.dispatchEvent(event);
    };

    return (
        <UserSettings onSave={handleSave} initialPreferences={preferences} />
    );
}

// Air Pollution component
function AirPollutionComponent() {
    const [pollutionData, setPollutionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState({ city: null, lat: null, lon: null });

    // Listen for weather data updates
    useEffect(() => {
        const handleWeatherDataUpdate = (event) => {
            const { city, lat, lon } = event.detail;
            setLocation({ city, lat, lon });
        };

        window.addEventListener("weatherDataUpdated", handleWeatherDataUpdate);
        return () => {
            window.removeEventListener("weatherDataUpdated", handleWeatherDataUpdate);
        };
    }, []);

    // Fetch air pollution data when location changes
    useEffect(() => {
        if (location.lat && location.lon) {
            fetchAirPollutionData(location.lat, location.lon);
        }
    }, [location]);

    const fetchAirPollutionData = async (lat, lon) => {
        const API_KEY = "38b64d931ea106a38a71f9ec1643ba9d";
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
            );
            const data = await response.json();

            if (data && data.list && data.list.length > 0) {
                setPollutionData(data.list[0]);
            } else {
                throw new Error("No air pollution data available");
            }
        } catch (err) {
            setError(err.message);
            console.error("Error fetching air pollution data:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AirPollutionDisplay
            data={pollutionData}
            loading={loading}
            error={error}
            location={location.city}
        />
    );
}

// Weather Map component
function WeatherMapComponent() {
    const [mapConfig, setMapConfig] = useState({
        lat: 51.5074,  // Default to London
        lon: -0.1278,
        zoom: 10
    });

    // Listen for weather data updates
    useEffect(() => {
        const handleWeatherDataUpdate = (event) => {
            const { lat, lon } = event.detail;
            if (lat && lon) {
                setMapConfig({
                    lat,
                    lon,
                    zoom: 10
                });
            }
        };

        window.addEventListener("weatherDataUpdated", handleWeatherDataUpdate);
        return () => {
            window.removeEventListener("weatherDataUpdated", handleWeatherDataUpdate);
        };
    }, []);

    return <WeatherMap config={mapConfig} />;
}

// Initialize all React components
function initializeApp() {
    // Mount Settings component
    const settingsContainer = document.getElementById('settingsContainer');
    if (settingsContainer) {
        ReactDOM.render(<SettingsComponent />, settingsContainer);
    }

    // Mount Air Pollution component
    const airPollutionContainer = document.getElementById('airPollutionContainer');
    if (airPollutionContainer) {
        ReactDOM.render(<AirPollutionComponent />, airPollutionContainer);
    }

    // Mount Weather Map component
    const mapContainer = document.getElementById('weather-map');
    if (mapContainer) {
        ReactDOM.render(<WeatherMapComponent />, mapContainer);
    }
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Expose initReactComponents for weather.js to call
window.initReactComponents = initializeApp;