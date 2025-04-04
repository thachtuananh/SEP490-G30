package com.example.homecleanapi.dtos;

import java.time.LocalDateTime;

public class JobSummaryDTO {

	private Long jobId;  // Thêm trường jobId
    private String serviceName;
    private Double price;
    private LocalDateTime scheduledTime;
	private Double distance;

	public JobSummaryDTO(Long jobId, String serviceName, Double price, LocalDateTime scheduledTime, Double distance) {
		this.jobId = jobId;
		this.serviceName = serviceName;
		this.price = price;
		this.scheduledTime = scheduledTime;
		this.distance = distance;  // Gán giá trị distance
	}

	public JobSummaryDTO() {

	}

	public Double getDistance() {
		return distance;
	}

	public void setDistance(Double distance) {
		this.distance = distance;
	}

	public String getServiceName() {
		return serviceName;
	}

	public void setServiceName(String serviceName) {
		this.serviceName = serviceName;
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
