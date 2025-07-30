package com.example.weatherapp.exception;

import com.example.weatherapp.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Weather-specific exceptions
    @ExceptionHandler(WeatherServiceException.class)
    public ResponseEntity<ErrorResponse> handleWeatherServiceException(
            WeatherServiceException ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.error("Weather service error [{}]: {}", requestId, ex.getMessage(), ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error("Weather Service Error")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .build();

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
    }

    @ExceptionHandler(LocationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleLocationNotFoundException(
            LocationNotFoundException ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.warn("Location not found [{}]: {}", requestId, ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Location Not Found")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleRateLimitExceededException(
            RateLimitExceededException ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.warn("Rate limit exceeded [{}]: {}", requestId, ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .error("Rate Limit Exceeded")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .details(Map.of(
                        "retryAfter", ex.getRetryAfter(),
                        "limit", ex.getLimit(),
                        "window", ex.getWindow()
                ))
                .build();

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(errorResponse);
    }

    @ExceptionHandler(InvalidWeatherDataException.class)
    public ResponseEntity<ErrorResponse> handleInvalidWeatherDataException(
            InvalidWeatherDataException ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.error("Invalid weather data [{}]: {}", requestId, ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Invalid Weather Data")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    // Validation exceptions
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        String requestId = generateRequestId();
        Map<String, String> validationErrors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationErrors.put(fieldName, errorMessage);
        });

        logger.warn("Validation failed [{}]: {}", requestId, validationErrors);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("Request validation failed")
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .details(Map.of("validationErrors", validationErrors))
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException ex, WebRequest request) {

        String requestId = generateRequestId();
        Map<String, String> validationErrors = new HashMap<>();

        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            validationErrors.put(fieldName, errorMessage);
        }

        logger.warn("Constraint violation [{}]: {}", requestId, validationErrors);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Constraint Violation")
                .message("Request constraint validation failed")
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .details(Map.of("validationErrors", validationErrors))
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    // Security exceptions
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.warn("Authentication failed [{}]: {}", requestId, ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Authentication Failed")
                .message("Invalid credentials or token")
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.warn("Access denied [{}]: {}", requestId, ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error("Access Denied")
                .message("Insufficient permissions to access this resource")
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    // HTTP client exceptions
    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<ErrorResponse> handleHttpClientErrorException(
            HttpClientErrorException ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.error("HTTP client error [{}]: {} - {}", requestId, ex.getStatusCode(), ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(ex.getStatusCode().value())
                .error("External Service Error")
                .message("Error communicating with external weather service")
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .build();

        return ResponseEntity.status(ex.getStatusCode()).body(errorResponse);
    }

    @ExceptionHandler(HttpServerErrorException.class)
    public ResponseEntity<ErrorResponse> handleHttpServerErrorException(
            HttpServerErrorException ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.error("HTTP server error [{}]: {} - {}", requestId, ex.getStatusCode(), ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_GATEWAY.value())
                .error("External Service Unavailable")
                .message("Weather service is temporarily unavailable")
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(errorResponse);
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<ErrorResponse> handleResourceAccessException(
            ResourceAccessException ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.error("Resource access error [{}]: {}", requestId, ex.getMessage(), ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error("Service Timeout")
                .message("Weather service request timed out")
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .build();

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
    }

    // General exceptions
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.warn("Illegal argument [{}]: {}", requestId, ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Invalid Request")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.warn("Method argument type mismatch [{}]: {}", requestId, ex.getMessage());

        String message = String.format("Invalid value '%s' for parameter '%s'. Expected type: %s",
                ex.getValue(), ex.getName(), ex.getRequiredType().getSimpleName());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Type Mismatch")
                .message(message)
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestParameterException(
            MissingServletRequestParameterException ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.warn("Missing request parameter [{}]: {}", requestId, ex.getMessage());

        String message = String.format("Required parameter '%s' is missing", ex.getParameterName());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Missing Parameter")
                .message(message)
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.warn("HTTP message not readable [{}]: {}", requestId, ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Malformed Request")
                .message("Request body is malformed or unreadable")
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    // Catch-all exception handler
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, WebRequest request) {

        String requestId = generateRequestId();
        logger.error("Unexpected error [{}]: {}", requestId, ex.getMessage(), ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred")
                .path(request.getDescription(false).replace("uri=", ""))
                .requestId(requestId)
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    private String generateRequestId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}

// Custom exception classes
class WeatherServiceException extends RuntimeException {
    public WeatherServiceException(String message) {
        super(message);
    }

    public WeatherServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}

class LocationNotFoundException extends RuntimeException {
    public LocationNotFoundException(String message) {
        super(message);
    }
}

class RateLimitExceededException extends RuntimeException {
    private final int retryAfter;
    private final int limit;
    private final String window;

    public RateLimitExceededException(String message, int retryAfter, int limit, String window) {
        super(message);
        this.retryAfter = retryAfter;
        this.limit = limit;
        this.window = window;
    }

    public int getRetryAfter() { return retryAfter; }
    public int getLimit() { return limit; }
    public String getWindow() { return window; }
}

class InvalidWeatherDataException extends RuntimeException {
    public InvalidWeatherDataException(String message) {
        super(message);
    }

    public InvalidWeatherDataException(String message, Throwable cause) {
        super(message, cause);
    }
}