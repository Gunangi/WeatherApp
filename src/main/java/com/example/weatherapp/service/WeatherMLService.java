package com.example.weatherapp.service;

import com.example.weatherapp.model.*;
import com.example.weatherapp.repository.WeatherMLRepository;
import com.example.weatherapp.ml.WeatherPredictionModel;
import com.example.weatherapp.ml.TensorFlowModelLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Slf4j
public class WeatherMLService {

    @Autowired
    private WeatherMLRepository mlRepository;

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private TensorFlowModelLoader modelLoader;

    private WeatherPredictionModel predictionModel;

    public WeatherMLPrediction getEnhancedForecast(Location location, int hoursAhead) {
        try {
            log.info("Generating ML-enhanced forecast for {} - {} hours ahead", location.getCity(), hoursAhead);

            // Get historical data for training context
            List<WeatherData> historicalData = getHistoricalDataForLocation(location, 30); // Last 30 days

            // Get current weather as baseline
            WeatherData currentWeather = weatherService.getCurrentWeather(location);

            // Initialize model if not already loaded
            if (predictionModel == null) {
                predictionModel = modelLoader.loadWeatherPredictionModel();
            }

            // Prepare input features
            double[] inputFeatures = prepareInputFeatures(currentWeather, historicalData, location);

            // Generate ML-based personalized recommendations
            PersonalizedWeatherRecommendations recommendations = generatePersonalizedRecommendations(
                    preferences, journalEntries, currentWeather, forecast, location);

            // Save recommendations for learning
            savePersonalizedRecommendations(userId, recommendations);

            log.info("Personalized recommendations generated for user: {}", userId);
            return recommendations;

        } catch (Exception e) {
            log.error("Error generating personalized recommendations: {}", e.getMessage());
            return createDefaultRecommendations(location);
        }
    }

    public WeatherPatternAnalysis analyzeWeatherPatterns(Location location, int daysBack) {
        try {
            log.info("Analyzing weather patterns for {} - {} days back", location.getCity(), daysBack);

            List<WeatherData> historicalData = getHistoricalDataForLocation(location, daysBack);

            if (historicalData.isEmpty()) {
                log.warn("No historical data available for pattern analysis");
                return null;
            }

            // Analyze temperature patterns
            TemperaturePatterns tempPatterns = analyzeTemperaturePatterns(historicalData);

            // Analyze precipitation patterns
            PrecipitationPatterns precipPatterns = analyzePrecipitationPatterns(historicalData);

            // Analyze seasonal trends
            SeasonalTrends seasonalTrends = analyzeSeasonalTrends(historicalData);

            // Detect anomalies
            List<WeatherAnomaly> anomalies = detectWeatherAnomalies(historicalData);

            // Predict upcoming patterns
            List<PatternPrediction> patternPredictions = predictUpcomingPatterns(historicalData, location);

            WeatherPatternAnalysis analysis = WeatherPatternAnalysis.builder()
                    .location(location)
                    .analysisDate(LocalDateTime.now())
                    .daysCovered(daysBack)
                    .temperaturePatterns(tempPatterns)
                    .precipitationPatterns(precipPatterns)
                    .seasonalTrends(seasonalTrends)
                    .anomalies(anomalies)
                    .patternPredictions(patternPredictions)
                    .build();

            // Save analysis
            mlRepository.savePatternAnalysis(analysis);

            return analysis;

        } catch (Exception e) {
            log.error("Error analyzing weather patterns: {}", e.getMessage());
            return null;
        }
    }

    public WeatherAccuracyReport getMLModelAccuracy(Location location, int daysBack) {
        try {
            log.info("Calculating ML model accuracy for {} - {} days back", location.getCity(), daysBack);

            List<WeatherMLPrediction> predictions = mlRepository.getPredictionsForLocation(location, daysBack);
            List<WeatherData> actualWeather = getHistoricalDataForLocation(location, daysBack);

            WeatherAccuracyMetrics metrics = calculateAccuracyMetrics(predictions, actualWeather);

            WeatherAccuracyReport report = WeatherAccuracyReport.builder()
                    .location(location)
                    .evaluationPeriod(daysBack)
                    .totalPredictions(predictions.size())
                    .accuracyMetrics(metrics)
                    .reportDate(LocalDateTime.now())
                    .build();

            mlRepository.saveAccuracyReport(report);

            return report;

        } catch (Exception e) {
            log.error("Error calculating ML model accuracy: {}", e.getMessage());
            return null;
        }
    }

    @Async
    public CompletableFuture<Void> retrainModel(Location location) {
        try {
            log.info("Starting model retraining for location: {}", location.getCity());

            // Get extended historical data for training
            List<WeatherData> trainingData = getHistoricalDataForLocation(location, 365); // 1 year

            if (trainingData.size() < 100) {
                log.warn("Insufficient data for model retraining: {} records", trainingData.size());
                return CompletableFuture.completedFuture(null);
            }

            // Prepare training dataset
            MLTrainingDataset dataset = prepareTrainingDataset(trainingData, location);

            // Retrain the model
            WeatherPredictionModel retrainedModel = predictionModel.retrain(dataset);

            // Validate retrained model
            ModelValidationResult validation = validateModel(retrainedModel, trainingData);

            if (validation.getAccuracy() > 0.75) { // Accept if accuracy > 75%
                predictionModel = retrainedModel;
                log.info("Model successfully retrained for: {} with accuracy: {}",
                        location.getCity(), validation.getAccuracy());
            } else {
                log.warn("Retrained model accuracy too low: {}", validation.getAccuracy());
            }

        } catch (Exception e) {
            log.error("Error retraining model: {}", e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    public ClimateChangeAnalysis analyzeClimateChangeTrends(Location location, int yearsBack) {
        try {
            log.info("Analyzing climate change trends for {} - {} years back", location.getCity(), yearsBack);

            List<WeatherData> longTermData = getHistoricalDataForLocation(location, yearsBack * 365);

            if (longTermData.isEmpty()) {
                log.warn("Insufficient data for climate change analysis");
                return null;
            }

            // Analyze temperature trends
            TemperatureTrend tempTrend = analyzeTemperatureTrend(longTermData, yearsBack);

            // Analyze precipitation trends
            PrecipitationTrend precipTrend = analyzePrecipitationTrend(longTermData, yearsBack);

            // Analyze extreme weather frequency
            ExtremeWeatherTrend extremeTrend = analyzeExtremeWeatherTrend(longTermData, yearsBack);

            // Generate future projections
            List<ClimateProjection> projections = generateClimateProjections(longTermData, location);

            ClimateChangeAnalysis analysis = ClimateChangeAnalysis.builder()
                    .location(location)
                    .analysisDate(LocalDateTime.now())
                    .yearsCovered(yearsBack)
                    .temperatureTrend(tempTrend)
                    .precipitationTrend(precipTrend)
                    .extremeWeatherTrend(extremeTrend)
                    .futureProjections(projections)
                    .build();

            mlRepository.saveClimateAnalysis(analysis);

            return analysis;

        } catch (Exception e) {
            log.error("Error analyzing climate change trends: {}", e.getMessage());
            return null;
        }
    }

    public List<WeatherSimilarity> findSimilarWeatherDays(Location location, WeatherData targetWeather, int daysToSearch) {
        try {
            log.info("Finding similar weather days for: {}", location.getCity());

            List<WeatherData> historicalData = getHistoricalDataForLocation(location, daysToSearch);

            return historicalData.stream()
                    .map(historical -> calculateWeatherSimilarity(targetWeather, historical))
                    .filter(similarity -> similarity.getSimilarityScore() > 0.8) // 80% similarity threshold
                    .sorted((s1, s2) -> Double.compare(s2.getSimilarityScore(), s1.getSimilarityScore()))
                    .limit(10)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error finding similar weather days: {}", e.getMessage());
            return List.of();
        }
    }

    private double[] prepareInputFeatures(WeatherData current, List<WeatherData> historical, Location location) {
        // Feature vector: [current_temp, current_humidity, current_pressure, current_wind,
        //                 avg_temp_7days, trend_temp, season, latitude, longitude, hour_of_day]

        double[] features = new double[10];

        // Current weather features
        features[0] = current.getTemperature();
        features[1] = current.getHumidity();
        features[2] = current.getPressure();
        features[3] = current.getWindSpeed();

        // Historical context
        if (!historical.isEmpty()) {
            features[4] = historical.stream().mapToDouble(WeatherData::getTemperature).average().orElse(0);
            features[5] = calculateTemperatureTrend(historical);
        }

        // Location and time features
        features[6] = getCurrentSeasonNumeric(); // 0-3 for seasons
        features[7] = location.getLatitude();
        features[8] = location.getLongitude();
        features[9] = LocalDateTime.now().getHour();

        return features;
    }

    private WeatherMLPrediction combineMLWithTraditionalForecast(MLPredictionResult mlResult,
                                                                 List<ForecastData> traditional, WeatherData current, Location location, int hoursAhead) {

        // Weighted combination: 60% ML, 40% traditional (adjustable based on model confidence)
        double mlWeight = Math.min(0.8, mlResult.getConfidence());
        double traditionalWeight = 1.0 - mlWeight;

        List<EnhancedForecastData> enhancedForecast = new java.util.ArrayList<>();

        for (int i = 0; i < Math.min(hoursAhead, traditional.size()); i++) {
            ForecastData traditionalData = traditional.get(i);
            MLHourlyPrediction mlHourly = mlResult.getHourlyPredictions().get(i);

            // Combine temperature predictions
            double combinedTemp = (mlHourly.getTemperature() * mlWeight) +
                    (traditionalData.getTemperature() * traditionalWeight);

            // Combine other parameters similarly
            EnhancedForecastData enhanced = EnhancedForecastData.builder()
                    .dateTime(traditionalData.getDateTime())
                    .temperature(combinedTemp)
                    .humidity(combineValues(mlHourly.getHumidity(), traditionalData.getHumidity(), mlWeight, traditionalWeight))
                    .pressure(combineValues(mlHourly.getPressure(), traditionalData.getPressure(), mlWeight, traditionalWeight))
                    .windSpeed(combineValues(mlHourly.getWindSpeed(), traditionalData.getWindSpeed(), mlWeight, traditionalWeight))
                    .condition(traditionalData.getCondition()) // Use traditional for condition
                    .confidence(mlResult.getConfidence())
                    .mlContribution(mlWeight)
                    .traditionalContribution(traditionalWeight)
                    .build();

            enhancedForecast.add(enhanced);
        }

        return WeatherMLPrediction.builder()
                .location(location)
                .predictionTime(LocalDateTime.now())
                .hoursAhead(hoursAhead)
                .enhancedForecast(enhancedForecast)
                .modelVersion(predictionModel.getVersion())
                .confidence(mlResult.getConfidence())
                .mlAlgorithm(predictionModel.getAlgorithmName())
                .build();
    }

    private PersonalizedWeatherRecommendations generatePersonalizedRecommendations(
            UserWeatherPreferences preferences, List<WeatherJournalEntry> journalEntries,
            WeatherData current, List<ForecastData> forecast, Location location) {

        // Analyze user's historical mood and activity patterns
        Map<String, List<String>> moodWeatherMap = analyzeUserMoodPatterns(journalEntries);
        Map<String, List<String>> activityWeatherMap = analyzeUserActivityPatterns(journalEntries);

        List<PersonalizedRecommendation> recommendations = new java.util.ArrayList<>();

        // Generate activity recommendations based on current weather and user patterns
        recommendations.addAll(generateActivityRecommendations(current, activityWeatherMap, preferences));

        // Generate clothing recommendations based on user preferences
        recommendations.addAll(generateClothingRecommendations(current, preferences));

        // Generate mood-based recommendations
        recommendations.addAll(generateMoodRecommendations(current, moodWeatherMap));

        // Generate timing recommendations for planned activities
        recommendations.addAll(generateTimingRecommendations(forecast, preferences));

        return PersonalizedWeatherRecommendations.builder()
                .userId(preferences.getUserId())
                .location(location)
                .generationTime(LocalDateTime.now())
                .recommendations(recommendations)
                .confidenceScore(calculateRecommendationConfidence(journalEntries))
                .build();
    }

    private WeatherSimilarity calculateWeatherSimilarity(WeatherData target, WeatherData historical) {
        // Calculate similarity based on multiple weather parameters
        double tempSimilarity = 1.0 - Math.abs(target.getTemperature() - historical.getTemperature()) / 50.0;
        double humiditySimilarity = 1.0 - Math.abs(target.getHumidity() - historical.getHumidity()) / 100.0;
        double pressureSimilarity = 1.0 - Math.abs(target.getPressure() - historical.getPressure()) / 100.0;
        double windSimilarity = 1.0 - Math.abs(target.getWindSpeed() - historical.getWindSpeed()) / 20.0;

        // Condition similarity (simple string matching)
        double conditionSimilarity = target.getCondition().equalsIgnoreCase(historical.getCondition()) ? 1.0 : 0.5;

        // Weighted average
        double overallSimilarity = (tempSimilarity * 0.3) + (humiditySimilarity * 0.2) +
                (pressureSimilarity * 0.2) + (windSimilarity * 0.15) +
                (conditionSimilarity * 0.15);

        return WeatherSimilarity.builder()
                .targetDate(target.getTimestamp())
                .similarDate(historical.getTimestamp())
                .similarityScore(Math.max(0.0, Math.min(1.0, overallSimilarity)))
                .temperatureDiff(Math.abs(target.getTemperature() - historical.getTemperature()))
                .humidityDiff(Math.abs(target.getHumidity() - historical.getHumidity()))
                .pressureDiff(Math.abs(target.getPressure() - historical.getPressure()))
                .windSpeedDiff(Math.abs(target.getWindSpeed() - historical.getWindSpeed()))
                .build();
    }

    // Helper methods
    private List<WeatherData> getHistoricalDataForLocation(Location location, int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);
        return weatherService.getHistoricalWeather(location, startDate, endDate);
    }

    private double calculateTemperatureTrend(List<WeatherData> data) {
        if (data.size() < 2) return 0.0;

        double firstHalf = data.subList(0, data.size() / 2).stream()
                .mapToDouble(WeatherData::getTemperature).average().orElse(0);
        double secondHalf = data.subList(data.size() / 2, data.size()).stream()
                .mapToDouble(WeatherData::getTemperature).average().orElse(0);

        return secondHalf - firstHalf;
    }

    private int getCurrentSeasonNumeric() {
        int month = LocalDateTime.now().getMonthValue();
        if (month >= 3 && month <= 5) return 0; // Spring
        if (month >= 6 && month <= 8) return 1; // Summer
        if (month >= 9 && month <= 11) return 2; // Autumn
        return 3; // Winter
    }

    private double combineValues(double mlValue, double traditionalValue, double mlWeight, double traditionalWeight) {
        return (mlValue * mlWeight) + (traditionalValue * traditionalWeight);
    }

    private WeatherMLPrediction createFallbackPrediction(Location location, int hoursAhead) {
        // Return basic traditional forecast as fallback
        List<ForecastData> traditional = weatherService.getHourlyForecast(location);

        List<EnhancedForecastData> enhancedForecast = traditional.stream()
                .limit(hoursAhead)
                .map(data -> EnhancedForecastData.builder()
                        .dateTime(data.getDateTime())
                        .temperature(data.getTemperature())
                        .humidity(data.getHumidity())
                        .pressure(data.getPressure())
                        .windSpeed(data.getWindSpeed())
                        .condition(data.getCondition())
                        .confidence(0.6) // Lower confidence for fallback
                        .mlContribution(0.0)
                        .traditionalContribution(1.0)
                        .build())
                .collect(Collectors.toList());

        return WeatherMLPrediction.builder()
                .location(location)
                .predictionTime(LocalDateTime.now())
                .hoursAhead(hoursAhead)
                .enhancedForecast(enhancedForecast)
                .modelVersion("fallback")
                .confidence(0.6)
                .mlAlgorithm("traditional")
                .build();
    }

    private UserWeatherPreferences getUserWeatherPreferences(String userId) {
        return mlRepository.getUserWeatherPreferences(userId)
                .orElse(createDefaultUserPreferences(userId));
    }

    private List<WeatherJournalEntry> getRecentJournalEntries(String userId, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        LocalDateTime endDate = LocalDateTime.now();
        return mlRepository.getJournalEntriesByUserAndDateRange(userId, startDate, endDate);
    }

    private PersonalizedWeatherRecommendations createDefaultRecommendations(Location location) {
        // Create basic recommendations when personalization fails
        return PersonalizedWeatherRecommendations.builder()
                .location(location)
                .generationTime(LocalDateTime.now())
                .recommendations(List.of())
                .confidenceScore(0.3)
                .build();
    }

    private UserWeatherPreferences createDefaultUserPreferences(String userId) {
        return UserWeatherPreferences.builder()
                .userId(userId)
                .preferredTemperatureRange(new TemperatureRange(18.0, 25.0))
                .preferredActivities(List.of("walking", "outdoor dining"))
                .weatherSensitivities(List.of())
                .build();
    }

    private void savePredictionForValidation(WeatherMLPrediction prediction) {
        mlRepository.savePredictionForValidation(prediction);
    }

    private void savePersonalizedRecommendations(String userId, PersonalizedWeatherRecommendations recommendations) {
        mlRepository.savePersonalizedRecommendations(userId, recommendations);
    }

    // Additional helper methods for analysis would be implemented here
    private TemperaturePatterns analyzeTemperaturePatterns(List<WeatherData> data) {
        // Implementation for temperature pattern analysis
        return new TemperaturePatterns();
    }

    private PrecipitationPatterns analyzePrecipitationPatterns(List<WeatherData> data) {
        // Implementation for precipitation pattern analysis
        return new PrecipitationPatterns();
    }

    private SeasonalTrends analyzeSeasonalTrends(List<WeatherData> data) {
        // Implementation for seasonal trend analysis
        return new SeasonalTrends();
    }

    private List<WeatherAnomaly> detectWeatherAnomalies(List<WeatherData> data) {
        // Implementation for anomaly detection
        return List.of();
    }

    private List<PatternPrediction> predictUpcomingPatterns(List<WeatherData> data, Location location) {
        // Implementation for pattern prediction
        return List.of();
    }

    private WeatherAccuracyMetrics calculateAccuracyMetrics(List<WeatherMLPrediction> predictions, List<WeatherData> actual) {
        // Implementation for accuracy calculation
        return new WeatherAccuracyMetrics();
    }

    private MLTrainingDataset prepareTrainingDataset(List<WeatherData> data, Location location) {
        // Implementation for training dataset preparation
        return new MLTrainingDataset();
    }

    private ModelValidationResult validateModel(WeatherPredictionModel model, List<WeatherData> data) {
        // Implementation for model validation
        return new ModelValidationResult();
    }

    private Map<String, List<String>> analyzeUserMoodPatterns(List<WeatherJournalEntry> entries) {
        // Implementation for mood pattern analysis
        return new HashMap<>();
    }

    private Map<String, List<String>> analyzeUserActivityPatterns(List<WeatherJournalEntry> entries) {
        // Implementation for activity pattern analysis
        return new HashMap<>();
    }

    private List<PersonalizedRecommendation> generateActivityRecommendations(WeatherData current,
                                                                             Map<String, List<String>> patterns, UserWeatherPreferences preferences) {
        // Implementation for activity recommendations
        return List.of();
    }

    private List<PersonalizedRecommendation> generateClothingRecommendations(WeatherData current,
                                                                             UserWeatherPreferences preferences) {
        // Implementation for clothing recommendations
        return List.of();
    }

    private List<PersonalizedRecommendation> generateMoodRecommendations(WeatherData current,
                                                                         Map<String, List<String>> moodPatterns) {
        // Implementation for mood-based recommendations
        return List.of();
    }

    private List<PersonalizedRecommendation> generateTimingRecommendations(List<ForecastData> forecast,
                                                                           UserWeatherPreferences preferences) {
        // Implementation for timing recommendations
        return List.of();
    }

    private double calculateRecommendationConfidence(List<WeatherJournalEntry> entries) {
        // Calculate confidence based on amount of user data available
        if (entries.isEmpty()) return 0.3;
        if (entries.size() < 10) return 0.5;
        if (entries.size() < 50) return 0.7;
        return 0.9;
    }

    private TemperatureTrend analyzeTemperatureTrend(List<WeatherData> data, int years) {
        // Implementation for temperature trend analysis
        return new TemperatureTrend();
    }

    private PrecipitationTrend analyzePrecipitationTrend(List<WeatherData> data, int years) {
        // Implementation for precipitation trend analysis
        return new PrecipitationTrend();
    }

    private ExtremeWeatherTrend analyzeExtremeWeatherTrend(List<WeatherData> data, int years) {
        // Implementation for extreme weather trend analysis
        return new ExtremeWeatherTrend();
    }

    private List<ClimateProjection> generateClimateProjections(List<WeatherData> data, Location location) {
        // Implementation for climate projections
        return List.of();
    }
} prediction
MLPredictionResult mlResult = predictionModel.predict(inputFeatures, hoursAhead);

// Combine with traditional forecast for hybrid approach
List<ForecastData> traditionalForecast = weatherService.getHourlyForecast(location);

WeatherMLPrediction enhancedPrediction = combineMLWithTraditionalForecast(
        mlResult, traditionalForecast, currentWeather, location, hoursAhead);

// Save ML prediction for accuracy tracking
savePredictionForValidation(enhancedPrediction);

            log.info("ML-enhanced forecast generated for: {}", location.getCity());
        return enhancedPrediction;

        } catch (Exception e) {
        log.error("Error generating ML-enhanced forecast: {}", e.getMessage());
        // Fallback to traditional forecast
        return createFallbackPrediction(location, hoursAhead);
        }
                }

public PersonalizedWeatherRecommendations getPersonalizedRecommendations(String userId, Location location) {
    try {
        log.info("Generating personalized weather recommendations for user: {} at {}", userId, location.getCity());

        // Get user's historical preferences and behavior
        UserWeatherPreferences preferences = getUserWeatherPreferences(userId);
        List<WeatherJournalEntry> journalEntries = getRecentJournalEntries(userId, 90); // Last 3 months

        // Get current and forecast weather
        WeatherData currentWeather = weatherService.getCurrentWeather(location);
        List<ForecastData> forecast = weatherService.getForecast(location, 7);

        // Generate ML
