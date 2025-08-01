package com.example.weatherapp.exception;

/**
 * Custom exception for location-related errors
 * Thrown when a requested location cannot be found or is invalid
 */
public class LocationNotFoundException extends RuntimeException {

    private final String locationQuery;
    private final String errorCode;

    /**
     * Constructor with message only
     * @param message Error message
     */
    public LocationNotFoundException(String message) {
        super(message);
        this.locationQuery = null;
        this.errorCode = "LOCATION_NOT_FOUND";
    }

    /**
     * Constructor with message and location query
     * @param message Error message
     * @param locationQuery The location query that failed
     */
    public LocationNotFoundException(String message, String locationQuery) {
        super(message);
        this.locationQuery = locationQuery;
        this.errorCode = "LOCATION_NOT_FOUND";
    }

    /**
     * Constructor with message, cause, and location query
     * @param message Error message
     * @param cause Root cause of the exception
     * @param locationQuery The location query that failed
     */
    public LocationNotFoundException(String message, Throwable cause, String locationQuery) {
        super(message, cause);
        this.locationQuery = locationQuery;
        this.errorCode = "LOCATION_NOT_FOUND";
    }

    /**
     * Constructor with message, location query, and error code
     * @param message Error message
     * @param locationQuery The location query that failed
     * @param errorCode Specific error code
     */
    public LocationNotFoundException(String message, String locationQuery, String errorCode) {
        super(message);
        this.locationQuery = locationQuery;
        this.errorCode = errorCode;
    }

    /**
     * Get the location query that caused the exception
     * @return Location query string
     */
    public String getLocationQuery() {
        return locationQuery;
    }

    /**
     * Get the error code
     * @return Error code
     */
    public String getErrorCode() {
        return errorCode;
    }

    // Static factory methods for common location errors

    /**
     * Create exception for invalid city name
     * @param cityName Invalid city name
     * @return LocationNotFoundException
     */
    public static LocationNotFoundException invalidCityName(String cityName) {
        return new LocationNotFoundException(
                String.format("City '%s' could not be found. Please check the spelling and try again.", cityName),
                cityName,
                "INVALID_CITY_NAME"
        );
    }

    /**
     * Create exception for invalid coordinates
     * @param latitude Latitude value
     * @param longitude Longitude value
     * @return LocationNotFoundException
     */
    public static LocationNotFoundException invalidCoordinates(double latitude, double longitude) {
        String coordinates = String.format("%.6f,%.6f", latitude, longitude);
        return new LocationNotFoundException(
                String.format("Invalid coordinates: latitude=%.6f, longitude=%.6f. " +
                                "Latitude must be between -90 and 90, longitude between -180 and 180.",
                        latitude, longitude),
                coordinates,
                "INVALID_COORDINATES"
        );
    }

    /**
     * Create exception for empty location query
     * @return LocationNotFoundException
     */
    public static LocationNotFoundException emptyQuery() {
        return new LocationNotFoundException(
                "Location query cannot be empty or null",
                "",
                "EMPTY_LOCATION_QUERY"
        );
    }

    /**
     * Create exception for ambiguous location
     * @param locationQuery The ambiguous location query
     * @param suggestions List of suggested locations
     * @return LocationNotFoundException
     */
    public static LocationNotFoundException ambiguousLocation(String locationQuery, String suggestions) {
        return new LocationNotFoundException(
                String.format("Location '%s' is ambiguous. Did you mean: %s?", locationQuery, suggestions),
                locationQuery,
                "AMBIGUOUS_LOCATION"
        );
    }

    /**
     * Create exception for unsupported country
     * @param country Unsupported country name
     * @return LocationNotFoundException
     */
    public static LocationNotFoundException unsupportedCountry(String country) {
        return new LocationNotFoundException(
                String.format("Weather data is not available for country: '%s'", country),
                country,
                "UNSUPPORTED_COUNTRY"
        );
    }

    /**
     * Create exception for geocoding service failure
     * @param locationQuery The location query that failed
     * @param cause Root cause of the failure
     * @return LocationNotFoundException
     */
    public static LocationNotFoundException geocodingFailure(String locationQuery, Throwable cause) {
        return new LocationNotFoundException(
                String.format("Failed to geocode location: '%s'. Geocoding service may be temporarily unavailable.",
                        locationQuery),
                cause,
                locationQuery
        );
    }

    /**
     * Create exception for location not in database
     * @param locationQuery The location query
     * @return LocationNotFoundException
     */
    public static LocationNotFoundException notInDatabase(String locationQuery) {
        return new LocationNotFoundException(
                String.format("Location '%s' is not found in our database. " +
                        "Please try a different spelling or nearby city.", locationQuery),
                locationQuery,
                "LOCATION_NOT_IN_DATABASE"
        );
    }

    /**
     * Create exception for invalid postal code
     * @param postalCode Invalid postal code
     * @param country Country for the postal code
     * @return LocationNotFoundException
     */
    public static LocationNotFoundException invalidPostalCode(String postalCode, String country) {
        String query = country != null ? postalCode + "," + country : postalCode;
        return new LocationNotFoundException(
                String.format("Invalid postal code '%s' for country '%s'", postalCode,
                        country != null ? country : "unknown"),
                query,
                "INVALID_POSTAL_CODE"
        );
    }

    /**
     * Create exception for restricted location access
     * @param locationQuery The restricted location
     * @return LocationNotFoundException
     */
    public static LocationNotFoundException restrictedAccess(String locationQuery) {
        return new LocationNotFoundException(
                String.format("Access to weather data for location '%s' is restricted", locationQuery),
                locationQuery,
                "RESTRICTED_LOCATION_ACCESS"
        );
    }

    /**
     * Create exception for invalid location format
     * @param locationQuery The malformed location query
     * @param expectedFormat Expected format description
     * @return LocationNotFoundException
     */
    public static LocationNotFoundException invalidFormat(String locationQuery, String expectedFormat) {
        return new LocationNotFoundException(
                String.format("Invalid location format: '%s'. Expected format: %s",
                        locationQuery, expectedFormat),
                locationQuery,
                "INVALID_LOCATION_FORMAT"
        );
    }

    @Override
    public String toString() {
        return String.format("LocationNotFoundException{locationQuery='%s', errorCode='%s', message='%s'}",
                locationQuery, errorCode, getMessage());
    }
}