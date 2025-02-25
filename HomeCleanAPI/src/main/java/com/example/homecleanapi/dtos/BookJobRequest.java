package com.example.homecleanapi.dtos;


public class BookJobRequest {

	
	private Long serviceId;          
    private Long serviceDetailId;    
    private String jobTime;          
    private Long customerAddressId; 
    private Integer roomSize;         
    private String imageUrl;
    
    
	
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
	public Long getCustomerAddressId() {
		return customerAddressId;
	}
	public void setCustomerAddressId(Long customerAddressId) {
		this.customerAddressId = customerAddressId;
	}
	public Integer getRoomSize() {
		return roomSize;
	}
	public void setRoomSize(Integer roomSize) {
		this.roomSize = roomSize;
	}
	public String getImageUrl() {
		return imageUrl;
	}
	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	} 

    
    
}
