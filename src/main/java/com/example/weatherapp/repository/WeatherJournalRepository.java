package com.example.weatherapp.repository;

import com.example.weatherapp.model.WeatherJournalEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WeatherJournalRepository extends MongoRepository<WeatherJournalEntry, String> {

    Page<WeatherJournalEntry> findByUserIdOrderByEntryDateDesc(String userId, Pageable pageable);

    List<WeatherJournalEntry> findByUserIdAndLocationId(String userId, String locationId);

    @Query("{ 'userId': ?0, 'entryDate': { $gte: ?1, $lte: ?2 } }")
    List<WeatherJournalEntry> findByUserIdAndEntryDateBetween(String userId, LocalDateTime start, LocalDateTime end);

    List<WeatherJournalEntry> findByIsPublicTrueOrderByEntryDateDesc();

    @Query("{ 'tags': { $in: ?0 } }")
    List<WeatherJournalEntry> findByTagsIn(List<String> tags);

    long countByUserId(String userId);
}
