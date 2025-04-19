// src/main/resources/static/js/src/app.jsx
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import UserSettings from './UserSettings';
import AirPollutionDisplay from './AirPollutionDisplay';
import WeatherMap from './WeatherMap';
import HourlyForecast from './HourlyForecast';
import CityComparison from './CityComparison';
import HistoricalWeather from './HistoricalWeather';
import SocialSharing from './SocialSharing';
import WeatherAlerts from './WeatherAlerts';
import WeatherRecommendations from './WeatherRecommendations';

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
        const saved = localStorage.getItem('userPreferences');
        if (saved) setPreferences(JSON.parse(saved));
    }, []);

    const handleSave = (updated) => {
        localStorage.setItem('userPreferences', JSON.stringify(updated));
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('show');
        window.dispatchEvent(new CustomEvent('preferencesUpdated', { detail: updated }));
    };

    return <UserSettings onSave={handleSave} initialPreferences={preferences} />;
}

function AirPollutionComponent({ lat, lon }) {
    return <AirPollutionDisplay lat={lat} lon={lon} />;
}

function WeatherMapComponent({ lat, lon }) {
    return <WeatherMap lat={lat} lon={lon} />;
}

function HourlyForecastComponent({ lat, lon }) {
    return <HourlyForecast lat={lat} lon={lon} />;
}

function CityComparisonComponent({ cities }) {
    return <CityComparison cities={cities} />;
}

function HistoricalWeatherComponent({ lat, lon }) {
    const preferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
    const tempUnit = preferences.temperatureUnit || 'celsius';
    return <HistoricalWeather lat={lat} lon={lon} tempUnit={tempUnit} />;
}

function WeatherAlertsComponent({ alerts }) {
    return <WeatherAlerts alerts={alerts} />;
}

function WeatherRecommendationsComponent({ weatherData }) {
    return <WeatherRecommendations weatherData={weatherData} />;
}

function SocialSharingComponent({ weatherData, location }) {
    return <SocialSharing weatherData={weatherData} location={location} />;
}

// Main initializer
function initializeApp() {
    let currentLocation = { lat: null, lon: null, city: '', weatherData: null, alerts: [], cities: [] };

    const mountSettings = () => {
        const settingsContainer = document.getElementById('settingsContainer');
        if (settingsContainer) ReactDOM.render(<SettingsComponent />, settingsContainer);
    };

    const mountWeatherSections = () => {
        if (currentLocation.lat && currentLocation.lon) {
            const airPollutionContainer = document.getElementById('airPollutionContainer');
            if (airPollutionContainer) ReactDOM.render(
                <AirPollutionComponent lat={currentLocation.lat} lon={currentLocation.lon} />, airPollutionContainer
            );

            const weatherMapContainer = document.getElementById('weather-map');
            if (weatherMapContainer) ReactDOM.render(
                <WeatherMapComponent lat={currentLocation.lat} lon={currentLocation.lon} />, weatherMapContainer
            );

            const hourlyForecastContainer = document.getElementById('hourlyForecastContainer');
            if (hourlyForecastContainer) ReactDOM.render(
                <HourlyForecastComponent lat={currentLocation.lat} lon={currentLocation.lon} />, hourlyForecastContainer
            );

            const historicalContainer = document.getElementById('historicalDataContainer');
            if (historicalContainer) ReactDOM.render(
                <HistoricalWeatherComponent lat={currentLocation.lat} lon={currentLocation.lon} />, historicalContainer
            );
        }

        const alertsBanner = document.getElementById('alertsBanner');
        if (alertsBanner) ReactDOM.render(
            <WeatherAlertsComponent alerts={currentLocation.alerts} />, alertsBanner
        );

        const recommendationsContainer = document.getElementById('recommendationsContainer');
        if (recommendationsContainer) ReactDOM.render(
            <WeatherRecommendationsComponent weatherData={currentLocation.weatherData} />, recommendationsContainer
        );

        const socialContainer = document.getElementById('communityReportsContainer');
        if (socialContainer) ReactDOM.render(
            <SocialSharingComponent weatherData={currentLocation.weatherData} location={{ name: currentLocation.city }} />, socialContainer
        );

        const comparisonContainer = document.getElementById('cityComparisonContainer');
        if (comparisonContainer) ReactDOM.render(
            <CityComparisonComponent cities={currentLocation.cities} />, comparisonContainer
        );
    };

    window.addEventListener('weatherDataUpdated', (event) => {
        const { lat, lon, city, weatherData, alerts } = event.detail;
        currentLocation.lat = lat;
        currentLocation.lon = lon;
        currentLocation.city = city;
        currentLocation.weatherData = weatherData;
        currentLocation.alerts = alerts || [];
        mountWeatherSections();
    });

    window.addEventListener('cityComparisonUpdated', (event) => {
        const { cities } = event.detail;
        currentLocation.cities = cities;
        mountWeatherSections();
    });

    mountSettings();
}

// Run initializer on load
document.addEventListener('DOMContentLoaded', initializeApp);
