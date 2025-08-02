// src/main/java/com/example/weatherapp/model/FavoriteLocation.java
package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.Instant;

@Data
@Document(collection = "favoriteLocations")
public class FavoriteLocation {
    @Id
    private String id;
    private String userId;
    private String city;
    private String country;
    private double latitude;
    private double longitude;
    private String timezone;
    private String nickname; // User-defined name for the location
    private int orderIndex; // For custom ordering
    private Instant createdAt;
    private Instant updatedAt;
}