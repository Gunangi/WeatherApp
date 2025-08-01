// WeatherResponse.java
package com.example.weatherapp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class WeatherResponse {

    // Location information
    private String cityName;
    private String countryCode;
    private String countryName;
    private double latitude;
    private double longitude;
    private String timezone;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime localTime;

    // Current weather
    private CurrentWeather current;

    // Forecast data
    private List<DailyForecast> dailyForecast;
    private List<HourlyForecast> hourlyForecast;

    // Air quality
    private AirQuality airQuality;

    // Air quality related fields
    private CurrentAirQuality currentAirQuality;
    private List<AirQualityForecast> forecast;
    private List<HistoricalAirQuality> historical;
    private HealthRecommendations healthRecommendations;

    // Sun and moon
    private SunMoon sunMoon;

    // Alerts
    private List<WeatherAlert> alerts;

    // Metadata
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastUpdated;
    private String dataSource;
    private boolean cached;

    // Nested classes
    public static class CurrentWeather {
        private double temperature;
        private double feelsLike;
        private int humidity;
        private double windSpeed;
        private double windDirection;
        private String windDirectionText;
        private double pressure;
        private double visibility;
        private int cloudCover;
        private double uvIndex;
        private String uvIndexText;
        private String weatherMain;
        private String weatherDescription;
        private String weatherIcon;
        private double dewPoint;
        private double rainfall;
        private double snowfall;

        // Getters and Setters
        public double getTemperature() { return temperature; }
        public void setTemperature(double temperature) { this.temperature = temperature; }

        public double getFeelsLike() { return feelsLike; }
        public void setFeelsLike(double feelsLike) { this.feelsLike = feelsLike; }

        public int getHumidity() { return humidity; }
        public void setHumidity(int humidity) { this.humidity = humidity; }

        public double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(double windSpeed) { this.windSpeed = windSpeed; }

        public double getWindDirection() { return windDirection; }
        public void setWindDirection(double windDirection) { this.windDirection = windDirection; }

        public String getWindDirectionText() { return windDirectionText; }
        public void setWindDirectionText(String windDirectionText) { this.windDirectionText = windDirectionText; }

        public double getPressure() { return pressure; }
        public void setPressure(double pressure) { this.pressure = pressure; }

        public double getVisibility() { return visibility; }
        public void setVisibility(double visibility) { this.visibility = visibility; }

        public int getCloudCover() { return cloudCover; }
        public void setCloudCover(int cloudCover) { this.cloudCover = cloudCover; }

        public double getUvIndex() { return uvIndex; }
        public void setUvIndex(double uvIndex) { this.uvIndex = uvIndex; }

        public String getUvIndexText() { return uvIndexText; }
        public void setUvIndexText(String uvIndexText) { this.uvIndexText = uvIndexText; }

        public String getWeatherMain() { return weatherMain; }
        public void setWeatherMain(String weatherMain) { this.weatherMain = weatherMain; }

        public String getWeatherDescription() { return weatherDescription; }
        public void setWeatherDescription(String weatherDescription) { this.weatherDescription = weatherDescription; }

        public String getWeatherIcon() { return weatherIcon; }
        public void setWeatherIcon(String weatherIcon) { this.weatherIcon = weatherIcon; }

        public double getDewPoint() { return dewPoint; }
        public void setDewPoint(double dewPoint) { this.dewPoint = dewPoint; }

        public double getRainfall() { return rainfall; }
        public void setRainfall(double rainfall) { this.rainfall = rainfall; }

        public double getSnowfall() { return snowfall; }
        public void setSnowfall(double snowfall) { this.snowfall = snowfall; }
    }

    public static class DailyForecast {
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDateTime date;
        private String dayName;
        private double minTemperature;
        private double maxTemperature;
        private String weatherMain;
        private String weatherDescription;
        private String weatherIcon;
        private int humidity;
        private double windSpeed;
        private double windDirection;
        private double pressure;
        private int cloudCover;
        private double uvIndex;
        private double rainfall;
        private double snowfall;
        private double precipitationProbability;

        // Getters and Setters
        public LocalDateTime getDate() { return date; }
        public void setDate(LocalDateTime date) { this.date = date; }

        public String getDayName() { return dayName; }
        public void setDayName(String dayName) { this.dayName = dayName; }

        public double getMinTemperature() { return minTemperature; }
        public void setMinTemperature(double minTemperature) { this.minTemperature = minTemperature; }

        public double getMaxTemperature() { return maxTemperature; }
        public void setMaxTemperature(double maxTemperature) { this.maxTemperature = maxTemperature; }

        public String getWeatherMain() { return weatherMain; }
        public void setWeatherMain(String weatherMain) { this.weatherMain = weatherMain; }

        public String getWeatherDescription() { return weatherDescription; }
        public void setWeatherDescription(String weatherDescription) { this.weatherDescription = weatherDescription; }

        public String getWeatherIcon() { return weatherIcon; }
        public void setWeatherIcon(String weatherIcon) { this.weatherIcon = weatherIcon; }

        public int getHumidity() { return humidity; }
        public void setHumidity(int humidity) { this.humidity = humidity; }

        public double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(double windSpeed) { this.windSpeed = windSpeed; }

        public double getWindDirection() { return windDirection; }
        public void setWindDirection(double windDirection) { this.windDirection = windDirection; }

        public double getPressure() { return pressure; }
        public void setPressure(double pressure) { this.pressure = pressure; }

        public int getCloudCover() { return cloudCover; }
        public void setCloudCover(int cloudCover) { this.cloudCover = cloudCover; }

        public double getUvIndex() { return uvIndex; }
        public void setUvIndex(double uvIndex) { this.uvIndex = uvIndex; }

        public double getRainfall() { return rainfall; }
        public void setRainfall(double rainfall) { this.rainfall = rainfall; }

        public double getSnowfall() { return snowfall; }
        public void setSnowfall(double snowfall) { this.snowfall = snowfall; }

        public double getPrecipitationProbability() { return precipitationProbability; }
        public void setPrecipitationProbability(double precipitationProbability) { this.precipitationProbability = precipitationProbability; }
    }

    public static class HourlyForecast {
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime dateTime;
        private double temperature;
        private double feelsLike;
        private String weatherMain;
        private String weatherDescription;
        private String weatherIcon;
        private int humidity;
        private double windSpeed;
        private double windDirection;
        private double pressure;
        private int cloudCover;
        private double uvIndex;
        private double rainfall;
        private double snowfall;
        private double precipitationProbability;

        // Getters and Setters
        public LocalDateTime getDateTime() { return dateTime; }
        public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

        public double getTemperature() { return temperature; }
        public void setTemperature(double temperature) { this.temperature = temperature; }

        public double getFeelsLike() { return feelsLike; }
        public void setFeelsLike(double feelsLike) { this.feelsLike = feelsLike; }

        public String getWeatherMain() { return weatherMain; }
        public void setWeatherMain(String weatherMain) { this.weatherMain = weatherMain; }

        public String getWeatherDescription() { return weatherDescription; }
        public void setWeatherDescription(String weatherDescription) { this.weatherDescription = weatherDescription; }

        public String getWeatherIcon() { return weatherIcon; }
        public void setWeatherIcon(String weatherIcon) { this.weatherIcon = weatherIcon; }

        public int getHumidity() { return humidity; }
        public void setHumidity(int humidity) { this.humidity = humidity; }

        public double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(double windSpeed) { this.windSpeed = windSpeed; }

        public double getWindDirection() { return windDirection; }
        public void setWindDirection(double windDirection) { this.windDirection = windDirection; }

        public double getPressure() { return pressure; }
        public void setPressure(double pressure) { this.pressure = pressure; }

        public int getCloudCover() { return cloudCover; }
        public void setCloudCover(int cloudCover) { this.cloudCover = cloudCover; }

        public double getUvIndex() { return uvIndex; }
        public void setUvIndex(double uvIndex) { this.uvIndex = uvIndex; }

        public double getRainfall() { return rainfall; }
        public void setRainfall(double rainfall) { this.rainfall = rainfall; }

        public double getSnowfall() { return snowfall; }
        public void setSnowfall(double snowfall) { this.snowfall = snowfall; }

        public double getPrecipitationProbability() { return precipitationProbability; }
        public void setPrecipitationProbability(double precipitationProbability) { this.precipitationProbability = precipitationProbability; }
    }

    public static class AirQuality {
        private int aqi;
        private String aqiText;
        private String aqiColor;
        private double co;
        private double no2;
        private double o3;
        private double so2;
        private double pm25;
        private double pm10;
        private String dominantPollutant;
        private String healthRecommendation;

        // Getters and Setters
        public int getAqi() { return aqi; }
        public void setAqi(int aqi) { this.aqi = aqi; }

        public String getAqiText() { return aqiText; }
        public void setAqiText(String aqiText) { this.aqiText = aqiText; }

        public String getAqiColor() { return aqiColor; }
        public void setAqiColor(String aqiColor) { this.aqiColor = aqiColor; }

        public double getCo() { return co; }
        public void setCo(double co) { this.co = co; }

        public double getNo2() { return no2; }
        public void setNo2(double no2) { this.no2 = no2; }

        public double getO3() { return o3; }
        public void setO3(double o3) { this.o3 = o3; }

        public double getSo2() { return so2; }
        public void setSo2(double so2) { this.so2 = so2; }

        public double getPm25() { return pm25; }
        public void setPm25(double pm25) { this.pm25 = pm25; }

        public double getPm10() { return pm10; }
        public void setPm10(double pm10) { this.pm10 = pm10; }

        public String getDominantPollutant() { return dominantPollutant; }
        public void setDominantPollutant(String dominantPollutant) { this.dominantPollutant = dominantPollutant; }

        public String getHealthRecommendation() { return healthRecommendation; }
        public void setHealthRecommendation(String healthRecommendation) { this.healthRecommendation = healthRecommendation; }
    }

    public static class HistoricalAirQuality {
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDateTime date;
        private int avgAqi;
        private int maxAqi;
        private int minAqi;
        private String dominantAqiCategory;

        // Average pollutant concentrations for the day
        private double avgCo;
        private double avgNo2;
        private double avgO3;
        private double avgSo2;
        private double avgPm25;
        private double avgPm10;

        // Getters and Setters
        public LocalDateTime getDate() { return date; }
        public void setDate(LocalDateTime date) { this.date = date; }

        public int getAvgAqi() { return avgAqi; }
        public void setAvgAqi(int avgAqi) { this.avgAqi = avgAqi; }

        public int getMaxAqi() { return maxAqi; }
        public void setMaxAqi(int maxAqi) { this.maxAqi = maxAqi; }

        public int getMinAqi() { return minAqi; }
        public void setMinAqi(int minAqi) { this.minAqi = minAqi; }

        public String getDominantAqiCategory() { return dominantAqiCategory; }
        public void setDominantAqiCategory(String dominantAqiCategory) { this.dominantAqiCategory = dominantAqiCategory; }

        public double getAvgCo() { return avgCo; }
        public void setAvgCo(double avgCo) { this.avgCo = avgCo; }

        public double getAvgNo2() { return avgNo2; }
        public void setAvgNo2(double avgNo2) { this.avgNo2 = avgNo2; }

        public double getAvgO3() { return avgO3; }
        public void setAvgO3(double avgO3) { this.avgO3 = avgO3; }

        public double getAvgSo2() { return avgSo2; }
        public void setAvgSo2(double avgSo2) { this.avgSo2 = avgSo2; }

        public double getAvgPm25() { return avgPm25; }
        public void setAvgPm25(double avgPm25) { this.avgPm25 = avgPm25; }

        public double getAvgPm10() { return avgPm10; }
        public void setAvgPm10(double avgPm10) { this.avgPm10 = avgPm10; }
    }

    public static class HealthRecommendations {
        private String generalRecommendation;
        private String sensitiveGroupRecommendation;
        private List<String> activities;
        private List<String> precautions;
        private Map<String, String> pollutantSpecificAdvice;
        private boolean maskRecommended;
        private boolean outdoorExerciseRecommended;
        private boolean windowsOpenRecommended;

        // Getters and Setters
        public String getGeneralRecommendation() { return generalRecommendation; }
        public void setGeneralRecommendation(String generalRecommendation) { this.generalRecommendation = generalRecommendation; }

        public String getSensitiveGroupRecommendation() { return sensitiveGroupRecommendation; }
        public void setSensitiveGroupRecommendation(String sensitiveGroupRecommendation) { this.sensitiveGroupRecommendation = sensitiveGroupRecommendation; }

        public List<String> getActivities() { return activities; }
        public void setActivities(List<String> activities) { this.activities = activities; }

        public List<String> getPrecautions() { return precautions; }
        public void setPrecautions(List<String> precautions) { this.precautions = precautions; }

        public Map<String, String> getPollutantSpecificAdvice() { return pollutantSpecificAdvice; }
        public void setPollutantSpecificAdvice(Map<String, String> pollutantSpecificAdvice) { this.pollutantSpecificAdvice = pollutantSpecificAdvice; }

        public boolean isMaskRecommended() { return maskRecommended; }
        public void setMaskRecommended(boolean maskRecommended) { this.maskRecommended = maskRecommended; }

        public boolean isOutdoorExerciseRecommended() { return outdoorExerciseRecommended; }
        public void setOutdoorExerciseRecommended(boolean outdoorExerciseRecommended) { this.outdoorExerciseRecommended = outdoorExerciseRecommended; }

        public boolean isWindowsOpenRecommended() { return windowsOpenRecommended; }
        public void setWindowsOpenRecommended(boolean windowsOpenRecommended) { this.windowsOpenRecommended = windowsOpenRecommended; }
    }

    // Main class getters and setters
    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }

    public String getCountryName() { return countryName; }
    public void setCountryName(String countryName) { this.countryName = countryName; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public LocalDateTime getLocalTime() { return localTime; }
    public void setLocalTime(LocalDateTime localTime) { this.localTime = localTime; }

    public CurrentWeather getCurrent() { return current; }
    public void setCurrent(CurrentWeather current) { this.current = current; }

    public List<DailyForecast> getDailyForecast() { return dailyForecast; }
    public void setDailyForecast(List<DailyForecast> dailyForecast) { this.dailyForecast = dailyForecast; }

    public List<HourlyForecast> getHourlyForecast() { return hourlyForecast; }
    public void setHourlyForecast(List<HourlyForecast> hourlyForecast) { this.hourlyForecast = hourlyForecast; }

    public AirQuality getAirQuality() { return airQuality; }
    public void setAirQuality(AirQuality airQuality) { this.airQuality = airQuality; }

    public CurrentAirQuality getCurrentAirQuality() { return currentAirQuality; }
    public void setCurrentAirQuality(CurrentAirQuality currentAirQuality) { this.currentAirQuality = currentAirQuality; }

    public List<AirQualityForecast> getForecast() { return forecast; }
    public void setForecast(List<AirQualityForecast> forecast) { this.forecast = forecast; }

    public List<HistoricalAirQuality> getHistorical() { return historical; }
    public void setHistorical(List<HistoricalAirQuality> historical) { this.historical = historical; }

    public HealthRecommendations getHealthRecommendations() { return healthRecommendations; }
    public void setHealthRecommendations(HealthRecommendations healthRecommendations) { this.healthRecommendations = healthRecommendations; }

    public SunMoon getSunMoon() { return sunMoon; }
    public void setSunMoon(SunMoon sunMoon) { this.sunMoon = sunMoon; }

    public List<WeatherAlert> getAlerts() { return alerts; }
    public void setAlerts(List<WeatherAlert> alerts) { this.alerts = alerts; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }

    public boolean isCached() { return cached; }
    public void setCached(boolean cached) { this.cached = cached; }
}