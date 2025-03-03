package com.example.homecleanapi.dtos;


public class BookJobRequest {

	
	private Long serviceId;          
    private Long serviceDetailId;    
    private String jobTime;          
    private Integer customerAddressId;         
    private String imageUrl;
    // test thu 1 dong o day
    
	
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
	public String getJobTime() {
		return jobTime;
	}
	public void setJobTime(String jobTime) {
		this.jobTime = jobTime;
	}
	public Integer getCustomerAddressId() {
		return customerAddressId;
	}
	public void setCustomerAddressId(Integer customerAddressId) {
		this.customerAddressId = customerAddressId;
	}

	public String getImageUrl() {
		return imageUrl;
	}
	
	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	} 
	
	
	

    
    
}
