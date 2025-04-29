package com.meta.user.config;

import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity // Explicitly enable security configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        // *** This is the crucial line for Prometheus ***
                        // Allow Prometheus and Health endpoints without authentication
                        .requestMatchers(EndpointRequest.to("prometheus", "health")).permitAll()
                        // Add any other public paths specific to user-service here if needed
                        .requestMatchers("/public/**").permitAll()

                        // Secure all other requests - they WILL require a valid JWT
                        .anyRequest().authenticated()
                )
                // Enable JWT resource server validation (uses your application.properties)
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                // Optional: Stateless session management is typical for resource servers
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Optional: Disable CSRF for stateless APIs
                .csrf(csrf -> csrf.disable());

        return http.build();
    }

    // You DO NOT need the Keycloak admin client bean here for request security.
    // Keep your existing KeycloakConfig.java for the admin client functionality.
    // You might need a CORS configuration bean here if called from a web frontend.
}