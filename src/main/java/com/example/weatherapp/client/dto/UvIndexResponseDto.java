// src/main/java/com/example/weatherapp/client/dto/UvIndexResponseDto.java
package com.example.weatherapp.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UvIndexResponseDto {
    private double lat;
    private double lon;
    private long date_iso;
    private long date;
    private double value;
}