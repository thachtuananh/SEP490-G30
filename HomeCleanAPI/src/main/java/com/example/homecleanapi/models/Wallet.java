package com.example.homecleanapi.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
@Getter
@Setter
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cleaner_id", nullable = false)
    private Employee cleaner;

    private Double balance;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @Column(name = "txn_ref")  
    private String txnRef;  

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getCleaner() {
        return cleaner;
    }

    public void setCleaner(Employee cleaner) {
        this.cleaner = cleaner;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public String getTxnRef() {
        return txnRef;
    }

    public void setTxnRef(String txnRef) {
        this.txnRef = txnRef;
    }
}
