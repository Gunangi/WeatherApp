package com.example.weatherapp.controller;

import com.example.weatherapp.dto.WeatherShareDto;
import com.example.weatherapp.dto.WeatherReportDto;
import com.example.weatherapp.service.WeatherSharingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/weather-sharing")
@CrossOrigin(origins = "*")
public class WeatherSharingController {

    @Autowired
    private WeatherSharingService weatherSharingService;

    @PostMapping("/share")
    public ResponseEntity<Map<String, String>> shareWeatherReport(@Valid @RequestBody WeatherShareDto shareDto) {
        Map<String, String> shareLinks = weatherSharingService.shareWeatherReport(shareDto);
        return ResponseEntity.ok(shareLinks);
    }

    @PostMapping("/generate-image")
    public ResponseEntity<String> generateWeatherImage(@Valid @RequestBody WeatherReportDto reportDto) {
        String imageUrl = weatherSharingService.generateWeatherImage(reportDto);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @PostMapping("/share/social/{platform}")
    public ResponseEntity<String> shareToSocialPlatform(
            @PathVariable String platform,
            @Valid @RequestBody WeatherShareDto shareDto) {
        String shareUrl = weatherSharingService.shareToSocialPlatform(platform, shareDto);
        return ResponseEntity.ok(Map.of("shareUrl", shareUrl));
    }

    @PostMapping("/share/email")
    public ResponseEntity<String> shareViaEmail(@Valid @RequestBody WeatherShareDto shareDto) {
        String result = weatherSharingService.shareViaEmail(shareDto);
        return ResponseEntity.ok(Map.of("message", result));
    }

    @PostMapping("/share/whatsapp")
    public ResponseEntity<String> shareViaWhatsApp(@Valid @RequestBody WeatherShareDto shareDto) {
        String whatsappUrl = weatherSharingService.shareViaWhatsApp(shareDto);
        return ResponseEntity.ok(Map.of("whatsappUrl", whatsappUrl));
    }

    @GetMapping("/template/{templateId}")
    public ResponseEntity<String> getShareTemplate(@PathVariable String templateId) {
        String template = weatherSharingService.getShareTemplate(templateId);
        return ResponseEntity.ok(Map.of("template", template));
    }

    @GetMapping("/templates")
    public ResponseEntity<Map<String, String>> getAllShareTemplates() {
        Map<String, String> templates = weatherSharingService.getAllShareTemplates();
        return ResponseEntity.ok(templates);
    }

    @PostMapping("/custom-message")
    public ResponseEntity<String> generateCustomShareMessage(@Valid @RequestBody WeatherShareDto shareDto) {
        String customMessage = weatherSharingService.generateCustomShareMessage(shareDto);
        return ResponseEntity.ok(Map.of("message", customMessage));
    }

    @PostMapping("/share/qr-code")
    public ResponseEntity<String> generateQRCode(@Valid @RequestBody WeatherReportDto reportDto) {
        String qrCodeUrl = weatherSharingService.generateQRCode(reportDto);
        return ResponseEntity.ok(Map.of("qrCodeUrl", qrCodeUrl));
    }

    @GetMapping("/share-history/{userId}")
    public ResponseEntity<Object> getShareHistory(@PathVariable String userId) {
        Object shareHistory = weatherSharingService.getShareHistory(userId);
        return ResponseEntity.ok(shareHistory);
    }
}