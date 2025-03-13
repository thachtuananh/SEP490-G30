package com.example.homecleanapi.dtos;

import java.util.List;

public class BookJobRequest {

    private Integer customerAddressId;  
    private String jobTime;  
    private List<ServiceRequest> services;  

    // Getter và Setter cho customerAddressId
    public Integer getCustomerAddressId() {
        return customerAddressId;
    }

    public void setCustomerAddressId(Integer customerAddressId) {
        this.customerAddressId = customerAddressId;
    }

    // Getter và Setter cho jobTime
    public String getJobTime() {
        return jobTime;
    }

    public void setJobTime(String jobTime) {
        this.jobTime = jobTime;
    }

    // Getter và Setter cho services
    public List<ServiceRequest> getServices() {
        return services;
    }

    public void setServices(List<ServiceRequest> services) {
        this.services = services;
    }

    // Đối tượng đại diện cho một dịch vụ và chi tiết dịch vụ
    public static class ServiceRequest {
        private Long serviceId;  // ID dịch vụ
        private Long serviceDetailId;  // ID chi tiết dịch vụ
        private String imageUrl;  // Link ảnh liên quan đến dịch vụ

        // Getter và Setter cho serviceId
        public Long getServiceId() {
            return serviceId;
        }

        public void setServiceId(Long serviceId) {
            this.serviceId = serviceId;
        }

        // Getter và Setter cho serviceDetailId
        public Long getServiceDetailId() {
            return serviceDetailId;
        }

        public void setServiceDetailId(Long serviceDetailId) {
            this.serviceDetailId = serviceDetailId;
        }

        // Getter và Setter cho imageUrl
        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }
}
