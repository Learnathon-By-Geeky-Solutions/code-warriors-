package com.map.MetaHive.config.cors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.Arrays;

@Configuration
public class CorsConfig {

    // Allowed origins read from application.properties (comma-separated list)
    @Value("${app.cors.allowedOrigins:http://localhost:3000}")
    private String[] allowedOrigins;

    // Allowed headers with a default that can be overridden
    @Value("${app.cors.allowedHeaders:Authorization,Content-Type}")
    private String[] allowedHeaders;

    // Allowed methods with a default that can be overridden
    @Value("${app.cors.allowedMethods:GET,POST,PUT,DELETE}")
    private String[] allowedMethods;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList(allowedOrigins));
        config.setAllowedHeaders(Arrays.asList(allowedHeaders));
        config.setAllowedMethods(Arrays.asList(allowedMethods));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
