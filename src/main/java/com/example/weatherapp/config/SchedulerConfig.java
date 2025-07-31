package com.example.weatherapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.beans.factory.annotation.Value;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Configuration
@EnableScheduling
public class SchedulerConfig implements SchedulingConfigurer {

    @Value("${app.scheduler.pool-size:10}")
    private int poolSize;

    @Value("${app.scheduler.thread-name-prefix:weather-scheduler-}")
    private String threadNamePrefix;

    @Value("${app.scheduler.await-termination-seconds:20}")
    private int awaitTerminationSeconds;

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        taskRegistrar.setScheduler(taskExecutor());
    }

    @Bean(destroyMethod = "shutdown")
    public Executor taskExecutor() {
        return Executors.newScheduledThreadPool(poolSize);
    }

    @Bean
    public ThreadPoolTaskScheduler threadPoolTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(poolSize);
        scheduler.setThreadNamePrefix(threadNamePrefix);
        scheduler.setAwaitTerminationSeconds(awaitTerminationSeconds);
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setRejectedExecutionHandler((r, executor) -> {
            // Log the rejection and optionally handle it
            System.err.println("Task rejected: " + r.toString());
        });
        scheduler.initialize();
        return scheduler;
    }

    /**
     * Configuration for weather data update scheduling
     */
    public static class WeatherUpdateScheduler {

        /**
         * Update current weather data every 10 minutes
         * Cron: 0 /10 * * * *
                */
        public static final String CURRENT_WEATHER_UPDATE = "0 */10 * * * *";

        /**
         * Update forecast data every 30 minutes
         * Cron: 0 /30 * * * *
                */
        public static final String FORECAST_UPDATE = "0 */30 * * * *";

        /**
         * Update air quality data every 15 minutes
         * Cron: 0 /15 * * *
                */
        public static final String AIR_QUALITY_UPDATE = "0 */15 * * * *";

        /**
         * Check for weather alerts every 5 minutes
         * Cron: 0 /5 * * *
        */
        public static final String WEATHER_ALERTS_CHECK = "0 */5 * * * *";

        /**
         * Clean up old historical data daily at 2 AM
         * Cron: 0 0 2 * * *
         */
        public static final String HISTORICAL_DATA_CLEANUP = "0 0 2 * * *";

        /**
         * Update historical weather data daily at 1 AM
         * Cron: 0 0 1 * * *
         */
        public static final String HISTORICAL_DATA_UPDATE = "0 0 1 * * *";

        /**
         * Cache warming for popular locations every hour
         * Cron: 0 0 * * * *
         */
        public static final String CACHE_WARMING = "0 0 * * * *";

        /**
         * Send daily weather summary notifications at 7 AM
         * Cron: 0 0 7 * * *
         */
        public static final String DAILY_SUMMARY_NOTIFICATIONS = "0 0 7 * * *";

        /**
         * Process user notification preferences weekly on Sunday at 3 AM
         * Cron: 0 0 3 * * SUN
         */
        public static final String NOTIFICATION_PREFERENCES_UPDATE = "0 0 3 * * SUN";
    }
}