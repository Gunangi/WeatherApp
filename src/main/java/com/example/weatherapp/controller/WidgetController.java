package com.example.weatherapp.controller;

import com.example.weatherapp.dto.WidgetConfigDTO;
import com.example.weatherapp.model.User;
import com.example.weatherapp.service.UserService;
import com.example.weatherapp.service.WidgetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/widget")
public class WidgetController {

    private final WidgetService widgetService;
    private final UserService userService;

    public WidgetController(WidgetService widgetService, UserService userService) {
        this.widgetService = widgetService;
        this.userService = userService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, String>> generateWidget(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody WidgetConfigDTO widgetConfig) {

        User user = userDetails != null ? userService.getUserByUsername(userDetails.getUsername()) : null;
        Map<String, String> widgetCode = widgetService.generateWidgetCode(user, widgetConfig);
        return ResponseEntity.ok(widgetCode);
    }

    @GetMapping("/preview")
    public ResponseEntity<String> previewWidget(@Valid WidgetConfigDTO widgetConfig) {
        String widgetPreview = widgetService.generateWidgetPreview(widgetConfig);
        return ResponseEntity.ok(widgetPreview);
    }

    @GetMapping("/embed/{widgetId}")
    public ResponseEntity<String> getEmbeddedWidget(@PathVariable String widgetId) {
        String widget = widgetService.getWidgetHtml(widgetId);
        return ResponseEntity.ok(widget);
    }

    @GetMapping("/json/{widgetId}")
    public ResponseEntity<Map<String, Object>> getWidgetData(@PathVariable String widgetId) {
        Map<String, Object> widgetData = widgetService.getWidgetData(widgetId);
        return ResponseEntity.ok(widgetData);
    }
}