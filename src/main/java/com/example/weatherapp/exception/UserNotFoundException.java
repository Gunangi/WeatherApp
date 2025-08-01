package com.example.weatherapp.exception;

/**
 * Custom exception for user-related errors
 * Thrown when a user cannot be found or user operations fail
 */
public class UserNotFoundException extends RuntimeException {

    private final String userId;
    private final String errorCode;

    /**
     * Constructor with message only
     * @param message Error message
     */
    public UserNotFoundException(String message) {
        super(message);
        this.userId = null;
        this.errorCode = "USER_NOT_FOUND";
    }

    /**
     * Constructor with message and user ID
     * @param message Error message
     * @param userId The user ID that was not found
     */
    public UserNotFoundException(String message, String userId) {
        super(message);
        this.userId = userId;
        this.errorCode = "USER_NOT_FOUND";
    }

    /**
     * Constructor with message, cause, and user ID
     * @param message Error message
     * @param cause Root cause of the exception
     * @param userId The user ID that was not found
     */
    public UserNotFoundException(String message, Throwable cause, String userId) {
        super(message, cause);
        this.userId = userId;
        this.errorCode = "USER_NOT_FOUND";
    }

    /**
     * Constructor with message, user ID, and error code
     * @param message Error message
     * @param userId The user ID that was not found
     * @param errorCode Specific error code
     */
    public UserNotFoundException(String message, String userId, String errorCode) {
        super(message);
        this.userId = userId;
        this.errorCode = errorCode;
    }

    /**
     * Get the user ID that caused the exception
     * @return User ID
     */
    public String getUserId() {
        return userId;
    }

    /**
     * Get the error code
     * @return Error code
     */
    public String getErrorCode() {
        return errorCode;
    }

    // Static factory methods for common user errors

    /**
     * Create exception for user not found by ID
     * @param userId User ID that was not found
     * @return UserNotFoundException
     */
    public static UserNotFoundException byId(String userId) {
        return new UserNotFoundException(
                String.format("User with ID '%s' not found", userId),
                userId,
                "USER_ID_NOT_FOUND"
        );
    }

    /**
     * Create exception for user not found by email
     * @param email Email address that was not found
     * @return UserNotFoundException
     */
    public static UserNotFoundException byEmail(String email) {
        return new UserNotFoundException(
                String.format("User with email '%s' not found", email),
                email,
                "USER_EMAIL_NOT_FOUND"
        );
    }

    /**
     * Create exception for user not found by username
     * @param username Username that was not found
     * @return UserNotFoundException
     */
    public static UserNotFoundException byUsername(String username) {
        return new UserNotFoundException(
                String.format("User with username '%s' not found", username),
                username,
                "USER_USERNAME_NOT_FOUND"
        );
    }

    /**
     * Create exception for inactive user account
     * @param userId User ID of inactive account
     * @return UserNotFoundException
     */
    public static UserNotFoundException inactiveAccount(String userId) {
        return new UserNotFoundException(
                String.format("User account '%s' is inactive or disabled", userId),
                userId,
                "USER_ACCOUNT_INACTIVE"
        );
    }

    /**
     * Create exception for deleted user account
     * @param userId User ID of deleted account
     * @return UserNotFoundException
     */
    public static UserNotFoundException deletedAccount(String userId) {
        return new UserNotFoundException(
                String.format("User account '%s' has been deleted", userId),
                userId,
                "USER_ACCOUNT_DELETED"
        );
    }

    /**
     * Create exception for suspended user account
     * @param userId User ID of suspended account
     * @return UserNotFoundException
     */
    public static UserNotFoundException suspendedAccount(String userId) {
        return new UserNotFoundException(
                String.format("User account '%s' is temporarily suspended", userId),
                userId,
                "USER_ACCOUNT_SUSPENDED"
        );
    }

    /**
     * Create exception for user session not found
     * @param sessionId Session ID that was not found
     * @return UserNotFoundException
     */
    public static UserNotFoundException sessionNotFound(String sessionId) {
        return new UserNotFoundException(
                String.format("User session '%s' not found or expired", sessionId),
                sessionId,
                "USER_SESSION_NOT_FOUND"
        );
    }

    /**
     * Create exception for invalid user token
     * @param token Invalid token
     * @return UserNotFoundException
     */
    public static UserNotFoundException invalidToken(String token) {
        return new UserNotFoundException(
                "Invalid or expired user authentication token",
                token,
                "INVALID_USER_TOKEN"
        );
    }

    /**
     * Create exception for user profile not found
     * @param userId User ID whose profile was not found
     * @return UserNotFoundException
     */
    public static UserNotFoundException profileNotFound(String userId) {
        return new UserNotFoundException(
                String.format("User profile for ID '%s' not found", userId),
                userId,
                "USER_PROFILE_NOT_FOUND"
        );
    }

    /**
     * Create exception for user preferences not found
     * @param userId User ID whose preferences were not found
     * @return UserNotFoundException
     */
    public static UserNotFoundException preferencesNotFound(String userId) {
        return new UserNotFoundException(
                String.format("User preferences for ID '%s' not found", userId),
                userId,
                "USER_PREFERENCES_NOT_FOUND"
        );
    }

    /**
     * Create exception for user location history not found
     * @param userId User ID whose location history was not found
     * @return UserNotFoundException
     */
    public static UserNotFoundException locationHistoryNotFound(String userId) {
        return new UserNotFoundException(
                String.format("Location history for user ID '%s' not found", userId),
                userId,
                "USER_LOCATION_HISTORY_NOT_FOUND"
        );
    }

    /**
     * Create exception for user favorites not found
     * @param userId User ID whose favorites were not found
     * @return UserNotFoundException
     */
    public static UserNotFoundException favoritesNotFound(String userId) {
        return new UserNotFoundException(
                String.format("Favorite locations for user ID '%s' not found", userId),
                userId,
                "USER_FAVORITES_NOT_FOUND"
        );
    }

    /**
     * Create exception for user alerts not found
     * @param userId User ID whose alerts were not found
     * @return UserNotFoundException
     */
    public static UserNotFoundException alertsNotFound(String userId) {
        return new UserNotFoundException(
                String.format("Weather alerts for user ID '%s' not found", userId),
                userId,
                "USER_ALERTS_NOT_FOUND"
        );
    }

    /**
     * Create exception for database connection issues
     * @param userId User ID that was being accessed
     * @param cause Root cause of the database error
     * @return UserNotFoundException
     */
    public static UserNotFoundException databaseError(String userId, Throwable cause) {
        return new UserNotFoundException(
                String.format("Database error while accessing user '%s'", userId),
                cause,
                userId
        );
    }

    /**
     * Create exception for user data corruption
     * @param userId User ID with corrupted data
     * @return UserNotFoundException
     */
    public static UserNotFoundException dataCorrupted(String userId) {
        return new UserNotFoundException(
                String.format("User data for ID '%s' appears to be corrupted", userId),
                userId,
                "USER_DATA_CORRUPTED"
        );
    }

    @Override
    public String toString() {
        return String.format("UserNotFoundException{userId='%s', errorCode='%s', message='%s'}",
                userId, errorCode, getMessage());
    }
}