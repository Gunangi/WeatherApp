package com.example.weatherapp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Basic integration test for the WeatherApp application.
 * This test verifies that the Spring application context loads successfully.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "openweathermap.api.key=test-api-key",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration,org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration"
})
class WeatherAppApplicationTests {

    /**
     * This test verifies that the Spring application context loads without any issues.
     * It's a basic "smoke test" to ensure the application starts up correctly.
     */
    @Test
    void contextLoads() {
        // This test will pass if the application context loads successfully
        // No additional assertions are needed for this basic test
    }
}