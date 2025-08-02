// src/main/java/com/weatherapp/service/ActivityRecommendationService.java
package com.example.weatherapp.service;

import com.example.weatherapp.dto.WeatherResponse;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class ActivityRecommendationService {

    public List<String> getRecommendations(WeatherResponse weather) {
        List<String> recommendations = new ArrayList<>();

        String desc = weather.getWeatherDescription().toLowerCase();

        if (desc.contains("rain") || desc.contains("thunderstorm") || desc.contains("drizzle")) {
            recommendations.add("Visit a museum or art gallery.");
            recommendations.add("Catch a movie at the cinema.");
            recommendations.add("Try an indoor climbing gym or a bowling alley.");
            recommendations.add("Explore a new recipe and cook at home.");
            recommendations.add("Cozy up with a good book and hot tea.");
            recommendations.add("Have a board game marathon with friends or family.");
            recommendations.add("Visit an indoor market or shopping mall.");

        } else if (weather.getTemperature() > 28 && !desc.contains("cloud")) {
            recommendations.add("Go for a swim at a local pool or beach.");
            recommendations.add("Enjoy a picnic in a shaded park.");
            recommendations.add("Find a cafe with outdoor seating and a cool drink.");
            recommendations.add("Visit a water park for a fun day out.");
            recommendations.add("Plan an early morning or late evening walk by a lake.");
            recommendations.add("Get some ice cream or a local kulfi.");

        } else if (weather.getTemperature() > 15) {
            recommendations.add("Go for a bike ride around the city.");
            recommendations.add("Explore a new neighborhood on foot.");
            recommendations.add("Visit a historical site or a local garden.");
            recommendations.add("Try some street food from a popular local spot.");
            recommendations.add("Go for an outdoor photography walk.");
            if (weather.getWindSpeed() > 5) {
                recommendations.add("Fly a kite in an open field!");
            }
            if (weather.getCloudCover() < 30) {
                recommendations.add("Perfect weather for some stargazing tonight!");
            }

        } else if (desc.contains("snow")) {
            recommendations.add("Go skiing or snowboarding if possible.");
            recommendations.add("Build a snowman or have a snowball fight!");
            recommendations.add("Enjoy a warm cup of hot chocolate at a cafe.");
            recommendations.add("Go for a scenic walk to see the snowy landscape.");
            recommendations.add("Try some winter photography.");

        } else if (desc.contains("haze") || desc.contains("mist") || desc.contains("fog")) {
            recommendations.add("A great day for an atmospheric, moody photoshoot.");
            recommendations.add("Be cautious if driving. A good day for indoor activities.");
            recommendations.add("Enjoy a warm beverage at a local coffee shop.");
            recommendations.add("Listen to a podcast or an audiobook at home.");

        } else {
            recommendations.add("Go for a brisk walk or a hike.");
            recommendations.add("Visit a local market or a farmer's market.");
            recommendations.add("Do some outdoor yoga or meditation.");
            recommendations.add("Visit the local zoo or botanical garden.");
        }

        return recommendations;
    }
}
