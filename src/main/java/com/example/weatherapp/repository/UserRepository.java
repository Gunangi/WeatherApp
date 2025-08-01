package com.example.weatherapp.repository;

import com.example.weatherapp.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User CRUD operations
 * Extends MongoRepository for basic MongoDB operations
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // Basic finder methods

    /**
     * Find user by email address
     * @param email User's email address
     * @return Optional containing user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by username
     * @param username User's username
     * @return Optional containing user if found
     */
    Optional<User> findByUsername(String username);

    /**
     * Check if user exists by email
     * @param email User's email address
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Check if user exists by username
     * @param username User's username
     * @return true if user exists, false otherwise
     */
    boolean existsByUsername(String username);

    /**
     * Find user by email or username
     * @param email User's email address
     * @param username User's username
     * @return Optional containing user if found
     */
    @Query("{'$or': [{'email': ?0}, {'username': ?1}]}")
    Optional<User> findByEmailOrUsername(String email, String username);

    // Advanced finder methods

    /**
     * Find users by first name and last name
     * @param firstName User's first name
     * @param lastName User's last name
     * @return List of users matching the criteria
     */
    List<User> findByFirstNameAndLastName(String firstName, String lastName);

    /**
     * Find users by first name containing (case insensitive)
     * @param firstName Partial first name to search
     * @return List of users with matching first names
     */
    List<User> findByFirstNameContainingIgnoreCase(String firstName);

    /**
     * Find users by location (city)
     * @param city City name
     * @return List of users in the specified city
     */
    @Query("{'location.city': ?0}")
    List<User> findByCity(String city);

    /**
     * Find users by country
     * @param country Country name
     * @return List of users in the specified country
     */
    @Query("{'location.country': ?0}")
    List<User> findByCountry(String country);

    /**
     * Find users within a certain distance from coordinates
     * @param latitude Latitude coordinate
     * @param longitude Longitude coordinate
     * @param maxDistance Maximum distance in meters
     * @return List of users within the specified distance
     */
    @Query("{'location': {'$near': {'$geometry': {'type': 'Point', 'coordinates': [?1, ?0]}, '$maxDistance': ?2}}}")
    List<User> findUsersNearLocation(double latitude, double longitude, double maxDistance);

    // User status and activity methods

    /**
     * Find active users
     * @return List of active users
     */
    List<User> findByIsActiveTrue();

    /**
     * Find inactive users
     * @return List of inactive users
     */
    List<User> findByIsActiveFalse();

    /**
     * Find users who have verified their email
     * @return List of verified users
     */
    List<User> findByEmailVerifiedTrue();

    /**
     * Find users who haven't verified their email
     * @return List of unverified users
     */
    List<User> findByEmailVerifiedFalse();

    /**
     * Find users by role
     * @param role User role
     * @return List of users with the specified role
     */
    List<User> findByRole(String role);

    /**
     * Find premium users
     * @return List of premium users
     */
    List<User> findByIsPremiumTrue();

    // Date-based queries

    /**
     * Find users created after a specific date
     * @param date Date threshold
     * @return List of users created after the date
     */
    List<User> findByCreatedAtAfter(LocalDateTime date);

    /**
     * Find users created between two dates
     * @param startDate Start date
     * @param endDate End date
     * @return List of users created within the date range
     */
    List<User> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find users who logged in after a specific date
     * @param date Date threshold
     * @return List of users with recent login activity
     */
    List<User> findByLastLoginAfter(LocalDateTime date);

    /**
     * Find users who haven't logged in since a specific date
     * @param date Date threshold
     * @return List of inactive users based on login date
     */
    List<User> findByLastLoginBefore(LocalDateTime date);

    // Preference-based queries

    /**
     * Find users by preferred temperature unit
     * @param unit Temperature unit (CELSIUS, FAHRENHEIT)
     * @return List of users with the specified temperature unit preference
     */
    @Query("{'preferences.temperatureUnit': ?0}")
    List<User> findByTemperatureUnit(String unit);

    /**
     * Find users by theme preference
     * @param theme Theme preference (LIGHT, DARK, AUTO)
     * @return List of users with the specified theme preference
     */
    @Query("{'preferences.theme': ?0}")
    List<User> findByThemePreference(String theme);

    /**
     * Find users who have notifications enabled
     * @return List of users with notifications enabled
     */
    @Query("{'preferences.notificationsEnabled': true}")
    List<User> findUsersWithNotificationsEnabled();

    /**
     * Find users by notification types
     * @param notificationType Type of notification
     * @return List of users subscribed to the notification type
     */
    @Query("{'preferences.notificationTypes': ?0}")
    List<User> findByNotificationType(String notificationType);

    // Aggregation queries

    /**
     * Count users by country
     * @return Aggregation result with country counts
     */
    @Aggregation(pipeline = {
            "{'$group': {'_id': '$location.country', 'count': {'$sum': 1}}}",
            "{'$sort': {'count': -1}}"
    })
    List<Object> countUsersByCountry();

    /**
     * Count users by registration month
     * @return Aggregation result with monthly registration counts
     */
    @Aggregation(pipeline = {
            "{'$group': {'_id': {'year': {'$year': '$createdAt'}, 'month': {'$month': '$createdAt'}}, 'count': {'$sum': 1}}}",
            "{'$sort': {'_id.year': -1, '_id.month': -1}}"
    })
    List<Object> countUsersByRegistrationMonth();

    /**
     * Get user activity statistics
     * @return Aggregation result with activity statistics
     */
    @Aggregation(pipeline = {
            "{'$group': {'_id': null, 'totalUsers': {'$sum': 1}, 'activeUsers': {'$sum': {'$cond': ['$isActive', 1, 0]}}, 'verifiedUsers': {'$sum': {'$cond': ['$emailVerified', 1, 0]}}, 'premiumUsers': {'$sum': {'$cond': ['$isPremium', 1, 0]}}}}"
    })
    Object getUserActivityStatistics();

    // Search and filtering methods

    /**
     * Search users by name (first name or last name)
     * @param searchTerm Search term for name
     * @param pageable Pagination information
     * @return Page of users matching the search criteria
     */
    @Query("{'$or': [{'firstName': {'$regex': ?0, '$options': 'i'}}, {'lastName': {'$regex': ?0, '$options': 'i'}}, {'username': {'$regex': ?0, '$options': 'i'}}]}")
    Page<User> searchUsersByName(String searchTerm, Pageable pageable);

    /**
     * Find users with specific favorite cities
     * @param cityName City name to search in favorites
     * @return List of users who have the city in their favorites
     */
    @Query("{'favoriteCities.city': ?0}")
    List<User> findUsersWithFavoriteCity(String cityName);

    /**
     * Find users who have searched for a specific location
     * @param cityName City name to search in location history
     * @return List of users who have searched for the city
     */
    @Query("{'locationHistory.city': ?0}")
    List<User> findUsersWhoSearchedForCity(String cityName);

    /**
     * Find users by age range (calculated from date of birth)
     * @param minAge Minimum age
     * @param maxAge Maximum age
     * @return List of users within the age range
     */
    @Query("{'dateOfBirth': {'$gte': ?1, '$lte': ?0}}")
    List<User> findUsersByAgeRange(LocalDateTime minAge, LocalDateTime maxAge);

    // Custom update operations

    /**
     * Update user's last login time
     * @param userId User ID
     * @param lastLogin Last login timestamp
     */
    @Query(value = "{'_id': ?0}", update = "{'$set': {'lastLogin': ?1, 'updatedAt': ?2}}")
    void updateLastLogin(String userId, LocalDateTime lastLogin, LocalDateTime updatedAt);

    /**
     * Update user's active status
     * @param userId User ID
     * @param isActive Active status
     */
    @Query(value = "{'_id': ?0}", update = "{'$set': {'isActive': ?1, 'updatedAt': ?2}}")
    void updateUserActiveStatus(String userId, boolean isActive, LocalDateTime updatedAt);

    /**
     * Update user's email verification status
     * @param userId User ID
     * @param emailVerified Email verification status
     */
    @Query(value = "{'_id': ?0}", update = "{'$set': {'emailVerified': ?1, 'updatedAt': ?2}}")
    void updateEmailVerificationStatus(String userId, boolean emailVerified, LocalDateTime updatedAt);

    /**
     * Update user's premium status
     * @param userId User ID
     * @param isPremium Premium status
     * @param premiumExpiryDate Premium expiry date
     */
    @Query(value = "{'_id': ?0}", update = "{'$set': {'isPremium': ?1, 'premiumExpiryDate': ?2, 'updatedAt': ?3}}")
    void updatePremiumStatus(String userId, boolean isPremium, LocalDateTime premiumExpiryDate, LocalDateTime updatedAt);

    /**
     * Add city to user's favorites
     * @param userId User ID
     * @param cityData City data to add
     */
    @Query(value = "{'_id': ?0}", update = "{'$addToSet': {'favoriteCities': ?1}, '$set': {'updatedAt': ?2}}")
    void addFavoriteCity(String userId, Object cityData, LocalDateTime updatedAt);

    /**
     * Remove city from user's favorites
     * @param userId User ID
     * @param cityName City name to remove
     */
    @Query(value = "{'_id': ?0}", update = "{'$pull': {'favoriteCities': {'city': ?1}}, '$set': {'updatedAt': ?2}}")
    void removeFavoriteCity(String userId, String cityName, LocalDateTime updatedAt);

    /**
     * Add location to user's search history
     * @param userId User ID
     * @param locationData Location data to add
     */
    @Query(value = "{'_id': ?0}", update = "{'$push': {'locationHistory': {'$each': [?1], '$slice': -50}}, '$set': {'updatedAt': ?2}}")
    void addLocationToHistory(String userId, Object locationData, LocalDateTime updatedAt);

    /**
     * Update user preferences
     * @param userId User ID
     * @param preferences Updated preferences object
     */
    @Query(value = "{'_id': ?0}", update = "{'$set': {'preferences': ?1, 'updatedAt': ?2}}")
    void updateUserPreferences(String userId, Object preferences, LocalDateTime updatedAt);

    // Cleanup and maintenance methods

    /**
     * Find users with expired premium subscriptions
     * @param currentDate Current date to compare against
     * @return List of users with expired premium subscriptions
     */
    @Query("{'isPremium': true, 'premiumExpiryDate': {'$lt': ?0}}")
    List<User> findUsersWithExpiredPremium(LocalDateTime currentDate);

    /**
     * Find inactive users who haven't logged in for a specified period
     * @param cutoffDate Date cutoff for considering users inactive
     * @return List of inactive users
     */
    @Query("{'$or': [{'lastLogin': {'$lt': ?0}}, {'lastLogin': null}], 'isActive': true}")
    List<User> findInactiveUsers(LocalDateTime cutoffDate);

    /**
     * Find users with unverified emails older than specified days
     * @param cutoffDate Date cutoff for unverified emails
     * @return List of users with old unverified emails
     */
    @Query("{'emailVerified': false, 'createdAt': {'$lt': ?0}}")
    List<User> findUsersWithOldUnverifiedEmails(LocalDateTime cutoffDate);

    /**
     * Count total number of active users
     * @return Count of active users
     */
    long countByIsActiveTrue();

    /**
     * Count total number of premium users
     * @return Count of premium users
     */
    long countByIsPremiumTrue();

    /**
     * Count total number of verified users
     * @return Count of verified users
     */
    long countByEmailVerifiedTrue();

    /**
     * Delete users who have been inactive and unverified for a long time
     * @param cutoffDate Date cutoff for deletion
     * @return Number of deleted users
     */
    @Query(value = "{'emailVerified': false, 'isActive': false, 'createdAt': {'$lt': ?0}}", delete = true)
    long deleteInactiveUnverifiedUsers(LocalDateTime cutoffDate);

    // Complex queries for analytics

    /**
     * Get user registration trends over time
     * @param startDate Start date for the trend analysis
     * @param endDate End date for the trend analysis
     * @return List of users registered within the date range
     */
    @Query("{'createdAt': {'$gte': ?0, '$lte': ?1}}")
    List<User> getUserRegistrationTrends(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find most active users based on location search frequency
     * @param limit Number of top users to return
     * @return List of most active users
     */
    @Aggregation(pipeline = {
            "{'$addFields': {'locationHistoryCount': {'$size': {'$ifNull': ['$locationHistory', []]}}}}",
            "{'$sort': {'locationHistoryCount': -1}}",
            "{'$limit': ?0}"
    })
    List<User> findMostActiveUsers(int limit);

    /**
     * Find users by multiple criteria
     * @param country Country filter
     * @param isActive Active status filter
     * @param isPremium Premium status filter
     * @param pageable Pagination information
     * @return Page of users matching all criteria
     */
    @Query("{'location.country': ?0, 'isActive': ?1, 'isPremium': ?2}")
    Page<User> findUsersByMultipleCriteria(String country, boolean isActive, boolean isPremium, Pageable pageable);

    /**
     * Find users who joined in the last N days
     * @param days Number of days to look back
     * @return List of recently joined users
     */
    @Query("{'createdAt': {'$gte': ?0}}")
    List<User> findRecentlyJoinedUsers(LocalDateTime days);

    /**
     * Get user distribution by theme preference
     * @return Aggregation result with theme distribution
     */
    @Aggregation(pipeline = {
            "{'$group': {'_id': '$preferences.theme', 'count': {'$sum': 1}}}",
            "{'$sort': {'count': -1}}"
    })
    List<Object> getUserThemeDistribution();

    /**
     * Get user distribution by temperature unit preference
     * @return Aggregation result with temperature unit distribution
     */
    @Aggregation(pipeline = {
            "{'$group': {'_id': '$preferences.temperatureUnit', 'count': {'$sum': 1}}}",
            "{'$sort': {'count': -1}}"
    })
    List<Object> getUserTemperatureUnitDistribution();
}