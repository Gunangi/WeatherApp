// src/main/java/com/example/weatherapp/model/FavoriteLocation.java
package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "favorite_locations")
public class FavoriteLocation {
    @Id
    private String id;
    private String userId;
    private String cityName;
    private double latitude;
    private double longitude;
    private String nickname;
    private String country;
    private String state;
    private boolean isDefault;
    private LocalDateTime addedAt;
    private WeatherAlertSettings alertSettings;
    private String timezone;
}