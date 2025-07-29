package com.example.weatherapp.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationSearchResult {
    private String name;
    private String localName;
    private double latitude;
    private double longitude;
    private String country;
    private String state;
    private String displayName;
    private double relevanceScore;
}