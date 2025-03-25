package com.example.homecleanapi.dtos;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BulkNotificationRequest {
    private List<Integer> userIds;
    private NotificationContent notification;
	public List<Integer> getUserIds() {
		return userIds;
	}
	public void setUserIds(List<Integer> userIds) {
		this.userIds = userIds;
	}
	public NotificationContent getNotification() {
		return notification;
	}
	public void setNotification(NotificationContent notification) {
		this.notification = notification;
	}
    
    
}

