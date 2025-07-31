// AirQualityResponse.java
package com.example.weatherapp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AirQualityResponse {

    // Location information
    private String cityName;
    private String countryCode;
    private String countryName;
    private double latitude;
    private double longitude;
    private String timezone;

    // Current air quality
    private CurrentAirQuality current;

    // Forecast air quality
    private List<AirQualityForecast> forecast;

    // Historical air quality (optional)
    private List<HistoricalAirQuality> historical;

    // Health recommendations
    private HealthRecommendations healthRecommendations;

    // Metadata
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastUpdated;
    private String dataSource;
    private boolean cached;

    // Nested classes
    public static class CurrentAirQuality {
        private int aqi;
        private String aqiText; // "Good", "Moderate", "Unhealthy for Sensitive Groups", etc.
        private String aqiColor; // "#00E400", "#FFFF00", "#FF7E00", etc.
        private String aqiCategory; // "good", "moderate", "unhealthy_sensitive", etc.

        // Pollutant concentrations (μg/m³)
        private double co; // Carbon Monoxide
        private double no2; // Nitrogen Dioxide
        private double o3; // Ozone
        private double so2; // Sulfur Dioxide
        private double pm25; // PM2.5
        private double pm10; // PM10
        private double nh3; // Ammonia (optional)

        // Individual pollutant AQI values
        private int coAqi;
        private int no2Aqi;
        private int o3Aqi;
        private int so2Aqi;
        private int pm25Aqi;
        private int pm10Aqi;

        // Dominant pollutant
        private String dominantPollutant;
        private String dominantPollutantText;

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime measurementTime;

        // Getters and Setters
        public int getAqi() { return aqi; }
        public void setAqi(int aqi) { this.aqi = aqi; }

        public String getAqiText() { return aqiText; }
        public void setAqiText(String aqiText) { this.aqiText = aqiText; }

        public String getAqiColor() { return aqiColor; }
        public void setAqiColor(String aqiColor) { this.aqiColor = aqiColor; }

        public String getAqiCategory() { return aqiCategory; }
        public void setAqiCategory(String aqiCategory) { this.aqiCategory = aqiCategory; }

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

        public double getNh3() { return nh3; }
        public void setNh3(double nh3) { this.nh3 = nh3; }

        public int getCoAqi() { return coAqi; }
        public void setCoAqi(int coAqi) { this.coAqi = coAqi; }

        public int getNo2Aqi() { return no2Aqi; }
        public void setNo2Aqi(int no2Aqi) { this.no2Aqi = no2Aqi; }

        public int getO3Aqi() { return o3Aqi; }
        public void setO3Aqi(int o3Aqi) { this.o3Aqi = o3Aqi; }

        public int getSo2Aqi() { return so2Aqi; }
        public void setSo2Aqi(int so2Aqi) { this.so2Aqi = so2Aqi; }

        public int getPm25Aqi() { return pm25Aqi; }
        public void setPm25Aqi(int pm25Aqi) { this.pm25Aqi = pm25Aqi; }

        public int getPm10Aqi() { return pm10Aqi; }
        public void setPm10Aqi(int pm10Aqi) { this.pm10Aqi = pm10Aqi; }

        public String getDominantPollutant() { return dominantPollutant; }
        public void setDominantPollutant(String dominantPollutant) { this.dominantPollutant = dominantPollutant; }

        public String getDominantPollutantText() { return dominantPollutantText; }
        public void setDominantPollutantText(String dominantPollutantText) { this.dominantPollutantText = dominantPollutantText; }

        public LocalDateTime getMeasurementTime() { return measurementTime; }
        public void setMeasurementTime(LocalDateTime measurementTime) { this.measurementTime = measurementTime; }
    }

    public static class AirQualityForecast {
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime dateTime;
        private String timeText;
        private int aqi;
        private String aqiText;
        private String aqiColor;
        private String aqiCategory;

        // Pollutant concentrations
        private double co;
        private double no2;
        private double o3;
        private double so2;
        private double pm25;
        private double pm10;

        private String dominantPollutant;

        // Getters and Setters
        public LocalDateTime getDateTime() { return dateTime; }
        public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

        public String getTimeText() { return timeText; }
        public void setTimeText(String timeText) { this.timeText = timeText; }

        public int getAqi() { return aqi; }
        public void setAqi(int aqi) { this.aqi = aqi; }

        public String getAqiText() { return aqiText; }
        public void setAqiText(String aqiText) { this.aqiText = aqiText; }

        public String getAqiColor() { return aqiColor; }
        public void setAqiColor(String aqiColor) { this.aqiColor = aqiColor; }

        public String getAqiCategory() { return aqiCategory; }
        public void setAqiCategory(String aqiCategory) { this.aqiCategory = aqiCategory; }

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
    }

    public static class HistoricalAirQuality {
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDateTime date;
        private String dayName;
        private int avgAqi;
        private int maxAqi;
        private int minAqi;
        private String dominantAqiCategory;
        private String dominantAqiText;
        private String dominantAqiColor;

        // Average pollutant concentrations for the day
        private double avgCo;
        private double avgNo2;
        private double avgO3;
        private double avgSo2;
        private double avgPm25;
        private double avgPm10;

        // Peak pollutant concentrations for the day
        private double maxCo;
        private double maxNo2;
        private double maxO3;
        private double maxSo2;
        private double maxPm25;
        private double maxPm10;

        // Minimum pollutant concentrations for the day
        private double minCo;
        private double minNo2;
        private double minO3;
        private double minSo2;
        private double minPm25;
        private double minPm10;

        // Hours of different AQI categories
        private int goodHours;
        private int moderateHours;
        private int unhealthySensitiveHours;
        private int unhealthyHours;
        private int veryUnhealthyHours;
        private int hazardousHours;

        // Getters and Setters
        public LocalDateTime getDate() { return date; }
        public void setDate(LocalDateTime date) { this.date = date; }

        public String getDayName() { return dayName; }
        public void setDayName(String dayName) { this.dayName = dayName; }

        public int getAvgAqi() { return avgAqi; }
        public void setAvgAqi(int avgAqi) { this.avgAqi = avgAqi; }

        public int getMaxAqi() { return maxAqi; }
        public void setMaxAqi(int maxAqi) { this.maxAqi = maxAqi; }

        public int getMinAqi() { return minAqi; }
        public void setMinAqi(int minAqi) { this.minAqi = minAqi; }

        public String getDominantAqiCategory() { return dominantAqiCategory; }
        public void setDominantAqiCategory(String dominantAqiCategory) { this.dominantAqiCategory = dominantAqiCategory; }

        public String getDominantAqiText() { return dominantAqiText; }
        public void setDominantAqiText(String dominantAqiText) { this.dominantAqiText = dominantAqiText; }

        public String getDominantAqiColor() { return dominantAqiColor; }
        public void setDominantAqiColor(String dominantAqiColor) { this.dominantAqiColor = dominantAqiColor; }

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

        public double getMaxCo() { return maxCo; }
        public void setMaxCo(double maxCo) { this.maxCo = maxCo; }

        public double getMaxNo2() { return maxNo2; }
        public void setMaxNo2(double maxNo2) { this.maxNo2 = maxNo2; }

        public double getMaxO3() { return maxO3; }
        public void setMaxO3(double maxO3) { this.maxO3 = maxO3; }

        public double getMaxSo2() { return maxSo2; }
        public void setMaxSo2(double maxSo2) { this.maxSo2 = maxSo2; }

        public double getMaxPm25() { return maxPm25; }
        public void setMaxPm25(double maxPm25) { this.maxPm25 = maxPm25; }

        public double getMaxPm10() { return maxPm10; }
        public void setMaxPm10(double maxPm10) { this.maxPm10 = maxPm10; }

        public double getMinCo() { return minCo; }
        public void setMinCo(double minCo) { this.minCo = minCo; }

        public double getMinNo2() { return minNo2; }
        public void setMinNo2(double minNo2) { this.minNo2 = minNo2; }

        public double getMinO3() { return minO3; }
        public void setMinO3(double minO3) { this.minO3 = minO3; }

        public double getMinSo2() { return minSo2; }
        public void setMinSo2(double minSo2) { this.minSo2 = minSo2; }

        public double getMinPm25() { return minPm25; }
        public void setMinPm25(double minPm25) { this.minPm25 = minPm25; }

        public double getMinPm10() { return minPm10; }
        public void setMinPm10(double minPm10) { this.minPm10 = minPm10; }

        public int getGoodHours() { return goodHours; }
        public void setGoodHours(int goodHours) { this.goodHours = goodHours; }

        public int getModerateHours() { return moderateHours; }
        public void setModerateHours(int moderateHours) { this.moderateHours = moderateHours; }

        public int getUnhealthySensitiveHours() { return unhealthySensitiveHours; }
        public void setUnhealthySensitiveHours(int unhealthySensitiveHours) { this.unhealthySensitiveHours = unhealthySensitiveHours; }

        public int getUnhealthyHours() { return unhealthyHours; }
        public void setUnhealthyHours(int unhealthyHours) { this.unhealthyHours = unhealthyHours; }

        public int getVeryUnhealthyHours() { return veryUnhealthyHours; }
        public void setVeryUnhealthyHours(int veryUnhealthyHours) { this.veryUnhealthyHours = veryUnhealthyHours; }

        public int getHazardousHours() { return hazardousHours; }
        public void setHazardousHours(int hazardousHours) { this.hazardousHours = hazardousHours; }
    }

    public static class HealthRecommendations {
        private String generalRecommendation;
        private String sensitiveGroupRecommendation;
        private String childrenRecommendation;
        private String elderlyRecommendation;
        private String pregnantWomenRecommendation;
        private String asthmaticRecommendation;

        private List<String> recommendedActivities;
        private List<String> activitiesToAvoid;
        private List<String> generalPrecautions;
        private List<String> sensitivePrecautions;

        private Map<String, String> pollutantSpecificAdvice;

        // Specific recommendations
        private boolean maskRecommended;
        private String maskType; // "N95", "surgical", "cloth", "none"
        private boolean outdoorExerciseRecommended;
        private String exerciseRecommendation; // "recommended", "limit", "avoid"
        private boolean windowsOpenRecommended;
        private boolean airPurifierRecommended;

        // Activity recommendations
        private boolean walkingRecommended;
        private boolean joggingRecommended;
        private boolean cyclingRecommended;
        private boolean outdoorSportsRecommended;
        private boolean gardening;

        // Time-based recommendations
        private List<String> bestTimesForOutdoorActivities;
        private List<String> timesToAvoidOutdoorActivities;

        // Health impact indicators
        private String eyeIrritation;
        private String respiratoryImpact;
        private String cardiovascularImpact;
        private String overallHealthRisk;

        // Getters and Setters
        public String getGeneralRecommendation() { return generalRecommendation; }
        public void setGeneralRecommendation(String generalRecommendation) { this.generalRecommendation = generalRecommendation; }

        public String getSensitiveGroupRecommendation() { return sensitiveGroupRecommendation; }
        public void setSensitiveGroupRecommendation(String sensitiveGroupRecommendation) { this.sensitiveGroupRecommendation = sensitiveGroupRecommendation; }

        public String getChildrenRecommendation() { return childrenRecommendation; }
        public void setChildrenRecommendation(String childrenRecommendation) { this.childrenRecommendation = childrenRecommendation; }

        public String getElderlyRecommendation() { return elderlyRecommendation; }
        public void setElderlyRecommendation(String elderlyRecommendation) { this.elderlyRecommendation = elderlyRecommendation; }

        public String getPregnantWomenRecommendation() { return pregnantWomenRecommendation; }
        public void setPregnantWomenRecommendation(String pregnantWomenRecommendation) { this.pregnantWomenRecommendation = pregnantWomenRecommendation; }

        public String getAsthmaticRecommendation() { return asthmaticRecommendation; }
        public void setAsthmaticRecommendation(String asthmaticRecommendation) { this.asthmaticRecommendation = asthmaticRecommendation; }

        public List<String> getRecommendedActivities() { return recommendedActivities; }
        public void setRecommendedActivities(List<String> recommendedActivities) { this.recommendedActivities = recommendedActivities; }

        public List<String> getActivitiesToAvoid() { return activitiesToAvoid; }
        public void setActivitiesToAvoid(List<String> activitiesToAvoid) { this.activitiesToAvoid = activitiesToAvoid; }

        public List<String> getGeneralPrecautions() { return generalPrecautions; }
        public void setGeneralPrecautions(List<String> generalPrecautions) { this.generalPrecautions = generalPrecautions; }

        public List<String> getSensitivePrecautions() { return sensitivePrecautions; }
        public void setSensitivePrecautions(List<String> sensitivePrecautions) { this.sensitivePrecautions = sensitivePrecautions; }

        public Map<String, String> getPollutantSpecificAdvice() { return pollutantSpecificAdvice; }
        public void setPollutantSpecificAdvice(Map<String, String> pollutantSpecificAdvice) { this.pollutantSpecificAdvice = pollutantSpecificAdvice; }

        public boolean isMaskRecommended() { return maskRecommended; }
        public void setMaskRecommended(boolean maskRecommended) { this.maskRecommended = maskRecommended; }

        public String getMaskType() { return maskType; }
        public void setMaskType(String maskType) { this.maskType = maskType; }

        public boolean isOutdoorExerciseRecommended() { return outdoorExerciseRecommended; }
        public void setOutdoorExerciseRecommended(boolean outdoorExerciseRecommended) { this.outdoorExerciseRecommended = outdoorExerciseRecommended; }

        public String getExerciseRecommendation() { return exerciseRecommendation; }
        public void setExerciseRecommendation(String exerciseRecommendation) { this.exerciseRecommendation = exerciseRecommendation; }

        public boolean isWindowsOpenRecommended() { return windowsOpenRecommended; }
        public void setWindowsOpenRecommended(boolean windowsOpenRecommended) { this.windowsOpenRecommended = windowsOpenRecommended; }

        public boolean isAirPurifierRecommended() { return airPurifierRecommended; }
        public void setAirPurifierRecommended(boolean airPurifierRecommended) { this.airPurifierRecommended = airPurifierRecommended; }

        public boolean isWalkingRecommended() { return walkingRecommended; }
        public void setWalkingRecommended(boolean walkingRecommended) { this.walkingRecommended = walkingRecommended; }

        public boolean isJoggingRecommended() { return joggingRecommended; }
        public void setJoggingRecommended(boolean joggingRecommended) { this.joggingRecommended = joggingRecommended; }

        public boolean isCyclingRecommended() { return cyclingRecommended; }
        public void setCyclingRecommended(boolean cyclingRecommended) { this.cyclingRecommended = cyclingRecommended; }

        public boolean isOutdoorSportsRecommended() { return outdoorSportsRecommended; }
        public void setOutdoorSportsRecommended(boolean outdoorSportsRecommended) { this.outdoorSportsRecommended = outdoorSportsRecommended; }

        public boolean isGardening() { return gardening; }
        public void setGardening(boolean gardening) { this.gardening = gardening; }

        public List<String> getBestTimesForOutdoorActivities() { return bestTimesForOutdoorActivities; }
        public void setBestTimesForOutdoorActivities(List<String> bestTimesForOutdoorActivities) { this.bestTimesForOutdoorActivities = bestTimesForOutdoorActivities; }

        public List<String> getTimesToAvoidOutdoorActivities() { return timesToAvoidOutdoorActivities; }
        public void setTimesToAvoidOutdoorActivities(List<String> timesToAvoidOutdoorActivities) { this.timesToAvoidOutdoorActivities = timesToAvoidOutdoorActivities; }

        public String getEyeIrritation() { return eyeIrritation; }
        public void setEyeIrritation(String eyeIrritation) { this.eyeIrritation = eyeIrritation; }

        public String getRespiratoryImpact() { return respiratoryImpact; }
        public void setRespiratoryImpact(String respiratoryImpact) { this.respiratoryImpact = respiratoryImpact; }

        public String getCardiovascularImpact() { return cardiovascularImpact; }
        public void setCardiovascularImpact(String cardiovascularImpact) { this.cardiovascularImpact = cardiovascularImpact; }

        public String getOverallHealthRisk() { return overallHealthRisk; }
        public void setOverallHealthRisk(String overallHealthRisk) { this.overallHealthRisk = overallHealthRisk; }
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

    public CurrentAirQuality getCurrent() { return current; }
    public void setCurrent(CurrentAirQuality current) { this.current = current; }

    public List<AirQualityForecast> getForecast() { return forecast; }
    public void setForecast(List<AirQualityForecast> forecast) { this.forecast = forecast; }

    public List<HistoricalAirQuality> getHistorical() { return historical; }
    public void setHistorical(List<HistoricalAirQuality> historical) { this.historical = historical; }

    public HealthRecommendations getHealthRecommendations() { return healthRecommendations; }
    public void setHealthRecommendations(HealthRecommendations healthRecommendations) { this.healthRecommendations = healthRecommendations; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }

    public boolean isCached() { return cached; }
    public void setCached(boolean cached) { this.cached = cached; }

    // Utility methods
    public boolean hasGoodAirQuality() {
        return current != null && current.getAqi() <= 50;
    }

    public boolean hasModerateAirQuality() {
        return current != null && current.getAqi() > 50 && current.getAqi() <= 100;
    }

    public boolean hasUnhealthyAirQuality() {
        return current != null && current.getAqi() > 100;
    }

    public boolean hasHazardousAirQuality() {
        return current != null && current.getAqi() > 300;
    }

    public boolean isHighPm25() {
        return current != null && current.getPm25() > 35.4;
    }

    public boolean isHighPm10() {
        return current != null && current.getPm10() > 154;
    }

    public String getAirQualityTrend() {
        if (forecast == null || forecast.size() < 2) {
            return "stable";
        }

        int currentAqi = current != null ? current.getAqi() : 0;
        int nextAqi = forecast.get(0).getAqi();

        if (nextAqi > currentAqi + 10) {
            return "worsening";
        } else if (nextAqi < currentAqi - 10) {
            return "improving";
        } else {
            return "stable";
        }
    }

    @Override
    public String toString() {
        return "AirQualityResponse{" +
                "cityName='" + cityName + '\'' +
                ", countryCode='" + countryCode + '\'' +
                ", aqi=" + (current != null ? current.getAqi() : "N/A") +
                ", aqiText='" + (current != null ? current.getAqiText() : "N/A") + '\'' +
                ", lastUpdated=" + lastUpdated +
                '}';
    }
}