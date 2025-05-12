package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.model.WeatherReport;
import com.example.weatherapp.repository.WeatherAlertRepository;
import com.example.weatherapp.repository.WeatherReportRepository;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class WeatherService {

    private final WeatherAlertRepository alertRepository;
    private final WeatherReportRepository reportRepository;
    private final WeatherApiService weatherApiService;

    public WeatherService(
            WeatherAlertRepository alertRepository,
            WeatherReportRepository reportRepository,
            WeatherApiService weatherApiService
    ) {
        this.alertRepository = alertRepository;
        this.reportRepository = reportRepository;
        this.weatherApiService = weatherApiService;
    }

    // Weather alerts methods
    public List<WeatherAlert> getUserAlerts(String userId) {
        return alertRepository.findByUserId(userId);
    }

    public WeatherAlert createAlert(WeatherAlert alert) {
        alert.setCreatedAt(LocalDateTime.now());
        return alertRepository.save(alert);
    }

    public WeatherAlert updateAlert(String alertId, WeatherAlert alertDetails) {
        WeatherAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        alert.setCity(alertDetails.getCity());
        alert.setActive(alertDetails.isActive());

        return alertRepository.save(alert);
    }

    public void deleteAlert(String alertId) {
        alertRepository.deleteById(alertId);
    }

    public List<WeatherAlert> getActiveAlertsByLocation(String location) {
        return alertRepository.findByCityAndActive(location, true);
    }

    // Weather reports methods
    public List<WeatherReport> getReportsByLocation(String location) {
        return reportRepository.findByLocationOrderByCreatedAtDesc(location);
    }

    public List<WeatherReport> getUserReports(String userId) {
        return reportRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public WeatherReport createReport(WeatherReport report) {
        // Set creation time
        report.setCreatedAt(LocalDateTime.now());

        // If coordinates are not set, attempt to geocode from location
        if (report.getLocationCoordinates() == null && report.getLocation() != null) {
            try {
                // This is a placeholder - you'd replace with actual geocoding service
                double[] coords = geocodeLocation(report.getLocation());
                report.setLocationCoordinates(new GeoJsonPoint(coords[0], coords[1]));
            } catch (Exception e) {
                // Log error or handle geocoding failure
            }
        }

        return reportRepository.save(report);
    }

    public List<WeatherReport> getNearbyReports(double lon, double lat, double radius) {
        // Radius is in meters
        return reportRepository.findNearbyReports(lon, lat, radius);
    }

    // Placeholder geocoding method - replace with actual geocoding service
    private double[] geocodeLocation(String location) {
        // This is a mock implementation
        // In a real application, use a geocoding service like Google Maps, OpenStreetMap, etc.
        return new double[]{-122.4194, 37.7749}; // San Francisco coordinates as example
    }

    // Weather data methods
    public Object getCurrentWeather(String location) {
        return weatherApiService.getCurrentWeather(location);
    }


    public List<Map<String, Object>> getHourlyForecast(String location) {
        return weatherApiService.getHourlyForecast(location, 12); // Default to 12 hours
    }
    public Object getAirPollution(double lat, double lon) {
        return weatherApiService.getAirPollution(lat, lon);
    }

    public Object getHistoricalWeather(double lat, double lon, String startDate, String endDate) {
        return weatherApiService.getHistoricalWeather(lat, lon, startDate, endDate);
    }
}