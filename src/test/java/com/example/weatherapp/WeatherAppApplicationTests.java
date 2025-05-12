package com.example.weatherapp;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class WeatherAppApplicationTests {

    @Autowired
    private ApplicationContext context;

    @Test
    void contextLoads() {
        // Verify RestTemplate bean is created
        assertThat(context.getBean(RestTemplate.class)).isNotNull();

        // Print out all bean names for debugging
        String[] beanNames = context.getBeanDefinitionNames();
        System.out.println("Beans loaded:");
        for (String beanName : beanNames) {
            System.out.println(beanName);
        }
    }

    @Test
    void testRestTemplateBean() {
        RestTemplate restTemplate = context.getBean(RestTemplate.class);
        assertThat(restTemplate).isNotNull();
    }
}
