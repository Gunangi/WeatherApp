package com.example.weatherapp.service;

import com.example.weatherapp.model.WeatherAlert;
import com.example.weatherapp.model.WeatherReport;
import com.example.weatherapp.repository.WeatherAlertRepository;
import com.example.weatherapp.repository.WeatherReportRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WeatherService {

    private final WeatherAlertRepository alertRepository;
    private final WeatherReportRepository reportRepository;
    private final WeatherApiService weatherApiService;

    public WeatherService(WeatherAlertRepository alertRepository, WeatherReportRepository reportRepository, WeatherApiService weatherApiService) {
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
        report.setCreatedAt(LocalDateTime.now());
        return reportRepository.save(report);
    }

    // Updated to match the repository method name
    public List<WeatherReport> getNearbyReports(double lat, double lon, double radius) {
        return reportRepository.findNearbyReports(lat, lon, radius);
    }

    // Weather data methods
    public Object getCurrentWeather(String location) {
        return weatherApiService.getCurrentWeather(location);
    }

    public Object getForecast(String location, int days) {
        return weatherApiService.getForecast(location, days);
    }

    public Object getHourlyForecast(String location) {
        return weatherApiService.getHourlyForecast(location);
    }

    public Object getAirPollution(double lat, double lon) {
        return weatherApiService.getAirPollution(lat, lon);
    }

    public Object getHistoricalWeather(double lat, double lon, String startDate, String endDate) {
        return weatherApiService.getHistoricalWeather(lat, lon, startDate, endDate);
    }
}