package com.example.homecleanapi.dtos;


import com.fasterxml.jackson.annotation.JsonFormat;
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
    @JsonFormat(pattern = "yyyy-MM-dd['T'HH:mm:ss]")
    private LocalDateTime timestamp;
    private boolean read = false;
}