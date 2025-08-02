package com.example.weatherapp.client.dto;

import lombok.Data;

@Data
public class GeoCoordinates {
    private String name;
    private double lat;
    private double lon;
    private String country;
}