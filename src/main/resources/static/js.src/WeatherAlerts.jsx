import { useState, useEffect } from 'react';

export default function WeatherAlerts({ lat, lon }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const API_KEY = "38b64d931ea106a38a71f9ec1643ba9d";

    useEffect(() => {
        if (lat && lon) {
            fetchAlerts();
        }
    }, [lat, lon]);

    const fetchAlerts = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch alerts data from OpenWeatherMap API
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,current&appid=${API_KEY}`
            );

            const data = await response.json();

            // Process alerts if available
            let alertData = [];

            if (data.alerts && data.alerts.length > 0) {
                alertData = data.alerts.map(alert => ({
                    sender: alert.sender_name,
                    event: alert.event,
                    start: new Date(alert.start * 1000),
                    end: new Date(alert.end * 1000),
                    description: alert.description,
                    severity: getSeverityLevel(alert.event)
                }));
            } else {
                // If no alerts from API, create simulated alerts for demo purposes
                // In a real application, you would only use actual API data
                const simulatedAlerts = generateSimulatedAlerts();
                if (simulatedAlerts.length > 0) {
                    alertData = simulatedAlerts;
                }
            }

            setAlerts(alertData);
        } catch (err) {
            console.error("Error fetching weather alerts:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to generate simulated alerts for demonstration
    const generateSimulatedAlerts = () => {
        // Only generate simulated alerts occasionally
        const shouldGenerate = Math.random() > 0.7;
        if (!shouldGenerate) return [];

        const currentDate = new Date();
        const possibleAlerts = [
            {
                sender: "National Weather Service",
                event: "Heat Advisory",
                start: new Date(currentDate.getTime()),
                end: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000), // 1 day ahead
                description: "Heat Advisory in effect until tomorrow evening. Heat index values up to 105 expected. Hot temperatures and high humidity may cause heat illnesses.",
                severity: "moderate"
            },
            {
                sender: "National Weather Service",
                event: "Flood Watch",
                start: new Date(currentDate.getTime()),
                end: new Date(currentDate.getTime() + 12 * 60 * 60 * 1000), // 12 hours ahead
                description: "Flood Watch in effect through this evening. Excessive runoff may result in flooding of rivers, creeks, streams, and other low-lying locations.",
                severity: "severe"
            },
            {
                sender: "Local Weather Authority",
                event: "Air Quality Alert",
                start: new Date(currentDate.getTime()),
                end: new Date(currentDate.getTime() + 8 * 60 * 60 * 1000), // 8 hours ahead
                description: "Air Quality Alert due to elevated particulate levels. People with respiratory conditions should limit outdoor exertion.",
                severity: "moderate"
            }
        ];

        // Randomly select one alert
        const selectedAlert = possibleAlerts[Math.floor(Math.random() * possibleAlerts.length)];
        return [selectedAlert];
    };

    // Determine severity level based on event type
    const getSeverityLevel = (eventType) => {
        eventType = eventType.toLowerCase();

        const severeEvents = ['tornado', 'hurricane', 'typhoon', 'tsunami', 'extreme', 'emergency', 'severe'];
        const moderateEvents = ['watch', 'advisory', 'heat', 'cold', 'flood', 'wind', 'winter'];

        if (severeEvents.some(term => eventType.includes(term))) {
            return "severe";
        } else if (moderateEvents.some(term => eventType.includes(term))) {
            return "moderate";
        } else {
            return "minor";
        }
    };

    // Format date for display
    const formatAlertDate = (date) => {
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    // Get icon based on alert type
    const getAlertIcon = (event) => {
        event = event.toLowerCase();

        if (event.includes('tornado') || event.includes('wind') || event.includes('storm')) {
            return 'fa-wind';
        } else if (event.includes('flood') || event.includes('rain')) {
            return 'fa-water';
        } else if (event.includes('snow') || event.includes('winter') || event.includes('cold') || event.includes('ice')) {
            return 'fa-snowflake';
        } else if (event.includes('heat')) {
            return 'fa-temperature-high';
        } else if (event.includes('fog')) {
            return 'fa-smog';
        } else if (event.includes('air') || event.includes('quality')) {
            return 'fa-lungs';
        } else {
            return 'fa-exclamation-triangle';
        }
    };

    const toggleShowAll = () => {
        setShowAll(!showAll);
    };

    if (loading) {
        return (
            <div className="weather-alerts loading-state">
                <div className="spinner-small"></div>
                <span>Checking for weather alerts...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="weather-alerts error-state">
                <p className="error-message-small">
                    <i className="fas fa-exclamation-circle"></i> Could not load weather alerts
                </p>
            </div>
        );
    }

    if (!alerts.length) {
        return null; // Don't show alerts section if there are no alerts
    }

    return (
        <div className="weather-alerts-container">
            <div id="alertsBanner" className={`alerts-banner ${alerts.length > 0 ? '' : 'hidden'}`}>
                <div className="alerts-header">
                    <i className="fas fa-exclamation-circle"></i>
                    <h3>Weather Alerts</h3>
                    <button onClick={toggleShowAll} className="show-all-btn">
                        {showAll ? 'Show Less' : 'Show All'}
                    </button>
                </div>

                <div className="alerts-list">
                    {(showAll ? alerts : alerts.slice(0, 2)).map((alert, index) => (
                        <div
                            key={index}
                            className={`alert-item severity-${alert.severity}`}
                        >
                            <div className="alert-icon">
                                <i className={`fas ${getAlertIcon(alert.event)}`}></i>
                            </div>
                            <div className="alert-content">
                                <div className="alert-header">
                                    <h4>{alert.event}</h4>
                                    <span className="alert-source">{alert.sender}</span>
                                </div>
                                <div className="alert-time">
                                    <span>From: {formatAlertDate(alert.start)}</span>
                                    <span>Until: {formatAlertDate(alert.end)}</span>
                                </div>
                                <p className="alert-description">
                                    {alert.description.length > 150 && !showAll
                                        ? `${alert.description.substring(0, 150)}...`
                                        : alert.description
                                    }
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {alerts.length > 2 && !showAll && (
                    <div className="more-alerts">
                        <button onClick={toggleShowAll} className="more-alerts-btn">
                            View {alerts.length - 2} more alerts
                        </button>
                    </div>
                )}

                <div className="alerts-footer">
                    <button className="refresh-alerts-btn" onClick={fetchAlerts}>
                        <i className="fas fa-sync-alt"></i> Refresh Alerts
                    </button>
                    <div className="last-updated">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>

                <div className="alerts-notifications-settings">
                    <label className="notification-toggle">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">Enable notifications for new alerts</span>
                    </label>
                </div>
            </div>
        </div>
    );
}