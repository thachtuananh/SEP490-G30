package com.example.homecleanapi.dtos;

import java.time.LocalDateTime;

public class ChatMessage {
    private Long conversation_id;
    private Long sender_id;
    private String content;
    private LocalDateTime timestamp = LocalDateTime.now();
}
