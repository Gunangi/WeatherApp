import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Thermometer, CloudRain, Wind, Eye, BarChart3 } from 'lucide-react';

const HistoricalWeather = ({ location = 'Delhi' }) => {
    const [timeRange, setTimeRange] = useState('30days');
    const [dataType, setDataType] = useState('temperature');
    const [historicalData, setHistoricalData] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [chartType, setChartType] = useState('line');

    useEffect(() => {
        fetchHistoricalData();
    }, [timeRange, dataType, location]);

    const fetchHistoricalData = async () => {
        setIsLoading(true);
        try {
            // Mock historical data generation - replace with actual API call
            const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 365;
            const mockData = Array.from({ length: days }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (days - i));

                // Generate realistic weather patterns
                const baseTemp = 25 + Math.sin((i / days) * 2 * Math.PI) * 10;
                const randomVariation = (Math.random() - 0.5) * 8;

                return {
                    date: date.toISOString().split('T')[0],
                    formattedDate: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
                    temperature: Math.round(baseTemp + randomVariation),
                    humidity: Math.round(50 + Math.random() * 40),
                    windSpeed: Math.round(2 + Math.random() * 8),
                    pressure: Math.round(1000 + Math.random() * 50),
                    precipitation: Math.random() > 0.7 ? Math.round(Math.random() * 20) : 0,
                    visibility: Math.round(8 + Math.random() * 4),
                    uvIndex: Math.round(3 + Math.random() * 8),
                    cloudCover: Math.round(Math.random() * 100)
                };
            });

            setHistoricalData(mockData);
            calculateStatistics(mockData);
        } catch (error) {
            console.error('Error fetching historical data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStatistics = (data) => {
        if (data.length === 0) return;

        const stats = {
            temperature: {
                avg: Math.round(data.reduce((sum, d) => sum + d.temperature, 0) / data.length),
                max: Math.max(...data.map(d => d.temperature)),
                min: Math.min(...data.map(d => d.temperature)),
                trend: calculateTrend(data.map(d => d.temperature))
            },
            humidity: {
                avg: Math.round(data.reduce((sum, d) => sum + d.humidity, 0) / data.length),
                max: Math.max(...data.map(d => d.humidity)),
                min: Math.min(...data.map(d => d.humidity))
            },
            windSpeed: {
                avg: Math.round(data.reduce((sum, d) => sum + d.windSpeed, 0) / data.length * 10) / 10,
                max: Math.max(...data.map(d => d.windSpeed)),
                min: Math.min(...data.map(d => d.windSpeed))
            },
            precipitation: {
                total: data.reduce((sum, d) => sum + d.precipitation, 0),
                days: data.filter(d => d.precipitation > 0).length,
                avg: Math.round(data.reduce((sum, d) => sum + d.precipitation, 0) / data.length * 10) / 10
            }
        };

        setStatistics(stats);
    };

    const calculateTrend = (values) => {
        if (values.length < 2) return 0;
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
        return Math.round((secondAvg - firstAvg) * 10) / 10;
    };

    const getDataForChart = () => {
        switch (dataType) {
            case 'temperature':
                return historicalData.map(d => ({ ...d, value: d.temperature, unit: '°C' }));
            case 'humidity':
                return historicalData.map(d => ({ ...d, value: d.humidity, unit: '%' }));
            case 'windSpeed':
                return historicalData.map(d => ({ ...d, value: d.windSpeed, unit: 'm/s' }));
            case 'pressure':
                return historicalData.map(d => ({ ...d, value: d.pressure, unit: 'hPa' }));
            case 'precipitation':
                return historicalData.map(d => ({ ...d, value: d.precipitation, unit: 'mm' }));
            default:
                return historicalData.map(d => ({ ...d, value: d.temperature, unit: '°C' }));
        }
    };

    const timeRanges = [
        { id: '7days', label: '7 Days' },
        { id: '30days', label: '30 Days' },
        { id: '1year', label: '1 Year' }
    ];

    const dataTypes = [
        { id: 'temperature', label: 'Temperature', icon: Thermometer, color: '#f59e0b' },
        { id: 'humidity', label: 'Humidity', icon: CloudRain, color: '#3b82f6' },
        { id: 'windSpeed', label: 'Wind Speed', icon: Wind, color: '#10b981' },
        { id: 'pressure', label: 'Pressure', icon: BarChart3, color: '#8b5cf6' },
        { id: 'precipitation', label: 'Precipitation', icon: CloudRain, color: '#06b6d4' }
    ];

    const chartTypes = [
        { id: 'line', label: 'Line Chart' },
        { id: 'area', label: 'Area Chart' },
        { id: 'bar', label: 'Bar Chart' }
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="text-white font-medium">{label}</p>
                    <p className="text-blue-300">
                        {`${payload[0].value}${payload[0].payload.unit}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        const data = getDataForChart();
        const currentDataType = dataTypes.find(dt => dt.id === dataType);
        const color = currentDataType?.color || '#3b82f6';

        const commonProps = {
            data,
            margin: { top: 5, right: 30, left: 20, bottom: 5 }
        };

        switch (chartType) {
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="formattedDate"
                                stroke="#9ca3af"
                                tick={{ fontSize: 12 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                fill={`${color}30`}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                );
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="formattedDate"
                                stroke="#9ca3af"
                                tick={{ fontSize: 12 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            default:
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="formattedDate"
                                stroke="#9ca3af"
                                tick={{ fontSize: 12 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={3}
                                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
        }
    };

    const getTrendIcon = (trend) => {
        if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
        if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
        return <div className="w-4 h-4" />;
    };

    if (isLoading) {
        return (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-semibold text-white">Historical Weather</h2>
                </div>
                <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-blue-400 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading historical data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Historical Weather</h2>
                <span className="text-gray-400">• {location}</span>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Time Range Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
                    <div className="flex gap-1">
                        {timeRanges.map((range) => (
                            <button
                                key={range.id}
                                onClick={() => setTimeRange(range.id)}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                    timeRange === range.id
                                        ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data Type Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Data Type</label>
                    <select
                        value={dataType}
                        onChange={(e) => setDataType(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
                    >
                        {dataTypes.map((type) => (
                            <option key={type.id} value={type.id} className="bg-gray-800">
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Chart Type Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Chart Type</label>
                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
                    >
                        {chartTypes.map((type) => (
                            <option key={type.id} value={type.id} className="bg-gray-800">
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {dataType === 'temperature' && statistics.temperature && (
                    <>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Thermometer className="w-5 h-5 text-orange-400" />
                                <span className="text-sm text-gray-400">Average</span>
                            </div>
                            <p className="text-xl font-semibold text-white">{statistics.temperature.avg}°C</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-red-400" />
                                <span className="text-sm text-gray-400">Maximum</span>
                            </div>
                            <p className="text-xl font-semibold text-white">{statistics.temperature.max}°C</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-5 h-5 text-blue-400" />
                                <span className="text-sm text-gray-400">Minimum</span>
                            </div>
                            <p className="text-xl font-semibold text-white">{statistics.temperature.min}°C</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                {getTrendIcon(statistics.temperature.trend)}
                                <span className="text-sm text-gray-400">Trend</span>
                            </div>
                            <p className="text-xl font-semibold text-white">
                                {statistics.temperature.trend > 0 ? '+' : ''}{statistics.temperature.trend}°C
                            </p>
                        </div>
                    </>
                )}

                {dataType === 'precipitation' && statistics.precipitation && (
                    <>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CloudRain className="w-5 h-5 text-blue-400" />
                                <span className="text-sm text-gray-400">Total</span>
                            </div>
                            <p className="text-xl font-semibold text-white">{statistics.precipitation.total}mm</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                <span className="text-sm text-gray-400">Rainy Days</span>
                            </div>
                            <p className="text-xl font-semibold text-white">{statistics.precipitation.days}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="w-5 h-5 text-blue-400" />
                                <span className="text-sm text-gray-400">Average</span>
                            </div>
                            <p className="text-xl font-semibold text-white">{statistics.precipitation.avg}mm</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-5 h-5 text-blue-400" />
                                <span className="text-sm text-gray-400">Frequency</span>
                            </div>
                            <p className="text-xl font-semibold text-white">
                                {Math.round((statistics.precipitation.days / historicalData.length) * 100)}%
                            </p>
                        </div>
                    </>
                )}

                {dataType !== 'temperature' && dataType !== 'precipitation' && statistics[dataType] && (
                    <>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                {React.createElement(dataTypes.find(dt => dt.id === dataType)?.icon || Thermometer, {
                                    className: "w-5 h-5 text-blue-400"
                                })}
                                <span className="text-sm text-gray-400">Average</span>
                            </div>
                            <p className="text-xl font-semibold text-white">
                                {statistics[dataType].avg}{dataType === 'humidity' ? '%' : dataType === 'windSpeed' ? ' m/s' : ' hPa'}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                                <span className="text-sm text-gray-400">Maximum</span>
                            </div>
                            <p className="text-xl font-semibold text-white">
                                {statistics[dataType].max}{dataType === 'humidity' ? '%' : dataType === 'windSpeed' ? ' m/s' : ' hPa'}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-5 h-5 text-blue-400" />
                                <span className="text-sm text-gray-400">Minimum</span>
                            </div>
                            <p className="text-xl font-semibold text-white">
                                {statistics[dataType].min}{dataType === 'humidity' ? '%' : dataType === 'windSpeed' ? ' m/s' : ' hPa'}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                                <span className="text-sm text-gray-400">Range</span>
                            </div>
                            <p className="text-xl font-semibold text-white">
                                {statistics[dataType].max - statistics[dataType].min}{dataType === 'humidity' ? '%' : dataType === 'windSpeed' ? ' m/s' : ' hPa'}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Chart */}
            <div className="bg-white/5 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-medium text-white mb-4 capitalize">
                    {dataType} Trends - {timeRange.replace('days', ' Days').replace('1year', '1 Year')}
                </h3>
                {renderChart()}
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-400/20">
                <h4 className="font-medium text-purple-300 mb-3">📊 Key Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-300">
                            • The {dataType} has varied between{' '}
                            <span className="text-white font-medium">
                {statistics[dataType]?.min || 'N/A'} and {statistics[dataType]?.max || 'N/A'}
              </span>
                        </p>
                        <p className="text-gray-300 mt-1">
                            • Average {dataType} was{' '}
                            <span className="text-white font-medium">{statistics[dataType]?.avg || 'N/A'}</span>
                        </p>
                    </div>
                    <div>
                        {dataType === 'temperature' && statistics.temperature?.trend && (
                            <p className="text-gray-300">
                                • Temperature trend: {statistics.temperature.trend > 0 ? 'Rising' : statistics.temperature.trend < 0 ? 'Falling' : 'Stable'}{' '}
                                <span className="text-white font-medium">
                  ({statistics.temperature.trend > 0 ? '+' : ''}{statistics.temperature.trend}°C)
                </span>
                            </p>
                        )}
                        {dataType === 'precipitation' && statistics.precipitation && (
                            <p className="text-gray-300">
                                • Rain frequency:{' '}
                                <span className="text-white font-medium">
                  {Math.round((statistics.precipitation.days / historicalData.length) * 100)}% of days
                </span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoricalWeather;
