// src/test/java/com/weatherapp/WeatherApplicationTests.java

package com.example.weatherapp;

import com.example.weatherapp.controller.WeatherController;
import com.example.weatherapp.service.WeatherService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * This class contains tests for the Spring Boot application.
 */
@SpringBootTest
class ApplicationContextTest {

    /**
     * A simple sanity check test that will fail if the application context cannot start.
     */
    @Test
    void contextLoads() {
    }
}

/**
 * This class contains tests specifically for the WeatherController.
 * Using @WebMvcTest loads only the web layer (controllers) and not the full application context,
 * making the tests faster and more focused.
 */
@WebMvcTest(WeatherController.class)
class WeatherControllerTests {

    @Autowired
    private MockMvc mockMvc;

    // We use @MockBean to create and inject a mock for the WeatherService.
    // This prevents the actual service from being called, so we don't make real API calls during tests.
    @MockBean
    private WeatherService weatherService;

    /**
     * Tests the GET /api/weather/current endpoint.
     * It verifies that the controller returns a 200 OK status and the expected JSON string.
     * @throws Exception if the mock MVC call fails
     */
    @Test
    void testGetCurrentWeather() throws Exception {
        String city = "London";
        String mockJsonResponse = "{\"coord\":{\"lon\":-0.1257,\"lat\":51.5085},\"weather\":[{\"id\":800,\"main\":\"Clear\",\"description\":\"clear sky\",\"icon\":\"01d\"}],\"main\":{\"temp\":15.0}}";

        // Define the behavior of the mocked WeatherService.
        // When getCurrentWeather("London") is called, it should return our mock JSON.
        given(weatherService.getCurrentWeather(city)).willReturn(mockJsonResponse);

        // Perform a GET request to the endpoint and assert the results.
        mockMvc.perform(get("/api/weather/current").param("city", city))
                .andExpect(status().isOk()) // Expect HTTP 200 OK
                .andExpect(content().string(mockJsonResponse)); // Expect the response body to be our mock JSON
    }

    /**
     * Tests the GET /api/weather/current endpoint with a city that doesn't exist.
     * It verifies that the controller can handle this case gracefully.
     * @throws Exception if the mock MVC call fails
     */
    @Test
    void testGetCurrentWeather_CityNotFound() throws Exception {
        String city = "InvalidCity";

        // When the service is called with an invalid city, we can simulate it returning null or an error message.
        given(weatherService.getCurrentWeather(city)).willReturn("{\"cod\":\"404\",\"message\":\"city not found\"}");

        mockMvc.perform(get("/api/weather/current").param("city", city))
                .andExpect(status().isOk()) // The controller itself returns OK, but the body contains the error
                .andExpect(content().json("{\"cod\":\"404\",\"message\":\"city not found\"}"));
    }
}