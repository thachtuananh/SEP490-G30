package com.example.homecleanapi.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Entity
@Table(name = "customer_addresses")
@Getter
@Setter
public class CustomerAddresses {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customers customer;
    private String address;
    private double latitude;
    private double longitude;
    @Column(name = "is_current")
    private boolean current;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
}
