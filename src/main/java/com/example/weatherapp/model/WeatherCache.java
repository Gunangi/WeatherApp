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
@Document(collection = "weather_cache")
public class WeatherCache {
    @Id
    private String id;
    private String cacheKey;
    private String weatherData;
    private LocalDateTime cachedAt;
    private LocalDateTime expiresAt;
    private String dataType; // current, forecast, hourly, uv, historical
    private String locationId;
    private long accessCount;
}