import { useState, useEffect } from 'react';

export default function HourlyForecast({ city, lat, lon }) {
    const [hourlyData, setHourlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_KEY = "38b64d931ea106a38a71f9ec1643ba9d";

    useEffect(() => {
        if (lat && lon) {
            fetchHourlyData();
        }
    }, [lat, lon]);

    const fetchHourlyData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get hourly forecast for the next 48 hours
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=16`
            );

            const data = await response.json();

            if (data.cod === "200" && data.list && data.list.length > 0) {
                // Process and format the hourly data
                const processedData = data.list.map(item => ({
                    time: new Date(item.dt * 1000),
                    temp: Math.round(item.main.temp),
                    feels_like: Math.round(item.main.feels_like),
                    weather: item.weather[0],
                    pop: Math.round(item.pop * 100), // Probability of precipitation as percentage
                    humidity: item.main.humidity,
                    wind: {
                        speed: item.wind.speed,
                        deg: item.wind.deg
                    }
                }));

                setHourlyData(processedData);
            } else {
                throw new Error(data.message || "Failed to fetch hourly forecast");
            }
        } catch (err) {
            console.error("Error fetching hourly forecast:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        // Get user's time format preference from localStorage
        const preferences = JSON.parse(localStorage.getItem("userPreferences") || "{}");
        const timeFormat = preferences.timeFormat || '24h';

        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: timeFormat === '12h'
        });
    };

    const getWeatherIcon = (iconCode) => {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    };

    if (loading) {
        return (
            <div className="hourly-forecast loading-state">
                <div className="hourly-loading">
                    <div className="spinner"></div>
                    <p>Loading hourly forecast...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="hourly-forecast error-state">
                <p className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </p>
            </div>
        );
    }

    if (!hourlyData.length) {
        return null;
    }

    return (
        <div className="hourly-forecast">
            <div className="hourly-scroll">
                {hourlyData.map((hour, index) => (
                    <div className="hourly-item" key={index}>
                        <div className="hourly-time">{formatTime(hour.time)}</div>
                        <div className="hourly-icon">
                            <img
                                src={getWeatherIcon(hour.weather.icon)}
                                alt={hour.weather.description}
                                title={hour.weather.description}
                            />
                        </div>
                        <div className="hourly-temp">{hour.temp}°</div>
                        <div className="hourly-rain">
                            <i className="fas fa-tint"></i> {hour.pop}%
                        </div>
                        <div className="hourly-wind">
                            <i className="fas fa-wind"></i> {hour.wind.speed} m/s
                        </div>
                    </div>
                ))}
            </div>
            <div className="hourly-chart">
                <canvas id="tempChart"></canvas>
            </div>
        </div>
    );
}