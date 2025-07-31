// src/main/java/com/example/weatherapp/controller/DashboardController.java
package com.example.weatherapp.controller;

import com.example.weatherapp.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/{userId}")
    public ResponseEntity<DashboardData> getDashboardData(@PathVariable String userId) {
        try {
            DashboardData dashboardData = dashboardService.getCompleteDashboardData(userId);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}/location/{locationId}")
    public ResponseEntity<DashboardData> getDashboardDataForLocation(
            @PathVariable String userId,
            @PathVariable String locationId) {
        try {
            DashboardData dashboardData = dashboardService.getDashboardDataForLocation(userId, locationId);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}/coordinates")
    public ResponseEntity<DashboardData> getDashboardDataByCoordinates(
            @PathVariable String userId,
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            DashboardData dashboardData = dashboardService.getDashboardDataByCoordinates(userId, lat, lon);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(@PathVariable String userId) {
        try {
            Map<String, Object> summary = dashboardService.getDashboardSummary(userId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{userId}/refresh")
    public ResponseEntity<DashboardData> refreshDashboard(@PathVariable String userId) {
        try {
            DashboardData dashboardData = dashboardService.refreshDashboardData(userId);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}/widgets")
    public ResponseEntity<DashboardData> getDashboardWidgets(@PathVariable String userId) {
        try {
            DashboardData widgetData = dashboardService.getWidgetData(userId);
            return ResponseEntity.ok(widgetData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}