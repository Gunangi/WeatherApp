import { useState, useEffect } from 'react';

export default function AirPollutionDisplay({ city, lat, lon }) {
    const [pollutionData, setPollutionData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (lat && lon) {
            fetchPollutionData();
        }
    }, [lat, lon]);

    const fetchPollutionData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/weather/airpollution?lat=${lat}&lon=${lon}`);
            const data = await response.json();
            setPollutionData(data);
        } catch (error) {
            console.error("Failed to fetch air pollution data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getAqiColor = (aqi) => {
        switch(aqi) {
            case 1: return "bg-green-500"; // Good
            case 2: return "bg-blue-500"; // Fair
            case 3: return "bg-yellow-500"; // Moderate
            case 4: return "bg-orange-500"; // Poor
            case 5: return "bg-red-500"; // Very Poor
            default: return "bg-gray-500";
        }
    };

    if (loading) {
        return <div className="p-4 bg-white rounded-lg shadow">Loading air quality data...</div>;
    }

    if (!pollutionData) {
        return null;
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Air Quality</h2>

            <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full ${getAqiColor(pollutionData.aqi)} flex items-center justify-center text-white font-bold text-xl`}>
                    {pollutionData.aqi}
                </div>
                <div className="ml-4">
                    <p className="font-semibold text-lg">{pollutionData.aqiDescription}</p>
                    <p className="text-gray-600">Air Quality Index</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-gray-600">PM2.5</p>
                    <p className="font-semibold">{pollutionData.components.pm2_5} μg/m³</p>
                </div>
                <div>
                    <p className="text-gray-600">PM10</p>
                    <p className="font-semibold">{pollutionData.components.pm10} μg/m³</p>
                </div>
                <div>
                    <p className="text-gray-600">NO₂</p>
                    <p className="font-semibold">{pollutionData.components.no2} μg/m³</p>
                </div>
                <div>
                    <p className="text-gray-600">O₃</p>
                    <p className="font-semibold">{pollutionData.components.o3} μg/m³</p>
                </div>
            </div>
        </div>
    );
}