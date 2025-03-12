package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.BulkNotificationRequest;
import com.example.homecleanapi.dtos.NotificationContent;
import com.example.homecleanapi.dtos.NotificationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final WebSocketService webSocketService;

    @Autowired
    public NotificationService(@Qualifier("commonRedisTemplate") RedisTemplate<String, Object> redisTemplate, WebSocketService webSocketService) {
        this.redisTemplate = redisTemplate;
        this.webSocketService = webSocketService;
    }

    public void processNotification(NotificationDTO notification, String role, Integer userId) {
        String key = role.equals("CUSTOMER") ?
                "notifications:customers:" + userId :
                "notifications:cleaners:" + userId;

        NotificationDTO userNotification = new NotificationDTO(notification.getUserId(), notification.getMessage(), notification.getType(), LocalDate.now());

        // Save to Redis
        redisTemplate.opsForList().leftPush(key, notification);

        // Send to websocket
        webSocketService.sendNotification(role, userId, notification);
    }

    public List<NotificationDTO> getUnreadNotifications(String role, String userId) {
        String key = role.equals("CUSTOMER") ?
                "notifications:customers:" + userId :
                "notifications:cleaners:" + userId;

        List<Object> notifications = redisTemplate.opsForList().range(key, 0, -1);
        List<NotificationDTO> collect = notifications.stream().map(o -> (NotificationDTO) o).collect(Collectors.toList());
        return collect;
    }

    public void sendBulkNotifications(String role, List<Integer> userIds, NotificationContent notifications) {
        for(Integer userId : userIds) {
            NotificationDTO userNotification = new NotificationDTO(
                    userId,
                    notifications.getMessage(),
                    notifications.getType(),
                    LocalDate.now());
            processNotification(userNotification, role, userId);
        }
    }

    public void clearNotifications(String role, String userId) {
        String key = role.equals("CUSTOMER") ?
                "notifications:customers:" + userId :
                "notifications:cleaners:" + userId;

        redisTemplate.delete(key);
    }
}
