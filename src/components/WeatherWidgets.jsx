import React, { useState, useEffect } from 'react';
import { Grid, Edit3, Save, X, Plus, Move, Thermometer, Droplets, Wind, Eye, Sun, Gauge } from 'lucide-react';

const WeatherWidgets = () => {
    const [widgets, setWidgets] = useState([
        { id: 1, type: 'temperature', position: { x: 0, y: 0 }, size: 'small', enabled: true },
        { id: 2, type: 'humidity', position: { x: 1, y: 0 }, size: 'small', enabled: true },
        { id: 3, type: 'forecast', position: { x: 0, y: 1 }, size: 'large', enabled: true }
    ]);

    const [editMode, setEditMode] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [draggedWidget, setDraggedWidget] = useState(null);

    const widgetTypes = {
        temperature: {
            name: 'Temperature',
            icon: Thermometer,
            color: 'bg-orange-500',
            sizes: ['small', 'medium']
        },
        humidity: {
            name: 'Humidity',
            icon: Droplets,
            color: 'bg-blue-500',
            sizes: ['small', 'medium']
        },
        wind: {
            name: 'Wind Speed',
            icon: Wind,
            color: 'bg-green-500',
            sizes: ['small', 'medium']
        },
        visibility: {
            name: 'Visibility',
            icon: Eye,
            color: 'bg-purple-500',
            sizes: ['small', 'medium']
        },
        uv: {
            name: 'UV Index',
            icon: Sun,
            color: 'bg-yellow-500',
            sizes: ['small', 'medium']
        },
        pressure: {
            name: 'Pressure',
            icon: Gauge,
            color: 'bg-indigo-500',
            sizes: ['small', 'medium']
        },
        forecast: {
            name: '5-Day Forecast',
            icon: Grid,
            color: 'bg-gray-500',
            sizes: ['large']
        }
    };

    useEffect(() => {
        fetchWeatherData();
    }, []);

    const fetchWeatherData = async () => {
        try {
            // Mock data - replace with actual API calls
            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`
            );
            const currentData = await currentResponse.json();
            setWeatherData(currentData);

            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=Delhi&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`
            );
            const forecastData = await forecastResponse.json();
            setForecastData(forecastData);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            // Fallback mock data
            setWeatherData({
                main: { temp: 25, humidity: 60, pressure: 1013 },
                wind: { speed: 3.5 },
                visibility: 8000,
                weather: [{ main: 'Clear', description: 'clear sky' }]
            });
            setForecastData({
                list: Array(5).fill().map((_, i) => ({
                    dt: Date.now() + i * 24 * 60 * 60 * 1000,
                    main: { temp: 25 + Math.random() * 10 },
                    weather: [{ main: 'Clear', icon: '01d' }]
                }))
            });
        }
    };

    const addWidget = (type) => {
        const newWidget = {
            id: Date.now(),
            type,
            position: { x: Math.floor(Math.random() * 3), y: Math.floor(Math.random() * 3) },
            size: widgetTypes[type].sizes[0],
            enabled: true
        };
        setWidgets([...widgets, newWidget]);
    };

    const removeWidget = (id) => {
        setWidgets(widgets.filter(w => w.id !== id));
    };

    const toggleWidget = (id) => {
        setWidgets(widgets.map(w =>
            w.id === id ? { ...w, enabled: !w.enabled } : w
        ));
    };

    const updateWidgetSize = (id, size) => {
        setWidgets(widgets.map(w =>
            w.id === id ? { ...w, size } : w
        ));
    };

    const moveWidget = (id, newPosition) => {
        setWidgets(widgets.map(w =>
            w.id === id ? { ...w, position: newPosition } : w
        ));
    };

    const handleDragStart = (e, widget) => {
        if (!editMode) return;
        setDraggedWidget(widget);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, x, y) => {
        e.preventDefault();
        if (draggedWidget && editMode) {
            moveWidget(draggedWidget.id, { x, y });
            setDraggedWidget(null);
        }
    };

    const renderWidget = (widget) => {
        if (!widget.enabled) return null;

        const WidgetIcon = widgetTypes[widget.type].icon;
        const sizeClasses = {
            small: 'col-span-1 row-span-1',
            medium: 'col-span-2 row-span-1',
            large: 'col-span-3 row-span-2'
        };

        const getWidgetContent = () => {
            if (!weatherData) return <div className="animate-pulse">Loading...</div>;

            switch (widget.type) {
                case 'temperature':
                    return (
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">
                                {Math.round(weatherData.main.temp)}°C
                            </div>
                            <div className="text-white/80 text-sm">Temperature</div>
                        </div>
                    );

                case 'humidity':
                    return (
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">
                                {weatherData.main.humidity}%
                            </div>
                            <div className="text-white/80 text-sm">Humidity</div>
                        </div>
                    );

                case 'wind':
                    return (
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">
                                {weatherData.wind.speed} m/s
                            </div>
                            <div className="text-white/80 text-sm">Wind Speed</div>
                        </div>
                    );

                case 'visibility':
                    return (
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">
                                {(weatherData.visibility / 1000).toFixed(1)} km
                            </div>
                            <div className="text-white/80 text-sm">Visibility</div>
                        </div>
                    );

                case 'uv':
                    return (
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">
                                {Math.floor(Math.random() * 11)} {/* Mock UV index */}
                            </div>
                            <div className="text-white/80 text-sm">UV Index</div>
                        </div>
                    );

                case 'pressure':
                    return (
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">
                                {weatherData.main.pressure} hPa
                            </div>
                            <div className="text-white/80 text-sm">Pressure</div>
                        </div>
                    );

                case 'forecast':
                    return (
                        <div className="h-full">
                            <div className="text-white/80 text-sm mb-3">5-Day Forecast</div>
                            <div className="space-y-2">
                                {forecastData?.list.slice(0, 5).map((day, index) => (
                                    <div key={index} className="flex items-center justify-between text-white">
                    <span className="text-sm">
                      {new Date(day.dt * 1000).toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                                        <span className="text-sm font-medium">
                      {Math.round(day.main.temp)}°C
                    </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                default:
                    return <div>Widget content</div>;
            }
        };

        return (
            <div
                key={widget.id}
                className={`${sizeClasses[widget.size]} ${widgetTypes[widget.type].color} rounded-xl p-4 text-white shadow-lg relative cursor-move transition-all hover:shadow-xl`}
                draggable={editMode}
                onDragStart={(e) => handleDragStart(e, widget)}
                style={{
                    gridColumn: `${widget.position.x + 1} / span ${widget.size === 'large' ? 3 : widget.size === 'medium' ? 2 : 1}`,
                    gridRow: `${widget.position.y + 1} / span ${widget.size === 'large' ? 2 : 1}`
                }}
            >
                {editMode && (
                    <div className="absolute top-2 right-2 flex gap-1">
                        {widgetTypes[widget.type].sizes.length > 1 && (
                            <select
                                value={widget.size}
                                onChange={(e) => updateWidgetSize(widget.id, e.target.value)}
                                className="text-xs bg-white/20 text-white border-none rounded px-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {widgetTypes[widget.type].sizes.map(size => (
                                    <option key={size} value={size} className="text-black">
                                        {size.charAt(0).toUpperCase() + size.slice(1)}
                                    </option>
                                ))}
                            </select>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeWidget(widget.id);
                            }}
                            className="text-white/80 hover:text-white bg-red-500/50 rounded p-1"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                    <WidgetIcon className="w-5 h-5" />
                    {!editMode && widget.size !== 'small' && (
                        <span className="font-medium text-sm">{widgetTypes[widget.type].name}</span>
                    )}
                </div>

                {getWidgetContent()}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        Weather Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Customize your weather widgets for a personalized experience
                    </p>
                </div>

                <div className="flex gap-4">
                    {editMode && (
                        <div className="flex gap-2">
                            <select
                                onChange={(e) => e.target.value && addWidget(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                defaultValue=""
                            >
                                <option value="">Add Widget</option>
                                {Object.entries(widgetTypes).map(([key, type]) => (
                                    <option key={key} value={key}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            editMode
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {editMode ? (
                            <>
                                <Save className="w-4 h-4" />
                                Save Layout
                            </>
                        ) : (
                            <>
                                <Edit3 className="w-4 h-4" />
                                Edit Layout
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Widget Grid */}
            <div
                className="grid grid-cols-4 grid-rows-4 gap-4 min-h-[600px]"
                onDragOver={handleDragOver}
            >
                {/* Grid Cells for Drop Zones (only visible in edit mode) */}
                {editMode && Array(16).fill().map((_, index) => {
                    const x = index % 4;
                    const y = Math.floor(index / 4);
                    return (
                        <div
                            key={index}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg opacity-50"
                            onDrop={(e) => handleDrop(e, x, y)}
                            style={{
                                gridColumn: x + 1,
                                gridRow: y + 1
                            }}
                        />
                    );
                })}

                {/* Render Widgets */}
                {widgets.map(renderWidget)}
            </div>

            {/* Widget Controls Panel (Edit Mode) */}
            {editMode && (
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Widget Controls
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {widgets.map(widget => {
                            const WidgetIcon = widgetTypes[widget.type].icon;
                            return (
                                <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 ${widgetTypes[widget.type].color} rounded-lg`}>
                                            <WidgetIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-medium text-gray-800 dark:text-white">
                      {widgetTypes[widget.type].name}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleWidget(widget.id)}
                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                widget.enabled
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                                            }`}
                                        >
                                            {widget.enabled ? 'On' : 'Off'}
                                        </button>
                                        <button
                                            onClick={() => removeWidget(widget.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Help Text */}
            {editMode && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-300 text-sm">
                        <strong>Edit Mode:</strong> Drag widgets to reposition them, use the dropdown to add new widgets,
                        adjust sizes, and toggle widgets on/off. Click "Save Layout" when you're done.
                    </p>
                </div>
            )}
        </div>
    );
};

export default WeatherWidgets;