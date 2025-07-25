// src/components/UserSettings.jsx

import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { getUserPreferences, updateUserPreferences } from '../api/weatherApi';

const UserSettings = () => {
    const { unit, setUnit, userId } = useContext(AppContext);
    const [statusMessage, setStatusMessage] = useState('');

    // In a real app, you'd fetch the user's saved preferences on load
    useEffect(() => {
        const fetchPrefs = async () => {
            try {
                // Note: Using a dummy userId. Our backend currently doesn't have user auth.
                const response = await getUserPreferences(userId);
                if (response.data && response.data.temperatureUnit) {
                    setUnit(response.data.temperatureUnit);
                }
            } catch (error) {
                // This will likely fail since we haven't created the dummy user yet.
                // That's okay for this demonstration.
                console.error("Could not fetch user preferences.", error);
            }
        };

        // fetchPrefs(); // Disabling for now to avoid console errors
    }, [userId, setUnit]);


    const handleUnitChange = (e) => {
        setUnit(e.target.value);
    };

    const handleSaveChanges = async () => {
        setStatusMessage('Saving...');
        try {
            // This is a placeholder for a full preferences object
            const preferencesToSave = {
                temperatureUnit: unit,
                // other preferences would go here
            };
            await updateUserPreferences(userId, preferencesToSave);
            setStatusMessage('Settings saved successfully!');
        } catch (error) {
            console.error("Failed to save settings", error);
            setStatusMessage('Failed to save settings. Please try again.');
        } finally {
            setTimeout(() => setStatusMessage(''), 3000); // Clear message after 3 seconds
        }
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

            {/* Add other settings here, e.g., time format, default location */}

            <div className="flex items-center justify-between">
                <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Save Changes
                </button>
                {statusMessage && <p className="text-sm text-gray-600 dark:text-gray-400">{statusMessage}</p>}
            </div>
        </div>
    );
};

export default UserSettings;