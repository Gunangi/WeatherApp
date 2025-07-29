import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const LoadingSpinner = ({
                            size = 'md',
                            text = 'Loading...',
                            showText = true,
                            className = '',
                            centered = true,
                            variant = 'default'
                        }) => {
    const { isDark } = useTheme();

    // Size variants
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    // Variant styles
    const variants = {
        default: {
            spinner: 'border-blue-500 border-t-transparent',
            text: 'text-gray-600 dark:text-gray-400'
        },
        primary: {
            spinner: 'border-blue-600 border-t-transparent',
            text: 'text-blue-600 dark:text-blue-400'
        },
        white: {
            spinner: 'border-white border-t-transparent',
            text: 'text-white'
        },
        weather: {
            spinner: 'border-gradient-to-r from-blue-500 to-purple-600 border-t-transparent',
            text: 'text-gray-600 dark:text-gray-400'
        }
    };

    const variantStyle = variants[variant] || variants.default;

    // Weather-themed spinner animation
    const WeatherSpinner = () => (
        <div className="relative">
            <div className={`
        ${sizeClasses[size]} border-4 rounded-full animate-spin
        ${variantStyle.spinner}
      `} />
            {variant === 'weather' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-xs">🌤️</div>
                </div>
            )}
        </div>
    );

    // Dots spinner
    const DotsSpinner = () => (
        <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
                <div
                    key={index}
                    className={`
            w-2 h-2 rounded-full animate-pulse
            ${isDark ? 'bg-blue-400' : 'bg-blue-500'}
          `}
                    style={{
                        animationDelay: `${index * 0.2}s`,
                        animationDuration: '1s'
                    }}
                />
            ))}
        </div>
    );

    // Pulse spinner
    const PulseSpinner = () => (
        <div className={`
      ${sizeClasses[size]} rounded-full animate-pulse
      ${isDark ? 'bg-blue-400/20' : 'bg-blue-500/20'}
      border-2 ${variantStyle.spinner}
    `}>
            <div className={`
        w-full h-full rounded-full animate-ping
        ${isDark ? 'bg-blue-400/40' : 'bg-blue-500/40'}
      `} />
        </div>
    );

    // Weather-specific loading states
    const WeatherLoadingStates = () => {
        const states = [
            { icon: '☀️', text: 'Checking sunny skies...' },
            { icon: '☁️', text: 'Scanning clouds...' },
            { icon: '🌧️', text: 'Detecting precipitation...' },
            { icon: '🌡️', text: 'Reading temperature...' },
            { icon: '💨', text: 'Measuring wind...' }
        ];

        const [currentState, setCurrentState] = React.useState(0);

        React.useEffect(() => {
            const interval = setInterval(() => {
                setCurrentState(prev => (prev + 1) % states.length);
            }, 1000);

            return () => clearInterval(interval);
        }, []);

        return (
            <div className="flex items-center space-x-3">
                <div className="text-2xl animate-bounce">
                    {states[currentState].icon}
                </div>
                <div className={variantStyle.text}>
                    {states[currentState].text}
                </div>
            </div>
        );
    };

    const renderSpinner = () => {
        switch (variant) {
            case 'dots':
                return <DotsSpinner />;
            case 'pulse':
                return <PulseSpinner />;
            case 'weather-states':
                return <WeatherLoadingStates />;
            default:
                return <WeatherSpinner />;
        }
    };

    const content = (
        <div className={`flex flex-col items-center space-y-3 ${className}`}>
            {renderSpinner()}
            {showText && variant !== 'weather-states' && (
                <div className={`text-sm font-medium ${variantStyle.text}`}>
                    {text}
                </div>
            )}
        </div>
    );

    if (centered) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                {content}
            </div>
        );
    }

    return content;
};

// Skeleton loader for weather cards
export const WeatherSkeleton = ({ className = '' }) => {
    const { isDark } = useTheme();

    return (
        <div className={`animate-pulse ${className}`}>
            <div className={`
        rounded-xl p-6 space-y-4
        ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}
      `}>
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className={`h-4 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        <div className={`h-3 w-16 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                    </div>
                    <div className={`h-12 w-12 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                </div>

                {/* Temperature */}
                <div className={`h-8 w-20 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-1">
                            <div className={`h-3 w-12 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                            <div className={`h-4 w-16 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Inline spinner for buttons
export const ButtonSpinner = ({ size = 'sm', className = '' }) => (
    <div className={`
    ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}
    border-2 border-white/30 border-t-white rounded-full animate-spin
    ${className}
  `} />
);

export default LoadingSpinner;