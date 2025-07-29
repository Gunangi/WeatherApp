package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AirQualityComponents {
    private double co;      // Carbon monoxide
    private double no;      // Nitric oxide
    private double no2;     // Nitrogen dioxide
    private double o3;      // Ozone
    private double so2;     // Sulphur dioxide
    private double pm2_5;   // Fine particles matter
    private double pm10;    // Coarse particulate matter
    private double nh3;     // Ammonia
}
