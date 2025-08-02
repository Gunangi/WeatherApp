// src/main/java/com/weatherapp/dto/ClothingSet.java
package com.example.weatherapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class ClothingSet {
    private List<String> topwear;
    private List<String> bottomwear;
    private List<String> footwear;
    private List<String> outerwear;
    private List<String> accessories;
}
