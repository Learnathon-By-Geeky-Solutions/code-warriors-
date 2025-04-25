package com.map.metahive.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.SockJsServiceRegistration;
import org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class WebSocketConfigTest {

    private WebSocketConfig webSocketConfig;

    @BeforeEach
    public void setup() {
        webSocketConfig = new WebSocketConfig();
    }

    @Test
    public void testConfigureMessageBroker() {
        MessageBrokerRegistry registry = mock(MessageBrokerRegistry.class);
        webSocketConfig.configureMessageBroker(registry);

        verify(registry).enableSimpleBroker("/topic", "/queue");
        verify(registry).setApplicationDestinationPrefixes("/app");
    }

    @Test
    public void testRegisterStompEndpoints() {
        // Create a mock for the endpoint registry.
        StompEndpointRegistry registry = mock(StompEndpointRegistry.class);

        // Create a mock for the registration returned by addEndpoint(...).
        StompWebSocketEndpointRegistration registration = mock(StompWebSocketEndpointRegistration.class);
        // Create a separate mock for what withSockJS() returns.
        SockJsServiceRegistration sockJsServiceRegistration = mock(SockJsServiceRegistration.class);

        // For varargs methods, use explicit cast with any() matcher.
        when(registry.addEndpoint((String[]) any())).thenReturn(registration);
        when(registration.setAllowedOriginPatterns((String[]) any())).thenReturn(registration);
        when(registration.withSockJS()).thenReturn(sockJsServiceRegistration);

        // Execute the method under test.
        webSocketConfig.registerStompEndpoints(registry);

        // Verify that addEndpoint was called with "/ws"
        ArgumentCaptor<String[]> endpointCaptor = ArgumentCaptor.forClass(String[].class);
        verify(registry).addEndpoint(endpointCaptor.capture());
        String[] endpoints = endpointCaptor.getValue();
        assertThat(endpoints).containsExactly("/ws");

        // Verify that setAllowedOriginPatterns was called with "*"
        ArgumentCaptor<String[]> originCaptor = ArgumentCaptor.forClass(String[].class);
        verify(registration).setAllowedOriginPatterns(originCaptor.capture());
        String[] origins = originCaptor.getValue();
        assertThat(origins).containsExactly("*");

        // Verify that withSockJS() was called.
        verify(registration).withSockJS();
    }
}
