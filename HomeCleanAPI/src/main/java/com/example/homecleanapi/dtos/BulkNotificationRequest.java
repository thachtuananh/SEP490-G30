package com.example.homecleanapi.dtos;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BulkNotificationRequest {
    private List<Integer> userIds;
    private NotificationContent notification;
}

