package com.example.weatherapp.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeatherWidgetRepository extends MongoRepository<WeatherWidget, String> {

    List<WeatherWidget> findByUserIdAndIsVisibleTrueOrderByPosition(String userId);

    List<WeatherWidget> findByUserIdOrderByPosition(String userId);

    List<WeatherWidget> findByUserIdAndWidgetType(String userId, String widgetType);

    void deleteByUserIdAndWidgetType(String userId, String widgetType);
}
