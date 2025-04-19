import { useState, useEffect } from 'react';

export default function CityComparison({ cities }) {
    const [comparisonData, setComparisonData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comparisonMetric, setComparisonMetric] = useState('temp');
    const API_KEY = "38b64d931ea106a38a71f9ec1643ba9d";

    useEffect(() => {
        if (cities && cities.length > 0) {
            fetchComparisonData();
        }
    }, [cities]);

    const fetchComparisonData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch weather data for all cities in parallel
            const promises = cities.map(city => {
                if (city.lat && city.lon) {
                    return fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`
                    )
                        .then(response => response.json())
                        .then(data => {
                            if (data.cod === 200) {
                                return {
                                    name: city.name || data.name,
                                    id: city.id || data.id,
                                    current: {
                                        temp: Math.round(data.main.temp),
                                        feels_like: Math.round(data.main.feels_like),
                                        humidity: data.main.humidity,
                                        pressure: data.main.pressure,
                                        windSpeed: data.wind.speed,
                                        windDeg: data.wind.deg,
                                        description: data.weather[0].description,
                                        icon: data.weather[0].icon,
                                        clouds: data.clouds.all,
                                        visibility: data.visibility,
                                        sunrise: new Date(data.sys.sunrise * 1000),
                                        sunset: new Date(data.sys.sunset * 1000)
                                    }
                                };
                            } else {
                                throw new Error(`Failed to fetch data for ${city.name}`);
                            }
                        });
                }
                return Promise.reject(new Error(`Invalid coordinates for ${city.name}`));
            });

            const results = await Promise.allSettled(promises);
            const cityData = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);

            if (cityData.length === 0) {
                throw new Error("Could not fetch data for any of the cities");
            }

            setComparisonData(cityData);
        } catch (err) {
            console.error("Error fetching comparison data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMetricChange = (metric) => {
        setComparisonMetric(metric);
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

    const getMetricValue = (city, metric) => {
        switch (metric) {
            case 'temp': return `${city.current.temp}°C`;
            case 'feels_like': return `${city.current.feels_like}°C`;
            case 'humidity': return `${city.current.humidity}%`;
            case 'wind': return `${city.current.windSpeed} m/s`;
            case 'pressure': return `${city.current.pressure} hPa`;
            case 'visibility': return `${(city.current.visibility / 1000).toFixed(1)} km`;
            case 'clouds': return `${city.current.clouds}%`;
            case 'sunrise': return formatTime(city.current.sunrise);
            case 'sunset': return formatTime(city.current.sunset);
            default: return `${city.current.temp}°C`;
        }
    };

    const getMetricIcon = (metric) => {
        switch (metric) {
            case 'temp': return 'fa-thermometer-half';
            case 'feels_like': return 'fa-temperature-high';
            case 'humidity': return 'fa-water';
            case 'wind': return 'fa-wind';
            case 'pressure': return 'fa-tachometer-alt';
            case 'visibility': return 'fa-eye';
            case 'clouds': return 'fa-cloud';
            case 'sunrise': return 'fa-sun';
            case 'sunset': return 'fa-moon';
            default: return 'fa-thermometer-half';
        }
    };

    const getMetricName = (metric) => {
        switch (metric) {
            case 'temp': return 'Temperature';
            case 'feels_like': return 'Feels Like';
            case 'humidity': return 'Humidity';
            case 'wind': return 'Wind Speed';
            case 'pressure': return 'Pressure';
            case 'visibility': return 'Visibility';
            case 'clouds': return 'Cloud Cover';
            case 'sunrise': return 'Sunrise';
            case 'sunset': return 'Sunset';
            default: return 'Temperature';
        }
    };

    const getBestCityForMetric = (metric) => {
        if (!comparisonData || comparisonData.length === 0) return null;

        // Clone and sort the cities based on the metric
        let bestCity;

        switch (metric) {
            case 'temp':
                // For temperature, best is moderate (close to 21°C)
                bestCity = [...comparisonData].sort((a, b) =>
                    Math.abs(a.current.temp - 21) - Math.abs(b.current.temp - 21)
                )[0];
                break;
            case 'feels_like':
                // For feels like, best is moderate (close to 21°C)
                bestCity = [...comparisonData].sort((a, b) =>
                    Math.abs(a.current.feels_like - 21) - Math.abs(b.current.feels_like - 21)
                )[0];
                break;
            case 'humidity':
                // For humidity, best is moderate (around 50%)
                bestCity = [...comparisonData].sort((a, b) =>
                    Math.abs(a.current.humidity - 50) - Math.abs(b.current.humidity - 50)
                )[0];
                break;
            case 'wind':
                // For wind, best is moderate breeze (around 3-4 m/s)
                bestCity = [...comparisonData].sort((a, b) =>
                    Math.abs(a.current.windSpeed - 3.5) - Math.abs(b.current.windSpeed - 3.5)
                )[0];
                break;
            case 'pressure':
                // Normal pressure is around 1013 hPa
                bestCity = [...comparisonData].sort((a, b) =>
                    Math.abs(a.current.pressure - 1013) - Math.abs(b.current.pressure - 1013)
                )[0];
                break;
            case 'visibility':
                // Higher visibility is better
                bestCity = [...comparisonData].sort((a, b) => b.current.visibility - a.current.visibility)[0];
                break;
            case 'clouds':
                // Fewer clouds is generally better for outdoor activities
                bestCity = [...comparisonData].sort((a, b) => a.current.clouds - b.current.clouds)[0];
                break;
            case 'sunrise':
                // Earlier sunrise
                bestCity = [...comparisonData].sort((a, b) =>
                    a.current.sunrise.getTime() - b.current.sunrise.getTime()
                )[0];
                break;
            case 'sunset':
                // Later sunset
                bestCity = [...comparisonData].sort((a, b) =>
                    b.current.sunset.getTime() - a.current.sunset.getTime()
                )[0];
                break;
            default:
                bestCity = comparisonData[0];
        }

        return bestCity ? bestCity.name : null;
    };

    if (loading) {
        return (
            <div className="city-comparison loading-state">
                <div className="spinner"></div>
                <p>Loading city comparison data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="city-comparison error-state">
                <p className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </p>
            </div>
        );
    }

    if (!comparisonData.length) {
        return (
            <div className="city-comparison empty-state">
                <p>Please select cities to compare</p>
            </div>
        );
    }

    return (
        <div className="city-comparison-container">
            <div className="comparison-header">
                <h2 className="section-title">City Comparison</h2>
                <div className="comparison-metrics">
                    <span>Compare by: </span>
                    <select
                        value={comparisonMetric}
                        onChange={(e) => handleMetricChange(e.target.value)}
                        className="metric-selector"
                    >
                        <option value="temp">Temperature</option>
                        <option value="feels_like">Feels Like</option>
                        <option value="humidity">Humidity</option>
                        <option value="wind">Wind Speed</option>
                        <option value="pressure">Pressure</option>
                        <option value="visibility">Visibility</option>
                        <option value="clouds">Cloud Cover</option>
                        <option value="sunrise">Sunrise</option>
                        <option value="sunset">Sunset</option>
                    </select>
                </div>
            </div>

            <div className="comparison-cards">
                {comparisonData.map((city, index) => (
                    <div
                        key={index}
                        className={`comparison-card ${city.name === getBestCityForMetric(comparisonMetric) ? 'best-metric' : ''}`}
                    >
                        <div className="comparison-city-header">
                            <h3>{city.name}</h3>
                            <img
                                src={getWeatherIcon(city.current.icon)}
                                alt={city.current.description}
                                title={city.current.description}
                            />
                        </div>

                        <div className="comparison-metric-value">
                            <i className={`fas ${getMetricIcon(comparisonMetric)}`}></i>
                            <span>{getMetricValue(city, comparisonMetric)}</span>
                        </div>

                        <div className="comparison-weather-desc">
                            {city.current.description}
                        </div>

                        <div className="comparison-other-metrics">
                            {comparisonMetric !== 'temp' && (
                                <div className="other-metric">
                                    <i className="fas fa-thermometer-half"></i> {city.current.temp}°C
                                </div>
                            )}
                            {comparisonMetric !== 'humidity' && (
                                <div className="other-metric">
                                    <i className="fas fa-water"></i> {city.current.humidity}%
                                </div>
                            )}
                            {comparisonMetric !== 'wind' && (
                                <div className="other-metric">
                                    <i className="fas fa-wind"></i> {city.current.windSpeed} m/s
                                </div>
                            )}
                        </div>

                        {city.name === getBestCityForMetric(comparisonMetric) && (
                            <div className="best-metric-badge">
                                <i className="fas fa-medal"></i> Best for {getMetricName(comparisonMetric)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="comparison-conclusion">
                <h3>Comparison Summary</h3>
                <p>
                    Based on {getMetricName(comparisonMetric)},
                    <strong> {getBestCityForMetric(comparisonMetric)}</strong> has the best conditions
                    among the compared cities.
                </p>
            </div>
        </div>
    );
}