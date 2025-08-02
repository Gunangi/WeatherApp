package com.example.weatherapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "airQualityData")
public class AirQualityData {
    @Id
    private String id;
    private String city;
    private int aqi;
    private double co;
    private double no2;
    private double o3;
    private double so2;
    private double nh3;
    private double pb;
    private double no;
    private double pm10;
}