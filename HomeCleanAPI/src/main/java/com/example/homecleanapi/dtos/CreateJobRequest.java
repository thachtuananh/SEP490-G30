package com.example.homecleanapi.dtos;

import java.time.LocalDateTime;

public class CreateJobRequest {
    private Long customerId;
    private Long serviceId;
    private Long serviceDetailId;
    private String address;
    private Double latitude;
    private Double longitude;
    private String requestedAddress;
    private Double requestedLatitude;
    private Double requestedLongitude;
    private LocalDateTime scheduledTime;
    private Double totalPrice;

    
    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Long getServiceDetailId() {
        return serviceDetailId;
    }

    public void setServiceDetailId(Long serviceDetailId) {
        this.serviceDetailId = serviceDetailId;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getRequestedAddress() {
        return requestedAddress;
    }

    public void setRequestedAddress(String requestedAddress) {
        this.requestedAddress = requestedAddress;
    }

    public Double getRequestedLatitude() {
        return requestedLatitude;
    }

    public void setRequestedLatitude(Double requestedLatitude) {
        this.requestedLatitude = requestedLatitude;
    }

    public Double getRequestedLongitude() {
        return requestedLongitude;
    }

    public void setRequestedLongitude(Double requestedLongitude) {
        this.requestedLongitude = requestedLongitude;
    }

    public LocalDateTime getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(LocalDateTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }
}
