package com.example.weatherapp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class WeatherService {

    @Value("${openweather.api.key}")
    private String apiKey;

    private final String BASE_URL = "https://api.openweathermap.org";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WeatherResponse getCurrentWeather(String city, String units) throws Exception {
        String url = String.format("%s/data/2.5/weather?q=%s&appid=%s&units=%s",
                BASE_URL, city, apiKey, units);

        String response = restTemplate.getForObject(url, String.class);
        JsonNode jsonNode = objectMapper.readTree(response);

        WeatherResponse weatherResponse = new WeatherResponse();
        weatherResponse.setType("current");
        weatherResponse.setSuccess(true);

        Map<String, Object> currentWeather = new HashMap<>();
        currentWeather.put("temperature", jsonNode.get("main").get("temp").asDouble());
        currentWeather.put("feelsLike", jsonNode.get("main").get("feels_like").asDouble());
        currentWeather.put("humidity", jsonNode.get("main").get("humidity").asInt());
        currentWeather.put("pressure", jsonNode.get("main").get("pressure").asInt());
        currentWeather.put("visibility", jsonNode.get("visibility").asInt());
        currentWeather.put("windSpeed", jsonNode.get("wind").get("speed").asDouble());
        currentWeather.put("windDirection", jsonNode.has("wind") && jsonNode.get("wind").has("deg") ?
                jsonNode.get("wind").get("deg").asInt() : 0);

        // Weather description
        JsonNode weather = jsonNode.get("weather").get(0);
        currentWeather.put("description", weather.get("description").asText());
        currentWeather.put("main", weather.get("main").asText());
        currentWeather.put("icon", weather.get("icon").asText());

        // Location and time
        currentWeather.put("city", jsonNode.get("name").asText());
        currentWeather.put("country", jsonNode.get("sys").get("country").asText());
        currentWeather.put("timezone", jsonNode.get("timezone").asLong());

        // Sunrise and sunset
        long sunrise = jsonNode.get("sys").get("sunrise").asLong();
        long sunset = jsonNode.get("sys").get("sunset").asLong();
        currentWeather.put("sunrise", formatTimestamp(sunrise, jsonNode.get("timezone").asLong()));
        currentWeather.put("sunset", formatTimestamp(sunset, jsonNode.get("timezone").asLong()));

        // Coordinates
        JsonNode coord = jsonNode.get("coord");
        currentWeather.put("lat", coord.get("lat").asDouble());
        currentWeather.put("lon", coord.get("lon").asDouble());

        weatherResponse.setData(currentWeather);
        return weatherResponse;
    }

    public WeatherResponse getCurrentWeatherByCoordinates(double lat, double lon, String units) throws Exception {
        String url = String.format("%s/data/2.5/weather?lat=%f&lon=%f&appid=%s&units=%s",
                BASE_URL, lat, lon, apiKey, units);

        String response = restTemplate.getForObject(url, String.class);
        JsonNode jsonNode = objectMapper.readTree(response);

        // Similar processing as getCurrentWeather but with coordinates
        WeatherResponse weatherResponse = new WeatherResponse();
        weatherResponse.setType("current");
        weatherResponse.setSuccess(true);

        Map<String, Object> currentWeather = new HashMap<>();
        currentWeather.put("temperature", jsonNode.get("main").get("temp").asDouble());
        currentWeather.put("feelsLike", jsonNode.get("main").get("feels_like").asDouble());
        currentWeather.put("humidity", jsonNode.get("main").get("humidity").asInt());
        currentWeather.put("pressure", jsonNode.get("main").get("pressure").asInt());
        currentWeather.put("visibility", jsonNode.get("visibility").asInt());
        currentWeather.put("windSpeed", jsonNode.get("wind").get("speed").asDouble());

        JsonNode weather = jsonNode.get("weather").get(0);
        currentWeather.put("description", weather.get("description").asText());
        currentWeather.put("main", weather.get("main").asText());
        currentWeather.put("icon", weather.get("icon").asText());

        currentWeather.put("city", jsonNode.get("name").asText());
        currentWeather.put("country", jsonNode.get("sys").get("country").asText());

        weatherResponse.setData(currentWeather);
        return weatherResponse;
    }

    public WeatherResponse getForecast(String city, String units) throws Exception {
        String url = String.format("%s/data/2.5/forecast?q=%s&appid=%s&units=%s",
                BASE_URL, city, apiKey, units);

        String response = restTemplate.getForObject(url, String.class);
        JsonNode jsonNode = objectMapper.readTree(response);

        WeatherResponse weatherResponse = new WeatherResponse();
        weatherResponse.setType("forecast");
        weatherResponse.setSuccess(true);

        List<Map<String, Object>> forecastList = new ArrayList<>();
        JsonNode list = jsonNode.get("list");

        // Group by day for 5-day forecast
        Map<String, List<JsonNode>> dailyForecasts = new LinkedHashMap<>();

        for (JsonNode item : list) {
            long timestamp = item.get("dt").asLong();
            String date = LocalDateTime.ofInstant(Instant.ofEpochSecond(timestamp), ZoneId.systemDefault())
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

            dailyForecasts.computeIfAbsent(date, k -> new ArrayList<>()).add(item);
        }

        for (Map.Entry<String, List<JsonNode>> entry : dailyForecasts.entrySet()) {
            if (forecastList.size() >= 5) break;

            List<JsonNode> dayForecasts = entry.getValue();
            JsonNode mainForecast = dayForecasts.get(dayForecasts.size() / 2); // Middle of the day

            Map<String, Object> dayForecast = new HashMap<>();
            dayForecast.put("date", entry.getKey());
            dayForecast.put("dayOfWeek", LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(mainForecast.get("dt").asLong()),
                    ZoneId.systemDefault()).getDayOfWeek().toString());

            // Calculate min/max temperatures for the day
            double minTemp = dayForecasts.stream()
                    .mapToDouble(f -> f.get("main").get("temp_min").asDouble())
                    .min().orElse(0);
            double maxTemp = dayForecasts.stream()
                    .mapToDouble(f -> f.get("main").get("temp_max").asDouble())
                    .max().orElse(0);

            dayForecast.put("minTemp", minTemp);
            dayForecast.put("maxTemp", maxTemp);

            JsonNode weather = mainForecast.get("weather").get(0);
            dayForecast.put("description", weather.get("description").asText());
            dayForecast.put("main", weather.get("main").asText());
            dayForecast.put("icon", weather.get("icon").asText());

            dayForecast.put("humidity", mainForecast.get("main").get("humidity").asInt());
            dayForecast.put("windSpeed", mainForecast.get("wind").get("speed").asDouble());

            forecastList.add(dayForecast);
        }

        weatherResponse.setData(Map.of("forecasts", forecastList));
        return weatherResponse;
    }

    public WeatherResponse getHourlyForecast(String city, String units) throws Exception {
        String url = String.format("%s/data/2.5/forecast?q=%s&appid=%s&units=%s",
                BASE_URL, city, apiKey, units);

        String response = restTemplate.getForObject(url, String.class);
        JsonNode jsonNode = objectMapper.readTree(response);

        WeatherResponse weatherResponse = new WeatherResponse();
        weatherResponse.setType("hourly");
        weatherResponse.setSuccess(true);

        List<Map<String, Object>> hourlyList = new ArrayList<>();
        JsonNode list = jsonNode.get("list");

        // Take first 8 items (24 hours with 3-hour intervals)
        for (int i = 0; i < Math.min(8, list.size()); i++) {
            JsonNode item = list.get(i);

            Map<String, Object> hourlyForecast = new HashMap<>();
            hourlyForecast.put("datetime", formatTimestamp(item.get("dt").asLong(), 0));
            hourlyForecast.put("temperature", item.get("main").get("temp").asDouble());
            hourlyForecast.put("feelsLike", item.get("main").get("feels_like").asDouble());
            hourlyForecast.put("humidity", item.get("main").get("humidity").asInt());
            hourlyForecast.put("windSpeed", item.get("wind").get("speed").asDouble());

            JsonNode weather = item.get("weather").get(0);
            hourlyForecast.put("description", weather.get("description").asText());
            hourlyForecast.put("icon", weather.get("icon").asText());

            hourlyList.add(hourlyForecast);
        }

        weatherResponse.setData(Map.of("hourly", hourlyList));
        return weatherResponse;
    }

    public WeatherResponse getAirQuality(String city) throws Exception {
        // First get coordinates
        WeatherResponse currentWeather = getCurrentWeather(city, "metric");
        Map<String, Object> data = (Map<String, Object>) currentWeather.getData();
        double lat = (Double) data.get("lat");
        double lon = (Double) data.get("lon");

        String url = String.format("%s/data/2.5/air_pollution?lat=%f&lon=%f&appid=%s",
                BASE_URL, lat, lon, apiKey);

        String response = restTemplate.getForObject(url, String.class);
        JsonNode jsonNode = objectMapper.readTree(response);

        WeatherResponse weatherResponse = new WeatherResponse();
        weatherResponse.setType("air_quality");
        weatherResponse.setSuccess(true);

        JsonNode airQuality = jsonNode.get("list").get(0);
        Map<String, Object> aqData = new HashMap<>();

        int aqi = airQuality.get("main").get("aqi").asInt();
        aqData.put("aqi", aqi);
        aqData.put("aqiLevel", getAQILevel(aqi));
        aqData.put("aqiColor", getAQIColor(aqi));
        aqData.put("healthImpact", getHealthImpact(aqi));

        JsonNode components = airQuality.get("components");
        Map<String, Object> pollutants = new HashMap<>();
        pollutants.put("co", components.get("co").asDouble());
        pollutants.put("no", components.get("no").asDouble());
        pollutants.put("no2", components.get("no2").asDouble());
        pollutants.put("o3", components.get("o3").asDouble());
        pollutants.put("so2", components.get("so2").asDouble());
        pollutants.put("pm2_5", components.get("pm2_5").asDouble());
        pollutants.put("pm10", components.get("pm10").asDouble());
        pollutants.put("nh3", components.get("nh3").asDouble());

        aqData.put("pollutants", pollutants);
        weatherResponse.setData(aqData);
        return weatherResponse;
    }

    public WeatherResponse getHistoricalWeather(String city, long timestamp, String units) throws Exception {
        // Get coordinates first
        WeatherResponse currentWeather = getCurrentWeather(city, units);
        Map<String, Object> data = (Map<String, Object>) currentWeather.getData();
        double lat = (Double) data.get("lat");
        double lon = (Double) data.get("lon");

        String url = String.format("%s/data/3.0/onecall/timemachine?lat=%f&lon=%f&dt=%d&appid=%s&units=%s",
                BASE_URL, lat, lon, timestamp, apiKey, units);

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response);

            WeatherResponse weatherResponse = new WeatherResponse();
            weatherResponse.setType("historical");
            weatherResponse.setSuccess(true);

            JsonNode current = jsonNode.get("current");
            Map<String, Object> historicalData = new HashMap<>();
            historicalData.put("temperature", current.get("temp").asDouble());
            historicalData.put("feelsLike", current.get("feels_like").asDouble());
            historicalData.put("humidity", current.get("humidity").asInt());
            historicalData.put("pressure", current.get("pressure").asInt());
            historicalData.put("windSpeed", current.get("wind_speed").asDouble());

            JsonNode weather = current.get("weather").get(0);
            historicalData.put("description", weather.get("description").asText());
            historicalData.put("main", weather.get("main").asText());

            weatherResponse.setData(historicalData);
            return weatherResponse;
        } catch (Exception e) {
            // Fallback with mock historical data
            WeatherResponse weatherResponse = new WeatherResponse();
            weatherResponse.setType("historical");
            weatherResponse.setSuccess(true);
            weatherResponse.setData(Map.of("message", "Historical data requires OpenWeather One Call API subscription"));
            return weatherResponse;
        }
    }

    public WeatherResponse getUVIndex(String city) throws Exception {
        // Get coordinates first
        WeatherResponse currentWeather = getCurrentWeather(city, "metric");
        Map<String, Object> data = (Map<String, Object>) currentWeather.getData();
        double lat = (Double) data.get("lat");
        double lon = (Double) data.get("lon");

        String url = String.format("%s/data/2.5/uvi?lat=%f&lon=%f&appid=%s",
                BASE_URL, lat, lon, apiKey);

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response);

            WeatherResponse weatherResponse = new WeatherResponse();
            weatherResponse.setType("uv_index");
            weatherResponse.setSuccess(true);

            double uvIndex = jsonNode.get("value").asDouble();
            Map<String, Object> uvData = new HashMap<>();
            uvData.put("uvIndex", uvIndex);
            uvData.put("uvLevel", getUVLevel(uvIndex));
            uvData.put("recommendation", getUVRecommendation(uvIndex));

            weatherResponse.setData(uvData);
            return weatherResponse;
        } catch (Exception e) {
            // Fallback with estimated UV index
            WeatherResponse weatherResponse = new WeatherResponse();
            weatherResponse.setType("uv_index");
            weatherResponse.setSuccess(true);

            Map<String, Object> uvData = new HashMap<>();
            uvData.put("uvIndex", 5.0);
            uvData.put("uvLevel", "Moderate");
            uvData.put("recommendation", "Seek shade during midday hours");

            weatherResponse.setData(uvData);
            return weatherResponse;
        }
    }

    public WeatherResponse getActivityRecommendations(String city, String units) throws Exception {
        WeatherResponse currentWeather = getCurrentWeather(city, units);
        Map<String, Object> weatherData = (Map<String, Object>) currentWeather.getData();

        WeatherResponse response = new WeatherResponse();
        response.setType("activity_recommendations");
        response.setSuccess(true);

        List<String> activities = generateActivityRecommendations(weatherData);
        response.setData(Map.of("activities", activities));

        return response;
    }

    public WeatherResponse getClothingRecommendations(String city, String units) throws Exception {
        WeatherResponse currentWeather = getCurrentWeather(city, units);
        Map<String, Object> weatherData = (Map<String, Object>) currentWeather.getData();

        WeatherResponse response = new WeatherResponse();
        response.setType("clothing_recommendations");
        response.setSuccess(true);

        List<String> clothing = generateClothingRecommendations(weatherData);
        response.setData(Map.of("clothing", clothing));

        return response;
    }

    public WeatherResponse searchCities(String query) throws Exception {
        String url = String.format("%s/geo/1.0/direct?q=%s&limit=5&appid=%s",
                BASE_URL, query, apiKey);

        String response = restTemplate.getForObject(url, String.class);
        JsonNode jsonNode = objectMapper.readTree(response);

        WeatherResponse weatherResponse = new WeatherResponse();
        weatherResponse.setType("city_search");
        weatherResponse.setSuccess(true);

        List<Map<String, Object>> cities = new ArrayList<>();
        for (JsonNode city : jsonNode) {
            Map<String, Object> cityData = new HashMap<>();
            cityData.put("name", city.get("name").asText());
            cityData.put("country", city.get("country").asText());
            cityData.put("state", city.has("state") ? city.get("state").asText() : "");
            cityData.put("lat", city.get("lat").asDouble());
            cityData.put("lon", city.get("lon").asDouble());
            cities.add(cityData);
        }

        weatherResponse.setData(Map.of("cities", cities));
        return weatherResponse;
    }

    // Helper methods
    private String formatTimestamp(long timestamp, long timezoneOffset) {
        return LocalDateTime.ofInstant(
                Instant.ofEpochSecond(timestamp + timezoneOffset),
                ZoneId.of("UTC")
        ).format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private String getAQILevel(int aqi) {
        switch (aqi) {
            case 1: return "Good";
            case 2: return "Fair";
            case 3: return "Moderate";
            case 4: return "Poor";
            case 5: return "Very Poor";
            default: return "Unknown";
        }
    }

    private String getAQIColor(int aqi) {
        switch (aqi) {
            case 1: return "#00E400";
            case 2: return "#FFFF00";
            case 3: return "#FF7E00";
            case 4: return "#FF0000";
            case 5: return "#8F3F97";
            default: return "#808080";
        }
    }

    private String getHealthImpact(int aqi) {
        switch (aqi) {
            case 1: return "No health concerns";
            case 2: return "Sensitive individuals should limit outdoor activities";
            case 3: return "Everyone should limit prolonged outdoor exertion";
            case 4: return "Everyone should avoid all outdoor exertion";
            case 5: return "Emergency conditions - everyone should stay indoors";
            default: return "Unknown";
        }
    }

    private String getUVLevel(double uvIndex) {
        if (uvIndex < 3) return "Low";
        else if (uvIndex < 6) return "Moderate";
        else if (uvIndex < 8) return "High";
        else if (uvIndex < 11) return "Very High";
        else return "Extreme";
    }

    private String getUVRecommendation(double uvIndex) {
        if (uvIndex < 3) return "No protection needed";
        else if (uvIndex < 6) return "Seek shade during midday hours";
        else if (uvIndex < 8) return "Seek shade, wear sun protective clothing";
        else if (uvIndex < 11) return "Avoid being outside during midday hours";
        else return "Take all precautions - avoid sun exposure";
    }

    private List<String> generateActivityRecommendations(Map<String, Object> weather) {
        List<String> activities = new ArrayList<>();
        double temp = (Double) weather.get("temperature");
        String main = (String) weather.get("main");
        double windSpeed = (Double) weather.get("windSpeed");

        if (main.toLowerCase().contains("rain")) {
            activities.add("Visit a museum or gallery");
            activities.add("Go to a shopping mall");
            activities.add("Try indoor rock climbing");
            activities.add("Visit a cinema");
        } else if (temp > 25) {
            activities.add("Go to the beach or swimming pool");
            activities.add("Have a picnic in the park");
            activities.add("Go for a bike ride");
            activities.add("Outdoor barbecue");
        } else if (temp < 10) {
            activities.add("Visit a cozy café");
            activities.add("Go ice skating");
            activities.add("Museum hopping");
            activities.add("Indoor yoga class");
        } else {
            activities.add("Go for a walk in the park");
            activities.add("Outdoor photography");
            activities.add("Visit local markets");
            activities.add("Hiking");
        }

        if (windSpeed > 10) {
            activities.add("Go kite flying");
            activities.add("Try windsurfing");
        }

        return activities;
    }

    private List<String> generateClothingRecommendations(Map<String, Object> weather) {
        List<String> clothing = new ArrayList<>();
        double temp = (Double) weather.get("temperature");
        String main = (String) weather.get("main");
        double windSpeed = (Double) weather.get("windSpeed");
        int humidity = (Integer) weather.get("humidity");

        if (main.toLowerCase().contains("rain")) {
            clothing.add("Waterproof jacket or raincoat");
            clothing.add("Umbrella");
            clothing.add("Waterproof shoes or boots");
            clothing.add("Quick-dry clothing");
        }

        if (temp > 30) {
            clothing.add("Light, breathable fabrics");
            clothing.add("Shorts or light pants");
            clothing.add("T-shirt or tank top");
            clothing.add("Sun hat and sunglasses");
            clothing.add("Sandals or breathable shoes");
        } else if (temp > 20) {
            clothing.add("Light layers");
            clothing.add("Long pants or jeans");
            clothing.add("Light sweater or cardigan");
            clothing.add("Comfortable walking shoes");
        } else if (temp > 10) {
            clothing.add("Medium weight jacket");
            clothing.add("Long pants");
            clothing.add("Sweater or hoodie");
            clothing.add("Closed-toe shoes");
        } else if (temp > 0) {
            clothing.add("Warm coat or heavy jacket");
            clothing.add("Thermal layers");
            clothing.add("Warm pants");
            clothing.add("Gloves and warm hat");
            clothing.add("Insulated boots");
        } else {
            clothing.add("Heavy winter coat");
            clothing.add("Multiple thermal layers");
            clothing.add("Insulated pants");
            clothing.add("Winter gloves and hat");
            clothing.add("Warm winter boots");
            clothing.add("Scarf");
        }

        if (windSpeed > 15) {
            clothing.add("Windbreaker or wind-resistant jacket");
        }

        if (humidity > 80) {
            clothing.add("Moisture-wicking fabrics");
            clothing.add("Breathable materials");
        }

        return clothing;
    }
}
