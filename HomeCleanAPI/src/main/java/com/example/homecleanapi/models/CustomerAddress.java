//package com.example.homecleanapi.models;
//
//import jakarta.persistence.*;
//
//import jakarta.persistence.Entity;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "customer_addresses")
//public class CustomerAddress {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne
//    @JoinColumn(name = "customer_id", nullable = false)
//    private Customers customer;
//
//    @Column(name = "address", nullable = false)
//    private String address;
//
//    @Column(name = "latitude")
//    private Double latitude;
//
//    @Column(name = "longitude")
//    private Double longitude;
//
//    @Column(name = "is_default", nullable = false)
//    private Boolean isDefault = false;
//
//    @Column(name = "created_at", nullable = false, updatable = false)
//    private LocalDateTime createdAt;
//
//    // Getter và Setter
//
//    public Long getId() {
//        return id;
//    }
//
//    public void setId(Long id) {
//        this.id = id;
//    }
//
//    public Customers getCustomer() {
//        return customer;
//    }
//
//    public void setCustomer(Customers customer) {
//        this.customer = customer;
//    }
//
//    public String getAddress() {
//        return address;
//    }
//
//    public void setAddress(String address) {
//        this.address = address;
//    }
//
//    public Double getLatitude() {
//        return latitude;
//    }
//
//    public void setLatitude(Double latitude) {
//        this.latitude = latitude;
//    }
//
//    public Double getLongitude() {
//        return longitude;
//    }
//
//    public void setLongitude(Double longitude) {
//        this.longitude = longitude;
//    }
//
//    public Boolean getIsDefault() {
//        return isDefault;
//    }
//
//    public void setIsDefault(Boolean isDefault) {
//        this.isDefault = isDefault;
//    }
//
//    public LocalDateTime getCreatedAt() {
//        return createdAt;
//    }
//
//    public void setCreatedAt(LocalDateTime createdAt) {
//        this.createdAt = createdAt;
//    }
//
//    // Optional: override equals and hashCode based on id or customer and address
//    @Override
//    public boolean equals(Object o) {
//        if (this == o) return true;
//        if (o == null || getClass() != o.getClass()) return false;
//        CustomerAddress that = (CustomerAddress) o;
//        return id != null && id.equals(that.id);
//    }
//
//    @Override
//    public int hashCode() {
//        return 31;
//    }
//}
