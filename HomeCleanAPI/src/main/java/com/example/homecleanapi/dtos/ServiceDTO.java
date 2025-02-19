package com.example.homecleanapi.dtos;

import java.util.List;

public class ServiceDTO {
    private Long serviceId;
    private String serviceName;
    private String description;
    private Double basePrice;
    private String serviceType;
    private List<ServiceDetailDTO> serviceDetails;

    // Getters and Setters

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public List<ServiceDetailDTO> getServiceDetails() {
        return serviceDetails;
    }

    public void setServiceDetails(List<ServiceDetailDTO> serviceDetails) {
        this.serviceDetails = serviceDetails;
    }

    public static class ServiceDetailDTO {
        private Long serviceDetailId;
        private String name;
        private Double additionalPrice;

        // Getters and Setters
        public Long getServiceDetailId() {
            return serviceDetailId;
        }

        public void setServiceDetailId(Long serviceDetailId) {
            this.serviceDetailId = serviceDetailId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Double getAdditionalPrice() {
            return additionalPrice;
        }

        public void setAdditionalPrice(Double additionalPrice) {
            this.additionalPrice = additionalPrice;
        }
    }
}
