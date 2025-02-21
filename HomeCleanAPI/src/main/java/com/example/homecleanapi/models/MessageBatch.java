package com.example.homecleanapi.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class MessageBatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "conversation_id")
    private Long conversationId;

    @Column(name = "meassge_content")
    private String meassge_content;

    private LocalDateTime sent_at = LocalDateTime.now();

    public MessageBatch() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public String getMeassge_content() {
        return meassge_content;
    }

    public void setMeassge_content(String meassge_content) {
        this.meassge_content = meassge_content;
    }

    public LocalDateTime getSent_at() {
        return sent_at;
    }

    public void setSent_at(LocalDateTime sent_at) {
        this.sent_at = sent_at;
    }
}
