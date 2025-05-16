package com.example.weatherapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/login")
    public String login() {
        // Redirect to /login.html served from static folder
        return "redirect:/login.html";
    }
}


