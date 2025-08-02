// src/main/java/com/example/weatherapp/model/WidgetConfig.java
package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.Instant;
import java.util.Map;

@Data
@Document(collection = "widgetConfigs")
public class WidgetConfig {
    @Id
    private String id;
    private String userId;
    private String widgetType;
    private String title;
    private String city;
    private String size;
    private Map<String, Object> position;
    private Map<String, Object> settings;
    private int refreshInterval;
    private int orderIndex;
    private boolean enabled;
    private Instant createdAt;
    private Instant updatedAt;
}
