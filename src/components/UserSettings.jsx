// src/components/UserSettings.jsx
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

const UserSettings = () => {
    const { unit, setUnit } = useContext(AppContext);
    const [statusMessage, setStatusMessage] = useState('');

    const handleUnitChange = (e) => {
        setUnit(e.target.value);
    };

    const handleSaveChanges = () => {
        setStatusMessage('Settings saved locally!');
        setTimeout(() => setStatusMessage(''), 3000);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Preferences</h2>

            <div className="mb-6">
                <label htmlFor="temp-unit" className="block text-gray-700 dark:text-gray-300 mb-2">
                    Temperature Unit
                </label>
                <select
                    id="temp-unit"
                    value={unit}
                    onChange={handleUnitChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                >
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                </select>
            </div>

            <div className="flex items-center justify-between">
                <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Save Changes (Local Only)
                </button>
                {statusMessage && <p className="text-sm text-gray-600 dark:text-gray-400">{statusMessage}</p>}
            </div>
        </div>
    );
};

export default UserSettings;