package com.example.homecleanapi.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.example.homecleanapi.enums.JobStatus;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customers customer;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Services service;
    
    @OneToOne(mappedBy = "job", fetch = FetchType.LAZY)
    private JobDetails jobDetails;
    
    @ManyToOne
    @JoinColumn(name = "cleaner_id")
    private Cleaner cleaner;

    @ManyToOne
    @JoinColumn(name = "service_detail_id", nullable = false)
    private ServiceDetail serviceDetail;

    private String address;
    private Double latitude;
    private Double longitude;
    private String requestedAddress;
    private Double requestedLatitude;
    private Double requestedLongitude;
    
    @Column(name = "scheduled_time")
    private LocalDateTime scheduledTime;

    private Double totalPrice;

    @Enumerated(EnumType.STRING)
    private JobStatus status;  // Import JobStatus ở đây 

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Customers getCustomer() {
        return customer;
    }

    public void setCustomer(Customers customer) {
        this.customer = customer;
    }

    public Services getService() {
        return service;
    }

    public void setService(Services service) {
        this.service = service;
    }

    public ServiceDetail getServiceDetail() {
        return serviceDetail;
    }

    public void setServiceDetail(ServiceDetail serviceDetail) {
        this.serviceDetail = serviceDetail;
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

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

	public JobDetails getJobDetails() {
		return jobDetails;
	}

	public void setJobDetails(JobDetails jobDetails) {
		this.jobDetails = jobDetails;
	}

	public Cleaner getCleaner() {
		return cleaner;
	}

	public void setCleaner(Cleaner cleaner) {
		this.cleaner = cleaner;
	}
	
    
}
