package com.example.weatherapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/index")
    public String homePage() {
        return "index"; // Make sure weather.html exists inside templates/
    }
}
