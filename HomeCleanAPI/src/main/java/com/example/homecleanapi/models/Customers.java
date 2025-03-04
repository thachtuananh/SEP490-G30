package com.example.homecleanapi.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "customers")
public class Customers {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String password_hash;
    private String full_name;
    @Column(name = "phone_number", unique = true, nullable = false)
    private String phone;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime created_at;

    public Customers() {
    }

    @PrePersist
    protected void onCreate() {
        this.created_at = LocalDateTime.now();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getPassword_hash() {
        return password_hash;
    }

    public void setPassword_hash(String password_hash) {
        this.password_hash = password_hash;
    }

    public String getFull_name() {
        return full_name;
    }

    public void setFull_name(String full_name) {
        this.full_name = full_name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(LocalDateTime created_at) {
        this.created_at = created_at;
    }
}