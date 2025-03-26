package com.example.homecleanapi.dtos;

import java.util.List;

public class ServiceDTO {
    private Long serviceId;
    private String serviceName;
    private String description;
    private Double basePrice;
    private List<ServiceDetailDTO> serviceDetails;  // List of service details

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
        private String description;
        private Double price;          // Thêm cột giá
        private Integer minRoomSize;  // Thêm cột minRoomSize
        private Integer maxRoomSize;  // Thêm cột maxRoomSize

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

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Double getPrice() {
            return price;
        }

        public void setPrice(Double price) {
            this.price = price;
        }

        public Integer getMinRoomSize() {
            return minRoomSize;
        }

        public void setMinRoomSize(Integer minRoomSize) {
            this.minRoomSize = minRoomSize;
        }

        public Integer getMaxRoomSize() {
            return maxRoomSize;
        }

        public void setMaxRoomSize(Integer maxRoomSize) {
            this.maxRoomSize = maxRoomSize;
        }
    }

}





