package com.map.metahive.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.SockJsServiceRegistration;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
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
        StompEndpointRegistry registry = mock(StompEndpointRegistry.class);
        // Use the new type from Spring 6:
        StompWebSocketEndpointRegistration registration = mock(StompWebSocketEndpointRegistration.class);

        // For methods with varargs, use any(String[].class) as the matcher
        when(registry.addEndpoint(any(String[].class))).thenReturn(registration);
        when(registration.setAllowedOriginPatterns(any(String[].class))).thenReturn(registration);
        when(registration.withSockJS()).thenReturn((SockJsServiceRegistration) registration);

        webSocketConfig.registerStompEndpoints(registry);

        // Capture and verify the endpoints registered
        ArgumentCaptor<String[]> captor = ArgumentCaptor.forClass(String[].class);
        verify(registry).addEndpoint(captor.capture());
        String[] endpoints = captor.getValue();
        assertThat(endpoints).containsExactly("/ws");

        // Capture and verify the allowed origin patterns
        ArgumentCaptor<String[]> captorOrigins = ArgumentCaptor.forClass(String[].class);
        verify(registration).setAllowedOriginPatterns(captorOrigins.capture());
        String[] origins = captorOrigins.getValue();
        assertThat(origins).containsExactly("*");

        // Verify SockJS was enabled.
        verify(registration).withSockJS();
    }
}
