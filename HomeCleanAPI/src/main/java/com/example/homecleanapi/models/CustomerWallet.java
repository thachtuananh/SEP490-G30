package com.example.homecleanapi.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_wallet")
public class CustomerWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Tự động tạo giá trị id
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)  // Mối quan hệ với Customer
    @JoinColumn(name = "customer_id", referencedColumnName = "id", nullable = false)
    private Customers customer;

    @Column(name = "balance", nullable = false)
    private Double balance = 0.0;  // Số dư ví mặc định là 0

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "txn_ref")
    private String txnRef;

    // Constructors
    public CustomerWallet() {}

    public CustomerWallet(Customers customer, Double balance, LocalDateTime updatedAt, String txnRef) {
        this.customer = customer;
        this.balance = balance;
        this.updatedAt = updatedAt;
        this.txnRef = txnRef;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Customers getCustomer() {
        return customer;
    }

    public void setCustomer(Customers customer) {
        this.customer = customer;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getTxnRef() {
        return txnRef;
    }

    public void setTxnRef(String txnRef) {
        this.txnRef = txnRef;
    }
}
