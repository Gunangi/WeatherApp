// src/main/java/com/weatherapp/dto/ClothingSuggestionDto.java
package com.example.weatherapp.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ClothingSuggestionDto {
    private String generalAdvice;
    private Map<String, ClothingSet> suggestions; // e.g., "casual", "workwear"
}