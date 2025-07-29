import React, { useState, useEffect } from 'react';
import { Moon, Calendar, Info, Star } from 'lucide-react';

const MoonPhases = ({ location }) => {
    const [moonData, setMoonData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateMoonPhases();
    }, [selectedDate, location]);

    const calculateMoonPhases = () => {
        setLoading(true);

        // Calculate moon phase for the selected date
        const date = new Date(selectedDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        // Simplified moon phase calculation (approximation)
        const c = Math.floor((year - 1900) / 100);
        const e = 2 * c - Math.floor(c / 4);
        const jd = 365.25 * (year - 1900) + 30.6 * (month + 1) + day - e + 0.5;
        const daysSinceNewMoon = (jd - 2415020.75933) % 29.53058867;
        const phase = daysSinceNewMoon / 29.53058867;

        // Calculate illumination percentage
        const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) * 50);

        // Determine phase name
        let phaseName, phaseIcon, phaseDescription;
        if (phase < 0.0625) {
            phaseName = 'New Moon';
            phaseIcon = '🌑';
            phaseDescription = 'The Moon is not visible from Earth';
        } else if (phase < 0.1875) {
            phaseName = 'Waxing Crescent';
            phaseIcon = '🌒';
            phaseDescription = 'A thin crescent of light appears on the right';
        } else if (phase < 0.3125) {
            phaseName = 'First Quarter';
            phaseIcon = '🌓';
            phaseDescription = 'Half of the Moon is illuminated';
        } else if (phase < 0.4375) {
            phaseName = 'Waxing Gibbous';
            phaseIcon = '🌔';
            phaseDescription = 'More than half of the Moon is illuminated';
        } else if (phase < 0.5625) {
            phaseName = 'Full Moon';
            phaseIcon = '🌕';
            phaseDescription = 'The entire Moon is illuminated';
        } else if (phase < 0.6875) {
            phaseName = 'Waning Gibbous';
            phaseIcon = '🌖';
            phaseDescription = 'More than half illuminated, but decreasing';
        } else if (phase < 0.8125) {
            phaseName = 'Last Quarter';
            phaseIcon = '🌗';
            phaseDescription = 'Half of the Moon is illuminated on the left';
        } else {
            phaseName = 'Waning Crescent';
            phaseIcon = '🌘';
            phaseDescription = 'A thin crescent appears on the left';
        }

        // Calculate rise and set times (simplified)
        const moonRise = new Date(date);
        moonRise.setHours(Math.floor(phase * 24), Math.floor((phase * 24 % 1) * 60));

        const moonSet = new Date(moonRise);
        moonSet.setHours(moonRise.getHours() + 12);

        // Generate upcoming phases
        const upcomingPhases = [];
        const phaseNames = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'];
        const phaseIcons = ['🌑', '🌓', '🌕', '🌗'];

        for (let i = 0; i < 8; i++) {
            const futureDate = new Date(date);
            futureDate.setDate(date.getDate() + (i * 7.4)); // Approximate week between major phases
            upcomingPhases.push({
                name: phaseNames[i % 4],
                icon: phaseIcons[i % 4],
                date: futureDate,
                daysAway: Math.floor((futureDate - date) / (1000 * 60 * 60 * 24))
            });
        }

        setTimeout(() => {
            setMoonData({
                phase,
                phaseName,
                phaseIcon,
                phaseDescription,
                illumination,
                age: Math.round(daysSinceNewMoon),
                moonRise,
                moonSet,
                upcomingPhases,
                zodiacSign: getZodiacSign(date),
                lunarCalendar: getLunarCalendarInfo(date)
            });
            setLoading(false);
        }, 500);
    };

    const getZodiacSign = (date) => {
        // Simplified zodiac calculation based on date
        const signs = [
            'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
            'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'
        ];
        const month = date.getMonth();
        const day = date.getDate();

        // Simplified zodiac determination
        let signIndex = month;
        if ((month === 0 && day < 20) || (month === 11 && day >= 22)) signIndex = 0; // Capricorn

        return signs[signIndex];
    };

    const getLunarCalendarInfo = (date) => {
        // Simplified lunar calendar information
        const lunarMonths = [
            'Wolf Moon', 'Snow Moon', 'Worm Moon', 'Pink Moon', 'Flower Moon', 'Strawberry Moon',
            'Buck Moon', 'Sturgeon Moon', 'Harvest Moon', 'Hunter\'s Moon', 'Beaver Moon', 'Cold Moon'
        ];

        return {
            name: lunarMonths[date.getMonth()],
            description: 'Traditional name for this month\'s full moon'
        };
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getMoonVisualizer = (phase) => {
        const size = 120;
        const radius = size / 2 - 10;
        const centerX = size / 2;
        const centerY = size / 2;

        return (
            <svg width={size} height={size} className="mx-auto">
                {/* Moon background */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="#1f2937"
                    stroke="#374151"
                    strokeWidth="2"
                />

                {/* Illuminated part */}
                <defs>
                    <mask id="moonMask">
                        <rect width={size} height={size} fill="black" />
                        <circle
                            cx={centerX}
                            cy={centerY}
                            r={radius}
                            fill="white"
                        />
                    </mask>
                </defs>

                {/* Light side */}
                <path
                    d={`M ${centerX} ${centerY - radius} 
              A ${radius} ${radius} 0 0 ${phase < 0.5 ? 1 : 0} ${centerX} ${centerY + radius}
              A ${radius * Math.cos((phase - 0.5) * Math.PI)} ${radius} 0 0 ${phase < 0.5 ? 0 : 1} ${centerX} ${centerY - radius}`}
                    fill="#fbbf24"
                    mask="url(#moonMask)"
                />

                {/* Phase indicator text */}
                <text
                    x={centerX}
                    y={centerY + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                >
                    {Math.round(phase * 100)}%
                </text>
            </svg>
        );
    };

    if (loading) {
        return (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 animate-pulse">
                <div className="flex items-center space-x-2 mb-6">
                    <Moon className="text-yellow-400 animate-pulse" size={24} />
                    <div className="h-6 bg-white/20 rounded w-32"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-32 bg-white/20 rounded mx-auto w-32"></div>
                    <div className="h-16 bg-white/20 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Moon className="text-yellow-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Moon Phases</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <Calendar className="text-blue-400" size={16} />
                    <input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400"
                    />
                </div>
            </div>

            {/* Current Moon Phase */}
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
                <div className="mb-6">
                    {getMoonVisualizer(moonData.phase)}
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="text-4xl mb-2">{moonData.phaseIcon}</div>
                        <h3 className="text-2xl font-bold text-white mb-2">{moonData.phaseName}</h3>
                        <p className="text-white/70">{moonData.phaseDescription}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="text-2xl font-bold text-white mb-1">{moonData.illumination}%</div>
                            <div className="text-sm text-white/70">Illuminated</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="text-2xl font-bold text-white mb-1">{moonData.age}</div>
                            <div className="text-sm text-white/70">Days Old</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="text-lg font-bold text-white mb-1">{moonData.zodiacSign}</div>
                            <div className="text-sm text-white/70">Zodiac Sign</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Moon Rise/Set Times */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                    <Star className="text-yellow-400" size={20} />
                    <h3 className="text-lg font-semibold text-white">Moon Times</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                        <div className="text-3xl mb-2">🌅</div>
                        <div className="text-sm text-white/70 mb-1">Moonrise</div>
                        <div className="text-xl font-bold text-white">
                            {formatTime(moonData.moonRise)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl mb-2">🌇</div>
                        <div className="text-sm text-white/70 mb-1">Moonset</div>
                        <div className="text-xl font-bold text-white">
                            {formatTime(moonData.moonSet)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lunar Calendar */}
            <div className="bg-gradient-to-br from-blue-500/20 to-teal-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                    <Info className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-white">Lunar Calendar</h3>
                </div>

                <div className="space-y-3">
                    <div>
                        <div className="text-xl font-bold text-white mb-1">
                            {moonData.lunarCalendar.name}
                        </div>
                        <p className="text-white/70 text-sm">
                            {moonData.lunarCalendar.description}
                        </p>
                    </div>

                    <div className="pt-3 border-t border-white/20">
                        <div className="text-sm text-white/70 mb-2">Lunar Facts:</div>
                        <ul className="text-sm text-white/80 space-y-1">
                            <li>• Lunar cycle: 29.53 days</li>
                            <li>• Distance from Earth: 384,400 km</li>
                            <li>• Moon's gravitational effect influences tides</li>
                            <li>• Best viewing time: {moonData.illumination > 50 ? 'Evening' : 'Pre-dawn'}</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Upcoming Moon Phases */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Moon Phases</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {moonData.upcomingPhases.slice(0, 4).map((phase, index) => (
                        <div
                            key={index}
                            className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-2">{phase.icon}</div>
                                <div className="font-semibold text-white mb-1">{phase.name}</div>
                                <div className="text-sm text-white/70 mb-2">
                                    {phase.date.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </div>
                                <div className="text-xs text-white/60">
                                    {phase.daysAway === 0 ? 'Today' : `In ${phase.daysAway} days`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Moon Phase Calendar */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Monthly Moon Phase Calendar</h3>

                <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-white/70 p-2">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }, (_, i) => {
                        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i - 6);
                        const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = date.toDateString() === selectedDate.toDateString();

                        // Calculate moon phase for this date
                        const daysSinceNewMoon = ((date - new Date('2000-01-06')) / (1000 * 60 * 60 * 24)) % 29.53;
                        const phase = daysSinceNewMoon / 29.53;
                        let phaseIcon = '🌑';
                        if (phase < 0.125) phaseIcon = '🌑';
                        else if (phase < 0.25) phaseIcon = '🌒';
                        else if (phase < 0.375) phaseIcon = '🌓';
                        else if (phase < 0.5) phaseIcon = '🌔';
                        else if (phase < 0.625) phaseIcon = '🌕';
                        else if (phase < 0.75) phaseIcon = '🌖';
                        else if (phase < 0.875) phaseIcon = '🌗';
                        else phaseIcon = '🌘';

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(new Date(date))}
                                className={`
                  p-2 rounded-lg text-sm transition-all duration-200 hover:scale-105
                  ${isCurrentMonth
                                    ? isSelected
                                        ? 'bg-blue-500 text-white'
                                        : isToday
                                            ? 'bg-yellow-500/30 text-white border border-yellow-400'
                                            : 'bg-white/5 text-white hover:bg-white/10'
                                    : 'text-white/30'
                                }
                `}
                            >
                                <div className="font-medium">{date.getDate()}</div>
                                <div className="text-xs">{phaseIcon}</div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 text-center text-sm text-white/60">
                    Click on any date to view moon phase details
                </div>
            </div>

            {/* Astronomical Information */}
            <div className="bg-gradient-to-br from-gray-500/20 to-slate-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Astronomical Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <div className="text-sm text-white/70 mb-1">Angular Diameter</div>
                            <div className="text-white font-medium">0.52°</div>
                        </div>
                        <div>
                            <div className="text-sm text-white/70 mb-1">Distance from Earth</div>
                            <div className="text-white font-medium">384,400 km</div>
                        </div>
                        <div>
                            <div className="text-sm text-white/70 mb-1">Orbital Period</div>
                            <div className="text-white font-medium">27.3 days</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="text-sm text-white/70 mb-1">Best Photography Time</div>
                            <div className="text-white font-medium">
                                {moonData.illumination > 50 ? '1-2 hours after sunset' : '1-2 hours before sunrise'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-white/70 mb-1">Tidal Influence</div>
                            <div className="text-white font-medium">
                                {moonData.phaseName === 'Full Moon' || moonData.phaseName === 'New Moon' ? 'High (Spring Tides)' : 'Moderate (Neap Tides)'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-white/70 mb-1">Viewing Conditions</div>
                            <div className="text-white font-medium">
                                {moonData.illumination > 75 ? 'Excellent' : moonData.illumination > 25 ? 'Good' : 'Fair'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoonPhases;