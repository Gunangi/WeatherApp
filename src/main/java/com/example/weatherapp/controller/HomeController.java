package com.example.weatherapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        // Redirect to /login.html served from static folder
        return "redirect:/login.html";
    }
}

