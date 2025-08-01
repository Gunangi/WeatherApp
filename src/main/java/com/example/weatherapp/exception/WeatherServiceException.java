package com.example.weatherapp.exception;

/**
 * Custom exception for weather service related errors
 * Thrown when weather API calls fail or return invalid data
 */
public class WeatherServiceException extends RuntimeException {

    private final String errorCode;
    private final int httpStatus;

    /**
     * Constructor with message only
     * @param message Error message
     */
    public WeatherServiceException(String message) {
        super(message);
        this.errorCode = "WEATHER_SERVICE_ERROR";
        this.httpStatus = 503; // Service Unavailable
    }

    /**
     * Constructor with message and cause
     * @param message Error message
     * @param cause Root cause of the exception
     */
    public WeatherServiceException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "WEATHER_SERVICE_ERROR";
        this.httpStatus = 503; // Service Unavailable
    }

    /**
     * Constructor with message, error code, and HTTP status
     * @param message Error message
     * @param errorCode Specific error code
     * @param httpStatus HTTP status code
     */
    public WeatherServiceException(String message, String errorCode, int httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    /**
     * Constructor with message, cause, error code, and HTTP status
     * @param message Error message
     * @param cause Root cause of the exception
     * @param errorCode Specific error code
     * @param httpStatus HTTP status code
     */
    public WeatherServiceException(String message, Throwable cause, String errorCode, int httpStatus) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    /**
     * Get the error code
     * @return Error code
     */
    public String getErrorCode() {
        return errorCode;
    }

    /**
     * Get the HTTP status code
     * @return HTTP status code
     */
    public int getHttpStatus() {
        return httpStatus;
    }

    // Static factory methods for common weather service errors

    /**
     * Create exception for API timeout
     * @param apiName Name of the weather API
     * @return WeatherServiceException
     */
    public static WeatherServiceException apiTimeout(String apiName) {
        return new WeatherServiceException(
                String.format("Timeout occurred while calling %s weather API", apiName),
                "API_TIMEOUT",
                408 // Request Timeout
        );
    }

    /**
     * Create exception for API rate limit exceeded
     * @param apiName Name of the weather API
     * @return WeatherServiceException
     */
    public static WeatherServiceException rateLimitExceeded(String apiName) {
        return new WeatherServiceException(
                String.format("Rate limit exceeded for %s weather API", apiName),
                "RATE_LIMIT_EXCEEDED",
                429 // Too Many Requests
        );
    }

    /**
     * Create exception for invalid API key
     * @param apiName Name of the weather API
     * @return WeatherServiceException
     */
    public static WeatherServiceException invalidApiKey(String apiName) {
        return new WeatherServiceException(
                String.format("Invalid API key for %s weather service", apiName),
                "INVALID_API_KEY",
                401 // Unauthorized
        );
    }

    /**
     * Create exception for API service unavailable
     * @param apiName Name of the weather API
     * @return WeatherServiceException
     */
    public static WeatherServiceException serviceUnavailable(String apiName) {
        return new WeatherServiceException(
                String.format("%s weather service is currently unavailable", apiName),
                "SERVICE_UNAVAILABLE",
                503 // Service Unavailable
        );
    }

    /**
     * Create exception for invalid API response
     * @param apiName Name of the weather API
     * @param reason Reason for invalid response
     * @return WeatherServiceException
     */
    public static WeatherServiceException invalidResponse(String apiName, String reason) {
        return new WeatherServiceException(
                String.format("Invalid response from %s weather API: %s", apiName, reason),
                "INVALID_RESPONSE",
                502 // Bad Gateway
        );
    }

    /**
     * Create exception for data parsing error
     * @param apiName Name of the weather API
     * @param cause Root cause of parsing error
     * @return WeatherServiceException
     */
    public static WeatherServiceException parsingError(String apiName, Throwable cause) {
        return new WeatherServiceException(
                String.format("Error parsing response from %s weather API", apiName),
                cause,
                "PARSING_ERROR",
                502 // Bad Gateway
        );
    }

    /**
     * Create exception for network connectivity issues
     * @param apiName Name of the weather API
     * @param cause Root cause of network error
     * @return WeatherServiceException
     */
    public static WeatherServiceException networkError(String apiName, Throwable cause) {
        return new WeatherServiceException(
                String.format("Network error while connecting to %s weather API", apiName),
                cause,
                "NETWORK_ERROR",
                503 // Service Unavailable
        );
    }

    /**
     * Create exception for quota exceeded
     * @param apiName Name of the weather API
     * @return WeatherServiceException
     */
    public static WeatherServiceException quotaExceeded(String apiName) {
        return new WeatherServiceException(
                String.format("API quota exceeded for %s weather service", apiName),
                "QUOTA_EXCEEDED",
                402 // Payment Required
        );
    }

    /**
     * Create exception for unsupported location
     * @param location Location that is not supported
     * @param apiName Name of the weather API
     * @return WeatherServiceException
     */
    public static WeatherServiceException unsupportedLocation(String location, String apiName) {
        return new WeatherServiceException(
                String.format("Location '%s' is not supported by %s weather API", location, apiName),
                "UNSUPPORTED_LOCATION",
                400 // Bad Request
        );
    }

    /**
     * Create exception for missing required data
     * @param dataType Type of missing data
     * @param location Location for which data is missing
     * @return WeatherServiceException
     */
    public static WeatherServiceException missingData(String dataType, String location) {
        return new WeatherServiceException(
                String.format("Required %s data is not available for location: %s", dataType, location),
                "MISSING_DATA",
                204 // No Content
        );
    }

    @Override
    public String toString() {
        return String.format("WeatherServiceException{errorCode='%s', httpStatus=%d, message='%s'}",
                errorCode, httpStatus, getMessage());
    }
}
