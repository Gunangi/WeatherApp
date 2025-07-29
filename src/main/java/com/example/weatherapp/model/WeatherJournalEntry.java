package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "weather_journal")
public class WeatherJournalEntry {
    @Id
    private String id;
    private String userId;
    private String locationId;
    private LocalDateTime entryDate;
    private String personalObservation;
    private String mood;
    private List<String> activities;
    private String weatherSnapshot; // JSON string of weather data
    private List<String> photoUrls;
    private Map<String, Object> customFields;
    private double personalTemperatureRating; // How the user felt about the temperature
    private String clothingWorn;
    private boolean isPublic;
    private List<String> tags;
}

