package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.Instant;

@Data
@Document(collection = "locationHistory")
public class LocationHistory {
    @Id
    private String id;
    private String userId;
    private String city;
    private String country;
    private double latitude;
    private double longitude;
    private String timezone;
    private Instant searchTimestamp;
    private int searchCount; // How many times this location was searched
    private boolean isFavorite;
}