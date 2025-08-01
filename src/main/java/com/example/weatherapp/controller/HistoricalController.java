package com.example.weatherapp.controller;

import com.example.weatherapp.model.HistoricalWeather;
import com.example.weatherapp.service.HistoricalWeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/historical")
@CrossOrigin(origins = "*")
public class HistoricalController {

    @Autowired
    private HistoricalWeatherService historicalWeatherService;

    /**
     * Get historical weather data for a specific date
     */
    @GetMapping("/weather")
    public ResponseEntity<HistoricalWeather> getHistoricalWeather(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            HistoricalWeather data = historicalWeatherService.getHistoricalWeather(lat, lon, date);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get historical weather data for a date range
     */
    @GetMapping("/weather/range")
    public ResponseEntity<List<HistoricalWeather>> getHistoricalWeatherRange(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<HistoricalWeather> data = historicalWeatherService.getHistoricalWeatherRange(lat, lon, startDate, endDate);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get weather statistics for a specific month
     */
    @GetMapping("/stats/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyStats(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam int year,
            @RequestParam int month) {
        try {
            Map<String, Object> stats = historicalWeatherService.getMonthlyStatistics(lat, lon, year, month);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get weather statistics for a specific year
     */
    @GetMapping("/stats/yearly")
    public ResponseEntity<Map<String, Object>> getYearlyStats(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam int year) {
        try {
            Map<String, Object> stats = historicalWeatherService.getYearlyStatistics(lat, lon, year);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get temperature trends for a location
     */
    @GetMapping("/trends/temperature")
    public ResponseEntity<Map<String, Object>> getTemperatureTrends(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Map<String, Object> trends = historicalWeatherService.getTemperatureTrends(lat, lon, startDate, endDate);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get precipitation trends for a location
     */
    @GetMapping("/trends/precipitation")
    public ResponseEntity<Map<String, Object>> getPrecipitationTrends(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Map<String, Object> trends = historicalWeatherService.getPrecipitationTrends(lat, lon, startDate, endDate);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare weather with same date in previous years
     */
    @GetMapping("/compare/yearly")
    public ResponseEntity<List<Map<String, Object>>> compareWithPreviousYears(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "5") int years) {
        try {
            List<Map<String, Object>> comparison = historicalWeatherService.compareWithPreviousYears(lat, lon, date, years);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get extreme weather events for a location
     */
    @GetMapping("/extremes")
    public ResponseEntity<Map<String, Object>> getExtremeWeatherEvents(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Map<String, Object> extremes = historicalWeatherService.getExtremeWeatherEvents(lat, lon, startDate, endDate);
            return ResponseEntity.ok(extremes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get weather records (all-time highs/lows) for a location
     */
    @GetMapping("/records")
    public ResponseEntity<Map<String, Object>> getWeatherRecords(
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            Map<String, Object> records = historicalWeatherService.getWeatherRecords(lat, lon);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get climate normals (30-year averages) for a location
     */
    @GetMapping("/normals")
    public ResponseEntity<Map<String, Object>> getClimateNormals(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "1991") int startYear,
            @RequestParam(defaultValue = "2020") int endYear) {
        try {
            Map<String, Object> normals = historicalWeatherService.getClimateNormals(lat, lon, startYear, endYear);
            return ResponseEntity.ok(normals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get seasonal weather patterns
     */
    @GetMapping("/patterns/seasonal")
    public ResponseEntity<Map<String, Object>> getSeasonalPatterns(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") int years) {
        try {
            Map<String, Object> patterns = historicalWeatherService.getSeasonalPatterns(lat, lon, years);
            return ResponseEntity.ok(patterns);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get weather data for this day in history
     */
    @GetMapping("/this-day")
    public ResponseEntity<List<HistoricalWeather>> getThisDayInHistory(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam int month,
            @RequestParam int day,
            @RequestParam(defaultValue = "10") int years) {
        try {
            List<HistoricalWeather> data = historicalWeatherService.getThisDayInHistory(lat, lon, month, day, years);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get weather anomalies (deviations from normal)
     */
    @GetMapping("/anomalies")
    public ResponseEntity<List<Map<String, Object>>> getWeatherAnomalies(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "2.0") double threshold) {
        try {
            List<Map<String, Object>> anomalies = historicalWeatherService.getWeatherAnomalies(lat, lon, startDate, endDate, threshold);
            return ResponseEntity.ok(anomalies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export historical data to CSV
     */
    @GetMapping("/export/csv")
    public ResponseEntity<String> exportToCsv(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            String csvData = historicalWeatherService.exportToCsv(lat, lon, startDate, endDate);
            return ResponseEntity.ok()
                    .header("Content-Type", "text/csv")
                    .header("Content-Disposition", "attachment; filename=weather_data.csv")
                    .body(csvData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}