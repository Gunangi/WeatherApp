package com.example.weatherapp;

import com.example.weatherapp.config.AppConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = AppConfiguration.class)
class WeatherAppApplicationTests {

    @Autowired
    private ApplicationContext context;

    @Test
    void contextLoads() {
        // Verify essential beans are created
        assertThat(context.getBean(AppConfiguration.class)).isNotNull();
        assertThat(context.getBean(RestTemplate.class)).isNotNull();
    }

    @Test
    void listRestTemplateBeans() {
        String[] beanNames = context.getBeanNamesForType(RestTemplate.class);
        System.out.println("RestTemplate beans:");
        for (String name : beanNames) {
            System.out.println(" - " + name);
        }
    }
}
