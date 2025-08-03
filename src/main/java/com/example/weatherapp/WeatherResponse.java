package com.example.weatherapp;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class WeatherResponse {
    private String type;
    private boolean success;
    private Object data;
    private String message;
    private String error;
    private LocalDateTime timestamp;

    public WeatherResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public WeatherResponse(String type, boolean success, Object data) {
        this();
        this.type = type;
        this.success = success;
        this.data = data;
    }

    public WeatherResponse(String type, boolean success, String message) {
        this();
        this.type = type;
        this.success = success;
        this.message = message;
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    // Static factory methods for common responses
    public static WeatherResponse success(String type, Object data) {
        return new WeatherResponse(type, true, data);
    }

    public static WeatherResponse error(String type, String error) {
        WeatherResponse response = new WeatherResponse();
        response.setType(type);
        response.setSuccess(false);
        response.setError(error);
        return response;
    }

    public static WeatherResponse message(String type, String message) {
        return new WeatherResponse(type, true, message);
    }
}
