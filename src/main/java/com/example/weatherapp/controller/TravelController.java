package com.example.weatherapp.controller;

import com.example.weatherapp.dto.TravelPlannerDto;
import com.example.weatherapp.service.TravelPlannerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/travel")
@RequiredArgsConstructor
public class TravelController {

    private final TravelPlannerService travelPlannerService;

    @PostMapping("/plan")
    public ResponseEntity<TravelPlannerDto> planTrip(@RequestBody TravelPlannerDto travelPlan) {
        return ResponseEntity.ok(travelPlannerService.getTravelPlan(travelPlan));
    }
}
