package com.example.homecleanapi.models;

import jakarta.persistence.*;
import java.util.List;


@Entity
@Table(name = "services")
public class Services {  

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double basePrice;         
    private Integer minArea;          
    private Integer maxArea;          
    private String unit;              
    private Boolean isPeakTimeFee;    
    private String specialDiscount;   



    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL)
    private List<ServiceDetail> serviceDetails;
    
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<JobServiceDetail> jobServiceDetails; 

    // Getters and Setters
    
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public Integer getMinArea() {
        return minArea;
    }

    public void setMinArea(Integer minArea) {
        this.minArea = minArea;
    }

    public Integer getMaxArea() {
        return maxArea;
    }

    public void setMaxArea(Integer maxArea) {
        this.maxArea = maxArea;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Boolean getIsPeakTimeFee() {
        return isPeakTimeFee;
    }

    public void setIsPeakTimeFee(Boolean isPeakTimeFee) {
        this.isPeakTimeFee = isPeakTimeFee;
    }

    public String getSpecialDiscount() {
        return specialDiscount;
    }

    public void setSpecialDiscount(String specialDiscount) {
        this.specialDiscount = specialDiscount;
    }


    public List<ServiceDetail> getServiceDetails() {
        return serviceDetails;
    }

    public void setServiceDetails(List<ServiceDetail> serviceDetails) {
        this.serviceDetails = serviceDetails;
    }

	public List<JobServiceDetail> getJobServiceDetails() {
		return jobServiceDetails;
	}

	public void setJobServiceDetails(List<JobServiceDetail> jobServiceDetails) {
		this.jobServiceDetails = jobServiceDetails;
	}
    
    
}
