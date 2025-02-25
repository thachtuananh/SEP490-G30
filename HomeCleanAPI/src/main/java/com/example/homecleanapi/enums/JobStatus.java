package com.example.homecleanapi.enums;

public enum JobStatus {
	OPEN,
    PENDING_APPROVAL,
    IN_PROGRESS,
    ARRIVED,       // Khi cleaner đã đến
    STARTED,       // Khi công việc bắt đầu
    COMPLETED,     
    CANCELLED
}