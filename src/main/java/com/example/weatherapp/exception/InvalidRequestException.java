package com.example.weatherapp.exception;

import java.util.List;
import java.util.Map;

/**
 * Custom exception for request validation errors
 * Thrown when request parameters or body are invalid
 */
public class InvalidRequestException extends RuntimeException {

    private final String errorCode;
    private final Map<String, String> validationErrors;
    private final String field;

    /**
     * Constructor with message only
     * @param message Error message
     */
    public InvalidRequestException(String message) {
        super(message);
        this.errorCode = "INVALID_REQUEST";
        this.validationErrors = null;
        this.field = null;
    }

    /**
     * Constructor with message and error code
     * @param message Error message
     * @param errorCode Specific error code
     */
    public InvalidRequestException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.validationErrors = null;
        this.field = null;
    }

    /**
     * Constructor with message, field, and error code
     * @param message Error message
     * @param field Field that caused the validation error
     * @param errorCode Specific error code
     */
    public InvalidRequestException(String message, String field, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.validationErrors = null;
        this.field = field;
    }

    /**
     * Constructor with message and validation errors
     * @param message Error message
     * @param validationErrors Map of field validation errors
     */
    public InvalidRequestException(String message, Map<String, String> validationErrors) {
        super(message);
        this.errorCode = "VALIDATION_ERROR";
        this.validationErrors = validationErrors;
        this.field = null;
    }

    /**
     * Constructor with message, cause, and error code
     * @param message Error message
     * @param cause Root cause of the exception
     * @param errorCode Specific error code
     */
    public InvalidRequestException(String message, Throwable cause, String errorCode) {
        super(message, cause);
        this.errorCode = errorCode;
        this.validationErrors = null;
        this.field = null;
    }

    /**
     * Get the error code
     * @return Error code
     */
    public String getErrorCode() {
        return errorCode;
    }

    /**
     * Get validation errors
     * @return Map of field validation errors
     */
    public Map<String, String> getValidationErrors() {
        return validationErrors;
    }

    /**
     * Get the field that caused the validation error
     * @return Field name
     */
    public String getField() {
        return field;
    }

    // Static factory methods for common validation errors

    /**
     * Create exception for missing required parameter
     * @param parameterName Name of the missing parameter
     * @return InvalidRequestException
     */
    public static InvalidRequestException missingParameter(String parameterName) {
        return new InvalidRequestException(
                String.format("Required parameter '%s' is missing", parameterName),
                parameterName,
                "MISSING_PARAMETER"
        );
    }

    /**
     * Create exception for invalid parameter format
     * @param parameterName Name of the parameter
     * @param value Invalid value
     * @param expectedFormat Expected format
     * @return InvalidRequestException
     */
    public static InvalidRequestException invalidFormat(String parameterName, String value, String expectedFormat) {
        return new InvalidRequestException(
                String.format("Parameter '%s' has invalid format. Value: '%s', Expected: %s",
                        parameterName, value, expectedFormat),
                parameterName,
                "INVALID_FORMAT"
        );
    }

    /**
     * Create exception for parameter out of range
     * @param parameterName Name of the parameter
     * @param value Value that is out of range
     * @param minValue Minimum allowed value
     * @param maxValue Maximum allowed value
     * @return InvalidRequestException
     */
    public static InvalidRequestException outOfRange(String parameterName, Object value,
                                                     Object minValue, Object maxValue) {
        return new InvalidRequestException(
                String.format("Parameter '%s' is out of range. Value: %s, Range: [%s, %s]",
                        parameterName, value, minValue, maxValue),
                parameterName,
                "VALUE_OUT_OF_RANGE"
        );
    }

    /**
     * Create exception for invalid date range
     * @param startDate Start date parameter name
     * @param endDate End date parameter name
     * @return InvalidRequestException
     */
    public static InvalidRequestException invalidDateRange(String startDate, String endDate) {
        return new InvalidRequestException(
                String.format("Invalid date range: %s cannot be after %s", startDate, endDate),
                "INVALID_DATE_RANGE"
        );
    }

    /**
     * Create exception for unsupported value
     * @param parameterName Name of the parameter
     * @param value Unsupported value
     * @param supportedValues List of supported values
     * @return InvalidRequestException
     */
    public static InvalidRequestException unsupportedValue(String parameterName, String value,
                                                           List<String> supportedValues) {
        return new InvalidRequestException(
                String.format("Parameter '%s' has unsupported value '%s'. Supported values: %s",
                        parameterName, value, supportedValues),
                parameterName,
                "UNSUPPORTED_VALUE"
        );
    }

    /**
     * Create exception for invalid JSON structure
     * @param expectedStructure Description of expected JSON structure
     * @return InvalidRequestException
     */
    public static InvalidRequestException invalidJsonStructure(String expectedStructure) {
        return new InvalidRequestException(
                String.format("Invalid JSON structure. Expected: %s", expectedStructure),
                "INVALID_JSON_STRUCTURE"
        );
    }

    /**
     * Create exception for empty request body
     * @return InvalidRequestException
     */
    public static InvalidRequestException emptyRequestBody() {
        return new InvalidRequestException(
                "Request body cannot be empty",
                "EMPTY_REQUEST_BODY"
        );
    }

    /**
     * Create exception for invalid content type
     * @param provided Provided content type
     * @param expected Expected content type
     * @return InvalidRequestException
     */
    public static InvalidRequestException invalidContentType(String provided, String expected) {
        return new InvalidRequestException(
                String.format("Invalid content type. Provided: '%s', Expected: '%s'", provided, expected),
                "INVALID_CONTENT_TYPE"
        );
    }

    /**
     * Create exception for request too large
     * @param size Current request size
     * @param maxSize Maximum allowed size
     * @return InvalidRequestException
     */
    public static InvalidRequestException requestTooLarge(long size, long maxSize) {
        return new InvalidRequestException(
                String.format("Request size %d bytes exceeds maximum limit of %d bytes", size, maxSize),
                "REQUEST_TOO_LARGE"
        );
    }

    /**
     * Create exception for invalid coordinates
     * @param latitude Latitude value
     * @param longitude Longitude value
     * @return InvalidRequestException
     */
    public static InvalidRequestException invalidCoordinates(double latitude, double longitude) {
        return new InvalidRequestException(
                String.format("Invalid coordinates: latitude=%.6f, longitude=%.6f. " +
                                "Latitude must be between -90 and 90, longitude between -180 and 180.",
                        latitude, longitude),
                "coordinates",
                "INVALID_COORDINATES"
        );
    }

    /**
     * Create exception for invalid temperature unit
     * @param unit Invalid temperature unit
     * @return InvalidRequestException
     */
    public static InvalidRequestException invalidTemperatureUnit(String unit) {
        return new InvalidRequestException(
                String.format("Invalid temperature unit '%s'. Supported units: celsius, fahrenheit, kelvin", unit),
                "temperatureUnit",
                "INVALID_TEMPERATURE_UNIT"
        );
    }

    /**
     * Create exception for invalid time zone
     * @param timeZone Invalid time zone
     * @return InvalidRequestException
     */
    public static InvalidRequestException invalidTimeZone(String timeZone) {
        return new InvalidRequestException(
                String.format("Invalid time zone '%s'", timeZone),
                "timeZone",
                "INVALID_TIMEZONE"
        );
    }

    /**
     * Create exception for invalid pagination parameters
     * @param page Page number
     * @param size Page size
     * @return InvalidRequestException
     */
    public static InvalidRequestException invalidPagination(int page, int size) {
        return new InvalidRequestException(
                String.format("Invalid pagination parameters: page=%d, size=%d. " +
                        "Page must be >= 0, size must be between 1 and 100", page, size),
                "INVALID_PAGINATION"
        );
    }

    /**
     * Create exception for conflicting parameters
     * @param param1 First conflicting parameter
     * @param param2 Second conflicting parameter
     * @return InvalidRequestException
     */
    public static InvalidRequestException conflictingParameters(String param1, String param2) {
        return new InvalidRequestException(
                String.format("Parameters '%s' and '%s' cannot be used together", param1, param2),
                "CONFLICTING_PARAMETERS"
        );
    }

    /**
     * Create exception for invalid email format
     * @param email Invalid email
     * @return InvalidRequestException
     */
    public static InvalidRequestException invalidEmail(String email) {
        return new InvalidRequestException(
                String.format("Invalid email format: '%s'", email),
                "email",
                "INVALID_EMAIL_FORMAT"
        );
    }

    /**
     * Create exception for invalid URL format
     * @param url Invalid URL
     * @return InvalidRequestException
     */
    public static InvalidRequestException invalidUrl(String url) {
        return new InvalidRequestException(
                String.format("Invalid URL format: '%s'", url),
                "url",
                "INVALID_URL_FORMAT"
        );
    }

    /**
     * Create exception for duplicate values
     * @param field Field with duplicate values
     * @param value Duplicate value
     * @return InvalidRequestException
     */
    public static InvalidRequestException duplicateValue(String field, String value) {
        return new InvalidRequestException(
                String.format("Duplicate value '%s' found in field '%s'", value, field),
                field,
                "DUPLICATE_VALUE"
        );
    }

    @Override
    public String toString() {
        return String.format("InvalidRequestException{errorCode='%s', field='%s', message='%s'}",
                errorCode, field, getMessage());
    }
}