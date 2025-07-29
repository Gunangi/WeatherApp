import { cache } from '../utils/cacheUtils.js';

/**
 * Satellite Imagery API service
 * Provides satellite images, radar data, and weather overlays
 */

class SatelliteService {
    constructor() {
        this.openWeatherApiKey = process.env.REACT_APP_OPENWEATHER_API_KEY || 'your-api-key';
        this.nasaApiKey = process.env.REACT_APP_NASA_API_KEY || 'DEMO_KEY';
        this.baseUrls = {
            openWeather: 'https://tile.openweathermap.org/map',
            nasa: 'https://api.nasa.gov/planetary/earth',
            noaa: 'https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR'
        };
        this.tileSize = 256;
        this.maxZoom = 18;
        this.rateLimit = {
            requests: 0,
            resetTime: Date.now() + 60000
        };
    }

    /**
     * Check rate limit
     */
    checkRateLimit() {
        const now = Date.now();
        if (now > this.rateLimit.resetTime) {
            this.rateLimit.requests = 0;
            this.rateLimit.resetTime = now + 60000;
        }

        if (this.rateLimit.requests >= 100) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }

        this.rateLimit.requests++;
    }

    /**
     * Get weather map tile URL from OpenWeatherMap
     */
    getWeatherTileUrl(layer, zoom, x, y, timestamp = null) {
        const timestampParam = timestamp ? `&date=${timestamp}` : '';
        return `${this.baseUrls.openWeather}/${layer}/${zoom}/${x}/${y}.png?appid=${this.openWeatherApiKey}${timestampParam}`;
    }

    /**
     * Get satellite imagery from NASA
     */
    async getSatelliteImage(lat, lon, date = null, dim = 0.15) {
        try {
            this.checkRateLimit();

            const dateParam = date ? `&date=${date}` : '';
            const cacheKey = `satellite_nasa_${lat}_${lon}_${date || 'latest'}_${dim}`;

            const cached = await cache.get(cacheKey);
            if (cached) {
                console.log('NASA satellite image cache hit');
                return cached;
            }

            const url = `${this.baseUrls.nasa}/imagery?lon=${lon}&lat=${lat}&dim=${dim}&api_key=${this.nasaApiKey}${dateParam}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`NASA satellite API failed: ${response.status}`);
            }

            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);

            const result = {
                imageUrl,
                coordinates: { lat, lon },
                date: date || new Date().toISOString().split('T')[0],
                dimensions: dim,
                source: 'nasa',
                metadata: {
                    resolution: '30m',
                    satellite: 'Landsat 8',
                    cloudCoverage: Math.random() * 30 // Mock cloud coverage
                }
            };

            // Cache for 4 hours
            await cache.set(cacheKey, result, 14400);

            return result;
        } catch (error) {
            console.error('NASA satellite error:', error);
            return this.getMockSatelliteImage(lat, lon, date);
        }
    }

    /**
     * Get real-time weather radar data
     */
    async getWeatherRadar(lat, lon, zoom = 8, layers = ['precipitation_new']) {
        try {
            const cacheKey = `weather_radar_${lat}_${lon}_${zoom}_${layers.join('_')}`;
            const cached = await cache.get(cacheKey);
            if (cached) {
                console.log('Weather radar cache hit');
                return cached;
            }

            // Calculate tile coordinates from lat/lon
            const tileCoords = this.latLonToTile(lat, lon, zoom);

            const radarLayers = [];

            for (const layer of layers) {
                const tileUrl = this.getWeatherTileUrl(layer, zoom, tileCoords.x, tileCoords.y);

                radarLayers.push({
                    layer,
                    tileUrl,
                    opacity: this.getLayerOpacity(layer),
                    colorScale: this.getLayerColorScale(layer)
                });
            }

            const result = {
                center: { lat, lon },
                zoom,
                tileCoords,
                layers: radarLayers,
                timestamp: Date.now(),
                refreshInterval: 300000, // 5 minutes
                source: 'openweather'
            };

            // Cache for 5 minutes
            await cache.set(cacheKey, result, 300);

            return result;
        } catch (error) {
            console.error('Weather radar error:', error);
            return this.getMockWeatherRadar(lat, lon, zoom);
        }
    }

    /**
     * Get animated weather radar for time series
     */
    async getAnimatedRadar(lat, lon, hours = 3, zoom = 8, layer = 'precipitation_new') {
        try {
            const cacheKey = `animated_radar_${lat}_${lon}_${hours}_${zoom}_${layer}`;
            const cached = await cache.get(cacheKey);
            if (cached) {
                console.log('Animated radar cache hit');
                return cached;
            }

            const frames = [];
            const now = Date.now();
            const intervalMs = (hours * 60 * 60 * 1000) / 12; // 12 frames

            const tileCoords = this.latLonToTile(lat, lon, zoom);

            for (let i = 0; i < 12; i++) {
                const timestamp = Math.floor((now - (11 - i) * intervalMs) / 1000);
                const tileUrl = this.getWeatherTileUrl(layer, zoom, tileCoords.x, tileCoords.y, timestamp);

                frames.push({
                    timestamp,
                    tileUrl,
                    dateTime: new Date(timestamp * 1000).toISOString()
                });
            }

            const result = {
                center: { lat, lon },
                zoom,
                layer,
                frames,
                animationSettings: {
                    duration: 200, // ms per frame
                    loop: true,
                    autoPlay: false
                },
                source: 'openweather'
            };

            // Cache for 10 minutes
            await cache.set(cacheKey, result, 600);

            return result;
        } catch (error) {
            console.error('Animated radar error:', error);
            return this.getMockAnimatedRadar(lat, lon, hours);
        }
    }

    /**
     * Get cloud coverage satellite imagery
     */
    async getCloudCoverage(lat, lon, zoom = 6) {
        try {
            const cacheKey = `cloud_coverage_${lat}_${lon}_${zoom}`;
            const cached = await cache.get(cacheKey);
            if (cached) return cached;

            const tileCoords = this.latLonToTile(lat, lon, zoom);
            const tileUrl = this.getWeatherTileUrl('clouds_new', zoom, tileCoords.x, tileCoords.y);

            const result = {
                center: { lat, lon },
                zoom,
                tileCoords,
                cloudLayer: {
                    tileUrl,
                    opacity: 0.6,
                    colorScale: this.getLayerColorScale('clouds_new')
                },
                metadata: {
                    updateInterval: 600000, // 10 minutes
                    resolution: '1km',
                    source: 'satellite'
                }
            };

            // Cache for 10 minutes
            await cache.set(cacheKey, result, 600);

            return result;
        } catch (error) {
            console.error('Cloud coverage error:', error);
            return this.getMockCloudCoverage(lat, lon);
        }
    }

    /**
     * Get temperature overlay satellite data
     */
    async getTemperatureOverlay(lat, lon, zoom = 6) {
        try {
            const cacheKey = `temperature_overlay_${lat}_${lon}_${zoom}`;
            const cached = await cache.get(cacheKey);
            if (cached) return cached;

            const tileCoords = this.latLonToTile(lat, lon, zoom);
            const tileUrl = this.getWeatherTileUrl('temp_new', zoom, tileCoords.x, tileCoords.y);

            const result = {
                center: { lat, lon },
                zoom,
                tileCoords,
                temperatureLayer: {
                    tileUrl,
                    opacity: 0.7,
                    colorScale: this.getLayerColorScale('temp_new'),
                    legend: this.getTemperatureLegend()
                },
                metadata: {
                    updateInterval: 3600000, // 1 hour
                    unit: 'celsius',
                    source: 'satellite'
                }
            };

            // Cache for 30 minutes
            await cache.set(cacheKey, result, 1800);

            return result;
        } catch (error) {
            console.error('Temperature overlay error:', error);
            return this.getMockTemperatureOverlay(lat, lon);
        }
    }

    /**
     * Get wind flow visualization
     */
    async getWindFlowData(lat, lon, zoom = 6) {
        try {
            const cacheKey = `wind_flow_${lat}_${lon}_${zoom}`;
            const cached = await cache.get(cacheKey);
            if (cached) return cached;

            const tileCoords = this.latLonToTile(lat, lon, zoom);
            const windSpeedUrl = this.getWeatherTileUrl('wind_new', zoom, tileCoords.x, tileCoords.y);

            // Generate mock wind vectors for visualization
            const windVectors = this.generateWindVectors(lat, lon, 20, 20);

            const result = {
                center: { lat, lon },
                zoom,
                tileCoords,
                windLayers: {
                    speedLayer: {
                        tileUrl: windSpeedUrl,
                        opacity: 0.5,
                        colorScale: this.getLayerColorScale('wind_new')
                    },
                    vectorLayer: {
                        vectors: windVectors,
                        style: {
                            strokeColor: '#ffffff',
                            strokeWidth: 2,
                            arrowSize: 8
                        }
                    }
                },
                metadata: {
                    updateInterval: 1800000, // 30 minutes
                    windUnit: 'm/s',
                    vectorDensity: 'medium'
                }
            };

            // Cache for 30 minutes
            await cache.set(cacheKey, result, 1800);

            return result;
        } catch (error) {
            console.error('Wind flow error:', error);
            return this.getMockWindFlowData(lat, lon);
        }
    }

    /**
     * Get satellite image layers for comparison
     */
    async getMultiLayerSatellite(lat, lon, layers, zoom = 8) {
        try {
            const cacheKey = `multi_layer_${lat}_${lon}_${layers.join('_')}_${zoom}`;
            const cached = await cache.get(cacheKey);
            if (cached) return cached;

            const tileCoords = this.latLonToTile(lat, lon, zoom);
            const layerData = [];

            for (const layer of layers) {
                const tileUrl = this.getWeatherTileUrl(layer, zoom, tileCoords.x, tileCoords.y);

                layerData.push({
                    name: layer,
                    displayName: this.getLayerDisplayName(layer),
                    tileUrl,
                    opacity: this.getLayerOpacity(layer),
                    colorScale: this.getLayerColorScale(layer),
                    visible: true
                });
            }

            const result = {
                center: { lat, lon },
                zoom,
                tileCoords,
                layers: layerData,
                controls: {
                    opacityControl: true,
                    layerToggle: true,
                    colorScaleSelector: true
                }
            };

            // Cache for 15 minutes
            await cache.set(cacheKey, result, 900);

            return result;
        } catch (error) {
            console.error('Multi-layer satellite error:', error);
            return this.getMockMultiLayerSatellite(lat, lon, layers);
        }
    }

    /**
     * Convert latitude/longitude to tile coordinates
     */
    latLonToTile(lat, lon, zoom) {
        const latRad = lat * Math.PI / 180;
        const n = Math.pow(2, zoom);

        const x = Math.floor((lon + 180) / 360 * n);
        const y = Math.floor((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n);

        return { x, y };
    }

    /**
     * Convert tile coordinates to latitude/longitude
     */
    tileToLatLon(x, y, zoom) {
        const n = Math.pow(2, zoom);

        const lon = x / n * 360 - 180;
        const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
        const lat = latRad * 180 / Math.PI;

        return { lat, lon };
    }

    /**
     * Get layer opacity settings
     */
    getLayerOpacity(layer) {
        const opacityMap = {
            'temp_new': 0.7,
            'precipitation_new': 0.8,
            'pressure_new': 0.6,
            'wind_new': 0.5,
            'clouds_new': 0.6
        };

        return opacityMap[layer] || 0.7;
    }

    /**
     * Get layer color scale information
     */
    getLayerColorScale(layer) {
        const colorScales = {
            'temp_new': {
                type: 'temperature',
                range: [-40, 50],
                colors: ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'],
                unit: '°C'
            },
            'precipitation_new': {
                type: 'precipitation',
                range: [0, 50],
                colors: ['#ffffff', '#b3f7ff', '#66d9ff', '#0099ff', '#0066cc', '#003399'],
                unit: 'mm/h'
            },
            'pressure_new': {
                type: 'pressure',
                range: [980, 1040],
                colors: ['#ff0000', '#ff6600', '#ffff00', '#66ff00', '#0066ff'],
                unit: 'hPa'
            },
            'wind_new': {
                type: 'wind',
                range: [0, 30],
                colors: ['#ffffff', '#ffff99', '#ff9999', '#ff3333', '#990000'],
                unit: 'm/s'
            },
            'clouds_new': {
                type: 'clouds',
                range: [0, 100],
                colors: ['#ffffff00', '#ffffff80', '#ffffffff'],
                unit: '%'
            }
        };

        return colorScales[layer] || colorScales['temp_new'];
    }

    /**
     * Get display name for layer
     */
    getLayerDisplayName(layer) {
        const displayNames = {
            'temp_new': 'Temperature',
            'precipitation_new': 'Precipitation',
            'pressure_new': 'Pressure',
            'wind_new': 'Wind Speed',
            'clouds_new': 'Cloud Cover'
        };

        return displayNames[layer] || layer;
    }

    /**
     * Get temperature legend data
     */
    getTemperatureLegend() {
        return {
            title: 'Temperature (°C)',
            stops: [
                { value: -40, color: '#0000ff', label: '-40°' },
                { value: -20, color: '#4080ff', label: '-20°' },
                { value: 0, color: '#80c0ff', label: '0°' },
                { value: 20, color: '#ffff80', label: '20°' },
                { value: 40, color: '#ff8000', label: '40°' },
                { value: 50, color: '#ff0000', label: '50°' }
            ]
        };
    }

    /**
     * Generate mock wind vectors for visualization
     */
    generateWindVectors(centerLat, centerLon, gridWidth, gridHeight) {
        const vectors = [];
        const latStep = 0.1;
        const lonStep = 0.1;

        for (let i = 0; i < gridWidth; i++) {
            for (let j = 0; j < gridHeight; j++) {
                const lat = centerLat - (gridHeight / 2 - j) * latStep;
                const lon = centerLon - (gridWidth / 2 - i) * lonStep;

                // Generate mock wind data
                const speed = Math.random() * 20; // 0-20 m/s
                const direction = Math.random() * 360; // 0-360 degrees

                const u = speed * Math.cos(direction * Math.PI / 180);
                const v = speed * Math.sin(direction * Math.PI / 180);

                vectors.push({
                    lat,
                    lon,
                    u, // east-west component
                    v, // north-south component
                    speed,
                    direction
                });
            }
        }

        return vectors;
    }

    /**
     * Get historical satellite imagery
     */
    async getHistoricalSatellite(lat, lon, date, layer = 'temp_new') {
        try {
            const timestamp = Math.floor(new Date(date).getTime() / 1000);
            const cacheKey = `historical_satellite_${lat}_${lon}_${timestamp}_${layer}`;

            const cached = await cache.get(cacheKey);
            if (cached) return cached;

            // For historical data, we would need different API endpoints
            // This is a simplified version
            const zoom = 6;
            const tileCoords = this.latLonToTile(lat, lon, zoom);
            const tileUrl = this.getWeatherTileUrl(layer, zoom, tileCoords.x, tileCoords.y, timestamp);

            const result = {
                center: { lat, lon },
                zoom,
                date,
                timestamp,
                layer,
                tileUrl,
                metadata: {
                    source: 'historical',
                    resolution: '1km',
                    availability: 'limited'
                }
            };

            // Cache for 24 hours (historical data doesn't change)
            await cache.set(cacheKey, result, 86400);

            return result;
        } catch (error) {
            console.error('Historical satellite error:', error);
            return this.getMockHistoricalSatellite(lat, lon, date, layer);
        }
    }

    /**
     * Mock satellite image for demo
     */
    getMockSatelliteImage(lat, lon, date) {
        return {
            imageUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="earthGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:#4a90e2"/>
              <stop offset="50%" style="stop-color:#7ed321"/>
              <stop offset="100%" style="stop-color:#8b572a"/>
            </radialGradient>
          </defs>
          <rect width="400" height="400" fill="#000"/>
          <circle cx="200" cy="200" r="180" fill="url(#earthGradient)" opacity="0.8"/>
          <text x="200" y="200" text-anchor="middle" fill="white" font-size="16">
            Satellite View
          </text>
          <text x="200" y="220" text-anchor="middle" fill="white" font-size="12">
            ${lat.toFixed(2)}, ${lon.toFixed(2)}
          </text>
        </svg>
      `)}`,
            coordinates: { lat, lon },
            date: date || new Date().toISOString().split('T')[0],
            source: 'mock',
            metadata: {
                resolution: '30m',
                satellite: 'Mock Satellite',
                cloudCoverage: 15
            }
        };
    }

    /**
     * Mock weather radar for demo
     */
    getMockWeatherRadar(lat, lon, zoom) {
        return {
            center: { lat, lon },
            zoom,
            layers: [{
                layer: 'precipitation_new',
                tileUrl: `data:image/svg+xml;base64,${btoa(`
          <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
            <rect width="256" height="256" fill="rgba(0,100,255,0.3)"/>
            <circle cx="128" cy="128" r="60" fill="rgba(0,150,255,0.6)"/>
            <text x="128" y="135" text-anchor="middle" fill="white" font-size="12">RADAR</text>
          </svg>
        `)}`,
                opacity: 0.8
            }],
            timestamp: Date.now(),
            source: 'mock'
        };
    }

    /**
     * Mock animated radar for demo
     */
    getMockAnimatedRadar(lat, lon, hours) {
        const frames = [];
        for (let i = 0; i < 12; i++) {
            frames.push({
                timestamp: Date.now() - (11 - i) * 300000,
                tileUrl: `data:image/svg+xml;base64,${btoa(`
          <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
            <rect width="256" height="256" fill="rgba(0,100,255,${0.1 + i * 0.05})"/>
            <circle cx="128" cy="128" r="${30 + i * 5}" fill="rgba(0,150,255,0.6)"/>
            <text x="128" y="135" text-anchor="middle" fill="white" font-size="10">Frame ${i + 1}</text>
          </svg>
        `)}`,
                dateTime: new Date(Date.now() - (11 - i) * 300000).toISOString()
            });
        }

        return {
            center: { lat, lon },
            layer: 'precipitation_new',
            frames,
            animationSettings: {
                duration: 200,
                loop: true,
                autoPlay: false
            },
            source: 'mock'
        };
    }

    /**
     * Mock cloud coverage for demo
     */
    getMockCloudCoverage(lat, lon) {
        return {
            center: { lat, lon },
            cloudLayer: {
                tileUrl: `data:image/svg+xml;base64,${btoa(`
          <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
            <rect width="256" height="256" fill="rgba(255,255,255,0.4)"/>
            <ellipse cx="128" cy="128" rx="80" ry="60" fill="rgba(255,255,255,0.8)"/>
            <text x="128" y="135" text-anchor="middle" fill="gray" font-size="12">Clouds</text>
          </svg>
        `)}`,
                opacity: 0.6
            },
            source: 'mock'
        };
    }

    /**
     * Mock temperature overlay for demo
     */
    getMockTemperatureOverlay(lat, lon) {
        return {
            center: { lat, lon },
            temperatureLayer: {
                tileUrl: `data:image/svg+xml;base64,${btoa(`
          <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#0000ff"/>
                <stop offset="50%" style="stop-color:#ffff00"/>
                <stop offset="100%" style="stop-color:#ff0000"/>
              </linearGradient>
            </defs>
            <rect width="256" height="256" fill="url(#tempGradient)" opacity="0.7"/>
            <text x="128" y="135" text-anchor="middle" fill="white" font-size="12">Temperature</text>
          </svg>
        `)}`,
                opacity: 0.7,
                legend: this.getTemperatureLegend()
            },
            source: 'mock'
        };
    }

    /**
     * Mock wind flow data for demo
     */
    getMockWindFlowData(lat, lon) {
        return {
            center: { lat, lon },
            windLayers: {
                speedLayer: {
                    tileUrl: `data:image/svg+xml;base64,${btoa(`
            <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
              <rect width="256" height="256" fill="rgba(100,200,100,0.5)"/>
              <text x="128" y="135" text-anchor="middle" fill="white" font-size="12">Wind Speed</text>
            </svg>
          `)}`,
                    opacity: 0.5
                },
                vectorLayer: {
                    vectors: this.generateWindVectors(lat, lon, 10, 10)
                }
            },
            source: 'mock'
        };
    }

    /**
     * Mock multi-layer satellite for demo
     */
    getMockMultiLayerSatellite(lat, lon, layers) {
        return {
            center: { lat, lon },
            layers: layers.map(layer => ({
                name: layer,
                displayName: this.getLayerDisplayName(layer),
                tileUrl: `data:image/svg+xml;base64,${btoa(`
          <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
            <rect width="256" height="256" fill="rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)"/>
            <text x="128" y="135" text-anchor="middle" fill="white" font-size="10">${this.getLayerDisplayName(layer)}</text>
          </svg>
        `)}`,
                opacity: this.getLayerOpacity(layer),
                visible: true
            })),
            source: 'mock'
        };
    }

    /**
     * Mock historical satellite for demo
     */
    getMockHistoricalSatellite(lat, lon, date, layer) {
        return {
            center: { lat, lon },
            date,
            layer,
            tileUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
          <rect width="256" height="256" fill="rgba(150,150,150,0.6)"/>
          <text x="128" y="120" text-anchor="middle" fill="white" font-size="10">Historical</text>
          <text x="128" y="140" text-anchor="middle" fill="white" font-size="10">${date}</text>
        </svg>
      `)}`,
            metadata: {
                source: 'mock-historical',
                resolution: '1km'
            }
        };
    }
}

// Create singleton instance
const satelliteService = new SatelliteService();

// Export individual functions
export const getSatelliteImage = (lat, lon, date, dim) =>
    satelliteService.getSatelliteImage(lat, lon, date, dim);

export const getWeatherRadar = (lat, lon, zoom, layers) =>
    satelliteService.getWeatherRadar(lat, lon, zoom, layers);

export const getAnimatedRadar = (lat, lon, hours, zoom, layer) =>
    satelliteService.getAnimatedRadar(lat, lon, hours, zoom, layer);

export const getCloudCoverage = (lat, lon, zoom) =>
    satelliteService.getCloudCoverage(lat, lon, zoom);

export const getTemperatureOverlay = (lat, lon, zoom) =>
    satelliteService.getTemperatureOverlay(lat, lon, zoom);

export const getWindFlowData = (lat, lon, zoom) =>
    satelliteService.getWindFlowData(lat, lon, zoom);

export const getMultiLayerSatellite = (lat, lon, layers, zoom) =>
    satelliteService.getMultiLayerSatellite(lat, lon, layers, zoom);

export const getHistoricalSatellite = (lat, lon, date, layer) =>
    satelliteService.getHistoricalSatellite(lat, lon, date, layer);

export const getWeatherTileUrl = (layer, zoom, x, y, timestamp) =>
    satelliteService.getWeatherTileUrl(layer, zoom, x, y, timestamp);

export const latLonToTile = (lat, lon, zoom) =>
    satelliteService.latLonToTile(lat, lon, zoom);

export const tileToLatLon = (x, y, zoom) =>
    satelliteService.tileToLatLon(x, y, zoom);

export default satelliteService;