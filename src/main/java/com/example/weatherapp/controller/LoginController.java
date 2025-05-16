package com.example.weatherapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/login")
    public String login() {
        // Since the file is in the static directory, we need to redirect to it
        return "redirect:/login.html";
    }

    // Add a root mapping to redirect to login page
    @GetMapping("/")
    public String root() {
        return "redirect:/login.html";
    }
}


