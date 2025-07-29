import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Instagram, Copy, Download } from 'lucide-react';

const WeatherSharing = ({ weatherData, location }) => {
    const [copied, setCopied] = useState(false);
    const [shareFormat, setShareFormat] = useState('text');

    const generateWeatherText = () => {
        const { current } = weatherData;
        return `🌤️ Weather in ${location}
🌡️ ${Math.round(current.temp)}°C (feels like ${Math.round(current.feels_like)}°C)
📍 ${current.weather[0].description}
💨 Wind: ${current.wind_speed} m/s
💧 Humidity: ${current.humidity}%
🕐 ${new Date().toLocaleTimeString()}`;
    };

    const generateWeatherCard = () => {
        return `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; padding: 20px; border-radius: 15px; 
                  font-family: Arial, sans-serif; max-width: 300px;">
        <h3 style="margin: 0 0 15px 0;">🌤️ ${location}</h3>
        <div style="font-size: 32px; margin: 10px 0;">
          ${Math.round(weatherData.current.temp)}°C
        </div>
        <p style="margin: 5px 0; opacity: 0.9;">
          ${weatherData.current.weather[0].description}
        </p>
        <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 14px;">
          <span>💨 ${weatherData.current.wind_speed} m/s</span>
          <span>💧 ${weatherData.current.humidity}%</span>
        </div>
      </div>
    `;
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareToSocial = (platform) => {
        const text = generateWeatherText();
        const encodedText = encodeURIComponent(text);
        const url = encodeURIComponent(window.location.href);

        const socialUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedText}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${encodedText}`
        };

        window.open(socialUrls[platform], '_blank', 'width=600,height=400');
    };

    const downloadWeatherCard = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 300;

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 400, 300);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 300);

        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`🌤️ ${location}`, 30, 60);

        ctx.font = 'bold 48px Arial';
        ctx.fillText(`${Math.round(weatherData.current.temp)}°C`, 30, 130);

        ctx.font = '18px Arial';
        ctx.fillText(weatherData.current.weather[0].description, 30, 160);

        ctx.font = '16px Arial';
        ctx.fillText(`💨 Wind: ${weatherData.current.wind_speed} m/s`, 30, 200);
        ctx.fillText(`💧 Humidity: ${weatherData.current.humidity}%`, 30, 225);

        ctx.fillText(`Generated at ${new Date().toLocaleString()}`, 30, 270);

        // Download
        const link = document.createElement('a');
        link.download = `weather-${location}-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    const shareOptions = [
        { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
        { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#4267B2' },
        { id: 'linkedin', name: 'LinkedIn', icon: Share2, color: '#0077B5' }
    ];

    if (!weatherData || !weatherData.current) {
        return (
            <div className="glass-card p-6">
                <p className="text-gray-500">No weather data available to share</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <Share2 className="text-blue-500" size={24} />
                <h3 className="text-xl font-semibold">Share Weather</h3>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
                <label className="block text-sm font-medium">Share Format:</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShareFormat('text')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            shareFormat === 'text'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        Text
                    </button>
                    <button
                        onClick={() => setShareFormat('card')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            shareFormat === 'card'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        Card
                    </button>
                </div>
            </div>

            {/* Preview */}
            <div className="space-y-3">
                <label className="block text-sm font-medium">Preview:</label>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    {shareFormat === 'text' ? (
                        <pre className="whitespace-pre-wrap text-sm">{generateWeatherText()}</pre>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: generateWeatherCard() }} />
                    )}
                </div>
            </div>

            {/* Copy Button */}
            <button
                onClick={() => copyToClipboard(shareFormat === 'text' ? generateWeatherText() : generateWeatherCard())}
                className="flex items-center gap-2 w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
                <Copy size={16} />
                {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>

            {/* Social Media Buttons */}
            <div className="space-y-3">
                <label className="block text-sm font-medium">Share on Social Media:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {shareOptions.map(({ id, name, icon: Icon, color }) => (
                        <button
                            key={id}
                            onClick={() => shareToSocial(id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-80"
                            style={{ backgroundColor: color, color: 'white' }}
                        >
                            <Icon size={16} />
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Download Card */}
            <button
                onClick={downloadWeatherCard}
                className="flex items-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
                <Download size={16} />
                Download Weather Card
            </button>

            {/* Native Share API (if supported) */}
            {navigator.share && (
                <button
                    onClick={() => {
                        navigator.share({
                            title: `Weather in ${location}`,
                            text: generateWeatherText(),
                            url: window.location.href
                        });
                    }}
                    className="flex items-center gap-2 w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Share2 size={16} />
                    Share via Device
                </button>
            )}
        </div>
    );
};

export default WeatherSharing;