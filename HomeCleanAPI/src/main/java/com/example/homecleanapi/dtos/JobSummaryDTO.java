package com.example.homecleanapi.dtos;

import java.time.LocalDateTime;

public class JobSummaryDTO {

	private Long jobId;  // Thêm trường jobId
    private String serviceName;
    private String location;
    private Double price;
    private LocalDateTime scheduledTime;

    public JobSummaryDTO(Long jobId, String serviceName, String location, Double price, LocalDateTime scheduledTime) {
        this.jobId = jobId;  // Gán giá trị jobId
        this.serviceName = serviceName;
        this.location = location;
        this.price = price;
        this.scheduledTime = scheduledTime;
    }

	public String getServiceName() {
		return serviceName;
	}

	public void setServiceName(String serviceName) {
		this.serviceName = serviceName;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public Double getPrice() {
		return price;
	}

	public void setPrice(Double price) {
		this.price = price;
	}

	public LocalDateTime getScheduledTime() {
		return scheduledTime;
	}

	public void setScheduledTime(LocalDateTime scheduledTime) {
		this.scheduledTime = scheduledTime;
	}

	public Long getJobId() {
		return jobId;
	}

	public void setJobId(Long jobId) {
		this.jobId = jobId;
	}

	
    
}
