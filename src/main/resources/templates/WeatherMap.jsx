import { useEffect, useState } from 'react';

export default function WeatherMap({ lat, lon }) {
    const [mapInitialized, setMapInitialized] = useState(false);

    useEffect(() => {
        // Only initialize the map once the component has mounted
        // and we have coordinates
        if (!mapInitialized && lat && lon) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
            script.async = true;
            script.onload = initializeMap;
            document.body.appendChild(script);

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
            document.head.appendChild(link);

            return () => {
                document.body.removeChild(script);
                document.head.removeChild(link);
            };
        }
    }, [lat, lon, mapInitialized]);

    const initializeMap = () => {
        if (window.L && lat && lon) {
            // Clear any existing map
            const container = document.getElementById('weather-map');
            container.innerHTML = '';

            // Initialize the map
            const map = window.L.map('weather-map').setView([lat, lon], 10);

            // Add the base tile layer
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Add a marker for the location
            window.L.marker([lat, lon]).addTo(map)
                .bindPopup('Weather location')
                .openPopup();

            // Add weather tiles
            window.L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=38b64d931ea106a38a71f9ec1643ba9d`, {
                attribution: 'Weather data &copy; OpenWeatherMap',
                opacity: 0.5
            }).addTo(map);

            setMapInitialized(true);
        }
    };

    return (
        <div className="rounded-lg shadow overflow-hidden mt-4">
            <div id="weather-map" className="w-full h-64"></div>
        </div>
    );
}