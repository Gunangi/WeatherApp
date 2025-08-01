package com.example.weatherapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import javax.annotation.PostConstruct;
import java.util.TimeZone;

/**
 * Spring Boot main application class for Weather App
 *
 * Features enabled:
 * - MongoDB integration with auditing
 * - Caching for improved performance
 * - Async processing for non-blocking operations
 * - Task scheduling for periodic weather updates
 * - Configuration properties binding
 * - Web MVC for REST API endpoints
 */
@SpringBootApplication
@EnableMongoAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
@EnableConfigurationProperties
@EnableWebMvc
public class WeatherAppApplication {

    /**
     * Main method to start the Spring Boot application
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        // Set system properties for better performance
        System.setProperty("spring.devtools.restart.enabled", "false");
        System.setProperty("spring.jpa.open-in-view", "false");

        // Configure JVM options for better garbage collection
        System.setProperty("java.awt.headless", "true");

        // Start the Spring Boot application
        SpringApplication app = new SpringApplication(WeatherAppApplication.class);

        // Add custom banner
        app.setBannerMode(org.springframework.boot.Banner.Mode.CONSOLE);

        // Set default profiles if none specified
        app.setAdditionalProfiles("default");

        // Run the application
        app.run(args);
    }

    /**
     * Post-construct initialization
     * Set default timezone to UTC for consistent weather data handling
     */
    @PostConstruct
    public void init() {
        // Set default timezone to UTC for consistent date/time handling
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));

        // Log application startup
        System.out.println("=================================================");
        System.out.println("     🌤️  Weather App Started Successfully  🌤️");
        System.out.println("=================================================");
        System.out.println("Features Available:");
        System.out.println("✅ Real-time Weather Data");
        System.out.println("✅ 5-Day Weather Forecast");
        System.out.println("✅ Air Quality Monitoring");
        System.out.println("✅ Weather Alerts & Notifications");
        System.out.println("✅ Travel Weather Planning");
        System.out.println("✅ Historical Weather Data");
        System.out.println("✅ Activity & Clothing Recommendations");
        System.out.println("✅ Multi-City Weather Comparison");
        System.out.println("✅ User Preferences & Settings");
        System.out.println("✅ Location History & Favorites");
        System.out.println("=================================================");
    }
}