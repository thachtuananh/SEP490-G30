package com.example.homecleanapi.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long conversation_id;

    @Lob
    private String message_content;

    private LocalDateTime sent_at = LocalDateTime.now();
}
