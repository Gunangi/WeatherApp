import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Edit, Save, X, Cloud, Sun, CloudRain, Thermometer, Wind, Eye } from 'lucide-react';

const CustomNotifications = ({ weatherData, location }) => {
    const [notifications, setNotifications] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newNotification, setNewNotification] = useState({
        type: 'temperature',
        condition: 'greater',
        value: '',
        message: '',
        enabled: true
    });

    const notificationTypes = [
        { id: 'temperature', name: 'Temperature', icon: Thermometer, unit: '°C' },
        { id: 'humidity', name: 'Humidity', icon: Cloud, unit: '%' },
        { id: 'wind_speed', name: 'Wind Speed', icon: Wind, unit: 'm/s' },
        { id: 'visibility', name: 'Visibility', icon: Eye, unit: 'km' },
        { id: 'rain', name: 'Rain Alert', icon: CloudRain, unit: '' },
        { id: 'uv_index', name: 'UV Index', icon: Sun, unit: '' }
    ];

    const conditions = [
        { id: 'greater', name: 'Greater than', symbol: '>' },
        { id: 'less', name: 'Less than', symbol: '<' },
        { id: 'equals', name: 'Equals', symbol: '=' }
    ];

    useEffect(() => {
        const stored = localStorage.getItem('weather_notifications');
        if (stored) {
            setNotifications(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('weather_notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        if (weatherData && weatherData.current) {
            checkNotifications();
        }
    }, [weatherData, notifications]);

    const checkNotifications = () => {
        const current = weatherData.current;

        notifications.forEach(notification => {
            if (!notification.enabled) return;

            let currentValue;
            switch (notification.type) {
                case 'temperature':
                    currentValue = Math.round(current.temp);
                    break;
                case 'humidity':
                    currentValue = current.humidity;
                    break;
                case 'wind_speed':
                    currentValue = current.wind_speed;
                    break;
                case 'visibility':
                    currentValue = current.visibility / 1000; // Convert to km
                    break;
                case 'uv_index':
                    currentValue = current.uvi || 0;
                    break;
                case 'rain':
                    currentValue = current.weather[0].main.toLowerCase().includes('rain') ? 1 : 0;
                    break;
                default:
                    return;
            }

            const shouldNotify = evaluateCondition(currentValue, notification.condition, notification.value);

            if (shouldNotify) {
                sendNotification(notification, currentValue);
            }
        });
    };

    const evaluateCondition = (current, condition, target) => {
        const targetNum = parseFloat(target);
        switch (condition) {
            case 'greater':
                return current > targetNum;
            case 'less':
                return current < targetNum;
            case 'equals':
                return Math.abs(current - targetNum) < 0.1;
            default:
                return false;
        }
    };

    const sendNotification = (notification, currentValue) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const typeInfo = notificationTypes.find(t => t.id === notification.type);
            const title = `Weather Alert - ${location}`;
            const body = notification.message ||
                `${typeInfo.name} is ${currentValue}${typeInfo.unit} (${notification.condition} ${notification.value}${typeInfo.unit})`;

            new Notification(title, {
                body,
                icon: '/weather-icon.png',
                badge: '/weather-badge.png'
            });
        }
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    };

    const handleCreate = () => {
        if (!newNotification.value || !newNotification.message) {
            alert('Please fill in all required fields');
            return;
        }

        const notification = {
            id: Date.now(),
            ...newNotification,
            createdAt: new Date().toISOString()
        };

        setNotifications(prev => [...prev, notification]);
        setNewNotification({
            type: 'temperature',
            condition: 'greater',
            value: '',
            message: '',
            enabled: true
        });
        setIsCreating(false);
    };

    const handleEdit = (notification) => {
        setEditingId(notification.id);
        setNewNotification({ ...notification });
    };

    const handleUpdate = () => {
        setNotifications(prev =>
            prev.map(n => n.id === editingId ? { ...newNotification, id: editingId } : n)
        );
        setEditingId(null);
        setNewNotification({
            type: 'temperature',
            condition: 'greater',
            value: '',
            message: '',
            enabled: true
        });
    };

    const handleDelete = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const toggleNotification = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n)
        );
    };

    const NotificationForm = ({ isEditing = false }) => (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                        value={newNotification.type}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                        {notificationTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Condition</label>
                    <select
                        value={newNotification.condition}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, condition: e.target.value }))}
                        className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                        {conditions.map(cond => (
                            <option key={cond.id} value={cond.id}>{cond.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Value {notificationTypes.find(t => t.id === newNotification.type)?.unit}
                </label>
                <input
                    type="number"
                    value={newNotification.value}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter threshold value"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Custom Message</label>
                <input
                    type="text"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter notification message"
                />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={isEditing ? handleUpdate : handleCreate}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Save size={16} />
                    {isEditing ? 'Update' : 'Create'}
                </button>
                <button
                    onClick={() => {
                        setIsCreating(false);
                        setEditingId(null);
                        setNewNotification({
                            type: 'temperature',
                            condition: 'greater',
                            value: '',
                            message: '',
                            enabled: true
                        });
                    }}
                    className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <X size={16} />
                    Cancel
                </button>
            </div>
        </div>
    );

    return (
        <div className="glass-card p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Bell className="text-blue-500" size={24} />
                    <h3 className="text-xl font-semibold">Custom Notifications</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={requestNotificationPermission}
                        className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg transition-colors"
                    >
                        Enable Notifications
                    </button>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                        Add Alert
                    </button>
                </div>
            </div>

            {(isCreating || editingId) && (
                <NotificationForm isEditing={!!editingId} />
            )}

            {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Bell size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No custom notifications set</p>
                    <p className="text-sm">Create alerts for temperature, weather conditions, and more</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map(notification => {
                        const typeInfo = notificationTypes.find(t => t.id === notification.type);
                        const conditionInfo = conditions.find(c => c.id === notification.condition);
                        const Icon = typeInfo?.icon || Bell;

                        return (
                            <div
                                key={notification.id}
                                className={`p-4 rounded-lg border transition-all ${
                                    notification.enabled
                                        ? 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800'
                                        : 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 opacity-60'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon size={20} className={notification.enabled ? 'text-blue-500' : 'text-gray-400'} />
                                        <div>
                                            <div className="font-medium">
                                                {typeInfo?.name} {conditionInfo?.symbol} {notification.value}{typeInfo?.unit}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {notification.message}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleNotification(notification.id)}
                                            className={`w-12 h-6 rounded-full transition-colors ${
                                                notification.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                        >
                                            <div
                                                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                                    notification.enabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>

                                        <button
                                            onClick={() => handleEdit(notification)}
                                            className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(notification.id)}
                                            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CustomNotifications;