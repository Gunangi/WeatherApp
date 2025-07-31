// ForecastResponse.java
package com.example.weatherapp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;

public class ForecastResponse {

    // Location information
    private String cityName;
    private String countryCode;
    private String countryName;
    private double latitude;
    private double longitude;
    private String timezone;

    // Forecast data
    private List<DailyForecast> dailyForecast;
    private List<HourlyForecast> hourlyForecast;

    // Extended forecast (optional)
    private List<WeeklyForecast> weeklyForecast;

    // Metadata
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastUpdated;
    private String dataSource;
    private boolean cached;
    private int forecastDays;
    private int forecastHours;

    // Nested classes
    public static class DailyForecast {
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDateTime date;
        private String dayName;
        private double minTemperature;
        private double maxTemperature;
        private double avgTemperature;
        private String weatherMain;
        private String weatherDescription;
        private String weatherIcon;
        private int humidity;
        private double windSpeed;
        private double windDirection;
        private String windDirectionText;
        private double pressure;
        private int cloudCover;
        private double uvIndex;
        private String uvIndexText;
        private double rainfall;
        private double snowfall;
        private double precipitationProbability;
        private double dewPoint;

        // Sun and moon for the day
        @JsonFormat(pattern = "HH:mm:ss")
        private LocalDateTime sunrise;
        @JsonFormat(pattern = "HH:mm:ss")
        private LocalDateTime sunset;
        private String moonPhase;
        private double moonIllumination;

        // Getters and Setters
        public LocalDateTime getDate() { return date; }
        public void setDate(LocalDateTime date) { this.date = date; }

        public String getDayName() { return dayName; }
        public void setDayName(String dayName) { this.dayName = dayName; }

        public double getMinTemperature() { return minTemperature; }
        public void setMinTemperature(double minTemperature) { this.minTemperature = minTemperature; }

        public double getMaxTemperature() { return maxTemperature; }
        public void setMaxTemperature(double maxTemperature) { this.maxTemperature = maxTemperature; }

        public double getAvgTemperature() { return avgTemperature; }
        public void setAvgTemperature(double avgTemperature) { this.avgTemperature = avgTemperature; }

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

        public String getWindDirectionText() { return windDirectionText; }
        public void setWindDirectionText(String windDirectionText) { this.windDirectionText = windDirectionText; }

        public double getPressure() { return pressure; }
        public void setPressure(double pressure) { this.pressure = pressure; }

        public int getCloudCover() { return cloudCover; }
        public void setCloudCover(int cloudCover) { this.cloudCover = cloudCover; }

        public double getUvIndex() { return uvIndex; }
        public void setUvIndex(double uvIndex) { this.uvIndex = uvIndex; }

        public String getUvIndexText() { return uvIndexText; }
        public void setUvIndexText(String uvIndexText) { this.uvIndexText = uvIndexText; }

        public double getRainfall() { return rainfall; }
        public void setRainfall(double rainfall) { this.rainfall = rainfall; }

        public double getSnowfall() { return snowfall; }
        public void setSnowfall(double snowfall) { this.snowfall = snowfall; }

        public double getPrecipitationProbability() { return precipitationProbability; }
        public void setPrecipitationProbability(double precipitationProbability) { this.precipitationProbability = precipitationProbability; }

        public double getDewPoint() { return dewPoint; }
        public void setDewPoint(double dewPoint) { this.dewPoint = dewPoint; }

        public LocalDateTime getSunrise() { return sunrise; }
        public void setSunrise(LocalDateTime sunrise) { this.sunrise = sunrise; }

        public LocalDateTime getSunset() { return sunset; }
        public void setSunset(LocalDateTime sunset) { this.sunset = sunset; }

        public String getMoonPhase() { return moonPhase; }
        public void setMoonPhase(String moonPhase) { this.moonPhase = moonPhase; }

        public double getMoonIllumination() { return moonIllumination; }
        public void setMoonIllumination(double moonIllumination) { this.moonIllumination = moonIllumination; }
    }

    public static class HourlyForecast {
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime dateTime;
        private String timeText; // "3:00 PM", "15:00"
        private double temperature;
        private double feelsLike;
        private String weatherMain;
        private String weatherDescription;
        private String weatherIcon;
        private int humidity;
        private double windSpeed;
        private double windDirection;
        private String windDirectionText;
        private double pressure;
        private int cloudCover;
        private double uvIndex;
        private String uvIndexText;
        private double rainfall;
        private double snowfall;
        private double precipitationProbability;
        private double dewPoint;
        private double visibility;

        // Getters and Setters
        public LocalDateTime getDateTime() { return dateTime; }
        public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

        public String getTimeText() { return timeText; }
        public void setTimeText(String timeText) { this.timeText = timeText; }

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

        public String getWindDirectionText() { return windDirectionText; }
        public void setWindDirectionText(String windDirectionText) { this.windDirectionText = windDirectionText; }

        public double getPressure() { return pressure; }
        public void setPressure(double pressure) { this.pressure = pressure; }

        public int getCloudCover() { return cloudCover; }
        public void setCloudCover(int cloudCover) { this.cloudCover = cloudCover; }

        public double getUvIndex() { return uvIndex; }
        public void setUvIndex(double uvIndex) { this.uvIndex = uvIndex; }

        public String getUvIndexText() { return uvIndexText; }
        public void setUvIndexText(String uvIndexText) { this.uvIndexText = uvIndexText; }

        public double getRainfall() { return rainfall; }
        public void setRainfall(double rainfall) { this.rainfall = rainfall; }

        public double getSnowfall() { return snowfall; }
        public void setSnowfall(double snowfall) { this.snowfall = snowfall; }

        public double getPrecipitationProbability() { return precipitationProbability; }
        public void setPrecipitationProbability(double precipitationProbability) { this.precipitationProbability = precipitationProbability; }

        public double getDewPoint() { return dewPoint; }
        public void setDewPoint(double dewPoint) { this.dewPoint = dewPoint; }

        public double getVisibility() { return visibility; }
        public void setVisibility(double visibility) { this.visibility = visibility; }
    }

    public static class WeeklyForecast {
        private int weekNumber;
        private String weekRange; // "Dec 23 - Dec 29"
        private double avgMinTemperature;
        private double avgMaxTemperature;
        private double avgTemperature;
        private String dominantWeather;
        private String dominantWeatherIcon;
        private int avgHumidity;
        private double avgWindSpeed;
        private double totalRainfall;
        private double totalSnowfall;
        private int rainyDays;
        private int sunnyDays;
        private int cloudyDays;

        // Getters and Setters
        public int getWeekNumber() { return weekNumber; }
        public void setWeekNumber(int weekNumber) { this.weekNumber = weekNumber; }

        public String getWeekRange() { return weekRange; }
        public void setWeekRange(String weekRange) { this.weekRange = weekRange; }

        public double getAvgMinTemperature() { return avgMinTemperature; }
        public void setAvgMinTemperature(double avgMinTemperature) { this.avgMinTemperature = avgMinTemperature; }

        public double getAvgMaxTemperature() { return avgMaxTemperature; }
        public void setAvgMaxTemperature(double avgMaxTemperature) { this.avgMaxTemperature = avgMaxTemperature; }

        public double getAvgTemperature() { return avgTemperature; }
        public void setAvgTemperature(double avgTemperature) { this.avgTemperature = avgTemperature; }

        public String getDominantWeather() { return dominantWeather; }
        public void setDominantWeather(String dominantWeather) { this.dominantWeather = dominantWeather; }

        public String getDominantWeatherIcon() { return dominantWeatherIcon; }
        public void setDominantWeatherIcon(String dominantWeatherIcon) { this.dominantWeatherIcon = dominantWeatherIcon; }

        public int getAvgHumidity() { return avgHumidity; }
        public void setAvgHumidity(int avgHumidity) { this.avgHumidity = avgHumidity; }

        public double getAvgWindSpeed() { return avgWindSpeed; }
        public void setAvgWindSpeed(double avgWindSpeed) { this.avgWindSpeed = avgWindSpeed; }

        public double getTotalRainfall() { return totalRainfall; }
        public void setTotalRainfall(double totalRainfall) { this.totalRainfall = totalRainfall; }

        public double getTotalSnowfall() { return totalSnowfall; }
        public void setTotalSnowfall(double totalSnowfall) { this.totalSnowfall = totalSnowfall; }

        public int getRainyDays() { return rainyDays; }
        public void setRainyDays(int rainyDays) { this.rainyDays = rainyDays; }

        public int getSunnyDays() { return sunnyDays; }
        public void setSunnyDays(int sunnyDays) { this.sunnyDays = sunnyDays; }

        public int getCloudyDays() { return cloudyDays; }
        public void setCloudyDays(int cloudyDays) { this.cloudyDays = cloudyDays; }
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

    public List<DailyForecast> getDailyForecast() { return dailyForecast; }
    public void setDailyForecast(List<DailyForecast> dailyForecast) { this.dailyForecast = dailyForecast; }

    public List<HourlyForecast> getHourlyForecast() { return hourlyForecast; }
    public void setHourlyForecast(List<HourlyForecast> hourlyForecast) { this.hourlyForecast = hourlyForecast; }

    public List<WeeklyForecast> getWeeklyForecast() { return weeklyForecast; }
    public void setWeeklyForecast(List<WeeklyForecast> weeklyForecast) { this.weeklyForecast = weeklyForecast; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }

    public boolean isCached() { return cached; }
    public void setCached(boolean cached) { this.cached = cached; }

    public int getForecastDays() { return forecastDays; }
    public void setForecastDays(int forecastDays) { this.forecastDays = forecastDays; }

    public int getForecastHours() { return forecastHours; }
    public void setForecastHours(int forecastHours) { this.forecastHours = forecastHours; }
}
