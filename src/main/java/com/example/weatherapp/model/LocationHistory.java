// src/main/java/com/example/weatherapp/model/LocationHistory.java
package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "location_history")
public class LocationHistory {
    @Id
    private String id;
    private String userId;
    private String cityName;
    private double latitude;
    private double longitude;
    private String country;
    private String state;
    private LocalDateTime searchedAt;
    private int searchCount;
    private boolean isGpsDetected;
}

