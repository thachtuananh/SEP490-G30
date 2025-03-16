package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.NotificationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WebSocketService {
    @Autowired
    private final SimpMessagingTemplate simpMessagingTemplate;

    public WebSocketService(SimpMessagingTemplate simpMessagingTemplate) {
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    public void sendNotification(String role, Integer userId, NotificationDTO notification) {
        String destination = role.equals("CUSTOMER") ?
                "/topic/customers/" + userId + "/notifications" :
                "/topic/cleaners/" + userId + "/notifications";

        simpMessagingTemplate.convertAndSend(destination, notification);
    }

    // Send to multiple
    public void sendNotificationToMultipleUsers(String role, List<Integer> userIds, NotificationDTO notification) {
        for (Integer userId : userIds) {
            sendNotification(role, userId, notification);
        }
    }

}
