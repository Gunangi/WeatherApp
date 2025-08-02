// src/main/java/com/example/weatherapp/controller/WidgetController.java
package com.example.weatherapp.controller;

import com.example.weatherapp.dto.WidgetConfigDto;
import com.example.weatherapp.dto.WidgetDataDto;
import com.example.weatherapp.service.WidgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/widgets")
@RequiredArgsConstructor
public class WidgetController {

    private final WidgetService widgetService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<WidgetConfigDto>> getUserWidgets(@PathVariable String userId) {
        return ResponseEntity.ok(widgetService.getUserWidgets(userId));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<WidgetConfigDto> createWidget(
            @PathVariable String userId,
            @RequestBody WidgetConfigDto widgetConfig) {
        return ResponseEntity.ok(widgetService.createWidget(userId, widgetConfig));
    }

    @PutMapping("/{userId}/{widgetId}")
    public ResponseEntity<WidgetConfigDto> updateWidget(
            @PathVariable String userId,
            @PathVariable String widgetId,
            @RequestBody WidgetConfigDto widgetConfig) {
        return ResponseEntity.ok(widgetService.updateWidget(userId, widgetId, widgetConfig));
    }

    @DeleteMapping("/{userId}/{widgetId}")
    public ResponseEntity<Void> deleteWidget(
            @PathVariable String userId,
            @PathVariable String widgetId) {
        widgetService.deleteWidget(userId, widgetId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/data")
    public ResponseEntity<List<WidgetDataDto>> getWidgetData(@PathVariable String userId) {
        return ResponseEntity.ok(widgetService.getWidgetData(userId));
    }

    @GetMapping("/{userId}/{widgetId}/data")
    public ResponseEntity<WidgetDataDto> getSpecificWidgetData(
            @PathVariable String userId,
            @PathVariable String widgetId) {
        return ResponseEntity.ok(widgetService.getSpecificWidgetData(userId, widgetId));
    }
}