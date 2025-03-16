package com.example.homecleanapi.controllers;


import com.example.homecleanapi.dtos.BulkNotificationRequest;
import com.example.homecleanapi.dtos.NotificationDTO;
import com.example.homecleanapi.dtos.NotificationRequest;
import com.example.homecleanapi.services.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Notifications API")
@RestController
@RequestMapping("/api/notification")
public class NotificationController {
    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping(value = "/send/{role}/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> sendNotification(@PathVariable String role, @PathVariable Integer userId, @RequestBody NotificationRequest request) {
        NotificationDTO notification = new NotificationDTO(userId, request.getMessage(), request.getType(), LocalDate.now());
        notificationService.processNotification(notification, role, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/send/bulk/{role}", produces =  MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> sendBulkNotification(@PathVariable String role, @RequestBody BulkNotificationRequest request) {
        notificationService.sendBulkNotifications(role, request.getUserIds(), request.getNotification());
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/{role}/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable String role, @PathVariable String userId) {
        return  ResponseEntity.ok(notificationService.getUnreadNotifications(userId, role));
    }

    @DeleteMapping(value = "/{role}/{userId}")
    public ResponseEntity<Void> clearNotifications(@PathVariable String role, @PathVariable String userId) {
        notificationService.clearNotifications(userId, role);
        return ResponseEntity.noContent().build();
    }
}
