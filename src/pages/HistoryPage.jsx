import React, { useState, useEffect } from 'react';
import { History, Calendar, TrendingUp, TrendingDown, Download, Filter, Search, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const HistoryPage = () => {
    const [selectedCity, setSelectedCity] = useState('New York');
    const [dateRange, setDateRange] = useState('7days');
    const [selectedMetric, setSelectedMetric] = useState('temperature');
    const [historicalData, setHistoricalData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock historical data
    const mockHistoricalData = {
        'New York': {
            '7days': [
                { date: '2024-01-24', temperature: 20, humidity: 65, windSpeed: 4.2, pressure: 1013, condition: 'Clear' },
                { date: '2024-01-25', temperature: 22, humidity: 62, windSpeed: 3.8, pressure: 1015, condition: 'Partly Cloudy' },
                { date: '2024-01-26', temperature: 18, humidity: 78, windSpeed: 5.1, pressure: 1008, condition: 'Rainy' },
                { date: '2024-01-27', temperature: 24, humidity: 58, windSpeed: 2.9, pressure: 1018, condition: 'Sunny' },
                { date: '2024-01-28', temperature: 21, humidity: 68, windSpeed: 4.5, pressure: 1012, condition: 'Cloudy' },
                { date: '2024-01-29', temperature: 23, humidity: 60, windSpeed: 3.2, pressure: 1016, condition: 'Clear' },
                { date: '2024-01-30', temperature: 25, humidity: 55, windSpeed: 2.8, pressure: 1020, condition: 'Sunny' }
            ],
            '30days': Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                temperature: 15 + Math.random() * 15 + Math.sin(i / 5) * 5,
                humidity: 40 + Math.random() * 40,
                windSpeed: 1 + Math.random() * 8,
                pressure: 995 + Math.random() * 40,
                condition: ['Clear', 'Cloudy', 'Rainy', 'Sunny', 'Partly Cloudy'][Math.floor(Math.random() * 5)]
            }))
        }
    };

    const cities = ['New York', 'London', 'Tokyo', 'Sydney', 'Paris', 'Mumbai'];
    const dateRanges = [
        { value: '7days', label: 'Last 7 Days' },
        { value: '30days', label: 'Last 30 Days' },
        { value: '90days', label: 'Last 3 Months' },
        { value: '365days', label: 'Last Year' }
    ];

    const metrics = [
        { key: 'temperature', label: 'Temperature', unit: '°C', color: '#3B82F6' },
        { key: 'humidity', label: 'Humidity', unit: '%', color: '#10B981' },
        { key: 'windSpeed', label: 'Wind Speed', unit: 'm/s', color: '#F59E0B' },
        { key: 'pressure', label: 'Pressure', unit: 'hPa', color: '#8B5CF6' }
    ];

    useEffect(() => {
        loadHistoricalData();
    }, [selectedCity, dateRange]);

    const loadHistoricalData = () => {
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            const data = mockHistoricalData[selectedCity]?.[dateRange] || [];
            setHistoricalData(data);
            setIsLoading(false);
        }, 1000);
    };

    const getStatistics = (data, metric) => {
        if (!data.length) return { min: 0, max: 0, avg: 0, trend: 0 };

        const values = data.map(item => item[metric]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

        // Calculate trend (slope)
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        const trend = ((secondAvg - firstAvg) / firstAvg) * 100;

        return { min, max, avg, trend };
    };

    const exportData = () => {
        const csv = [
            ['Date', 'Temperature (°C)', 'Humidity (%)', 'Wind Speed (m/s)', 'Pressure (hPa)', 'Condition'],
            ...historicalData.map(item => [
                item.date,
                item.temperature.toFixed(1),
                item.humidity.toFixed(1),
                item.windSpeed.toFixed(1),
                item.pressure.toFixed(1),
                item.condition
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weather-history-${selectedCity}-${dateRange}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredData = historicalData.filter(item =>
        !searchQuery ||
        item.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.date.includes(searchQuery)
    );

    const currentMetric = metrics.find(m => m.key === selectedMetric);
    const stats = getStatistics(filteredData, selectedMetric);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <History className="text-blue-500" size={32} />
                        Weather History
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Explore historical weather patterns and trends
                    </p>
                </div>

                <button
                    onClick={exportData}
                    disabled={!historicalData.length}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Download size={16} />
                    Export Data
                </button>
            </div>

            {/* Controls */}
            <div className="glass-card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* City Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">City</label>
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Time Period</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {dateRanges.map(range => (
                                <option key={range.value} value={range.value}>{range.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Metric Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Metric</label>
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {metrics.map(metric => (
                                <option key={metric.key} value={metric.key}>{metric.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search Filter */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filter by condition..."
                                className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            {!isLoading && filteredData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Minimum</span>
                            <TrendingDown className="text-blue-500" size={16} />
                        </div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.min.toFixed(1)}{currentMetric.unit}
                        </div>
                    </div>

                    <div className="glass-card p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Maximum</span>
                            <TrendingUp className="text-red-500" size={16} />
                        </div>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {stats.max.toFixed(1)}{currentMetric.unit}
                        </div>
                    </div>

                    <div className="glass-card p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Average</span>
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                        </div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {stats.avg.toFixed(1)}{currentMetric.unit}
                        </div>
                    </div>

                    <div className="glass-card p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Trend</span>
                            {stats.trend > 0 ?
                                <TrendingUp className="text-green-500" size={16} /> :
                                <TrendingDown className="text-red-500" size={16} />
                            }
                        </div>
                        <div className={`text-2xl font-bold ${stats.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(1)}%
                        </div>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">
                        {currentMetric.label} History - {selectedCity}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={16} />
                        {dateRanges.find(r => r.value === dateRange)?.label}
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-80 flex items-center justify-center">
                        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center">
                        <div className="text-center">
                            <Eye size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500">No historical data available</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filteredData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                    formatter={(value) => [`${value.toFixed(1)}${currentMetric.unit}`, currentMetric.label]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={selectedMetric}
                                    stroke={currentMetric.color}
                                    fill={`${currentMetric.color}20`}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Data Table */}
            {!isLoading && filteredData.length > 0 && (
                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-4">Detailed Records</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-4 font-semibold">Date</th>
                                <th className="text-center py-3 px-4 font-semibold">Temperature</th>
                                <th className="text-center py-3 px-4 font-semibold">Humidity</th>
                                <th className="text-center py-3 px-4 font-semibold">Wind Speed</th>
                                <th className="text-center py-3 px-4 font-semibold">Pressure</th>
                                <th className="text-center py-3 px-4 font-semibold">Condition</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredData.slice(0, 10).map((item, index) => (
                                <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="py-3 px-4 font-medium">
                                        {new Date(item.date).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 text-center">{item.temperature.toFixed(1)}°C</td>
                                    <td className="py-3 px-4 text-center">{item.humidity.toFixed(1)}%</td>
                                    <td className="py-3 px-4 text-center">{item.windSpeed.toFixed(1)} m/s</td>
                                    <td className="py-3 px-4 text-center">{item.pressure.toFixed(1)} hPa</td>
                                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        {item.condition}
                      </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredData.length > 10 && (
                        <div className="mt-4 text-center text-sm text-gray-500">
                            Showing 10 of {filteredData.length} records
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;