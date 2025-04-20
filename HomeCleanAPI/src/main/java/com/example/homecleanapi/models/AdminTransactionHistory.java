package com.example.homecleanapi.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_transaction_history")
public class AdminTransactionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // BIGSERIAL sẽ sử dụng AUTO_INCREMENT trong PostgreSQL
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private Customers customer;  // Nếu giao dịch liên quan đến customer

    @ManyToOne
    @JoinColumn(name = "cleaner_id", referencedColumnName = "id")
    private Employee cleaner;  // Nếu giao dịch liên quan đến cleaner

    @Column(name = "transaction_type")
    private String transactionType;  // Loại giao dịch (nạp tiền, thanh toán, rút tiền, v.v.)

    @Column(name = "amount")
    private Double amount;  // Số tiền được cộng hoặc trừ

    @Column(name = "transaction_date", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime transactionDate;  // Ngày giờ giao dịch

    @Column(name = "payment_method")
    private String paymentMethod;  // Phương thức thanh toán (VNPAY, bank transfer, etc.)

    @Column(name = "status")
    private String status;  // Trạng thái giao dịch (thành công, thất bại)

    @Column(name = "description")
    private String description;  // Mô tả giao dịch

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

    public Employee getCleaner() {
        return cleaner;
    }

    public void setCleaner(Employee cleaner) {
        this.cleaner = cleaner;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

