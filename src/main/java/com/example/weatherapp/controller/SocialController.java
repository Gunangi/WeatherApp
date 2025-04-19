package com.example.weatherapp.controller;

import com.example.weatherapp.dto.SocialShareDTO;
import com.example.weatherapp.dto.WeatherReportDTO;
import com.example.weatherapp.model.User;
import com.example.weatherapp.service.SocialService;
import com.example.weatherapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/social")
public class SocialController {

    private final SocialService socialService;
    private final UserService userService;

    public SocialController(SocialService socialService, UserService userService) {
        this.socialService = socialService;
        this.userService = userService;
    }

    @PostMapping("/share")
    public ResponseEntity<Map<String, String>> shareWeather(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SocialShareDTO shareDTO) {

        User user = userDetails != null ? userService.getUserByUsername(userDetails.getUsername()) : null;
        Map<String, String> shareLinks = socialService.generateSocialShareLinks(user, shareDTO);
        return ResponseEntity.ok(shareLinks);
    }

    @PostMapping("/report")
    public ResponseEntity<WeatherReportDTO> reportWeatherCondition(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody WeatherReportDTO reportDTO) {

        User user = userDetails != null ? userService.getUserByUsername(userDetails.getUsername()) : null;
        WeatherReportDTO savedReport = socialService.saveWeatherReport(user, reportDTO);
        return ResponseEntity.ok(savedReport);
    }

    @GetMapping("/reports")
    public ResponseEntity<List<WeatherReportDTO>> getRecentReports(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Double radius,
            @RequestParam(defaultValue = "10") Integer limit) {

        List<WeatherReportDTO> reports;
        if (lat != null && lon != null) {
            double radiusValue = radius != null ? radius : 10.0; // Default 10km radius
            reports = socialService.getReportsNearLocation(lat, lon, radiusValue, limit);
        } else {
            reports = socialService.getRecentReports(limit);
        }

        return ResponseEntity.ok(reports);
    }
}