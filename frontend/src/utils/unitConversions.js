// Temperature conversions
export const convertTemperature = (temp, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return temp;

    let celsius;

    // Convert to Celsius first
    switch (fromUnit.toLowerCase()) {
        case 'fahrenheit':
        case 'f':
            celsius = (temp - 32) * 5/9;
            break;
        case 'kelvin':
        case 'k':
            celsius = temp - 273.15;
            break;
        case 'celsius':
        case 'c':
        default:
            celsius = temp;
            break;
    }

    // Convert from Celsius to target unit
    switch (toUnit.toLowerCase()) {
        case 'fahrenheit':
        case 'f':
            return (celsius * 9/5) + 32;
        case 'kelvin':
        case 'k':
            return celsius + 273.15;
        case 'celsius':
        case 'c':
        default:
            return celsius;
    }
};

// Wind speed conversions
export const convertWindSpeed = (speed, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return speed;

    let mps; // meters per second as base unit

    // Convert to m/s first
    switch (fromUnit.toLowerCase()) {
        case 'kmh':
        case 'km/h':
        case 'kph':
            mps = speed / 3.6;
            break;
        case 'mph':
        case 'mi/h':
            mps = speed * 0.44704;
            break;
        case 'knots':
        case 'kt':
            mps = speed * 0.514444;
            break;
        case 'fps':
        case 'ft/s':
            mps = speed * 0.3048;
            break;
        case 'mps':
        case 'm/s':
        default:
            mps = speed;
            break;
    }

    // Convert from m/s to target unit
    switch (toUnit.toLowerCase()) {
        case 'kmh':
        case 'km/h':
        case 'kph':
            return mps * 3.6;
        case 'mph':
        case 'mi/h':
            return mps / 0.44704;
        case 'knots':
        case 'kt':
            return mps / 0.514444;
        case 'fps':
        case 'ft/s':
            return mps / 0.3048;
        case 'mps':
        case 'm/s':
        default:
            return mps;
    }
};

// Pressure conversions
export const convertPressure = (pressure, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return pressure;

    let hpa; // hectopascals as base unit

    // Convert to hPa first
    switch (fromUnit.toLowerCase()) {
        case 'pa':
            hpa = pressure / 100;
            break;
        case 'kpa':
            hpa = pressure * 10;
            break;
        case 'bar':
            hpa = pressure * 1000;
            break;
        case 'atm':
            hpa = pressure * 1013.25;
            break;
        case 'mmhg':
        case 'torr':
            hpa = pressure * 1.33322;
            break;
        case 'inhg':
            hpa = pressure * 33.8639;
            break;
        case 'psi':
            hpa = pressure * 68.9476;
            break;
        case 'hpa':
        case 'mbar':
        default:
            hpa = pressure;
            break;
    }

    // Convert from hPa to target unit
    switch (toUnit.toLowerCase()) {
        case 'pa':
            return hpa * 100;
        case 'kpa':
            return hpa / 10;
        case 'bar':
            return hpa / 1000;
        case 'atm':
            return hpa / 1013.25;
        case 'mmhg':
        case 'torr':
            return hpa / 1.33322;
        case 'inhg':
            return hpa / 33.8639;
        case 'psi':
            return hpa / 68.9476;
        case 'hpa':
        case 'mbar':
        default:
            return hpa;
    }
};

// Distance/Visibility conversions
export const convertDistance = (distance, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return distance;

    let km; // kilometers as base unit

    // Convert to km first
    switch (fromUnit.toLowerCase()) {
        case 'm':
        case 'meters':
            km = distance / 1000;
            break;
        case 'mi':
        case 'miles':
            km = distance * 1.60934;
            break;
        case 'ft':
        case 'feet':
            km = distance * 0.0003048;
            break;
        case 'nm':
        case 'nautical miles':
            km = distance * 1.852;
            break;
        case 'km':
        case 'kilometers':
        default:
            km = distance;
            break;
    }

    // Convert from km to target unit
    switch (toUnit.toLowerCase()) {
        case 'm':
        case 'meters':
            return km * 1000;
        case 'mi':
        case 'miles':
            return km / 1.60934;
        case 'ft':
        case 'feet':
            return km / 0.0003048;
        case 'nm':
        case 'nautical miles':
            return km / 1.852;
        case 'km':
        case 'kilometers':
        default:
            return km;
    }
};

// Format temperature with unit
export const formatTemperature = (temp, unit = 'celsius', decimals = 0) => {
    const roundedTemp = Math.round(temp * Math.pow(10, decimals)) / Math.pow(10, decimals);

    switch (unit.toLowerCase()) {
        case 'fahrenheit':
        case 'f':
            return `${roundedTemp}°F`;
        case 'kelvin':
        case 'k':
            return `${roundedTemp}K`;
        case 'celsius':
        case 'c':
        default:
            return `${roundedTemp}°C`;
    }
};

// Format wind speed with unit
export const formatWindSpeed = (speed, unit = 'mps', decimals = 1) => {
    const roundedSpeed = Math.round(speed * Math.pow(10, decimals)) / Math.pow(10, decimals);

    switch (unit.toLowerCase()) {
        case 'kmh':
        case 'km/h':
        case 'kph':
            return `${roundedSpeed} km/h`;
        case 'mph':
        case 'mi/h':
            return `${roundedSpeed} mph`;
        case 'knots':
        case 'kt':
            return `${roundedSpeed} knots`;
        case 'fps':
        case 'ft/s':
            return `${roundedSpeed} ft/s`;
        case 'mps':
        case 'm/s':
        default:
            return `${roundedSpeed} m/s`;
    }
};

// Format pressure with unit
export const formatPressure = (pressure, unit = 'hpa', decimals = 0) => {
    const roundedPressure = Math.round(pressure * Math.pow(10, decimals)) / Math.pow(10, decimals);

    switch (unit.toLowerCase()) {
        case 'pa':
            return `${roundedPressure} Pa`;
        case 'kpa':
            return `${roundedPressure} kPa`;
        case 'bar':
            return `${roundedPressure} bar`;
        case 'atm':
            return `${roundedPressure} atm`;
        case 'mmhg':
        case 'torr':
            return `${roundedPressure} mmHg`;
        case 'inhg':
            return `${roundedPressure} inHg`;
        case 'psi':
            return `${roundedPressure} psi`;
        case 'hpa':
        case 'mbar':
        default:
            return `${roundedPressure} hPa`;
    }
};

// Format distance with unit
export const formatDistance = (distance, unit = 'km', decimals = 1) => {
    const roundedDistance = Math.round(distance * Math.pow(10, decimals)) / Math.pow(10, decimals);

    switch (unit.toLowerCase()) {
        case 'm':
        case 'meters':
            return `${roundedDistance} m`;
        case 'mi':
        case 'miles':
            return `${roundedDistance} mi`;
        case 'ft':
        case 'feet':
            return `${roundedDistance} ft`;
        case 'nm':
        case 'nautical miles':
            return `${roundedDistance} nm`;
        case 'km':
        case 'kilometers':
        default:
            return `${roundedDistance} km`;
    }
};

// Get appropriate unit labels
export const getUnitLabels = () => ({
    temperature: {
        celsius: '°C',
        fahrenheit: '°F',
        kelvin: 'K'
    },
    windSpeed: {
        mps: 'm/s',
        kmh: 'km/h',
        mph: 'mph',
        knots: 'knots',
        fps: 'ft/s'
    },
    pressure: {
        hpa: 'hPa',
        pa: 'Pa',
        kpa: 'kPa',
        bar: 'bar',
        atm: 'atm',
        mmhg: 'mmHg',
        inhg: 'inHg',
        psi: 'psi'
    },
    distance: {
        km: 'km',
        m: 'm',
        mi: 'mi',
        ft: 'ft',
        nm: 'nm'
    }
});

// Convert weather data object with user preferences
export const convertWeatherData = (weatherData, userPreferences) => {
    const {
        temperatureUnit = 'celsius',
        windSpeedUnit = 'mps',
        pressureUnit = 'hpa',
        distanceUnit = 'km'
    } = userPreferences;

    return {
        ...weatherData,
        temperature: convertTemperature(weatherData.temperature, 'celsius', temperatureUnit),
        feelsLike: convertTemperature(weatherData.feelsLike, 'celsius', temperatureUnit),
        windSpeed: convertWindSpeed(weatherData.windSpeed, 'mps', windSpeedUnit),
        pressure: convertPressure(weatherData.pressure, 'hpa', pressureUnit),
        visibility: convertDistance(weatherData.visibility, 'km', distanceUnit),
    };
};