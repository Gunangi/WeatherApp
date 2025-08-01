package com.example.weatherapp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
@EnableScheduling
public class SchedulerConfig {

    private static final Logger log = LoggerFactory.getLogger(SchedulerConfig.class);

    @Value("${app.scheduler.pool-size:10}")
    private int poolSize;

    @Value("${app.scheduler.thread-name-prefix:weather-scheduler-}")
    private String threadNamePrefix;

    @Value("${app.scheduler.await-termination-seconds:20}")
    private int awaitTerminationSeconds;

    @Bean
    public ThreadPoolTaskScheduler threadPoolTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(poolSize);
        scheduler.setThreadNamePrefix(threadNamePrefix);
        scheduler.setAwaitTerminationSeconds(awaitTerminationSeconds);
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setRejectedExecutionHandler((runnable, executor) ->
                log.warn("Task rejected: {}", runnable.toString())
        );
        // Spring automatically initializes the bean, so scheduler.initialize() is not needed.
        return scheduler;
    }

    /**
     * Holds cron expression constants for all scheduled tasks in the application.
     * The "@SuppressWarnings" annotation is used to prevent "unused" warnings
     * from the IDE, as these constants are meant to be used in other files.
     */
    @SuppressWarnings("unused")
    public static class WeatherUpdateScheduler {

        public static final String CURRENT_WEATHER_UPDATE = "0 */10 * * * *";
        public static final String FORECAST_UPDATE = "0 */30 * * * *";
        public static final String AIR_QUALITY_UPDATE = "0 */15 * * * *";
        public static final String WEATHER_ALERTS_CHECK = "0 */5 * * * *";
        public static final String HISTORICAL_DATA_CLEANUP = "0 0 2 * * *";
        public static final String HISTORICAL_DATA_UPDATE = "0 0 1 * * *";
        public static final String CACHE_WARMING = "0 0 * * * *";
        public static final String DAILY_SUMMARY_NOTIFICATIONS = "0 0 7 * * *";
        public static final String NOTIFICATION_PREFERENCES_UPDATE = "0 0 3 * * SUN";
    }
}