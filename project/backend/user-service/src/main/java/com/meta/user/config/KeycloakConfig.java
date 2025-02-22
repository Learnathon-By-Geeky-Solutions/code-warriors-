package com.meta.user.config;

import lombok.Data;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Data
@Configuration
@ConfigurationProperties(prefix = "keycloak")
public class KeycloakConfig {
    private String authServerUrl;
    private String realm;
    private String resource;
    private Credentials credentials;
    private Admin admin;

    @Data
    public static class Credentials {
        private String secret;
    }

    @Data
    public static class Admin {
        private String username;
        private String password;
    }

    @Bean
    public Keycloak keycloak() {
        return KeycloakBuilder.builder()
                .serverUrl(authServerUrl)
                .realm("master")
                .clientId("admin-cli")
                .username(admin.getUsername())
                .password(admin.getPassword())
                .build();
    }
}
