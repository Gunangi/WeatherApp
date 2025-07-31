package com.example.weatherapp.controller;

import com.example.weatherapp.dto.WeatherJournalEntryDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/weather-journal")
@CrossOrigin(origins = "*")
public class WeatherJournalController {

    @Autowired
    private WeatherJournalService weatherJournalService;

    @PostMapping("/entry")
    public ResponseEntity<WeatherJournalEntry> createJournalEntry(@Valid @RequestBody WeatherJournalEntryDto entryDto) {
        WeatherJournalEntry entry = weatherJournalService.createJournalEntry(entryDto);
        return ResponseEntity.ok(entry);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<WeatherJournalEntry>> getUserJournalEntries(
            @PathVariable String userId,
            Pageable pageable) {
        Page<WeatherJournalEntry> entries = weatherJournalService.getUserJournalEntries(userId, pageable);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<List<WeatherJournalEntry>> getEntriesByDateRange(
            @PathVariable String userId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        List<WeatherJournalEntry> entries = weatherJournalService.getEntriesByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/entry/{entryId}")
    public ResponseEntity<WeatherJournalEntry> getJournalEntry(@PathVariable String entryId) {
        WeatherJournalEntry entry = weatherJournalService.getJournalEntry(entryId);
        return ResponseEntity.ok(entry);
    }

    @PutMapping("/entry/{entryId}")
    public ResponseEntity<WeatherJournalEntry> updateJournalEntry(
            @PathVariable String entryId,
            @Valid @RequestBody WeatherJournalEntryDto entryDto) {
        WeatherJournalEntry entry = weatherJournalService.updateJournalEntry(entryId, entryDto);
        return ResponseEntity.ok(entry);
    }

    @DeleteMapping("/entry/{entryId}")
    public ResponseEntity<Void> deleteJournalEntry(@PathVariable String entryId) {
        weatherJournalService.deleteJournalEntry(entryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}/location/{location}")
    public ResponseEntity<List<WeatherJournalEntry>> getEntriesByLocation(
            @PathVariable String userId,
            @PathVariable String location) {
        List<WeatherJournalEntry> entries = weatherJournalService.getEntriesByLocation(userId, location);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/user/{userId}/weather-pattern")
    public ResponseEntity<List<WeatherJournalEntry>> getEntriesByWeatherPattern(
            @PathVariable String userId,
            @RequestParam String weatherCondition) {
        List<WeatherJournalEntry> entries = weatherJournalService.getEntriesByWeatherPattern(userId, weatherCondition);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/user/{userId}/mood/{mood}")
    public ResponseEntity<List<WeatherJournalEntry>> getEntriesByMood(
            @PathVariable String userId,
            @PathVariable String mood) {
        List<WeatherJournalEntry> entries = weatherJournalService.getEntriesByMood(userId, mood);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/user/{userId}/statistics")
    public ResponseEntity<Object> getJournalStatistics(@PathVariable String userId) {
        Object statistics = weatherJournalService.getJournalStatistics(userId);
        return ResponseEntity.ok(statistics);
    }
}