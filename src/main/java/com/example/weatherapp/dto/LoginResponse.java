package com.example.weatherapp.dto;

public class LoginResponse {
    private boolean success;
    private String message;
    private String username;
    private String email;

    // Default constructor
    public LoginResponse() {}

    // Constructor with parameters
    public LoginResponse(boolean success, String message, String username, String email) {
        this.success = success;
        this.message = message;
        this.username = username;
        this.email = email;
    }

    // Getters and setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
