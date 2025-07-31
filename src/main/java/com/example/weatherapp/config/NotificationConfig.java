package com.example.weatherapp.config;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.auth.oauth2.GoogleCredentials;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

@Configuration
public class NotificationConfig {

    // Firebase Configuration
    @Value("${app.firebase.config-path:firebase-service-account.json}")
    private String firebaseConfigPath;

    @Value("${app.firebase.database-url:https://your-project.firebaseio.com}")
    private String firebaseDatabaseUrl;

    // Email Configuration
    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${spring.mail.username}")
    private String mailUsername;

    @Value("${spring.mail.password}")
    private String mailPassword;

    @Value("${spring.mail.properties.mail.smtp.auth:true}")
    private boolean smtpAuth;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable:true}")
    private boolean starttlsEnable;

    // Notification Settings
    @Value("${app.notifications.enabled:true}")
    private boolean notificationsEnabled;

    @Value("${app.notifications.batch-size:100}")
    private int batchSize;

    @Value("${app.notifications.retry-attempts:3}")
    private int retryAttempts;

    @PostConstruct
    public void initializeFirebase() {
        if (!notificationsEnabled) {
            return;
        }

        try {
            if (FirebaseApp.getApps().isEmpty()) {
                ClassPathResource resource = new ClassPathResource(firebaseConfigPath);
                InputStream serviceAccount = resource.getInputStream();

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setDatabaseUrl(firebaseDatabaseUrl)
                        .build();

                FirebaseApp.initializeApp(options);
            }
        } catch (IOException e) {
            System.err.println("Failed to initialize Firebase: " + e.getMessage());
            // You might want to disable notifications or use alternative notification method
        }
    }

    @Bean
    public FirebaseMessaging firebaseMessaging() {
        if (!notificationsEnabled || FirebaseApp.getApps().isEmpty()) {
            return null;
        }
        return FirebaseMessaging.getInstance();
    }

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(mailHost);
        mailSender.setPort(mailPort);
        mailSender.setUsername(mailUsername);
        mailSender.setPassword(mailPassword);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", smtpAuth);
        props.put("mail.smtp.starttls.enable", starttlsEnable);
        props.put("mail.debug", "false"); // Set to true for debugging
        props.put("mail.smtp.ssl.trust", mailHost);

        return mailSender;
    }

    /**
     * Notification types enum
     */
    public enum NotificationType {
        WEATHER_ALERT("Weather Alert"),
        DAILY_SUMMARY("Daily Weather Summary"),
        RAIN_ALERT("Rain Alert"),
        TEMPERATURE_THRESHOLD("Temperature Alert"),
        AIR_QUALITY_ALERT("Air Quality Alert"),
        SEVERE_WEATHER("Severe Weather Warning"),
        UV_INDEX_HIGH("High UV Index Warning"),
        TRAVEL_WEATHER("Travel Weather Update");

        private final String displayName;

        NotificationType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * Notification priority levels
     */
    public enum NotificationPriority {
        LOW("low"),
        NORMAL("normal"),
        HIGH("high");

        private final String value;

        NotificationPriority(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    /**
     * Push notification configuration
     */
    public static class PushNotificationConfig {
        public static final String WEATHER_CHANNEL_ID = "weather_updates";
        public static final String ALERT_CHANNEL_ID = "weather_alerts";
        public static final String DAILY_CHANNEL_ID = "daily_summary";

        public static final int DEFAULT_TTL_SECONDS = 3600; // 1 hour
        public static final int ALERT_TTL_SECONDS = 7200; // 2 hours
        public static final int DAILY_TTL_SECONDS = 86400; // 24 hours
    }

    /**
     * Email notification templates
     */
    public static class EmailTemplates {
        public static final String WEATHER_ALERT_TEMPLATE = "weather-alert";
        public static final String DAILY_SUMMARY_TEMPLATE = "daily-summary";
        public static final String TRAVEL_WEATHER_TEMPLATE = "travel-weather";
    }

    // Getters for configuration values
    public boolean isNotificationsEnabled() {
        return notificationsEnabled;
    }

    public int getBatchSize() {
        return batchSize;
    }

    public int getRetryAttempts() {
        return retryAttempts;
    }

    public String getMailUsername() {
        return mailUsername;
    }
}