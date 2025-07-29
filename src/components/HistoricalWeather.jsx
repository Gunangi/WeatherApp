import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, BarChart3, LineChart, Download } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';

const HistoricalWeather = ({ location }) => {
    const [historicalData, setHistoricalData] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState('temperature');
    const [timeRange, setTimeRange] = useState('7days');
    const [chartType, setChartType] = useState('line');
    const [loading, setLoading] = useState(true);

    const metrics = [
        { id: 'temperature', name: 'Temperature', unit: '°C', color: '#ef4444' },
        { id: 'humidity', name: 'Humidity', unit: '%', color: '#3b82f6' },
        { id: 'pressure', name: 'Pressure', unit: 'hPa', color: '#8b5cf6' },
        { id: 'windSpeed', name: 'Wind Speed', unit: 'm/s', color: '#10b981' },
        { id: 'precipitation', name: 'Precipitation', unit: 'mm', color: '#06b6d4' }
    ];

    const timeRanges = [
        { id: '7days', name: '7 Days', days: 7 },
        { id: '30days', name: '30 Days', days: 30 },
        { id: '90days', name: '3 Months', days: 90 },
        { id: '365days', name: '1 Year', days: 365 }
    ];

    useEffect(() => {
        if (location) {
            fetchHistoricalData();
        }
    }, [location, timeRange]);

    const fetchHistoricalData = async () => {
        setLoading(true);

        // Mock historical data generation
        const days = timeRanges.find(range => range.id === timeRange)?.days || 7;
        const data = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            data.push({
                date: date.toISOString().split('T')[0],
                dateDisplay: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                temperature: Math.round(Math.random() * 20 + 15 + Math.sin(i / 7) * 5),
                humidity: Math.round(Math.random() * 30 + 50),
                pressure: Math.round(Math.random() * 50 + 990),
                windSpeed: Math.round((Math.random() * 8 + 2) * 10) / 10,
                precipitation: Math.round(Math.random() * 10 * 10) / 10
            });
        }

        setTimeout(() => {
            setHistoricalData(data);
            setLoading(false);
        }, 1000);
    };

    const getStatistics = () => {
        if (!historicalData) return null;

        const currentMetric = metrics.find(m => m.id === selectedMetric);
        const values = historicalData.map(d => d[selectedMetric]);

        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const latest = values[values.length - 1];
        const previous = values[values.length - 2];
        const trend = latest > previous ? 'up' : latest < previous ? 'down' : 'stable';

        return {
            min,
            max,
            avg: Math.round(avg * 10) / 10,
            trend,
            change: Math.abs(latest - previous),
            unit: currentMetric.unit
        };
    };

    const exportData = () => {
        if (!historicalData) return;

        const csvContent = [
            ['Date', ...metrics.map(m => `${m.name} (${m.unit})`)].join(','),
            ...historicalData.map(row => [
                row.date,
                row.temperature,
                row.humidity,
                row.pressure,
                row.windSpeed,
                row.precipitation
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `weather-history-${location?.name || 'location'}-${timeRange}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const stats = getStatistics();
    const currentMetric = metrics.find(m => m.id === selectedMetric);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Calendar className="text-blue-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Historical Weather</h2>
                </div>
                <button
                    onClick={exportData}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
                >
                    <Download size={16} />
                    <span>Export Data</span>
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Time Range Selection */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">Time Range</label>
                        <div className="grid grid-cols-2 gap-2">
                            {timeRanges.map(range => (
                                <button
                                    key={range.id}
                                    onClick={() => setTimeRange(range.id)}
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                        timeRange === range.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                                    }`}
                                >
                                    {range.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Metric Selection */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">Metric</label>
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                        >
                            {metrics.map(metric => (
                                <option key={metric.id} value={metric.id} className="bg-gray-800">
                                    {metric.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Chart Type */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">Chart Type</label>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setChartType('line')}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                                    chartType === 'line'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                                }`}
                            >
                                <LineChart size={16} />
                                <span>Line</span>
                            </button>
                            <button
                                onClick={() => setChartType('bar')}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                                    chartType === 'bar'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                                }`}
                            >
                                <BarChart3 size={16} />
                                <span>Bar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-white mb-1">
                            {stats.min}{stats.unit}
                        </div>
                        <div className="text-sm text-white/70">Minimum</div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-white mb-1">
                            {stats.max}{stats.unit}
                        </div>
                        <div className="text-sm text-white/70">Maximum</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-white mb-1">
                            {stats.avg}{stats.unit}
                        </div>
                        <div className="text-sm text-white/70">Average</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <div className="flex items-center space-x-2 mb-1">
                            <div className="text-2xl font-bold text-white">
                                {stats.change.toFixed(1)}{stats.unit}
                            </div>
                            {stats.trend === 'up' ? (
                                <TrendingUp className="text-green-400" size={20} />
                            ) : stats.trend === 'down' ? (
                                <TrendingDown className="text-red-400" size={20} />
                            ) : (
                                <div className="w-5 h-5 bg-yellow-400 rounded-full"></div>
                            )}
                        </div>
                        <div className="text-sm text-white/70">Recent Change</div>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                        {currentMetric?.name} History - {timeRanges.find(r => r.id === timeRange)?.name}
                    </h3>
                    <div className="text-sm text-white/60">
                        {location?.name || 'Current Location'}
                    </div>
                </div>

                {loading ? (
                    <div className="h-80 flex items-center justify-center">
                        <div className="text-center">
                            <BarChart3 className="text-blue-400 animate-pulse mx-auto mb-4" size={48} />
                            <div className="text-white/60">Loading historical data...</div>
                        </div>
                    </div>
                ) : (
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'line' ? (
                                <RechartsLineChart data={historicalData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="dateDisplay"
                                        stroke="#9ca3af"
                                        fontSize={12}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        fontSize={12}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#ffffff'
                                        }}
                                        formatter={(value) => [`${value}${currentMetric?.unit}`, currentMetric?.name]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey={selectedMetric}
                                        stroke={currentMetric?.color}
                                        strokeWidth={2}
                                        dot={{ fill: currentMetric?.color, strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: currentMetric?.color, strokeWidth: 2 }}
                                    />
                                </RechartsLineChart>
                            ) : (
                                <RechartsBarChart data={historicalData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="dateDisplay"
                                        stroke="#9ca3af"
                                        fontSize={12}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        fontSize={12}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#ffffff'
                                        }}
                                        formatter={(value) => [`${value}${currentMetric?.unit}`, currentMetric?.name]}
                                    />
                                    <Bar
                                        dataKey={selectedMetric}
                                        fill={currentMetric?.color}
                                        radius={[4, 4, 0, 0]}
                                    />
                                </RechartsBarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Data Table */}
            {historicalData && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Raw Data</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-white text-sm">
                            <thead>
                            <tr className="border-b border-white/20">
                                <th className="text-left py-2 px-3">Date</th>
                                {metrics.map(metric => (
                                    <th key={metric.id} className="text-left py-2 px-3">
                                        {metric.name} ({metric.unit})
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {historicalData.slice(-10).map((row, index) => (
                                <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="py-2 px-3 font-medium">{row.dateDisplay}</td>
                                    <td className="py-2 px-3">{row.temperature}</td>
                                    <td className="py-2 px-3">{row.humidity}</td>
                                    <td className="py-2 px-3">{row.pressure}</td>
                                    <td className="py-2 px-3">{row.windSpeed}</td>
                                    <td className="py-2 px-3">{row.precipitation}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {historicalData.length > 10 && (
                            <div className="text-center text-white/60 text-sm mt-4">
                                Showing last 10 entries. Export data to view all records.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoricalWeather;