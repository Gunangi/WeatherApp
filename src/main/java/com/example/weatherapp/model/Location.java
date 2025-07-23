package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // Lombok annotation to generate getters, setters, toString, etc.
@NoArgsConstructor // Lombok annotation for a no-argument constructor
@AllArgsConstructor // Lombok annotation for a constructor with all arguments
public class Location {
    private double lat;
    private double lon;
}