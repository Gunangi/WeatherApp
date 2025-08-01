package com.example.weatherapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Data Transfer Object for travel weather planning
 * Used for planning trips with weather forecasts across multiple destinations
 */
public class TravelPlannerDto {

    @JsonProperty("id")
    private String id;

    @NotBlank(message = "Trip name cannot be blank")
    @Size(min = 1, max = 100, message = "Trip name must be between 1 and 100 characters")
    @JsonProperty("tripName")
    private String tripName;

    @JsonProperty("description")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Start date cannot be null")
    @Future(message = "Start date must be in the future")
    @JsonProperty("startDate")
    private LocalDate startDate;

    @NotNull(message = "End date cannot be null")
    @JsonProperty("endDate")
    private LocalDate endDate;

    @NotEmpty(message = "At least one destination must be provided")
    @Size(min = 1, max = 20, message = "Trip can include between 1 and 20 destinations")
    @Valid
    @JsonProperty("destinations")
    private List<TravelDestination> destinations;

    @JsonProperty("travelType")
    private TravelType travelType;

    @JsonProperty("activities")
    private List<String> activities;

    @JsonProperty("weatherSummary")
    private TravelWeatherSummary weatherSummary;

    @JsonProperty("packingRecommendations")
    private PackingRecommendations packingRecommendations;

    @JsonProperty("weatherAlerts")
    private List<String> weatherAlerts;

    @JsonProperty("bestTravelDays")
    private List<LocalDate> bestTravelDays;

    @JsonProperty("worstTravelDays")
    private List<LocalDate> worstTravelDays;

    @JsonProperty("temperatureUnit")
    private String temperatureUnit;

    @JsonProperty("windSpeedUnit")
    private String windSpeedUnit;

    @JsonProperty("precipitationUnit")
    private String precipitationUnit;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    @JsonProperty("userId")
    private String userId;

    @JsonProperty("isPublic")
    private Boolean isPublic;

    // Default constructor
    public TravelPlannerDto() {
        this.destinations = new ArrayList<>();
        this.activities = new ArrayList<>();
        this.weatherAlerts = new ArrayList<>();
        this.bestTravelDays = new ArrayList<>();
        this.worstTravelDays = new ArrayList<>();
        this.temperatureUnit = "CELSIUS";
        this.windSpeedUnit = "MS";
        this.precipitationUnit = "MM";
        this.travelType = TravelType.LEISURE;
        this.isPublic = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor with essential fields
    public TravelPlannerDto(String tripName, LocalDate startDate, LocalDate endDate) {
        this();
        this.tripName = tripName;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Inner class for travel destinations
    public static class TravelDestination {
        @NotNull(message = "Location cannot be null")
        @Valid
        @JsonProperty("location")
        private LocationDto location;

        @NotNull(message = "Arrival date cannot be null")
        @JsonProperty("arrivalDate")
        private LocalDate arrivalDate;

        @NotNull(message = "Departure date cannot be null")
        @JsonProperty("departureDate")
        private LocalDate departureDate;

        @JsonProperty("accommodation")
        @Size(max = 200, message = "Accommodation details cannot exceed 200 characters")
        private String accommodation;

        @JsonProperty("plannedActivities")
        private List<String> plannedActivities;

        @JsonProperty("dailyForecasts")
        private List<DailyTravelForecast> dailyForecasts;

        @JsonProperty("weatherScore")
        private Double weatherScore;

        @JsonProperty("recommendations")
        private List<String> recommendations;

        @JsonProperty("priority")
        private Integer priority;

        @JsonProperty("notes")
        @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
        private String notes;

        // Default constructor
        public TravelDestination() {
            this.plannedActivities = new ArrayList<>();
            this.dailyForecasts = new ArrayList<>();
            this.recommendations = new ArrayList<>();
            this.priority = 1;
        }

        // Constructor with essential fields
        public TravelDestination(LocationDto location, LocalDate arrivalDate, LocalDate departureDate) {
            this();
            this.location = location;
            this.arrivalDate = arrivalDate;
            this.departureDate = departureDate;
        }

        // Getters and Setters
        public LocationDto getLocation() { return location; }
        public void setLocation(LocationDto location) { this.location = location; }

        public LocalDate getArrivalDate() { return arrivalDate; }
        public void setArrivalDate(LocalDate arrivalDate) { this.arrivalDate = arrivalDate; }

        public LocalDate getDepartureDate() { return departureDate; }
        public void setDepartureDate(LocalDate departureDate) { this.departureDate = departureDate; }

        public String getAccommodation() { return accommodation; }
        public void setAccommodation(String accommodation) { this.accommodation = accommodation; }

        public List<String> getPlannedActivities() { return plannedActivities; }
        public void setPlannedActivities(List<String> plannedActivities) { this.plannedActivities = plannedActivities; }

        public List<DailyTravelForecast> getDailyForecasts() { return dailyForecasts; }
        public void setDailyForecasts(List<DailyTravelForecast> dailyForecasts) { this.dailyForecasts = dailyForecasts; }

        public Double getWeatherScore() { return weatherScore; }
        public void setWeatherScore(Double weatherScore) { this.weatherScore = weatherScore; }

        public List<String> getRecommendations() { return recommendations; }
        public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

        public Integer getPriority() { return priority; }
        public void setPriority(Integer priority) { this.priority = priority; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    // Inner class for daily travel forecast
    public static class DailyTravelForecast {
        @JsonProperty("date")
        private LocalDate date;

        @JsonProperty("maxTemperature")
        private Double maxTemperature;

        @JsonProperty("minTemperature")
        private Double minTemperature;

        @JsonProperty("condition")
        private String condition;

        @JsonProperty("conditionCode")
        private String conditionCode;

        @JsonProperty("humidity")
        private Integer humidity;

        @JsonProperty("windSpeed")
        private Double windSpeed;

        @JsonProperty("precipitation")
        private Double precipitation;

        @JsonProperty("precipitationChance")
        private Integer precipitationChance;

        @JsonProperty("uvIndex")
        private Double uvIndex;

        @JsonProperty("visibility")
        private Double visibility;

        @JsonProperty("sunrise")
        private LocalDateTime sunrise;

        @JsonProperty("sunset")
        private LocalDateTime sunset;

        @JsonProperty("moonPhase")
        private String moonPhase;

        @JsonProperty("suitableActivities")
        private List<String> suitableActivities;

        @JsonProperty("weatherScore")
        private Double weatherScore;

        @JsonProperty("warnings")
        private List<String> warnings;

        // Default constructor
        public DailyTravelForecast() {
            this.suitableActivities = new ArrayList<>();
            this.warnings = new ArrayList<>();
        }

        // Getters and Setters
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public Double getMaxTemperature() { return maxTemperature; }
        public void setMaxTemperature(Double maxTemperature) { this.maxTemperature = maxTemperature; }

        public Double getMinTemperature() { return minTemperature; }
        public void setMinTemperature(Double minTemperature) { this.minTemperature = minTemperature; }

        public String getCondition() { return condition; }
        public void setCondition(String condition) { this.condition = condition; }

        public String getConditionCode() { return conditionCode; }
        public void setConditionCode(String conditionCode) { this.conditionCode = conditionCode; }

        public Integer getHumidity() { return humidity; }
        public void setHumidity(Integer humidity) { this.humidity = humidity; }

        public Double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }

        public Double getPrecipitation() { return precipitation; }
        public void setPrecipitation(Double precipitation) { this.precipitation = precipitation; }

        public Integer getPrecipitationChance() { return precipitationChance; }
        public void setPrecipitationChance(Integer precipitationChance) { this.precipitationChance = precipitationChance; }

        public Double getUvIndex() { return uvIndex; }
        public void setUvIndex(Double uvIndex) { this.uvIndex = uvIndex; }

        public Double getVisibility() { return visibility; }
        public void setVisibility(Double visibility) { this.visibility = visibility; }

        public LocalDateTime getSunrise() { return sunrise; }
        public void setSunrise(LocalDateTime sunrise) { this.sunrise = sunrise; }

        public LocalDateTime getSunset() { return sunset; }
        public void setSunset(LocalDateTime sunset) { this.sunset = sunset; }

        public String getMoonPhase() { return moonPhase; }
        public void setMoonPhase(String moonPhase) { this.moonPhase = moonPhase; }

        public List<String> getSuitableActivities() { return suitableActivities; }
        public void setSuitableActivities(List<String> suitableActivities) { this.suitableActivities = suitableActivities; }

        public Double getWeatherScore() { return weatherScore; }
        public void setWeatherScore(Double weatherScore) { this.weatherScore = weatherScore; }

        public List<String> getWarnings() { return warnings; }
        public void setWarnings(List<String> warnings) { this.warnings = warnings; }
    }

    // Inner class for travel weather summary
    public static class TravelWeatherSummary {
        @JsonProperty("averageTemperature")
        private Double averageTemperature;

        @JsonProperty("temperatureRange")
        private Double temperatureRange;

        @JsonProperty("rainyDaysCount")
        private Integer rainyDaysCount;

        @JsonProperty("sunnyDaysCount")
        private Integer sunnyDaysCount;

        @JsonProperty("mostCommonCondition")
        private String mostCommonCondition;

        @JsonProperty("extremeWeatherDays")
        private Integer extremeWeatherDays;

        @JsonProperty("overallWeatherScore")
        private Double overallWeatherScore;

        @JsonProperty("bestDestination")
        private String bestDestination;

        @JsonProperty("worstDestination")
        private String worstDestination;

        @JsonProperty("totalPrecipitation")
        private Double totalPrecipitation;

        @JsonProperty("averageHumidity")
        private Double averageHumidity;

        @JsonProperty("averageWindSpeed")
        private Double averageWindSpeed;

        // Getters and Setters
        public Double getAverageTemperature() { return averageTemperature; }
        public void setAverageTemperature(Double averageTemperature) { this.averageTemperature = averageTemperature; }

        public Double getTemperatureRange() { return temperatureRange; }
        public void setTemperatureRange(Double temperatureRange) { this.temperatureRange = temperatureRange; }

        public Integer getRainyDaysCount() { return rainyDaysCount; }
        public void setRainyDaysCount(Integer rainyDaysCount) { this.rainyDaysCount = rainyDaysCount; }

        public Integer getSunnyDaysCount() { return sunnyDaysCount; }
        public void setSunnyDaysCount(Integer sunnyDaysCount) { this.sunnyDaysCount = sunnyDaysCount; }

        public String getMostCommonCondition() { return mostCommonCondition; }
        public void setMostCommonCondition(String mostCommonCondition) { this.mostCommonCondition = mostCommonCondition; }

        public Integer getExtremeWeatherDays() { return extremeWeatherDays; }
        public void setExtremeWeatherDays(Integer extremeWeatherDays) { this.extremeWeatherDays = extremeWeatherDays; }

        public Double getOverallWeatherScore() { return overallWeatherScore; }
        public void setOverallWeatherScore(Double overallWeatherScore) { this.overallWeatherScore = overallWeatherScore; }

        public String getBestDestination() { return bestDestination; }
        public void setBestDestination(String bestDestination) { this.bestDestination = bestDestination; }

        public String getWorstDestination() { return worstDestination; }
        public void setWorstDestination(String worstDestination) { this.worstDestination = worstDestination; }

        public Double getTotalPrecipitation() { return totalPrecipitation; }
        public void setTotalPrecipitation(Double totalPrecipitation) { this.totalPrecipitation = totalPrecipitation; }

        public Double getAverageHumidity() { return averageHumidity; }
        public void setAverageHumidity(Double averageHumidity) { this.averageHumidity = averageHumidity; }

        public Double getAverageWindSpeed() { return averageWindSpeed; }
        public void setAverageWindSpeed(Double averageWindSpeed) { this.averageWindSpeed = averageWindSpeed; }
    }

    // Inner class for packing recommendations
    public static class PackingRecommendations {
        @JsonProperty("clothing")
        private List<String> clothing;

        @JsonProperty("accessories")
        private List<String> accessories;

        @JsonProperty("weatherGear")
        private List<String> weatherGear;

        @JsonProperty("footwear")
        private List<String> footwear;

        @JsonProperty("electronics")
        private List<String> electronics;

        @JsonProperty("healthAndSafety")
        private List<String> healthAndSafety;

        @JsonProperty("specialItems")
        private List<String> specialItems;

        // Default constructor
        public PackingRecommendations() {
            this.clothing = new ArrayList<>();
            this.accessories = new ArrayList<>();
            this.weatherGear = new ArrayList<>();
            this.footwear = new ArrayList<>();
            this.electronics = new ArrayList<>();
            this.healthAndSafety = new ArrayList<>();
            this.specialItems = new ArrayList<>();
        }

        // Getters and Setters
        public List<String> getClothing() { return clothing; }
        public void setClothing(List<String> clothing) { this.clothing = clothing; }

        public List<String> getAccessories() { return accessories; }
        public void setAccessories(List<String> accessories) { this.accessories = accessories; }

        public List<String> getWeatherGear() { return weatherGear; }
        public void setWeatherGear(List<String> weatherGear) { this.weatherGear = weatherGear; }

        public List<String> getFootwear() { return footwear; }
        public void setFootwear(List<String> footwear) { this.footwear = footwear; }

        public List<String> getElectronics() { return electronics; }
        public void setElectronics(List<String> electronics) { this.electronics = electronics; }

        public List<String> getHealthAndSafety() { return healthAndSafety; }
        public void setHealthAndSafety(List<String> healthAndSafety) { this.healthAndSafety = healthAndSafety; }

        public List<String> getSpecialItems() { return specialItems; }
        public void setSpecialItems(List<String> specialItems) { this.specialItems = specialItems; }
    }

    // Enum for travel types
    public enum TravelType {
        LEISURE, BUSINESS, ADVENTURE, FAMILY, ROMANTIC, CULTURAL, SPORTS, MEDICAL
    }

    // Main class getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTripName() { return tripName; }
    public void setTripName(String tripName) { this.tripName = tripName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public List<TravelDestination> getDestinations() { return destinations; }
    public void setDestinations(List<TravelDestination> destinations) { this.destinations = destinations; }

    public TravelType getTravelType() { return travelType; }
    public void setTravelType(TravelType travelType) { this.travelType = travelType; }

    public List<String> getActivities() { return activities; }
    public void setActivities(List<String> activities) { this.activities = activities; }

    public TravelWeatherSummary getWeatherSummary() { return weatherSummary; }
    public void setWeatherSummary(TravelWeatherSummary weatherSummary) { this.weatherSummary = weatherSummary; }

    public PackingRecommendations getPackingRecommendations() { return packingRecommendations; }
    public void setPackingRecommendations(PackingRecommendations packingRecommendations) { this.packingRecommendations = packingRecommendations; }

    public List<String> getWeatherAlerts() { return weatherAlerts; }
    public void setWeatherAlerts(List<String> weatherAlerts) { this.weatherAlerts = weatherAlerts; }

    public List<LocalDate> getBestTravelDays() { return bestTravelDays; }
    public void setBestTravelDays(List<LocalDate> bestTravelDays) { this.bestTravelDays = bestTravelDays; }

    public List<LocalDate> getWorstTravelDays() { return worstTravelDays; }
    public void setWorstTravelDays(List<LocalDate> worstTravelDays) { this.worstTravelDays = worstTravelDays; }

    public String getTemperatureUnit() { return temperatureUnit; }
    public void setTemperatureUnit(String temperatureUnit) { this.temperatureUnit = temperatureUnit; }

    public String getWindSpeedUnit() { return windSpeedUnit; }
    public void setWindSpeedUnit(String windSpeedUnit) { this.windSpeedUnit = windSpeedUnit; }

    public String getPrecipitationUnit() { return precipitationUnit; }
    public void setPrecipitationUnit(String precipitationUnit) { this.precipitationUnit = precipitationUnit; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }

    // Utility methods
    public void addDestination(TravelDestination destination) {
        if (this.destinations == null) {
            this.destinations = new ArrayList<>();
        }
        this.destinations.add(destination);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeDestination(String cityName) {
        if (this.destinations != null) {
            this.destinations.removeIf(dest ->
                    dest.getLocation().getCity().equalsIgnoreCase(cityName));
            this.updatedAt = LocalDateTime.now();
        }
    }

    public boolean isDateRangeValid() {
        return startDate != null && endDate != null && !endDate.isBefore(startDate);
    }

    public long getTripDurationDays() {
        if (!isDateRangeValid()) return 0;
        return startDate.until(endDate).getDays() + 1;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TravelPlannerDto that = (TravelPlannerDto) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(tripName, that.tripName) &&
                Objects.equals(startDate, that.startDate) &&
                Objects.equals(endDate, that.endDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, tripName, startDate, endDate);
    }

    @Override
    public String toString() {
        return "TravelPlannerDto{" +
                "id='" + id + '\'' +
                ", tripName='" + tripName + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", destinationsCount=" + (destinations != null ? destinations.size() : 0) +
                ", travelType=" + travelType +
                ", userId='" + userId + '\'' +
                '}';
    }
}