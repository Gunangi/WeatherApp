import { useEffect, useState, useRef } from 'react';

export default function WeatherMap({ config }) {
    const mapRef = useRef(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [currentLayer, setCurrentLayer] = useState('temperature');
    const [layerInstances, setLayerInstances] = useState({});
    const API_KEY = "38b64d931ea106a38a71f9ec1643ba9d";

    // Initialize map when component mounts
    useEffect(() => {
        if (!mapInstance && config.lat && config.lon) {
            loadLeaflet();
        }
    }, [config, mapInstance]);

    // Listen for layer toggle changes
    useEffect(() => {
        const handleLayerToggle = (e) => {
            if (e.target.classList.contains('map-layer-toggle')) {
                const layer = e.target.getAttribute('data-layer');
                setCurrentLayer(layer);

                // Update active class on buttons
                document.querySelectorAll('.map-layer-toggle').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        };

        const mapControls = document.querySelector('.map-controls');
        if (mapControls) {
            mapControls.addEventListener('click', handleLayerToggle);
        }

        return () => {
            if (mapControls) {
                mapControls.removeEventListener('click', handleLayerToggle);
            }
        };
    }, []);

    // Update visible layer when currentLayer changes
    useEffect(() => {
        if (mapInstance && layerInstances) {
            // Hide all layers
            Object.keys(layerInstances).forEach(key => {
                if (layerInstances[key] && mapInstance.hasLayer(layerInstances[key])) {
                    mapInstance.removeLayer(layerInstances[key]);
                }
            });

            // Show selected layer
            if (layerInstances[currentLayer] && !mapInstance.hasLayer(layerInstances[currentLayer])) {
                mapInstance.addLayer(layerInstances[currentLayer]);
            }
        }
    }, [currentLayer, mapInstance, layerInstances]);

    // Load Leaflet library
    const loadLeaflet = () => {
        if (window.L) {
            initializeMap();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
        script.async = true;
        script.onload = initializeMap;
        document.body.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(link);
    };

    // Initialize the map
    const initializeMap = () => {
        if (!window.L || !config.lat || !config.lon) return;

        // Clear any existing map
        const container = document.getElementById('weather-map');
        container.innerHTML = '';

        // Create map instance
        const map = window.L.map('weather-map').setView([config.lat, config.lon], config.zoom || 10);

        // Add the base tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Add marker for location
        const marker = window.L.marker([config.lat, config.lon]).addTo(map)
            .bindPopup('Weather location')
            .openPopup();

        // Create weather layers
        const layers = {
            temperature: window.L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
                attribution: 'Weather data &copy; OpenWeatherMap',
                opacity: 0.7
            }),
            precipitation: window.L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
                attribution: 'Weather data &copy; OpenWeatherMap',
                opacity: 0.7
            }),
            wind: window.L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
                attribution: 'Weather data &copy; OpenWeatherMap',
                opacity: 0.7
            }),
            clouds: window.L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
                attribution: 'Weather data &copy; OpenWeatherMap',
                opacity: 0.7
            })
        };

        // Add temperature layer by default
        layers.temperature.addTo(map);

        // Set up click event to get weather at clicked location
        map.on('click', async (e) => {
            const { lat, lng } = e.latlng;

            try {
                // Update marker position
                marker.setLatLng([lat, lng]);
                marker.bindPopup('Loading...').openPopup();

                // Get weather for clicked location
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`);
                const data = await response.json();

                if (data.cod === 200) {
                    // Update popup with weather info
                    marker.bindPopup(`
                        <div class="map-popup">
                            <h3>${data.name || 'Selected Location'}</h3>
                            <div class="popup-weather">
                                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
                                <span class="popup-temp">${Math.round(data.main.temp)}°C</span>
                            </div>
                            <p>${data.weather[0].description}</p>
                            <button class="popup-details-btn" onclick="getWeatherByCoordinates(${lat}, ${lng})">
                                View Details
                            </button>
                        </div>
                    `).openPopup();

                    // Make getWeatherByCoordinates available globally
                    if (!window.getWeatherByCoordinates) {
                        window.getWeatherByCoordinates = (lat, lng) => {
                            const event = new CustomEvent("mapLocationSelected", {
                                detail: { lat, lng }
                            });
                            window.dispatchEvent(event);
                        };
                    }
                } else {
                    marker.bindPopup(`Weather data not available for this location`).openPopup();
                }
            } catch (error) {
                console.error("Error fetching location weather:", error);
                marker.bindPopup(`Error fetching weather data`).openPopup();
            }
        });

        // Store map and layers
        setMapInstance(map);
        setLayerInstances(layers);

        // Store map reference
        mapRef.current = map;
    };

    // Update map view when coordinates change
    useEffect(() => {
        if (mapRef.current && config.lat && config.lon) {
            mapRef.current.setView([config.lat, config.lon], config.zoom || 10);

            // Update marker position
            const markers = [];
            mapRef.current.eachLayer(layer => {
                if (layer instanceof window.L.Marker) {
                    markers.push(layer);
                }
            });

            if (markers.length > 0) {
                markers[0].setLatLng([config.lat, config.lon]);
                markers[0].bindPopup('Weather location').openPopup();
            }
        }
    }, [config.lat, config.lon]);

    return (
        <div className="weather-map-component">
            <div id="weather-map" className="w-full h-96 rounded-lg overflow-hidden"></div>
            <div className="map-legend">
                <div className="legend-item">
                    <span className="legend-color" style={{backgroundColor: 'rgba(255, 0, 0, 0.5)'}}></span>
                    <span className="legend-label">High</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{backgroundColor: 'rgba(255, 255, 0, 0.5)'}}></span>
                    <span className="legend-label">Medium</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{backgroundColor: 'rgba(0, 0, 255, 0.5)'}}></span>
                    <span className="legend-label">Low</span>
                </div>
            </div>
        </div>
    );
}