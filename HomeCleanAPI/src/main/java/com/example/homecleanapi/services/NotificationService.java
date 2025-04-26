package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.BulkNotificationRequest;
import com.example.homecleanapi.dtos.NotificationContent;
import com.example.homecleanapi.dtos.NotificationDTO;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;


import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final WebSocketService webSocketService;
    private final ObjectMapper objectMapper;

    @Autowired
    public NotificationService(@Qualifier("commonRedisTemplate") RedisTemplate<String, Object> redisTemplate, WebSocketService webSocketService, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.webSocketService = webSocketService;
        this.objectMapper = objectMapper;
    }

    public void processNotification(NotificationDTO notification, String role, Integer userId) {
        if (notification == null || role == null || userId == null) {
            throw new IllegalArgumentException("Notification, role, and userId must not be null");
        }

        String key = generateRedisKey(role, userId);
        // Đảm bảo thông báo mới luôn là chưa đọc
        notification.setRead(false);
        try {
            // Convert Object -> JSON String trước khi lưu vào Redis
            String jsonNotification = objectMapper.writeValueAsString(notification);

            // Save JSON string vào Redis thay vì Object
            redisTemplate.opsForList().leftPush(key, jsonNotification);

            // Send to WebSocket
            webSocketService.sendNotification(role, userId, notification);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting NotificationDTO to JSON", e);
        }
    }

    public List<NotificationDTO> getUnreadNotifications(String role, Integer userId) {
        if (role == null || userId == null) {
            throw new IllegalArgumentException("Role and userId must not be null");
        }

        String key = generateRedisKey(role, userId);
        List<Object> rawNotifications = redisTemplate.opsForList().range(key, 0, -1);

        if (rawNotifications == null || rawNotifications.isEmpty()) {
            return Collections.emptyList();
        }

        List<NotificationDTO> notifications = new ArrayList<>();
        for (Object obj : rawNotifications) {
            try {
                NotificationDTO notification = objectMapper.readValue(obj.toString(), NotificationDTO.class);
                if (!notification.isRead()) {
                    notifications.add(notification);
                }
            } catch (JsonProcessingException e) {
                // Log lỗi parse nhưng bỏ qua, không throw
                System.out.println("Error parsing notification: " + e.getMessage());
                // Bạn có thể dùng logger thay vì System.out nếu cần production-ready
            }
        }

        return notifications;
    }

    private String generateRedisKey(String role, Integer userId) {
        switch (role.toUpperCase()) {
            case "CUSTOMER":
                return "notifications:customers:" + userId;
            case "CLEANER":
                return "notifications:cleaners:" + userId;
            default:
                throw new IllegalArgumentException("Invalid role: " + role);
        }
    }

    public void sendBulkNotifications(String role, List<Integer> userIds, NotificationContent notifications) {
        for (Integer userId : userIds) {
            NotificationDTO userNotification = new NotificationDTO();
            userNotification.setUserId(userId);
            userNotification.setMessage(notifications.getMessage());
            userNotification.setType(notifications.getType());
            userNotification.setTimestamp(LocalDate.now());
            userNotification.setRead(false); // Chắc chắn chưa đọc

            processNotification(userNotification, role, userId);
        }
    }

    public void clearNotifications(String role, Integer userId) {
        String key = generateRedisKey(role, userId);

        redisTemplate.delete(key);
    }

    public void markAllAsRead(String role, Integer userId) {
        if (role == null || userId == null) {
            throw new IllegalArgumentException("Role and userId must not be null");
        }

        String key = generateRedisKey(role, userId);
        List<Object> rawNotifications = redisTemplate.opsForList().range(key, 0, -1);

        if (rawNotifications == null || rawNotifications.isEmpty()) {
            return;
        }

        List<String> updatedNotifications = rawNotifications.stream()
                .map(obj -> {
                    try {
                        NotificationDTO notification = objectMapper.readValue(obj.toString(), NotificationDTO.class);
                        if (!notification.isRead()) {
                            notification.setRead(true);
                        }
                        return objectMapper.writeValueAsString(notification);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException("Error processing notification JSON", e);
                    }
                })
                .collect(Collectors.toList());

        // Ghi đè lại toàn bộ list trong Redis
        redisTemplate.delete(key); // Xóa cũ
        redisTemplate.opsForList().rightPushAll(key, updatedNotifications); // Ghi mới từ đầu
    }

}
