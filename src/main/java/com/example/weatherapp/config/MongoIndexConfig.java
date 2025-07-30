package com.example.weatherapp.config;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.IndexOptions;
import com.mongodb.client.model.Indexes;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class MongoIndexConfig implements CommandLineRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) throws Exception {
        createWeatherDataIndexes();
        createLocationIndexes();
        createWeatherJournalIndexes();
        createNotificationIndexes();
        createCacheIndexes();
        createHistoricalDataIndexes();
    }

    private void createWeatherDataIndexes() {
        MongoDatabase database = mongoTemplate.getDb();
        MongoCollection<Document> collection = database.getCollection("weatherData");

        // Index for location-based queries
        collection.createIndex(
                Indexes.compound(
                        Indexes.ascending("latitude"),
                        Indexes.ascending("longitude")
                )
        );

        // Index for city-based queries
        collection.createIndex(Indexes.ascending("city"));

        // Index for timestamp queries with TTL (expire after 24 hours)
        collection.createIndex(
                Indexes.ascending("timestamp"),
                new IndexOptions().expireAfter(24L, TimeUnit.HOURS)
        );

        // Index for user-specific weather data
        collection.createIndex(
                Indexes.compound(
                        Indexes.ascending("userId"),
                        Indexes.descending("timestamp")
                )
        );
    }

    private void createLocationIndexes() {
        MongoDatabase database = mongoTemplate.getDb();
        MongoCollection<Document> collection = database.getCollection("locations");

        // 2dsphere index for geo queries
        collection.createIndex(Indexes.geo2dsphere("location"));

        // Index for user's favorite locations
        collection.createIndex(
                Indexes.compound(
                        Indexes.ascending("userId"),
                        Indexes.ascending("isFavorite")
                )
        );

        // Index for location search history
        collection.createIndex(
                Indexes.compound(
                        Indexes.ascending("userId"),
                        Indexes.descending("lastSearched")
                )
        );
    }

    private void createWeatherJournalIndexes() {
        MongoDatabase database = mongoTemplate.getDb();
        MongoCollection<Document> collection = database.getCollection("weatherJournal");

        // Index for user journal entries
        collection.createIndex(
                Indexes.compound(
                        Indexes.ascending("userId"),
                        Indexes.descending("entryDate")
                )
        );

        // Index for location-based journal entries
        collection.createIndex(
                Indexes.compound(
                        Indexes.ascending("latitude"),
                        Indexes.ascending("longitude"),
                        Indexes.descending("entryDate")
                )
        );

        // Text index for journal content search
        collection.createIndex(Indexes.text("content"));
    }

    private void createNotificationIndexes() {
        MongoDatabase database = mongoTemplate.getDb();
        MongoCollection<Document> collection = database.getCollection("notifications");

        // Index for user notifications
        collection.createIndex(
                Indexes.compound(
                        Indexes.ascending("userId"),
                        Indexes.descending("createdAt")
                )
        );

        // Index for notification status
        collection.createIndex(
                Indexes.compound(
                        Indexes.ascending("userId"),
                        Indexes.ascending("status"),
                        Indexes.descending("createdAt")
                )
        );

        // Index for scheduled notifications
        collection.createIndex(Indexes.ascending("scheduledTime"));

        // TTL index for delivered notifications (expire after 30 days)
        collection.createIndex(
                Indexes.ascending("deliveredAt"),
                new IndexOptions().expireAfter(30L, TimeUnit.DAYS)
        );
    }

    private void createCacheIndexes() {
        MongoDatabase database = mongoTemplate.getDb();
        MongoCollection<Document> collection = database.getCollection("weatherCache");

        // Index for cache key lookups
        collection.createIndex(Indexes.ascending("cacheKey"));

        // TTL index for cache expiration
        collection.createIndex(
                Indexes.ascending("expiresAt"),
                new IndexOptions().expireAfter(0L, TimeUnit.SECONDS)
        );

        // Index for cache type and priority
        collection.createIndex(
                Indexes.compound(
                        Indexes.ascending("cacheType"),
                        Indexes.descending("priority")
                )
        );
    }

    private void createHistoricalDataIndexes() {
        MongoDatabase database = mongoTemplate.getDb();
        MongoCollection<Document> collection = database.getCollection("historicalWeather");

        // Index for location and date range queries
        collection.createIndex(
                Indexes.compound(
                        Indexes.ascending("latitude"),
                        Indexes.ascending("longitude"),
                        Indexes.descending("date")
                )
        );

        // Index for city-based historical queries
        collection.createIndex(
                Indexes.compound(
                        Indexes.ascending("city"),
                        Indexes.descending("date")
                )
        );

        // Index for weather parameter analysis
        collection.createIndex(
                Indexes.compound(
                        Indexes.ascending("city"),
                        Indexes.ascending("parameter"),
                        Indexes.descending("date")
                )
        );
    }
}