package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "weather_data")
public class WeatherData {
    @Id
    private String id;
    private String city;
    private double temperature;
    private String condition;
    private int humidity;
    private double windSpeed;
    private String icon;
    private String description;


    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public int getHumidity() { return humidity; }
    public void setHumidity(int humidity) { this.humidity = humidity; }

    public double getWindSpeed() { return windSpeed; }
    public void setWindSpeed(double windSpeed) { this.windSpeed = windSpeed; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon  = icon; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

}



