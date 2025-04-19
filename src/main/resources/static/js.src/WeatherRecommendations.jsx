import { useState, useEffect } from 'react';

const WeatherRecommendations = ({ currentWeather, forecast, userPreferences }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [category, setCategory] = useState('all'); // all, activities, clothing, health
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        if (currentWeather && forecast) {
            generateRecommendations();
        }
    }, [currentWeather, forecast, category, userPreferences]);

    const generateRecommendations = () => {
        // Get weather conditions
        const temp = currentWeather.temp;
        const conditions = currentWeather.weather[0].main.toLowerCase();
        const windSpeed = currentWeather.wind_speed;
        const humidity = currentWeather.humidity;
        const uvi = currentWeather.uvi || 0;
        const rain = currentWeather.rain ? currentWeather.rain['1h'] : 0;
        const snow = currentWeather.snow ? currentWeather.snow['1h'] : 0;

        // Get forecast for decision making
        const willRainSoon = forecast.hourly.slice(0, 6).some(hour =>
            hour.weather[0].main.toLowerCase().includes('rain')
        );
        const willSnowSoon = forecast.hourly.slice(0, 6).some(hour =>
            hour.weather[0].main.toLowerCase().includes('snow')
        );

        // Create recommendations array
        let allRecommendations = [];

        // Activities recommendations
        const activities = getActivityRecommendations(temp, conditions, willRainSoon, willSnowSoon, uvi, windSpeed);
        allRecommendations = [...allRecommendations, ...activities.map(item => ({ ...item, category: 'activities' }))];

        // Clothing recommendations
        const clothing = getClothingRecommendations(temp, conditions, willRainSoon, willSnowSoon, windSpeed);
        allRecommendations = [...allRecommendations, ...clothing.map(item => ({ ...item, category: 'clothing' }))];

        // Health recommendations
        const health = getHealthRecommendations(temp, conditions, humidity, uvi);
        allRecommendations = [...allRecommendations, ...health.map(item => ({ ...item, category: 'health' }))];

        // Filter by category if needed
        if (category !== 'all') {
            allRecommendations = allRecommendations.filter(rec => rec.category === category);
        }

        // Apply user preferences
        if (userPreferences) {
            // Filter out outdoor activities for users who prefer indoor activities
            if (userPreferences.activityPreference === 'indoor') {
                allRecommendations = allRecommendations.filter(rec =>
                    !(rec.category === 'activities' && rec.tags && rec.tags.includes('outdoor'))
                );
            }

            // Add priority to health recommendations for users with health concerns
            if (userPreferences.healthConcerns && userPreferences.healthConcerns.length > 0) {
                allRecommendations = allRecommendations.map(rec => {
                    if (rec.category === 'health' &&
                        rec.tags &&
                        userPreferences.healthConcerns.some(concern => rec.tags.includes(concern))) {
                        return { ...rec, priority: 'high' };
                    }
                    return rec;
                });
            }
        }

        // Sort recommendations: high priority first, then by relevance score
        allRecommendations.sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            return b.relevance - a.relevance;
        });

        setRecommendations(allRecommendations);
    };

    const getActivityRecommendations = (temp, conditions, willRainSoon, willSnowSoon, uvi, windSpeed) => {
        const recommendations = [];

        // Sunny day activities
        if (conditions.includes('clear') && temp > 15 && temp < 30 && uvi < 8 && windSpeed < 15) {
            recommendations.push({
                title: "Perfect for Outdoor Recreation",
                description: "Great conditions for hiking, cycling, or a picnic in the park.",
                icon: "hiking",
                relevance: 95,
                tags: ['outdoor', 'exercise']
            });
        }

        // Rainy day activities
        if (conditions.includes('rain') || willRainSoon) {
            recommendations.push({
                title: "Indoor Activities Recommended",
                description: "Visit a museum, catch a movie, or enjoy a coffee shop.",
                icon: "film",
                relevance: 90,
                tags: ['indoor', 'rainy']
            });

            if (rain < 2.5) {
                recommendations.push({
                    title: "Light Rain - Short Walks Still Possible",
                    description: "A light drizzle shouldn't stop a brief stroll with proper rain gear.",
                    icon: "umbrella",
                    relevance: 80,
                    tags: ['outdoor', 'rainy']
                });
            }
        }

        // Hot weather activities
        if (temp > 30) {
            recommendations.push({
                title: "Stay Cool - Water Activities Ideal",
                description: "Consider swimming, water parks, or staying in air-conditioned spaces.",
                icon: "swimming-pool",
                relevance: 95,
                tags: ['outdoor', 'hot', 'health']
            });
        }

        // Cold weather activities
        if (temp < 5) {
            if (conditions.includes('snow') || willSnowSoon) {
                recommendations.push({
                    title: "Snow Day Activities",
                    description: "Perfect conditions for sledding, building a snowman, or enjoying hot chocolate indoors.",
                    icon: "snowflake",
                    relevance: 95,
                    tags: ['outdoor', 'cold']
                });
            } else {
                recommendations.push({
                    title: "Indoor Warmth Recommended",
                    description: "Stay cozy with indoor activities like reading, cooking, or watching movies.",
                    icon: "home",
                    relevance: 90,
                    tags: ['indoor', 'cold']
                });
            }
        }

        // Windy day recommendations
        if (windSpeed > 20) {
            recommendations.push({
                title: "High Winds - Avoid Open Areas",
                description: "Not ideal for parks or open spaces. Consider indoor activities or sheltered locations.",
                icon: "wind",
                relevance: 85,
                tags: ['safety', 'windy']
            });

            if (temp > 15) {
                recommendations.push({
                    title: "Great Day for Kite Flying",
                    description: "The strong winds make this a perfect day for kite enthusiasts.",
                    icon: "kite",
                    relevance: 75,
                    tags: ['outdoor', 'windy']
                });
            }
        }

        return recommendations;
    };

    const getClothingRecommendations = (temp, conditions, willRainSoon, willSnowSoon, windSpeed) => {
        const recommendations = [];

        // Base clothing recommendations based on temperature
        if (temp < 0) {
            recommendations.push({
                title: "Bundle Up - Extreme Cold",
                description: "Wear multiple layers, thermal underwear, heavy coat, hat, gloves, and scarf.",
                icon: "mitten",
                relevance: 100,
                tags: ['cold', 'essential']
            });
        } else if (temp < 10) {
            recommendations.push({
                title: "Cold Weather Clothing",
                description: "Wear a warm coat, hat, and gloves. Consider thermals for extended outdoor activities.",
                icon: "coat",
                relevance: 95,
                tags: ['cold', 'essential']
            });
        } else if (temp < 15) {
            recommendations.push({
                title: "Cool Weather Attire",
                description: "A light jacket or sweater should suffice. Consider layering for changing temperatures.",
                icon: "jacket",
                relevance: 90,
                tags: ['cool', 'casual']
            });
        } else if (temp < 25) {
            recommendations.push({
                title: "Mild Weather Clothing",
                description: "Perfect for long sleeves or light layers. Consider a light jacket for evening.",
                icon: "shirt",
                relevance: 85,
                tags: ['mild', 'casual']
            });
        } else if (temp < 30) {
            recommendations.push({
                title: "Warm Weather Attire",
                description: "Short sleeves and light clothing recommended. Consider a hat for sun protection.",
                icon: "tshirt",
                relevance: 90,
                tags: ['warm', 'casual']
            });
        } else {
            recommendations.push({
                title: "Hot Weather Clothing",
                description: "Lightweight, breathable clothing essential. Opt for light colors and loose fits.",
                icon: "shorts",
                relevance: 95,
                tags: ['hot', 'essential']
            });
        }

        // Special condition recommendations
        if (conditions.includes('rain') || willRainSoon) {
            recommendations.push({
                title: "Rain Protection",
                description: "Don't forget an umbrella and waterproof jacket or rain boots.",
                icon: "umbrella",
                relevance: 95,
                tags: ['rain', 'essential']
            });
        }

        if (conditions.includes('snow') || willSnowSoon) {
            recommendations.push({
                title: "Snow Ready",
                description: "Waterproof boots, snow pants, and insulated gloves recommended.",
                icon: "snowflake",
                relevance: 95,
                tags: ['snow', 'essential']
            });
        }

        if (windSpeed > 20) {
            recommendations.push({
                title: "Wind Protection",
                description: "A windbreaker or wind-resistant jacket is advised today.",
                icon: "wind",
                relevance: 85,
                tags: ['windy', 'essential']
            });
        }

        if (uvi > 6) {
            recommendations.push({
                title: "Sun Protection",
                description: "High UV index - wear sunscreen, sunglasses, and a wide-brimmed hat.",
                icon: "sun",
                relevance: 90,
                tags: ['sunny', 'health']
            });
        }

        return recommendations;
    };

    const getHealthRecommendations = (temp, conditions, humidity, uvi) => {
        const recommendations = [];

        // Temperature-based health recommendations
        if (temp > 30) {
            recommendations.push({
                title: "Heat Safety",
                description: "Stay hydrated, seek shade, and limit outdoor activity during peak hours.",
                icon: "water",
                relevance: 100,
                tags: ['hot', 'health', 'hydration']
            });

            if (humidity > 70) {
                recommendations.push({
                    title: "High Humidity Alert",
                    description: "High heat and humidity can cause heat exhaustion. Take frequent breaks and drink plenty of water.",
                    icon: "thermometer-half",
                    relevance: 100,
                    tags: ['hot', 'humid', 'health']
                });
            }
        }

        if (temp < 0) {
            recommendations.push({
                title: "Cold Exposure Warning",
                description: "Limit time outdoors. Watch for signs of hypothermia and frostbite.",
                icon: "thermometer-quarter",
                relevance: 100,
                tags: ['cold', 'health', 'safety']
            });
        }

        // UV index recommendations
        if (uvi >= 8) {
            recommendations.push({
                title: "Extreme UV Warning",
                description: "Very high UV levels. Minimize sun exposure between 10am-4pm. Use SPF 30+ sunscreen.",
                icon: "sun",
                relevance: 95,
                tags: ['sunny', 'health', 'skin']
            });
        } else if (uvi >= 6) {
            recommendations.push({
                title: "High UV Alert",
                description: "High UV levels. Wear sunscreen SPF 15+ and protective clothing.",
                icon: "sun",
                relevance: 90,
                tags: ['sunny', 'health', 'skin']
            });
        } else if (uvi >= 3) {
            recommendations.push({
                title: "Moderate UV Levels",
                description: "Some protection required. Wear sunscreen if outdoors for extended periods.",
                icon: "sun",
                relevance: 75,
                tags: ['sunny', 'health', 'skin']
            });
        }

        // Air quality recommendations based on weather conditions
        if (conditions.includes('fog') || conditions.includes('mist') || conditions.includes('smoke')) {
            recommendations.push({
                title: "Reduced Air Quality",
                description: "People with respiratory conditions should limit outdoor activity.",
                icon: "lungs",
                relevance: 90,
                tags: ['air', 'health', 'respiratory']
            });
        }

        // Humidity-based recommendations
        if (humidity < 30) {
            recommendations.push({
                title: "Low Humidity",
                description: "Consider using a humidifier. Stay hydrated to prevent dry skin and respiratory irritation.",
                icon: "tint-slash",
                relevance: 80,
                tags: ['dry', 'health', 'skin', 'respiratory']
            });
        } else if (humidity > 80 && temp > 20) {
            recommendations.push({
                title: "High Humidity",
                description: "Humid conditions can feel warmer. Stay hydrated and take breaks in air conditioning if possible.",
                icon: "tint",
                relevance: 85,
                tags: ['humid', 'health', 'hydration']
            });
        }

        // Allergy recommendations based on seasons and conditions
        const date = new Date();
        const month = date.getMonth();

        // Spring allergy season (March-May)
        if (month >= 2 && month <= 4 && conditions.includes('clear')) {
            recommendations.push({
                title: "Pollen Alert",
                description: "High pollen count likely. Allergy sufferers should take precautions.",
                icon: "flower",
                relevance: 85,
                tags: ['allergies', 'health', 'respiratory']
            });
        }

        // Fall allergy season (August-October)
        if (month >= 7 && month <= 9 && conditions.includes('clear')) {
            recommendations.push({
                title: "Ragweed Alert",
                description: "Ragweed pollen may be high. Consider antihistamines if you have allergies.",
                icon: "flower",
                relevance: 80,
                tags: ['allergies', 'health', 'respiratory']
            });
        }

        return recommendations;
    };

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
    };

    const toggleShowMore = () => {
        setShowMore(!showMore);
    };

    const getIconClass = (iconName) => {
        return `fas fa-${iconName}`;
    };

    // Renders recommendations with social sharing integration
    const renderRecommendations = () => {
        if (recommendations.length === 0) {
            return <div className="no-recommendations">No recommendations available for these conditions.</div>;
        }

        // Get visible recommendations based on showMore state
        const visibleRecommendations = showMore ? recommendations : recommendations.slice(0, 3);

        return (
            <div className="recommendations-container">
                {visibleRecommendations.map((rec, index) => (
                    <div key={index} className={`recommendation-card ${rec.priority === 'high' ? 'priority-high' : ''}`}>
                        <div className="recommendation-icon">
                            <i className={getIconClass(rec.icon)}></i>
                        </div>
                        <div className="recommendation-content">
                            <h4>{rec.title}</h4>
                            <p>{rec.description}</p>
                            <div className="recommendation-tags">
                                {rec.tags && rec.tags.map((tag, tagIndex) => (
                                    <span key={tagIndex} className="tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="recommendation-share">
                            <button
                                className="share-btn"
                                onClick={() => handleShareRecommendation(rec)}
                                aria-label="Share this recommendation"
                            >
                                <i className="fas fa-share-alt"></i>
                            </button>
                        </div>
                    </div>
                ))}

                {recommendations.length > 3 && (
                    <button
                        className="show-more-btn"
                        onClick={toggleShowMore}
                    >
                        {showMore ? 'Show Less' : `Show ${recommendations.length - 3} More`}
                    </button>
                )}
            </div>
        );
    };

    // Handle sharing a specific recommendation
    const handleShareRecommendation = (recommendation) => {
        // Create share text
        const shareText = `Weather tip: ${recommendation.title} - ${recommendation.description} #WeatherApp`;

        // Check if Web Share API is available
        if (navigator.share) {
            navigator.share({
                title: 'Weather Recommendation',
                text: shareText,
                url: window.location.href,
            })
                .catch((error) => console.log('Error sharing:', error));
        } else {
            // Fallback for browsers that don't support Web Share API
            // Open a modal or use a third-party share library
            openShareModal(shareText);
        }
    };

    // Modal for sharing when Web Share API is not available
    const openShareModal = (text) => {
        // This would typically trigger a modal component
        // For simplicity, we'll use a basic method
        alert(`Share this recommendation:\n\n${text}\n\nCopy and paste to share!`);
    };

    return (
        <div className="weather-recommendations">
            <div className="recommendations-header">
                <h3>Weather Recommendations</h3>
                <div className="category-filter">
                    <button
                        className={category === 'all' ? 'active' : ''}
                        onClick={() => handleCategoryChange('all')}
                    >
                        All
                    </button>
                    <button
                        className={category === 'activities' ? 'active' : ''}
                        onClick={() => handleCategoryChange('activities')}
                    >
                        Activities
                    </button>
                    <button
                        className={category === 'clothing' ? 'active' : ''}
                        onClick={() => handleCategoryChange('clothing')}
                    >
                        Clothing
                    </button>
                    <button
                        className={category === 'health' ? 'active' : ''}
                        onClick={() => handleCategoryChange('health')}
                    >
                        Health
                    </button>
                </div>
            </div>

            {/* Export widget button */}
            <div className="widget-export">
                <button
                    className="export-widget-btn"
                    onClick={() => exportAsWidget(currentWeather, recommendations)}
                    title="Export as widget"
                >
                    <i className="fas fa-external-link-alt"></i> Export Widget
                </button>
            </div>

            {renderRecommendations()}
        </div>
    );
};

// Function to export recommendations as a widget
const exportAsWidget = (weather, recommendations) => {
    // Create a minimal version of the widget with only essential data
    const widgetData = {
        location: weather.name,
        temp: weather.temp,
        conditions: weather.weather[0].main,
        icon: weather.weather[0].icon,
        recommendations: recommendations.slice(0, 3).map(rec => ({
            title: rec.title,
            description: rec.description,
            icon: rec.icon
        }))
    };

    // Generate embed code
    const widgetCode = `<iframe src="${window.location.origin}/widget?data=${encodeURIComponent(JSON.stringify(widgetData))}" width="300" height="400" frameborder="0"></iframe>`;

    // Show modal with embed code
    const modal = document.createElement('div');
    modal.className = 'widget-modal';
    modal.innerHTML = `
        <div class="widget-modal-content">
            <span class="close-modal">&times;</span>
            <h3>Export Weather Widget</h3>
            <p>Copy the code below to embed this weather widget on your website:</p>
            <textarea rows="4" readonly>${widgetCode}</textarea>
            <p>Preview:</p>
            <div class="widget-preview">
                <div class="weather-widget">
                    <div class="widget-header">
                        <h4>${weather.name}</h4>
                        <div class="widget-weather-info">
                            <img src="https://openweathermap.org/img/wn/${weather.weather[0].icon}.png" alt="${weather.weather[0].description}">
                            <span>${Math.round(weather.temp)}°</span>
                            <span>${weather.weather[0].main}</span>
                        </div>
                    </div>
                    <div class="widget-recommendations">
                        ${recommendations.slice(0, 2).map(rec => `
                            <div class="widget-recommendation">
                                <i class="fas fa-${rec.icon}"></i>
                                <span>${rec.title}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="widget-footer">
                        <span>Powered by Weather App</span>
                    </div>
                </div>
            </div>
            <button class="copy-code-btn">Copy Code</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.querySelector('.copy-code-btn').addEventListener('click', () => {
        const textarea = modal.querySelector('textarea');
        textarea.select();
        document.execCommand('copy');
        modal.querySelector('.copy-code-btn').textContent = 'Copied!';
        setTimeout(() => {
            modal.querySelector('.copy-code-btn').textContent = 'Copy Code';
        }, 2000);
    });
};

export default WeatherRecommendations;