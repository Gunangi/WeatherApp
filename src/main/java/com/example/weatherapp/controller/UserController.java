package com.example.weatherapp.controller;

import com.example.weatherapp.dto.UserSettingsDto;
import com.example.weatherapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}/settings")
    public ResponseEntity<UserSettingsDto> getSettings(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserSettings(userId));
    }

    @PutMapping("/{userId}/settings")
    public ResponseEntity<Void> updateSettings(@PathVariable String userId, @RequestBody UserSettingsDto settingsDto) {
        userService.updateUserSettings(userId, settingsDto);
        return ResponseEntity.ok().build();
    }
}