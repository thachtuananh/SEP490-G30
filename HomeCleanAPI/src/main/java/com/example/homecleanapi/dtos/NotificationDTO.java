package com.example.homecleanapi.dtos;


import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;


@Data
@Setter
@Getter
public class NotificationDTO implements Serializable {
    private Integer userId;
    private String message;
    private String type;
    private LocalDate timestamp;
    private boolean read = false;
}