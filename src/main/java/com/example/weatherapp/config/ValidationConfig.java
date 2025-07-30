package com.example.weatherapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.validation.beanvalidation.MethodValidationPostProcessor;

import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Configuration
public class ValidationConfig {

    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }

    @Bean
    public MethodValidationPostProcessor methodValidationPostProcessor() {
        MethodValidationPostProcessor processor = new MethodValidationPostProcessor();
        processor.setValidator(validator());
        return processor;
    }

    // Custom validation annotations for weather-specific validations

    @Documented
    @jakarta.validation.Constraint(validatedBy = LatitudeValidator.class)
    @Target({ElementType.FIELD, ElementType.PARAMETER})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface ValidLatitude {
        String message() default "Latitude must be between -90 and 90 degrees";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
    }

    @Documented
    @jakarta.validation.Constraint(validatedBy = LongitudeValidator.class)
    @Target({ElementType.FIELD, ElementType.PARAMETER})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface ValidLongitude {
        String message() default "Longitude must be between -180 and 180 degrees";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
    }

    @Documented
    @jakarta.validation.Constraint(validatedBy = TimezoneValidator.class)
    @Target({ElementType.FIELD, ElementType.PARAMETER})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface ValidTimezone {
        String message() default "Invalid timezone format";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
    }

    @Documented
    @jakarta.validation.Constraint(validatedBy = WeatherUnitValidator.class)
    @Target({ElementType.FIELD, ElementType.PARAMETER})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface ValidWeatherUnit {
        String message() default "Invalid weather unit. Supported units: metric, imperial, kelvin";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
    }

    @Documented
    @jakarta.validation.Constraint(validatedBy = DateRangeValidator.class)
    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface ValidDateRange {
        String message() default "End date must be after start date";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
        String startDateField() default "startDate";
        String endDateField() default "endDate";
    }

    // Validator implementations
    public static class LatitudeValidator implements jakarta.validation.ConstraintValidator<ValidLatitude, Double> {
        @Override
        public boolean isValid(Double latitude, jakarta.validation.ConstraintValidatorContext context) {
            return latitude != null && latitude >= -90.0 && latitude <= 90.0;
        }
    }

    public static class LongitudeValidator implements jakarta.validation.ConstraintValidator<ValidLongitude, Double> {
        @Override
        public boolean isValid(Double longitude, jakarta.validation.ConstraintValidatorContext context) {
            return longitude != null && longitude >= -180.0 && longitude <= 180.0;
        }
    }

    public static class TimezoneValidator implements jakarta.validation.ConstraintValidator<ValidTimezone, String> {
        @Override
        public boolean isValid(String timezone, jakarta.validation.ConstraintValidatorContext context) {
            if (timezone == null || timezone.trim().isEmpty()) {
                return false;
            }
            try {
                java.time.ZoneId.of(timezone);
                return true;
            } catch (Exception e) {
                return false;
            }
        }
    }

    public static class WeatherUnitValidator implements jakarta.validation.ConstraintValidator<ValidWeatherUnit, String> {
        private static final java.util.Set<String> VALID_UNITS =
                java.util.Set.of("metric", "imperial", "kelvin", "standard");

        @Override
        public boolean isValid(String unit, jakarta.validation.ConstraintValidatorContext context) {
            return unit != null && VALID_UNITS.contains(unit.toLowerCase());
        }
    }

    public static class DateRangeValidator implements jakarta.validation.ConstraintValidator<ValidDateRange, Object> {
        private String startDateField;
        private String endDateField;

        @Override
        public void initialize(ValidDateRange constraintAnnotation) {
            this.startDateField = constraintAnnotation.startDateField();
            this.endDateField = constraintAnnotation.endDateField();
        }

        @Override
        public boolean isValid(Object object, jakarta.validation.ConstraintValidatorContext context) {
            try {
                java.lang.reflect.Field startField = object.getClass().getDeclaredField(startDateField);
                java.lang.reflect.Field endField = object.getClass().getDeclaredField(endDateField);

                startField.setAccessible(true);
                endField.setAccessible(true);

                java.time.LocalDateTime startDate = (java.time.LocalDateTime) startField.get(object);
                java.time.LocalDateTime endDate = (java.time.LocalDateTime) endField.get(object);

                if (startDate == null || endDate == null) {
                    return true; // Let @NotNull handle null validation
                }

                return startDate.isBefore(endDate);
            } catch (Exception e) {
                return false;
            }
        }
    }
}

// Example DTO classes with validation annotations
class WeatherRequestDto {

    @NotBlank(message = "City name is required")
    @Size(min = 2, max = 100, message = "City name must be between 2 and 100 characters")
    private String city;

    @ValidationConfig.ValidLatitude
    private Double latitude;

    @ValidationConfig.ValidLongitude
    private Double longitude;

    @ValidationConfig.ValidWeatherUnit
    private String units = "metric";

    @ValidationConfig.ValidTimezone
    private String timezone;

    @Pattern(regexp = "^[a-zA-Z]{2}$", message = "Country code must be 2 letters")
    private String countryCode;

    // Getters and setters
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getUnits() { return units; }
    public void setUnits(String units) { this.units = units; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
}

@ValidationConfig.ValidDateRange
class HistoricalWeatherRequestDto {

    @NotBlank(message = "City name is required")
    private String city;

    @NotNull(message = "Start date is required")
    private java.time.LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private java.time.LocalDateTime endDate;

    @ValidationConfig.ValidWeatherUnit
    private String units = "metric";

    // Getters and setters
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public java.time.LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(java.time.LocalDateTime startDate) { this.startDate = startDate; }

    public java.time.LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(java.time.LocalDateTime endDate) { this.endDate = endDate; }

    public String getUnits() { return units; }
    public void setUnits(String units) { this.units = units; }
}