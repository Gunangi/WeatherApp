import { useState } from 'react';

const SocialSharing = ({ weatherData, location }) => {
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);
    const [shareLink, setShareLink] = useState('');

    // Generate a shareable URL with current weather data
    const generateShareableLink = () => {
        const shareData = {
            location: location.name,
            temp: weatherData.current.temp,
            conditions: weatherData.current.weather[0].main,
            timestamp: new Date().getTime()
        };

        // Encode the data to be passed as URL parameters
        const encodedData = encodeURIComponent(JSON.stringify(shareData));
        const link = `${window.location.origin}/shared?data=${encodedData}`;

        setShareLink(link);
        return link;
    };

    // Handle share button click
    const handleShareClick = () => {
        setShowShareOptions(!showShareOptions);
        if (!shareLink) {
            generateShareableLink();
        }
    };

    // Share via Web Share API if available
    const handleWebShare = async () => {
        const link = shareLink || generateShareableLink();

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Weather in ${location.name}`,
                    text: `Check out the weather in ${location.name}: ${Math.round(weatherData.current.temp)}° and ${weatherData.current.weather[0].main}`,
                    url: link
                });
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 3000);
                setShowShareOptions(false);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback for browsers without Web Share API
            copyLinkToClipboard();
        }
    };

    // Share to specific platforms
    const handlePlatformShare = (platform) => {
        const link = shareLink || generateShareableLink();
        const text = encodeURIComponent(`Check out the weather in ${location.name}: ${Math.round(weatherData.current.temp)}° and ${weatherData.current.weather[0].main}`);
        let shareUrl = '';

        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(link)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${text}%20${encodeURIComponent(link)}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=Weather in ${location.name}&body=${text}%20${encodeURIComponent(link)}`;
                break;
            default:
                return;
        }

        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        setShowShareOptions(false);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
    };

    // Copy link to clipboard
    const copyLinkToClipboard = () => {
        const link = shareLink || generateShareableLink();
        navigator.clipboard.writeText(link)
            .then(() => {
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 3000);
                setShowShareOptions(false);
            })
            .catch(err => console.error('Failed to copy link:', err));
    };

    // User weather report submission
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportData, setReportData] = useState({
        actualConditions: '',
        actualTemperature: '',
        comments: ''
    });

    const handleReportSubmit = (e) => {
        e.preventDefault();

        // Here you would typically send the report to your backend
        console.log('User weather report:', {
            ...reportData,
            location: location.name,
            timestamp: new Date().toISOString(),
            reportedBy: 'anonymous' // Would use actual user ID if you have authentication
        });

        // Success message
        alert('Thank you for your weather report!');
        setReportModalOpen(false);
        setReportData({
            actualConditions: '',
            actualTemperature: '',
            comments: ''
        });
    };

    return (
        <div className="social-sharing">
            <div className="share-container">
                <button
                    className="share-button primary-button"
                    onClick={handleShareClick}
                    aria-expanded={showShareOptions}
                >
                    <i className="fas fa-share-alt"></i> Share
                </button>

                {shareSuccess && (
                    <div className="share-success">
                        <i className="fas fa-check-circle"></i> Shared successfully!
                    </div>
                )}

                {showShareOptions && (
                    <div className="share-options">
                        <button onClick={handleWebShare} className="option-button">
                            <i className="fas fa-share"></i> Share
                        </button>
                        <button onClick={() => handlePlatformShare('twitter')} className="option-button twitter">
                            <i className="fab fa-twitter"></i> Twitter
                        </button>
                        <button onClick={() => handlePlatformShare('facebook')} className="option-button facebook">
                            <i className="fab fa-facebook"></i> Facebook
                        </button>
                        <button onClick={() => handlePlatformShare('whatsapp')} className="option-button whatsapp">
                            <i className="fab fa-whatsapp"></i> WhatsApp
                        </button>
                        <button onClick={() => handlePlatformShare('telegram')} className="option-button telegram">
                            <i className="fab fa-telegram"></i> Telegram
                        </button>
                        <button onClick={() => handlePlatformShare('email')} className="option-button email">
                            <i className="fas fa-envelope"></i> Email
                        </button>
                        <button onClick={copyLinkToClipboard} className="option-button">
                            <i className="fas fa-link"></i> Copy Link
                        </button>
                    </div>
                )}
            </div>

            <div className="report-weather">
                <button
                    className="report-button secondary-button"
                    onClick={() => setReportModalOpen(true)}
                >
                    <i className="fas fa-cloud-upload-alt"></i> Report Weather
                </button>

                {reportModalOpen && (
                    <div className="modal report-modal">
                        <div className="modal-content">
                            <span
                                className="close-modal"
                                onClick={() => setReportModalOpen(false)}
                            >
                                &times;
                            </span>
                            <h3>Report Local Weather</h3>
                            <p>Help improve forecasts by reporting the actual weather at your location.</p>

                            <form onSubmit={handleReportSubmit}>
                                <div className="form-group">
                                    <label htmlFor="actualConditions">Current Conditions:</label>
                                    <select
                                        id="actualConditions"
                                        value={reportData.actualConditions}
                                        onChange={(e) => setReportData({...reportData, actualConditions: e.target.value})}
                                        required
                                    >
                                        <option value="">Select conditions</option>
                                        <option value="Clear">Clear</option>
                                        <option value="Partly Cloudy">Partly Cloudy</option>
                                        <option value="Cloudy">Cloudy</option>
                                        <option value="Light Rain">Light Rain</option>
                                        <option value="Heavy Rain">Heavy Rain</option>
                                        <option value="Thunderstorm">Thunderstorm</option>
                                        <option value="Snow">Snow</option>
                                        <option value="Fog">Fog</option>
                                        <option value="Windy">Windy</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="actualTemperature">Temperature (°C):</label>
                                    <input
                                        type="number"
                                        id="actualTemperature"
                                        value={reportData.actualTemperature}
                                        onChange={(e) => setReportData({...reportData, actualTemperature: e.target.value})}
                                        placeholder="Enter the current temperature"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="comments">Additional Comments:</label>
                                    <textarea
                                        id="comments"
                                        value={reportData.comments}
                                        onChange={(e) => setReportData({...reportData, comments: e.target.value})}
                                        placeholder="Any additional weather observations (optional)"
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="primary-button">
                                        Submit Report
                                    </button>
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => setReportModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Widget Export Functionality */}
            <WidgetExport weatherData={weatherData} location={location} />
        </div>
    );
};

// Widget Export Component
const WidgetExport = ({ weatherData, location }) => {
    const [showWidgetOptions, setShowWidgetOptions] = useState(false);
    const [widgetType, setWidgetType] = useState('basic');
    const [widgetSize, setWidgetSize] = useState('medium');
    const [widgetTheme, setWidgetTheme] = useState('light');
    const [widgetCode, setWidgetCode] = useState('');
    const [codeCopied, setCodeCopied] = useState(false);

    // Generate the widget embed code
    const generateWidgetCode = () => {
        // Create a unique widget ID
        const widgetId = `weather-widget-${Date.now()}`;

        // Base URL of your application
        const baseUrl = window.location.origin;

        // Encode widget parameters
        const params = new URLSearchParams({
            location: location.name,
            type: widgetType,
            size: widgetSize,
            theme: widgetTheme,
            id: widgetId
        }).toString();

        // Create the embed code
        const code = `<div id="${widgetId}" class="weather-widget"></div>
<script src="${baseUrl}/widgets/weather-widget.js"></script>
<script>
    WeatherWidget.init("#${widgetId}", "${params}");
</script>`;

        setWidgetCode(code);
        return code;
    };

    // Handle widget button click
    const handleWidgetButtonClick = () => {
        setShowWidgetOptions(!showWidgetOptions);
        if (showWidgetOptions === false) {
            generateWidgetCode();
        }
    };

    // Copy widget code to clipboard
    const copyWidgetCode = () => {
        navigator.clipboard.writeText(widgetCode)
            .then(() => {
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 3000);
            })
            .catch(err => console.error('Failed to copy widget code:', err));
    };

    // Update widget code when options change
    const updateWidgetOptions = (option, value) => {
        switch (option) {
            case 'type':
                setWidgetType(value);
                break;
            case 'size':
                setWidgetSize(value);
                break;
            case 'theme':
                setWidgetTheme(value);
                break;
            default:
                return;
        }

        // Regenerate code after a brief delay to allow state to update
        setTimeout(() => generateWidgetCode(), 100);
    };

    // Preview widget component
    const WidgetPreview = () => {
        const getWidgetSize = () => {
            switch (widgetSize) {
                case 'small': return { width: '200px', height: '100px' };
                case 'medium': return { width: '300px', height: '150px' };
                case 'large': return { width: '400px', height: '200px' };
                default: return { width: '300px', height: '150px' };
            }
        };

        const getWidgetContent = () => {
            const size = getWidgetSize();
            const themeClass = widgetTheme === 'dark' ? 'widget-dark' : 'widget-light';

            return (
                <div className={`widget-preview ${themeClass}`} style={size}>
                    <div className="widget-header">
                        <div className="widget-location">{location.name}</div>
                        {widgetType !== 'minimal' && (
                            <div className="widget-date">{new Date().toLocaleDateString()}</div>
                        )}
                    </div>
                    <div className="widget-body">
                        <div className="widget-temp">
                            {Math.round(weatherData.current.temp)}°
                        </div>
                        <div className="widget-icon">
                            <i className={`wi wi-owm-${weatherData.current.weather[0].id}`}></i>
                        </div>
                        {widgetType === 'detailed' && (
                            <div className="widget-details">
                                <div className="widget-condition">
                                    {weatherData.current.weather[0].main}
                                </div>
                                <div className="widget-humidity">
                                    <i className="wi wi-humidity"></i> {weatherData.current.humidity}%
                                </div>
                                <div className="widget-wind">
                                    <i className="wi wi-strong-wind"></i> {Math.round(weatherData.current.wind_speed)} km/h
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="widget-footer">
                        <small>Weather data provided by WeatherApp</small>
                    </div>
                </div>
            );
        };

        return getWidgetContent();
    };

    return (
        <div className="widget-export">
            <button
                className="widget-button secondary-button"
                onClick={handleWidgetButtonClick}
                aria-expanded={showWidgetOptions}
            >
                <i className="fas fa-code"></i> Get Widget
            </button>

            {showWidgetOptions && (
                <div className="widget-options-modal modal">
                    <div className="modal-content">
                        <span
                            className="close-modal"
                            onClick={() => setShowWidgetOptions(false)}
                        >
                            &times;
                        </span>
                        <h3>Export Weather Widget</h3>
                        <p>Customize your widget and get the code to embed it on your website.</p>

                        <div className="widget-customization">
                            <div className="form-group">
                                <label htmlFor="widgetType">Widget Type:</label>
                                <select
                                    id="widgetType"
                                    value={widgetType}
                                    onChange={(e) => updateWidgetOptions('type', e.target.value)}
                                >
                                    <option value="minimal">Minimal (Temperature only)</option>
                                    <option value="basic">Basic (Temperature & Conditions)</option>
                                    <option value="detailed">Detailed (All weather data)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="widgetSize">Widget Size:</label>
                                <select
                                    id="widgetSize"
                                    value={widgetSize}
                                    onChange={(e) => updateWidgetOptions('size', e.target.value)}
                                >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="widgetTheme">Widget Theme:</label>
                                <select
                                    id="widgetTheme"
                                    value={widgetTheme}
                                    onChange={(e) => updateWidgetOptions('theme', e.target.value)}
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>
                        </div>

                        <div className="widget-preview-container">
                            <h4>Preview</h4>
                            <WidgetPreview />
                        </div>

                        <div className="widget-code-container">
                            <h4>Embed Code</h4>
                            <div className="code-block">
                                <pre>{widgetCode}</pre>
                            </div>
                            <button
                                className="copy-code-button primary-button"
                                onClick={copyWidgetCode}
                            >
                                <i className="fas fa-clipboard"></i>
                                {codeCopied ? 'Copied!' : 'Copy Code'}
                            </button>
                        </div>

                        <div className="widget-instructions">
                            <h4>Instructions</h4>
                            <ol>
                                <li>Copy the embed code above</li>
                                <li>Paste it into your website's HTML where you want the widget to appear</li>
                                <li>The widget will automatically update with the latest weather data</li>
                            </ol>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialSharing;