// src/test/java/com/example/weatherapp/WeatherAppApplicationTests.java

package com.example.weatherapp;

import com.example.weatherapp.controller.WeatherController;
import com.example.weatherapp.service.WeatherService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * This class contains a basic test to ensure the Spring application context loads.
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
 * Using @MockBean to mock the WeatherService dependency.
 */
@WebMvcTest(WeatherController.class)
class WeatherControllerTests {

    @Autowired
    private MockMvc mockMvc;

    // Mock the WeatherService using Spring Boot's @MockBean
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

        // Define the behavior of the mocked WeatherService using Mockito's 'when'.
        when(weatherService.getCurrentWeather(city)).thenReturn(mockJsonResponse);

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

        // When the service is called with an invalid city, we simulate it returning an error message.
        when(weatherService.getCurrentWeather(city)).thenReturn("{\"cod\":\"404\",\"message\":\"city not found\"}");

        mockMvc.perform(get("/api/weather/current").param("city", city))
                .andExpect(status().isOk()) // The controller itself returns OK, but the body contains the error
                .andExpect(content().json("{\"cod\":\"404\",\"message\":\"city not found\"}"));
    }
}