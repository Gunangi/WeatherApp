package com.example.weatherapp.controller;

import com.example.weatherapp.service.UserService;

public class LoginControllerBuilder {
    private UserService userService;

    public LoginControllerBuilder setUserService(UserService userService) {
        this.userService = userService;
        return this;
    }

    public LoginController createLoginController() {
        return new LoginController(userService);
    }
}