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
        // Chat service
        stompEndpointRegistry.addEndpoint("/websocket-chat")
                .setAllowedOrigins("http://localhost:3000/")
                .withSockJS();
        // Notification service
        stompEndpointRegistry.addEndpoint("/websocket-notifications")
                .setAllowedOrigins("http://localhost:3000")
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
