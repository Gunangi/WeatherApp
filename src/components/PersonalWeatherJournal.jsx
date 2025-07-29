import React, { useState, useEffect } from 'react';
import { Calendar, Edit3, Save, Trash2, Cloud, Sun, CloudRain, Search, Filter, BookOpen, Camera, Tag } from 'lucide-react';

const PersonalWeatherJournal = () => {
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState({
        date: new Date().toISOString().split('T')[0],
        location: '',
        weather: '',
        temperature: '',
        mood: '',
        activities: '',
        notes: '',
        tags: [],
        photos: []
    });
    const [editingEntry, setEditingEntry] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMood, setFilterMood] = useState('');
    const [filterWeather, setFilterWeather] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const moods = [
        { value: 'happy', label: 'Happy', emoji: '😊', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'calm', label: 'Calm', emoji: '😌', color: 'bg-blue-100 text-blue-800' },
        { value: 'energetic', label: 'Energetic', emoji: '⚡', color: 'bg-orange-100 text-orange-800' },
        { value: 'cozy', label: 'Cozy', emoji: '🏠', color: 'bg-purple-100 text-purple-800' },
        { value: 'melancholy', label: 'Melancholy', emoji: '😔', color: 'bg-gray-100 text-gray-800' },
        { value: 'refreshed', label: 'Refreshed', emoji: '🌿', color: 'bg-green-100 text-green-800' }
    ];

    const weatherTypes = [
        { value: 'sunny', label: 'Sunny', icon: Sun, color: 'text-yellow-500' },
        { value: 'cloudy', label: 'Cloudy', icon: Cloud, color: 'text-gray-500' },
        { value: 'rainy', label: 'Rainy', icon: CloudRain, color: 'text-blue-500' },
        { value: 'stormy', label: 'Stormy', icon: CloudRain, color: 'text-purple-500' },
        { value: 'snowy', label: 'Snowy', icon: Cloud, color: 'text-cyan-500' },
        { value: 'foggy', label: 'Foggy', icon: Cloud, color: 'text-gray-400' }
    ];

    useEffect(() => {
        // Load entries from localStorage on component mount
        const savedEntries = localStorage.getItem('weatherJournalEntries');
        if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
        }
    }, []);

    useEffect(() => {
        // Save entries to localStorage whenever entries change
        localStorage.setItem('weatherJournalEntries', JSON.stringify(entries));
    }, [entries]);

    const addEntry = () => {
        if (!newEntry.location || !newEntry.weather) return;

        const entry = {
            id: Date.now(),
            ...newEntry,
            createdAt: new Date(),
            tags: newEntry.tags.filter(tag => tag.trim() !== '')
        };

        setEntries([entry, ...entries]);
        setNewEntry({
            date: new Date().toISOString().split('T')[0],
            location: '',
            weather: '',
            temperature: '',
            mood: '',
            activities: '',
            notes: '',
            tags: [],
            photos: []
        });
        setShowAddForm(false);
    };

    const updateEntry = () => {
        if (!editingEntry) return;

        setEntries(entries.map(entry =>
            entry.id === editingEntry.id
                ? { ...editingEntry, updatedAt: new Date() }
                : entry
        ));
        setEditingEntry(null);
    };

    const deleteEntry = (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            setEntries(entries.filter(entry => entry.id !== id));
        }
    };

    const addTag = (entryData, setEntryData) => {
        const tagInput = document.getElementById('tagInput');
        const tagValue = tagInput.value.trim();

        if (tagValue && !entryData.tags.includes(tagValue)) {
            setEntryData({
                ...entryData,
                tags: [...entryData.tags, tagValue]
            });
            tagInput.value = '';
        }
    };

    const removeTag = (entryData, setEntryData, tagToRemove) => {
        setEntryData({
            ...entryData,
            tags: entryData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = !searchTerm ||
            entry.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.activities.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesMood = !filterMood || entry.mood === filterMood;
        const matchesWeather = !filterWeather || entry.weather === filterWeather;

        return matchesSearch && matchesMood && matchesWeather;
    });

    const EntryForm = ({ entryData, setEntryData, onSave, onCancel, isEditing = false }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {isEditing ? 'Edit Entry' : 'New Journal Entry'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date
                    </label>
                    <input
                        type="date"
                        value={entryData.date}
                        onChange={(e) => setEntryData({ ...entryData, date: e.target.value })}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                    </label>
                    <input
                        type="text"
                        value={entryData.location}
                        onChange={(e) => setEntryData({ ...entryData, location: e.target.value })}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Where were you?"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Weather
                    </label>
                    <select
                        value={entryData.weather}
                        onChange={(e) => setEntryData({ ...entryData, weather: e.target.value })}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">Select weather</option>
                        {weatherTypes.map(weather => (
                            <option key={weather.value} value={weather.value}>
                                {weather.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Temperature (°C)
                    </label>
                    <input
                        type="number"
                        value={entryData.temperature}
                        onChange={(e) => setEntryData({ ...entryData, temperature: e.target.value })}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="25"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mood
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {moods.map(mood => (
                            <button
                                key={mood.value}
                                type="button"
                                onClick={() => setEntryData({ ...entryData, mood: mood.value })}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    entryData.mood === mood.value
                                        ? mood.color
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {mood.emoji} {mood.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Activities
                    </label>
                    <input
                        type="text"
                        value={entryData.activities}
                        onChange={(e) => setEntryData({ ...entryData, activities: e.target.value })}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="What did you do? (e.g., went for a walk, stayed indoors, picnic)"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                    </label>
                    <textarea
                        value={entryData.notes}
                        onChange={(e) => setEntryData({ ...entryData, notes: e.target.value })}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white h-32 resize-none"
                        placeholder="How did the weather make you feel? Any observations?"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            id="tagInput"
                            type="text"
                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Add a tag..."
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag(entryData, setEntryData);
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => addTag(entryData, setEntryData)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Tag className="w-4 h-4" />
                        </button>
                    </div>
                    {entryData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {entryData.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm flex items-center gap-1"
                                >
                  {tag}
                                    <button
                                        onClick={() => removeTag(entryData, setEntryData, tag)}
                                        className="text-blue-600 dark:text-blue-300 hover:text-blue-800"
                                    >
                    ×
                  </button>
                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onSave}
                    disabled={!entryData.location || !entryData.weather}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Update Entry' : 'Save Entry'}
                </button>
                <button
                    onClick={onCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        Personal Weather Journal
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Record your daily weather experiences and how they make you feel
                    </p>
                </div>

                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    <BookOpen className="w-4 h-4" />
                    New Entry
                </button>
            </div>

            {/* Add Entry Form */}
            {showAddForm && (
                <EntryForm
                    entryData={newEntry}
                    setEntryData={setNewEntry}
                    onSave={addEntry}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {/* Edit Entry Form */}
            {editingEntry && (
                <EntryForm
                    entryData={editingEntry}
                    setEntryData={setEditingEntry}
                    onSave={updateEntry}
                    onCancel={() => setEditingEntry(null)}
                    isEditing={true}
                />
            )}

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Search Entries
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Search by location, notes, activities, or tags..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Filter by Mood
                        </label>
                        <select
                            value={filterMood}
                            onChange={(e) => setFilterMood(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Moods</option>
                            {moods.map(mood => (
                                <option key={mood.value} value={mood.value}>
                                    {mood.emoji} {mood.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Filter by Weather
                        </label>
                        <select
                            value={filterWeather}
                            onChange={(e) => setFilterWeather(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Weather</option>
                            {weatherTypes.map(weather => (
                                <option key={weather.value} value={weather.value}>
                                    {weather.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Entries List */}
            <div className="space-y-6">
                {filteredEntries.map(entry => {
                    const mood = moods.find(m => m.value === entry.mood);
                    const weather = weatherTypes.find(w => w.value === entry.weather);
                    const WeatherIcon = weather?.icon || Cloud;

                    return (
                        <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-gray-500" />
                                        <span className="font-medium text-gray-800 dark:text-white">
                      {new Date(entry.date).toLocaleDateString('en', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                      })}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <WeatherIcon className={`w-5 h-5 ${weather?.color || 'text-gray-500'}`} />
                                        <span className="text-gray-600 dark:text-gray-300">
                      {entry.location}
                    </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingEntry(entry)}
                                        className="text-blue-500 hover:text-blue-700 p-1"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteEntry(entry.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">Weather</h4>
                                    <div className="flex items-center gap-2">
                                        <WeatherIcon className={`w-5 h-5 ${weather?.color || 'text-gray-500'}`} />
                                        <span className="text-gray-600 dark:text-gray-300">
                      {weather?.label || entry.weather}
                                            {entry.temperature && ` • ${entry.temperature}°C`}
                    </span>
                                    </div>
                                </div>

                                {mood && (
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">Mood</h4>
                                        <span className={`px-2 py-1 rounded-lg text-sm ${mood.color}`}>
                      {mood.emoji} {mood.label}
                    </span>
                                    </div>
                                )}

                                {entry.activities && (
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">Activities</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                                            {entry.activities}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {entry.notes && (
                                <div className="mb-4">
                                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">Notes</h4>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {entry.notes}
                                    </p>
                                </div>
                            )}

                            {entry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {entry.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm"
                                        >
                      #{tag}
                    </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredEntries.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                            {entries.length === 0 ? 'No Entries Yet' : 'No Matching Entries'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {entries.length === 0
                                ? 'Start your weather journal by adding your first entry'
                                : 'Try adjusting your search or filter criteria'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonalWeatherJournal;
