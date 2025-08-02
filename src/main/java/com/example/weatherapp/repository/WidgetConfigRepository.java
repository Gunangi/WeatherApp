// src/main/java/com/example/weatherapp/repository/WidgetConfigRepository.java
package com.example.weatherapp.repository;

import com.example.weatherapp.model.WidgetConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface WidgetConfigRepository extends MongoRepository<WidgetConfig, String> {
    List<WidgetConfig> findByUserIdOrderByOrderIndexAsc(String userId);
    Optional<WidgetConfig> findByIdAndUserId(String id, String userId);
    long countByUserId(String userId);
    List<WidgetConfig> findByUserIdAndEnabledTrue(String userId);
    void deleteByUserId(String userId);
}
