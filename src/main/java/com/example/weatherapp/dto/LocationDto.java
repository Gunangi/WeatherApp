package com.example.weatherapp.dto;

import lombok.Data;

@Data
public class LocationDto {
    private String city;
    private String state;
    private String country;
    private double latitude;
    private double longitude;
    private String countryCode;
    private String timezone;
    private Integer searchCount;

}