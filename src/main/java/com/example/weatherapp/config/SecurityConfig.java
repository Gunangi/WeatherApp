package com.example.weatherapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Value("${app.security.jwt.secret}")
    private String jwtSecret;

    @Value("${app.security.jwt.expiration:86400}")
    private int jwtExpirationInSeconds;

    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource) {
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/public/weather/**",
                                "/api/health/**",
                                "/api/weather/current/**",
                                "/api/weather/forecast/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/actuator/health",
                                "/error"
                        ).permitAll()

                        // Weather endpoints with rate limiting
                        .requestMatchers("/api/weather/**").hasAnyRole("USER", "PREMIUM", "ADMIN")

                        // Premium features
                        .requestMatchers(
                                "/api/weather/historical/**",
                                "/api/weather/ml/**",
                                "/api/weather/alerts/custom/**",
                                "/api/weather/travel/**",
                                "/api/weather/comparison/**"
                        ).hasAnyRole("PREMIUM", "ADMIN")

                        // User-specific endpoints
                        .requestMatchers(
                                "/api/users/profile/**",
                                "/api/weather/favorites/**",
                                "/api/weather/journal/**",
                                "/api/weather/notifications/**",
                                "/api/weather/widgets/**",
                                "/api/weather/sharing/**"
                        ).hasAnyRole("USER", "PREMIUM", "ADMIN")

                        // Admin endpoints
                        .requestMatchers(
                                "/api/admin/**",
                                "/actuator/**"
                        ).hasRole("ADMIN")

                        // All other requests need authentication
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers
                        .frameOptions().deny()
                        .contentTypeOptions().and()
                        .httpStrictTransportSecurity(hsts -> hsts
                                .maxAgeInSeconds(31536000)
                                .includeSubdomains(true)
                        )
                );

        // Add JWT filter
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtSecret);
    }

    @Bean
    public JwtUtil jwtUtil() {
        return new JwtUtil(jwtSecret, jwtExpirationInSeconds);
    }
}

// JWT Authentication Filter
class JwtAuthenticationFilter extends org.springframework.web.filter.OncePerRequestFilter {

    private final String jwtSecret;

    public JwtAuthenticationFilter(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    @Override
    protected void doFilterInternal(
            jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response,
            jakarta.servlet.FilterChain filterChain
    ) throws jakarta.servlet.ServletException, java.io.IOException {

        String token = getTokenFromRequest(request);

        if (token != null && validateToken(token)) {
            String username = getUsernameFromToken(token);

            if (username != null && org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() == null) {
                // Create authentication object
                org.springframework.security.authentication.UsernamePasswordAuthenticationToken authentication =
                        new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                username, null, getAuthoritiesFromToken(token));

                org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(jakarta.servlet.http.HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private boolean validateToken(String token) {
        // Implementation for token validation
        return true; // Simplified for example
    }

    private String getUsernameFromToken(String token) {
        // Implementation to extract username from token
        return "user"; // Simplified for example
    }

    private java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthoritiesFromToken(String token) {
        // Implementation to extract authorities from token
        return java.util.Arrays.asList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"));
    }
}

// JWT Utility Class
class JwtUtil {
    private final String secret;
    private final int expiration;

    public JwtUtil(String secret, int expiration) {
        this.secret = secret;
        this.expiration = expiration;
    }

    public String generateToken(String username) {
        // Implementation for token generation
        return "generated-jwt-token"; // Simplified for example
    }

    public boolean validateToken(String token) {
        // Implementation for token validation
        return true; // Simplified for example
    }

    public String getUsernameFromToken(String token) {
        // Implementation to extract username
        return "user"; // Simplified for example
    }
}
