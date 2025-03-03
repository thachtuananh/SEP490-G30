package com.example.homecleanapi.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "service_details")
public class ServiceDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Services service; // Liên kết với bảng Services

    private String name;             // Tên chi tiết dịch vụ
    private Double additionalPrice;  // Phụ phí
    private String description;      // Mô tả
    private String areaRange;        // Phạm vi diện tích
    private Double price;            // Giá dịch vụ
    private Integer minRoomSize;    
    private Integer maxRoomSize; 
    private Double peakTimeFee;      // Phụ phí giờ cao điểm
    private String discounts;        // Chiết khấu hoặc ưu đãi

    // Getters and Setters
    
    public Long getId() {
        return id;
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

	public void setId(Long id) {
        this.id = id;
    }

    public Services getService() {
        return service;
    }

    public void setService(Services service) {
        this.service = service;
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

    public String getAreaRange() {
        return areaRange;
    }

    public void setAreaRange(String areaRange) {
        this.areaRange = areaRange;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

 

    public Double getPeakTimeFee() {
        return peakTimeFee;
    }

    public void setPeakTimeFee(Double peakTimeFee) {
        this.peakTimeFee = peakTimeFee;
    }

    public String getDiscounts() {
        return discounts;
    }

    public void setDiscounts(String discounts) {
        this.discounts = discounts;
    }
}
