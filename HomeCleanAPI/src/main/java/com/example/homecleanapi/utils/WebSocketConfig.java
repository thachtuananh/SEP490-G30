package com.example.homecleanapi.utils;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry stompEndpointRegistry) {
        String[] allowedOrigins = {
                "http://localhost:3000",
                "https://house-clean-platform.firebaseapp.com",
                "https://house-clean-platform.web.app"
        };

        stompEndpointRegistry.addEndpoint("/websocket-chat")
                .setAllowedOrigins(allowedOrigins)
                .withSockJS();

        stompEndpointRegistry.addEndpoint("/websocket-notifications")
                .setAllowedOrigins(allowedOrigins)
                .withSockJS();
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Chat queue
        registry.enableSimpleBroker("/topic", "/queue");
        // Notification queue
        registry.setApplicationDestinationPrefixes("/topic/customers", "topic/cleaners");
        // Prefix message gửi từ client to server
        registry.setApplicationDestinationPrefixes("/app");
    }
}

