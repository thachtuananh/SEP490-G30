package com.example.homecleanapi.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "withdrawal_requests")
public class WithdrawalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private Customers customer;

    @ManyToOne
    @JoinColumn(name = "cleaner_id", referencedColumnName = "id")
    private Employee cleaner;

    @Column(name = "amount", nullable = false)
    private Double amount;


    @Column(name = "status", nullable = false)
    private String status;  // Trạng thái yêu cầu

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();  // Thời gian tạo yêu cầu

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();  // Thời gian cập nhật yêu cầu

    @Column(name = "card_number")
    private String cardNumber;  // Số thẻ

    @Column(name = "bank_name")
    private String bankName;    // Tên ngân hàng

    @Column(name = "account_holder_name")
    private String accountHolderName;

    // Getters and Setters


    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getAccountHolderName() {
        return accountHolderName;
    }

    public void setAccountHolderName(String accountHolderName) {
        this.accountHolderName = accountHolderName;
    }

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

    public Employee getCleaner() {
        return cleaner;
    }

    public void setCleaner(Employee cleaner) {
        this.cleaner = cleaner;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
