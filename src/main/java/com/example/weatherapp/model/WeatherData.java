package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Document(collection = "weather_data")
@CompoundIndexes({
        @CompoundIndex(name = "location_timestamp_idx", def = "{'latitude': 1, 'longitude': 1, 'timestamp': -1}"),
        @CompoundIndex(name = "city_timestamp_idx", def = "{'cityName': 1, 'timestamp': -1}")
})
public class WeatherData {

    @Id
    private String id;

    // Location information
    @NotNull(message = "City name is required")
    @Indexed
    private String cityName;

    @NotNull(message = "Country is required")
    private String country;

    private String state; // For US/CA locations
    private String region; // Alternative to state

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    private String timezone;
    private Long timezoneOffset; // Offset in seconds from UTC

    // Current weather conditions
    @NotNull(message = "Temperature is required")
    private Double temperature; // in Celsius

    @NotNull(message = "Feels like temperature is required")
    private Double feelsLike; // in Celsius

    @NotNull(message = "Weather condition is required")
    private String weatherCondition; // e.g., "Clear", "Clouds", "Rain"

    @NotNull(message = "Weather description is required")
    private String weatherDescription; // e.g., "clear sky", "broken clouds"

    private String weatherIcon; // Weather icon code
    private Integer weatherId; // Weather condition ID

    // Temperature metrics
    private Double minTemperature; // Daily minimum temperature
    private Double maxTemperature; // Daily maximum temperature
    private Double temperatureTrend; // Temperature change from previous reading

    // Atmospheric data
    @NotNull(message = "Humidity is required")
    @DecimalMin(value = "0.0", message = "Humidity must be between 0 and 100")
    @DecimalMax(value = "100.0", message = "Humidity must be between 0 and 100")
    private Double humidity; // Percentage

    @NotNull(message = "Pressure is required")
    private Double pressure; // in hPa

    private Double seaLevelPressure; // Sea level pressure in hPa
    private Double groundLevelPressure; // Ground level pressure in hPa

    // Wind information
    private WindData wind = new WindData();

    // Visibility
    private Double visibility; // in meters

    // Cloud coverage
    private Double cloudiness; // Percentage

    // Precipitation
    private PrecipitationData precipitation = new PrecipitationData();

    // UV Index
    private Double uvIndex;
    private String uvIndexCategory; // e.g., "Low", "Moderate", "High", "Very High", "Extreme"

    // Sun data
    private LocalTime sunrise;
    private LocalTime sunset;
    private Long dayLength; // Day length in seconds

    // Air quality (basic - detailed in separate AirQualityData document)
    private Integer airQualityIndex;
    private String airQualityCategory;

    // Data source and quality
    private String dataSource; // e.g., "OpenWeatherMap", "WeatherAPI"
    private String apiVersion;
    private Double dataQuality; // Quality score 0-1
    private Boolean isRealTime; // Is this real-time or cached data

    // Timestamps
    @NotNull(message = "Observation timestamp is required")
    @Indexed
    private LocalDateTime timestamp; // When the weather was observed

    @CreatedDate
    private LocalDateTime createdAt; // When this record was created

    @LastModifiedDate
    private LocalDateTime updatedAt; // When this record was last updated

    private LocalDateTime expiresAt; // When this data expires

    // Additional metadata
    private Map<String, Object> additionalData; // For any extra weather parameters

    // Nested classes for complex data structures
    public static class WindData {
        private Double speed; // Wind speed in m/s
        private Double direction; // Wind direction in degrees (0-360)
        private String directionName; // e.g., "N", "NE", "E", "SE", "S", "SW", "W", "NW"
        private Double gust; // Wind gust speed in m/s

        public WindData() {}

        public WindData(Double speed, Double direction) {
            this.speed = speed;
            this.direction = direction;
            this.directionName = getDirectionName(direction);
        }

        private static String getDirectionName(Double direction) {
            if (direction == null) return null;

            String[] directions = {"N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"};
            int index = (int) Math.round(direction / 22.5) % 16;
            return directions[index];
        }

        // Getters and Setters
        public Double getSpeed() { return speed; }
        public void setSpeed(Double speed) { this.speed = speed; }

        public Double getDirection() { return direction; }
        public void setDirection(Double direction) {
            this.direction = direction;
            this.directionName = getDirectionName(direction);
        }

        public String getDirectionName() { return directionName; }
        public void setDirectionName(String directionName) { this.directionName = directionName; }

        public Double getGust() { return gust; }
        public void setGust(Double gust) { this.gust = gust; }
    }

    public static class PrecipitationData {
        private Double rain1h; // Rain volume for last 1 hour in mm
        private Double rain3h; // Rain volume for last 3 hours in mm
        private Double rain24h; // Rain volume for last 24 hours in mm
        private Double snow1h; // Snow volume for last 1 hour in mm
        private Double snow3h; // Snow volume for last 3 hours in mm
        private Double snow24h; // Snow volume for last 24 hours in mm
        private Double probabilityOfPrecipitation; // Probability of precipitation (0-100%)
        private String precipitationType; // "rain", "snow", "sleet", "none"

        // Getters and Setters
        public Double getRain1h() { return rain1h; }
        public void setRain1h(Double rain1h) { this.rain1h = rain1h; }

        public Double getRain3h() { return rain3h; }
        public void setRain3h(Double rain3h) { this.rain3h = rain3h; }

        public Double getRain24h() { return rain24h; }
        public void setRain24h(Double rain24h) { this.rain24h = rain24h; }

        public Double getSnow1h() { return snow1h; }
        public void setSnow1h(Double snow1h) { this.snow1h = snow1h; }

        public Double getSnow3h() { return snow3h; }
        public void setSnow3h(Double snow3h) { this.snow3h = snow3h; }

        public Double getSnow24h() { return snow24h; }
        public void setSnow24h(Double snow24h) { this.snow24h = snow24h; }

        public Double getProbabilityOfPrecipitation() { return probabilityOfPrecipitation; }
        public void setProbabilityOfPrecipitation(Double probabilityOfPrecipitation) {
            this.probabilityOfPrecipitation = probabilityOfPrecipitation;
        }

        public String getPrecipitationType() { return precipitationType; }
        public void setPrecipitationType(String precipitationType) { this.precipitationType = precipitationType; }
    }

    // Constructors
    public WeatherData() {}

    public WeatherData(String cityName, String country, Double latitude, Double longitude) {
        this.cityName = cityName;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = LocalDateTime.now();
        this.isRealTime = true;
    }

    // Utility methods
    public boolean isDataExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public String getFullLocationName() {
        StringBuilder location = new StringBuilder(cityName);
        if (state != null && !state.isEmpty()) {
            location.append(", ").append(state);
        } else if (region != null && !region.isEmpty()) {
            location.append(", ").append(region);
        }
        location.append(", ").append(country);
        return location.toString();
    }

    public Double getTemperatureInFahrenheit() {
        return temperature != null ? (temperature * 9.0 / 5.0) + 32.0 : null;
    }

    public Double getFeelsLikeInFahrenheit() {
        return feelsLike != null ? (feelsLike * 9.0 / 5.0) + 32.0 : null;
    }

    // Main getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public Long getTimezoneOffset() { return timezoneOffset; }
    public void setTimezoneOffset(Long timezoneOffset) { this.timezoneOffset = timezoneOffset; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getFeelsLike() { return feelsLike; }
    public void setFeelsLike(Double feelsLike) { this.feelsLike = feelsLike; }

    public String getWeatherCondition() { return weatherCondition; }
    public void setWeatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; }

    public String getWeatherDescription() { return weatherDescription; }
    public void setWeatherDescription(String weatherDescription) { this.weatherDescription = weatherDescription; }

    public String getWeatherIcon() { return weatherIcon; }
    public void setWeatherIcon(String weatherIcon) { this.weatherIcon = weatherIcon; }

    public Integer getWeatherId() { return weatherId; }
    public void setWeatherId(Integer weatherId) { this.weatherId = weatherId; }

    public Double getMinTemperature() { return minTemperature; }
    public void setMinTemperature(Double minTemperature) { this.minTemperature = minTemperature; }

    public Double getMaxTemperature() { return maxTemperature; }
    public void setMaxTemperature(Double maxTemperature) { this.maxTemperature = maxTemperature; }

    public Double getTemperatureTrend() { return temperatureTrend; }
    public void setTemperatureTrend(Double temperatureTrend) { this.temperatureTrend = temperatureTrend; }

    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }

    public Double getPressure() { return pressure; }
    public void setPressure(Double pressure) { this.pressure = pressure; }

    public Double getSeaLevelPressure() { return seaLevelPressure; }
    public void setSeaLevelPressure(Double seaLevelPressure) { this.seaLevelPressure = seaLevelPressure; }

    public Double getGroundLevelPressure() { return groundLevelPressure; }
    public void setGroundLevelPressure(Double groundLevelPressure) { this.groundLevelPressure = groundLevelPressure; }

    public WindData getWind() { return wind; }
    public void setWind(WindData wind) { this.wind = wind; }

    public Double getVisibility() { return visibility; }
    public void setVisibility(Double visibility) { this.visibility = visibility; }

    public Double getCloudiness() { return cloudiness; }
    public void setCloudiness(Double cloudiness) { this.cloudiness = cloudiness; }

    public PrecipitationData getPrecipitation() { return precipitation; }
    public void setPrecipitation(PrecipitationData precipitation) { this.precipitation = precipitation; }

    public Double getUvIndex() { return uvIndex; }
    public void setUvIndex(Double uvIndex) { this.uvIndex = uvIndex; }

    public String getUvIndexCategory() { return uvIndexCategory; }
    public void setUvIndexCategory(String uvIndexCategory) { this.uvIndexCategory = uvIndexCategory; }

    public LocalTime getSunrise() { return sunrise; }
    public void setSunrise(LocalTime sunrise) { this.sunrise = sunrise; }

    public LocalTime getSunset() { return sunset; }
    public void setSunset(LocalTime sunset) { this.sunset = sunset; }

    public Long getDayLength() { return dayLength; }
    public void setDayLength(Long dayLength) { this.dayLength = dayLength; }

    public Integer getAirQualityIndex() { return airQualityIndex; }
    public void setAirQualityIndex(Integer airQualityIndex) { this.airQualityIndex = airQualityIndex; }

    public String getAirQualityCategory() { return airQualityCategory; }
    public void setAirQualityCategory(String airQualityCategory) { this.airQualityCategory = airQualityCategory; }

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }

    public String getApiVersion() { return apiVersion; }
    public void setApiVersion(String apiVersion) { this.apiVersion = apiVersion; }

    public Double getDataQuality() { return dataQuality; }
    public void setDataQuality(Double dataQuality) { this.dataQuality = dataQuality; }

    public Boolean getIsRealTime() { return isRealTime; }
    public void setIsRealTime(Boolean isRealTime) { this.isRealTime = isRealTime; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public Map<String, Object> getAdditionalData() { return additionalData; }
    public void setAdditionalData(Map<String, Object> additionalData) { this.additionalData = additionalData; }

    @Override
    public String toString() {
        return "WeatherData{" +
                "id='" + id + '\'' +
                ", cityName='" + cityName + '\'' +
                ", country='" + country + '\'' +
                ", temperature=" + temperature +
                ", weatherCondition='" + weatherCondition + '\'' +
                ", humidity=" + humidity +
                ", pressure=" + pressure +
                ", timestamp=" + timestamp +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof WeatherData)) return false;
        WeatherData that = (WeatherData) o;
        return id != null ? id.equals(that.id) : that.id == null;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}