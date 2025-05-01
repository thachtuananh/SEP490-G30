package com.example.homecleanapi.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "customers")
@Getter
@Setter
public class Customers {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String password_hash;
    private String full_name;

    @Column(name = "phone_number")
    private String phone;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDate created_at;

    @Column(name = "is_deleted")
    private boolean isDeleted;
    private String email;
}
