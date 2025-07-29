package com.example.weatherapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClothingRecommendation {
    private List<ClothingItem> essentialItems;
    private List<ClothingItem> recommendedItems;
    private List<ClothingItem> optionalItems;
    private String overallAdvice;
    private String colorRecommendation;
    private String materialRecommendation;
}