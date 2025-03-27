package com.example.homecleanapi.dtos;


import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;


@Data
@NoArgsConstructor
public class NotificationDTO implements Serializable {
    private Integer userId;
    private String message;
    private String type;
    private LocalDate timestamp;
    
    
    public NotificationDTO(Integer userId, String message, String type, LocalDate timestamp) {
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.timestamp = timestamp;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDate getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDate timestamp) {
        this.timestamp = timestamp;
    }
}