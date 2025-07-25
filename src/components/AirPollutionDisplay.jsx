// src/components/AirPollutionDisplay.jsx

import React from 'react';

const AirPollutionDisplay = ({ airPollutionData }) => {
    if (!airPollutionData || !airPollutionData.list || !airPollutionData.list[0]) return null;

    const aqi = airPollutionData.list[0].main.aqi;
    const components = airPollutionData.list[0].components;

    const getAqiInfo = (index) => {
        switch (index) {
            case 1: return { level: 'Good', color: 'bg-green-500' };
            case 2: return { level: 'Fair', color: 'bg-yellow-500' };
            case 3: return { level: 'Moderate', color: 'bg-orange-500' };
            case 4: return { level: 'Poor', color: 'bg-red-500' };
            case 5: return { level: 'Very Poor', color: 'bg-purple-700' };
            default: return { level: 'Unknown', color: 'bg-gray-500' };
        }
    };

    const aqiInfo = getAqiInfo(aqi);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Air Quality</h3>
            <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">AQI: {aqiInfo.level}</span>
                <span className={`px-3 py-1 text-sm font-bold text-white rounded-full ${aqiInfo.color}`}>
          {aqi}
        </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>CO: {components.co} μg/m³</p>
                <p>NO₂: {components.no2} μg/m³</p>
                <p>O₃: {components.o3} μg/m³</p>
                <p>SO₂: {components.so2} μg/m³</p>
            </div>
        </div>
    );
};

export default AirPollutionDisplay;