package com.example.homecleanapi.dtos;


import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;


@Data
@Setter
@Getter
public class NotificationDTO implements Serializable {
    private Integer userId;
    private String message;
    private String type;
    private LocalDateTime timestamp;
    private boolean read = false;
}