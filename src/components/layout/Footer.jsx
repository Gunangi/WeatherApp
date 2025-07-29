import React from 'react';
import { Cloud, Github, Twitter, Mail, Heart, ExternalLink } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const links = {
        social: [
            { name: 'GitHub', icon: Github, url: 'https://github.com', color: 'hover:text-gray-700' },
            { name: 'Twitter', icon: Twitter, url: 'https://twitter.com', color: 'hover:text-blue-400' },
            { name: 'Email', icon: Mail, url: 'mailto:contact@weatherapp.com', color: 'hover:text-green-500' }
        ],
        quick: [
            { name: 'Current Weather', url: '/' },
            { name: '5-Day Forecast', url: '/forecast' },
            { name: 'Air Quality', url: '/air-quality' },
            { name: 'Weather Map', url: '/map' }
        ],
        features: [
            { name: 'Weather Alerts', url: '/alerts' },
            { name: 'City Comparison', url: '/compare' },
            { name: 'Weather Journal', url: '/journal' },
            { name: 'History', url: '/history' }
        ],
        legal: [
            { name: 'Privacy Policy', url: '/privacy' },
            { name: 'Terms of Service', url: '/terms' },
            { name: 'API Documentation', url: '/docs' },
            { name: 'Contact', url: '/contact' }
        ]
    };

    const weatherTip = {
        title: "Weather Tip",
        content: "Did you know? The 'feels like' temperature considers wind chill and humidity to show how hot or cold it really feels outside!"
    };

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
            {/* Weather Tip Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 py-4">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
                        <Cloud size={20} />
                        <span className="font-semibold">{weatherTip.title}:</span>
                        <span className="text-sm">{weatherTip.content}</span>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                <Cloud className="text-white" size={24} />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WeatherApp
              </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Your comprehensive weather companion providing accurate forecasts,
                            air quality monitoring, and personalized weather insights.
                        </p>
                        <div className="flex gap-3">
                            {links.social.map(({ name, icon: Icon, url, color }) => (
                                <a
                                    key={name}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors ${color}`}
                                    aria-label={name}
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            {links.quick.map(({ name, url }) => (
                                <li key={name}>
                                    <a
                                        href={url}
                                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                                    >
                                        {name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Features */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Features</h4>
                        <ul className="space-y-2">
                            {links.features.map(({ name, url }) => (
                                <li key={name}>
                                    <a
                                        href={url}
                                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                                    >
                                        {name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal & Support */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h4>
                        <ul className="space-y-2">
                            {links.legal.map(({ name, url }) => (
                                <li key={name}>
                                    <a
                                        href={url}
                                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                                    >
                                        {name}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        {/* API Attribution */}
                        <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Powered by</h5>
                            <div className="space-y-1">
                                <a
                                    href="https://openweathermap.org"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    OpenWeatherMap API
                                    <ExternalLink size={10} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weather Stats */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50K+</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Cities Covered</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">1M+</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Daily Users</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">99.9%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Live Updates</div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>© {currentYear} WeatherApp. Made with</span>
                            <Heart size={16} className="text-red-500" />
                            <span>for weather enthusiasts</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                            <span>Version 2.1.0</span>
                            <span>•</span>
                            <span>Last updated: {new Date().toLocaleDateString()}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>All systems operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation Spacer */}
            <div className="h-16 md:h-0"></div>
        </footer>
    );
};

export default Footer;