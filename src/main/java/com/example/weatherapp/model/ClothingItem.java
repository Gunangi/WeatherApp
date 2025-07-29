package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClothingItem {
    private String name;
    private String category; // outer, inner, footwear, accessories
    private String description;
    private int priority; // 1-5
    private String reason;
    private String icon;
}
