package com.example.weatherapp.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class DebugController {

    @GetMapping("/debug/auth")
    @ResponseBody
    public String checkAuth(Authentication authentication) {
        if (authentication != null) {
            return "Authenticated as: " + authentication.getName();
        } else {
            return "Not authenticated";
        }
    }

    @GetMapping("/debug/hello")
    @ResponseBody
    public String hello() {
        return "Hello! If you see this message, the application is running correctly.";
    }
}
