package com.example.homecleanapi.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "converstion")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id")
    private Integer customerId;

    @Column(name = "cleaner_id")
    private Integer cleanerId;
    private LocalDateTime created_at = LocalDateTime.now();

    public Conversation() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public Integer getCleanerId() {
        return cleanerId;
    }

    public void setCleanerId(Integer cleanerId) {
        this.cleanerId = cleanerId;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(LocalDateTime created_at) {
        this.created_at = created_at;
    }
}
