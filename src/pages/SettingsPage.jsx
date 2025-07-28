import React from 'react';
import UserSettings from '../components/UserSettings';

const SettingsPage = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Settings
            </h1>
            <div className="max-w-2xl mx-auto">
                <UserSettings />
            </div>
        </div>
    );
};

export default SettingsPage;