package com.example.weatherapp.service;

import com.example.weatherapp.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@Service
@Slf4j
public class WeatherJournalService {

    @Autowired
    private WeatherJournalRepository journalRepository;

    @Autowired
    private WeatherService weatherService;

    public WeatherJournalEntry createJournalEntry(String userId, WeatherJournalEntry entry) {
        try {
            log.info("Creating weather journal entry for user: {}", userId);

            entry.setUserId(userId);
            entry.setCreatedAt(LocalDateTime.now());
            entry.setUpdatedAt(LocalDateTime.now());

            // Auto-populate weather data if not provided
            if (entry.getWeatherData() == null && entry.getLocation() != null) {
                WeatherData currentWeather = weatherService.getCurrentWeather(entry.getLocation());
                entry.setWeatherData(currentWeather);
            }

            // Generate auto-tags based on content and weather
            entry.setAutoTags(generateAutoTags(entry));

            WeatherJournalEntry savedEntry = journalRepository.save(entry);
            log.info("Weather journal entry created with ID: {}", savedEntry.getId());

            return savedEntry;

        } catch (Exception e) {
            log.error("Error creating weather journal entry: {}", e.getMessage());
            throw new RuntimeException("Failed to create journal entry", e);
        }
    }

    public WeatherJournalEntry updateJournalEntry(String userId, String entryId, WeatherJournalEntry updatedEntry) {
        try {
            log.info("Updating weather journal entry: {} for user: {}", entryId, userId);

            Optional<WeatherJournalEntry> existingEntry = journalRepository.findByIdAndUserId(entryId, userId);

            if (existingEntry.isEmpty()) {
                throw new RuntimeException("Journal entry not found or access denied");
            }

            WeatherJournalEntry entry = existingEntry.get();
            entry.setTitle(updatedEntry.getTitle());
            entry.setContent(updatedEntry.getContent());
            entry.setMood(updatedEntry.getMood());
            entry.setActivities(updatedEntry.getActivities());
            entry.setUserTags(updatedEntry.getUserTags());
            entry.setPhotos(updatedEntry.getPhotos());
            entry.setRating(updatedEntry.getRating());
            entry.setUpdatedAt(LocalDateTime.now());

            // Regenerate auto-tags
            entry.setAutoTags(generateAutoTags(entry));

            WeatherJournalEntry savedEntry = journalRepository.save(entry);
            log.info("Weather journal entry updated: {}", entryId);

            return savedEntry;

        } catch (Exception e) {
            log.error("Error updating weather journal entry: {}", e.getMessage());
            throw new RuntimeException("Failed to update journal entry", e);
        }
    }

    public Optional<WeatherJournalEntry> getJournalEntry(String userId, String entryId) {
        try {
            log.info("Fetching weather journal entry: {} for user: {}", entryId, userId);
            return journalRepository.findByIdAndUserId(entryId, userId);
        } catch (Exception e) {
            log.error("Error fetching weather journal entry: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Page<WeatherJournalEntry> getUserJournalEntries(String userId, int page, int size) {
        try {
            log.info("Fetching weather journal entries for user: {} (page: {}, size: {})", userId, page, size);

            Pageable pageable = PageRequest.of(page, size,
                    Sort.by(Sort.Direction.DESC, "createdAt"));

            return journalRepository.findByUserId(userId, pageable);

        } catch (Exception e) {
            log.error("Error fetching user journal entries: {}", e.getMessage());
            return Page.empty();
        }
    }

    public List<WeatherJournalEntry> getJournalEntriesByDateRange(String userId, LocalDate startDate, LocalDate endDate) {
        try {
            log.info("Fetching weather journal entries for user: {} from {} to {}", userId, startDate, endDate);

            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

            return journalRepository.findByUserIdAndCreatedAtBetween(userId, startDateTime, endDateTime);

        } catch (Exception e) {
            log.error("Error fetching journal entries by date range: {}", e.getMessage());
            return List.of();
        }
    }

    public List<WeatherJournalEntry> searchJournalEntries(String userId, String query) {
        try {
            log.info("Searching weather journal entries for user: {} with query: {}", userId, query);

            return journalRepository.searchByUserIdAndQuery(userId, query);

        } catch (Exception e) {
            log.error("Error searching journal entries: {}", e.getMessage());
            return List.of();
        }
    }

    public List<WeatherJournalEntry> getJournalEntriesByTag(String userId, String tag) {
        try {
            log.info("Fetching weather journal entries by tag: {} for user: {}", tag, userId);

            return journalRepository.findByUserIdAndTagsContaining(userId, tag);

        } catch (Exception e) {
            log.error("Error fetching journal entries by tag: {}", e.getMessage());
            return List.of();
        }
    }

    public List<WeatherJournalEntry> getJournalEntriesByLocation(String userId, Location location, double radiusKm) {
        try {
            log.info("Fetching weather journal entries near location: {} for user: {}", location.getCity(), userId);

            return journalRepository.findByUserIdAndLocationNear(userId,
                    location.getLatitude(), location.getLongitude(), radiusKm);

        } catch (Exception e) {
            log.error("Error fetching journal entries by location: {}", e.getMessage());
            return List.of();
        }
    }

    public void deleteJournalEntry(String userId, String entryId) {
        try {
            log.info("Deleting weather journal entry: {} for user: {}", entryId, userId);

            Optional<WeatherJournalEntry> entry = journalRepository.findByIdAndUserId(entryId, userId);

            if (entry.isEmpty()) {
                throw new RuntimeException("Journal entry not found or access denied");
            }

            journalRepository.deleteById(entryId);
            log.info("Weather journal entry deleted: {}", entryId);

        } catch (Exception e) {
            log.error("Error deleting weather journal entry: {}", e.getMessage());
            throw new RuntimeException("Failed to delete journal entry", e);
        }
    }

    public WeatherJournalStats getJournalStats(String userId) {
        try {
            log.info("Fetching weather journal stats for user: {}", userId);

            long totalEntries = journalRepository.countByUserId(userId);
            long entriesThisMonth = journalRepository.countByUserIdAndCurrentMonth(userId);
            long entriesThisYear = journalRepository.countByUserIdAndCurrentYear(userId);

            Map<String, Long> moodDistribution = journalRepository.getMoodDistribution(userId);
            Map<String, Long> activityDistribution = journalRepository.getActivityDistribution(userId);
            Map<String, Long> weatherConditionDistribution = journalRepository.getWeatherConditionDistribution(userId);

            Optional<WeatherJournalEntry> firstEntry = journalRepository.findFirstByUserIdOrderByCreatedAtAsc(userId);
            Optional<WeatherJournalEntry> lastEntry = journalRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);

            List<String> popularTags = journalRepository.getPopularTags(userId, 10);
            List<Location> popularLocations = journalRepository.getPopularLocations(userId, 10);

            return WeatherJournalStats.builder()
                    .totalEntries(totalEntries)
                    .entriesThisMonth(entriesThisMonth)
                    .entriesThisYear(entriesThisYear)
                    .moodDistribution(moodDistribution)
                    .activityDistribution(activityDistribution)
                    .weatherConditionDistribution(weatherConditionDistribution)
                    .firstEntryDate(firstEntry.map(WeatherJournalEntry::getCreatedAt).orElse(null))
                    .lastEntryDate(lastEntry.map(WeatherJournalEntry::getCreatedAt).orElse(null))
                    .popularTags(popularTags)
                    .popularLocations(popularLocations)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching journal stats: {}", e.getMessage());
            return WeatherJournalStats.builder()
                    .totalEntries(0L)
                    .entriesThisMonth(0L)
                    .entriesThisYear(0L)
                    .build();
        }
    }

    public List<WeatherJournalInsight> getJournalInsights(String userId) {
        try {
            log.info("Generating weather journal insights for user: {}", userId);

            List<WeatherJournalInsight> insights = new java.util.ArrayList<>();

            // Mood vs Weather Analysis
            insights.addAll(analyzeMoodWeatherCorrelation(userId));

            // Activity Patterns
            insights.addAll(analyzeActivityPatterns(userId));

            // Seasonal Preferences
            insights.addAll(analyzeSeasonalPreferences(userId));

            // Location-based Insights
            insights.addAll(analyzeLocationPreferences(userId));

            return insights;

        } catch (Exception e) {
            log.error("Error generating journal insights: {}", e.getMessage());
            return List.of();
        }
    }

    public List<String> getAllTags(String userId) {
        try {
            log.info("Fetching all tags for user: {}", userId);
            return journalRepository.getAllTagsByUserId(userId);
        } catch (Exception e) {
            log.error("Error fetching all tags: {}", e.getMessage());
            return List.of();
        }
    }

    public WeatherJournalEntry addPhotoToEntry(String userId, String entryId, String photoUrl, String caption) {
        try {
            log.info("Adding photo to journal entry: {} for user: {}", entryId, userId);

            Optional<WeatherJournalEntry> entryOptional = journalRepository.findByIdAndUserId(entryId, userId);

            if (entryOptional.isEmpty()) {
                throw new RuntimeException("Journal entry not found or access denied");
            }

            WeatherJournalEntry entry = entryOptional.get();
            JournalPhoto photo = JournalPhoto.builder()
                    .url(photoUrl)
                    .caption(caption)
                    .uploadedAt(LocalDateTime.now())
                    .build();

            if (entry.getPhotos() == null) {
                entry.setPhotos(new java.util.ArrayList<>());
            }

            entry.getPhotos().add(photo);
            entry.setUpdatedAt(LocalDateTime.now());

            return journalRepository.save(entry);

        } catch (Exception e) {
            log.error("Error adding photo to journal entry: {}", e.getMessage());
            throw new RuntimeException("Failed to add photo to journal entry", e);
        }
    }

    public WeatherJournalEntry removePhotoFromEntry(String userId, String entryId, int photoIndex) {
        try {
            log.info("Removing photo from journal entry: {} for user: {}", entryId, userId);

            Optional<WeatherJournalEntry> entryOptional = journalRepository.findByIdAndUserId(entryId, userId);

            if (entryOptional.isEmpty()) {
                throw new RuntimeException("Journal entry not found or access denied");
            }

            WeatherJournalEntry entry = entryOptional.get();

            if (entry.getPhotos() != null && photoIndex >= 0 && photoIndex < entry.getPhotos().size()) {
                entry.getPhotos().remove(photoIndex);
                entry.setUpdatedAt(LocalDateTime.now());
                return journalRepository.save(entry);
            } else {
                throw new RuntimeException("Invalid photo index");
            }

        } catch (Exception e) {
            log.error("Error removing photo from journal entry: {}", e.getMessage());
            throw new RuntimeException("Failed to remove photo from journal entry", e);
        }
    }

    private List<String> generateAutoTags(WeatherJournalEntry entry) {
        List<String> autoTags = new java.util.ArrayList<>();

        // Weather-based tags
        if (entry.getWeatherData() != null) {
            WeatherData weather = entry.getWeatherData();

            String condition = weather.getCondition().toLowerCase();
            if (condition.contains("rain")) autoTags.add("rainy");
            if (condition.contains("snow")) autoTags.add("snowy");
            if (condition.contains("sun") || condition.contains("clear")) autoTags.add("sunny");
            if (condition.contains("cloud")) autoTags.add("cloudy");
            if (condition.contains("storm")) autoTags.add("stormy");

            // Temperature tags
            if (weather.getTemperature() < 0) autoTags.add("freezing");
            else if (weather.getTemperature() < 10) autoTags.add("cold");
            else if (weather.getTemperature() < 20) autoTags.add("cool");
            else if (weather.getTemperature() < 30) autoTags.add("warm");
            else autoTags.add("hot");

            // Wind tags
            if (weather.getWindSpeed() > 10) autoTags.add("windy");

            // Humidity tags
            if (weather.getHumidity() > 80) autoTags.add("humid");
            else if (weather.getHumidity() < 30) autoTags.add("dry");
        }

        // Mood-based tags
        if (entry.getMood() != null) {
            autoTags.add(entry.getMood().toLowerCase());
        }

        // Activity-based tags
        if (entry.getActivities() != null) {
            for (String activity : entry.getActivities()) {
                autoTags.add(activity.toLowerCase().replace(" ", "-"));
            }
        }

        // Season tag
        autoTags.add(getCurrentSeason());

        return autoTags;
    }

    private List<WeatherJournalInsight> analyzeMoodWeatherCorrelation(String userId) {
        List<WeatherJournalInsight> insights = new java.util.ArrayList<>();

        Map<String, List<String>> moodWeatherCorrelation = journalRepository.getMoodWeatherCorrelation(userId);

        for (Map.Entry<String, List<String>> entry : moodWeatherCorrelation.entrySet()) {
            String mood = entry.getKey();
            List<String> conditions = entry.getValue();

            if (conditions.size() > 0) {
                String mostCommonCondition = conditions.get(0); // Assuming sorted by frequency

                insights.add(WeatherJournalInsight.builder()
                        .type("mood-weather")
                        .title("Mood & Weather Connection")
                        .description(String.format("You tend to feel %s during %s weather", mood, mostCommonCondition))
                        .confidence(calculateConfidence(conditions))
                        .category("Psychology")
                        .build());
            }
        }

        return insights;
    }

    private List<WeatherJournalInsight> analyzeActivityPatterns(String userId) {
        List<WeatherJournalInsight> insights = new java.util.ArrayList<>();

        Map<String, List<String>> activityWeatherMap = journalRepository.getActivityWeatherPatterns(userId);

        for (Map.Entry<String, List<String>> entry : activityWeatherMap.entrySet()) {
            String activity = entry.getKey();
            List<String> conditions = entry.getValue();

            if (conditions.size() > 2) { // Only if there's enough data
                insights.add(WeatherJournalInsight.builder()
                        .type("activity-pattern")
                        .title("Activity Preferences")
                        .description(String.format("You enjoy %s most during %s conditions", activity, conditions.get(0)))
                        .confidence(calculateConfidence(conditions))
                        .category("Activities")
                        .build());
            }
        }

        return insights;
    }

    private List<WeatherJournalInsight> analyzeSeasonalPreferences(String userId) {
        List<WeatherJournalInsight> insights = new java.util.ArrayList<>();

        Map<String, Double> seasonalRatings = journalRepository.getSeasonalRatings(userId);

        if (!seasonalRatings.isEmpty()) {
            String favoriteSeason = seasonalRatings.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("Unknown");

            insights.add(WeatherJournalInsight.builder()
                    .type("seasonal-preference")
                    .title("Seasonal Preferences")
                    .description(String.format("Your favorite season appears to be %s based on your journal ratings", favoriteSeason))
                    .confidence(0.8)
                    .category("Seasons")
                    .build());
        }

        return insights;
    }

    private List<WeatherJournalInsight> analyzeLocationPreferences(String userId) {
        List<WeatherJournalInsight> insights = new java.util.ArrayList<>();

        List<Location> favoriteLocations = journalRepository.getLocationsByHighestRatings(userId, 3);

        if (!favoriteLocations.isEmpty()) {
            Location topLocation = favoriteLocations.get(0);

            insights.add(WeatherJournalInsight.builder()
                    .type("location-preference")
                    .title("Favorite Places")
                    .description(String.format("You seem to enjoy spending time in %s the most", topLocation.getCity()))
                    .confidence(0.7)
                    .category("Locations")
                    .build());
        }

        return insights;
    }

    private double calculateConfidence(List<String> data) {
        if (data.isEmpty()) return 0.0;

        // Simple confidence calculation based on data consistency
        Map<String, Integer> frequency = new HashMap<>();
        for (String item : data) {
            frequency.put(item, frequency.getOrDefault(item, 0) + 1);
        }

        int maxFreq = frequency.values().stream().mapToInt(Integer::intValue).max().orElse(0);
        return Math.min(1.0, (double) maxFreq / data.size() * 2);
    }

    private String getCurrentSeason() {
        int month = LocalDate.now().getMonthValue();
        if (month >= 3 && month <= 5) return "spring";
        if (month >= 6 && month <= 8) return "summer";
        if (month >= 9 && month <= 11) return "autumn";
        return "winter";
    }
}
