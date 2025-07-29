import React, { useState, useEffect } from 'react';
import {
    BookOpen, Plus, Calendar, MapPin, Thermometer, Wind,
    Droplets, Eye, Sun, Cloud, CloudRain, Search, Filter,
    Edit3, Trash2, Save, X, Camera, Image, Tag
} from 'lucide-react';

const JournalPage = () => {
    const [entries, setEntries] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState('');
    const [currentWeather, setCurrentWeather] = useState(null);

    // Mock weather data for current conditions
    useEffect(() => {
        const mockCurrentWeather = {
            temp: 28,
            condition: 'Partly Cloudy',
            humidity: 65,
            windSpeed: 4.2,
            pressure: 1013,
            location: 'Delhi, India'
        };
        setCurrentWeather(mockCurrentWeather);

        // Load sample entries
        const sampleEntries = [
            {
                id: 1,
                date: '2025-07-30',
                time: '14:30',
                location: 'Delhi, India',
                weather: {
                    temp: 28,
                    condition: 'Partly Cloudy',
                    humidity: 65,
                    windSpeed: 4.2,
                    pressure: 1013
                },
                title: 'Perfect Weather for Park Visit',
                content: 'Took the kids to India Gate today. The weather was absolutely perfect - not too hot, nice breeze. The partly cloudy sky provided just enough shade. Great day for outdoor activities!',
                tags: ['family', 'outdoor', 'delhi'],
                mood: 'happy',
                activities: ['walking', 'photography'],
                photos: []
            },
            {
                id: 2,
                date: '2025-07-29',
                time: '08:15',
                location: 'Mumbai, India',
                weather: {
                    temp: 32,
                    condition: 'Heavy Rain',
                    humidity: 85,
                    windSpeed: 8.1,
                    pressure: 998
                },
                title: 'Monsoon Magic',
                content: 'Woke up to heavy rainfall. The sound of rain was so soothing. Spent the morning with a cup of chai watching the rain from my balcony. The air smells so fresh after the rain!',
                tags: ['monsoon', 'peaceful', 'mumbai'],
                mood: 'relaxed',
                activities: ['reading', 'relaxing'],
                photos: []
            }
        ];
        setEntries(sampleEntries);
    }, []);

    const [newEntry, setNewEntry] = useState({
        title: '',
        content: '',
        tags: [],
        mood: '',
        activities: [],
        photos: []
    });

    const moods = ['happy', 'sad', 'excited', 'calm', 'energetic', 'peaceful', 'anxious', 'content'];
    const commonActivities = ['walking', 'running', 'cycling', 'photography', 'reading', 'gardening', 'sports', 'relaxing'];
    const commonTags = ['sunny', 'rainy', 'cloudy', 'windy', 'hot', 'cold', 'humid', 'dry', 'outdoor', 'indoor', 'family', 'work'];

    const handleAddEntry = () => {
        if (!newEntry.title || !newEntry.content) return;

        const entry = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            location: currentWeather?.location || 'Unknown Location',
            weather: currentWeather,
            ...newEntry,
            tags: typeof newEntry.tags === 'string' ? newEntry.tags.split(',').map(tag => tag.trim()) : newEntry.tags
        };

        setEntries(prev => [entry, ...prev]);
        setNewEntry({ title: '', content: '', tags: [], mood: '', activities: [], photos: [] });
        setShowAddForm(false);
    };

    const handleEditEntry = (entry) => {
        setEditingEntry({ ...entry });
    };

    const handleSaveEdit = () => {
        setEntries(prev => prev.map(entry =>
            entry.id === editingEntry.id ? editingEntry : entry
        ));
        setEditingEntry(null);
    };

    const handleDeleteEntry = (id) => {
        setEntries(prev => prev.filter(entry => entry.id !== id));
    };

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.location.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = !filterTag || entry.tags.includes(filterTag);

        return matchesSearch && matchesFilter;
    });

    const WeatherIcon = ({ condition }) => {
        const iconMap = {
            'Clear': Sun,
            'Partly Cloudy': Cloud,
            'Cloudy': Cloud,
            'Rain': CloudRain,
            'Heavy Rain': CloudRain,
            'Storm': CloudRain
        };
        const IconComponent = iconMap[condition] || Sun;
        return <IconComponent className="w-5 h-5" />;
    };

    const EntryForm = ({ entry, onSave, onCancel, isEditing = false }) => {
        const [formData, setFormData] = useState(entry || {
            title: '',
            content: '',
            tags: [],
            mood: '',
            activities: [],
            photos: []
        });

        const handleSubmit = (e) => {
            e.preventDefault();
            if (isEditing) {
                onSave({ ...formData });
            } else {
                onSave(formData);
            }
        };

        const toggleArrayItem = (array, item) => {
            return array.includes(item)
                ? array.filter(i => i !== item)
                : [...array, item];
        };

        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Entry Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="How was the weather today?"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Your Weather Story
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            rows={4}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                            placeholder="Share your weather experience, observations, or how the weather made you feel..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mood
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {moods.map(mood => (
                                    <button
                                        key={mood}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, mood }))}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                            formData.mood === mood
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {mood}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Activities
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {commonActivities.slice(0, 6).map(activity => (
                                    <button
                                        key={activity}
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            activities: toggleArrayItem(prev.activities, activity)
                                        }))}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                            formData.activities.includes(activity)
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {activity}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="sunny, outdoor, family, photography..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {isEditing ? 'Save Changes' : 'Add Entry'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-8 h-8 text-blue-500" />
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                            Weather Journal
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Document your weather experiences and memories
                    </p>
                </div>

                {/* Current Weather Card */}
                {currentWeather && (
                    <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold mb-1">Current Weather</h2>
                                <div className="flex items-center gap-2 text-blue-100">
                                    <MapPin className="w-4 h-4" />
                                    <span>{currentWeather.location}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold">{currentWeather.temp}°C</div>
                                <div className="flex items-center gap-2">
                                    <WeatherIcon condition={currentWeather.condition} />
                                    <span>{currentWeather.condition}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Entry
                        </button>

                        <div className="flex-1 relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search entries..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <select
                            value={filterTag}
                            onChange={(e) => setFilterTag(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">All Tags</option>
                            {commonTags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Add/Edit Form */}
                {showAddForm && (
                    <div className="mb-6">
                        <EntryForm
                            onSave={handleAddEntry}
                            onCancel={() => setShowAddForm(false)}
                        />
                    </div>
                )}

                {editingEntry && (
                    <div className="mb-6">
                        <EntryForm
                            entry={editingEntry}
                            onSave={() => handleSaveEdit()}
                            onCancel={() => setEditingEntry(null)}
                            isEditing={true}
                        />
                    </div>
                )}

                {/* Entries List */}
                <div className="space-y-4">
                    {filteredEntries.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                No entries found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-500">
                                {searchTerm || filterTag ? 'Try adjusting your search or filter' : 'Start documenting your weather experiences!'}
                            </p>
                        </div>
                    ) : (
                        filteredEntries.map(entry => (
                            <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6">
                                    {/* Entry Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                                                {entry.title}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{entry.date} at {entry.time}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{entry.location}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditEntry(entry)}
                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEntry(entry.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Weather Summary */}
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <WeatherIcon condition={entry.weather.condition} />
                                                <span className="font-medium text-gray-800 dark:text-white">
                          {entry.weather.condition}
                        </span>
                                            </div>
                                            <span className="text-2xl font-bold text-gray-800 dark:text-white">
                        {entry.weather.temp}°C
                      </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <Droplets className="w-4 h-4" />
                                                <span>{entry.weather.humidity}%</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Wind className="w-4 h-4" />
                                                <span>{entry.weather.windSpeed} m/s</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                <span>{entry.weather.pressure} hPa</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Entry Content */}
                                    <div className="prose prose-gray dark:prose-invert max-w-none mb-4">
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {entry.content}
                                        </p>
                                    </div>

                                    {/* Entry Metadata */}
                                    <div className="space-y-3">
                                        {entry.mood && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mood:</span>
                                                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-medium">
                          {entry.mood}
                        </span>
                                            </div>
                                        )}

                                        {entry.activities && entry.activities.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Activities:</span>
                                                {entry.activities.map(activity => (
                                                    <span key={activity} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                            {activity}
                          </span>
                                                ))}
                                            </div>
                                        )}

                                        {entry.tags && entry.tags.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Tag className="w-4 h-4 text-gray-400" />
                                                {entry.tags.map(tag => (
                                                    <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                            #{tag}
                          </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Stats Summary */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Journal Statistics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {entries.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
                        </div>

                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {new Set(entries.flatMap(e => e.tags)).size}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Unique Tags</div>
                        </div>

                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {new Set(entries.map(e => e.location)).size}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Locations</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JournalPage;