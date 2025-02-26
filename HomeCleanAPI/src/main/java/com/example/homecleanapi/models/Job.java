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
    private Employee cleaner;

    @ManyToOne
    @JoinColumn(name = "service_detail_id", nullable = false)
    private ServiceDetail serviceDetail;

    
    @ManyToOne
    @JoinColumn(name = "customer_address_id", referencedColumnName = "id")
    private CustomerAddresses customerAddress; // Mối quan hệ với CustomerAddress

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

    public CustomerAddresses getCustomerAddress() {
        return customerAddress;
    }

    public void setCustomerAddress(CustomerAddresses customerAddress) {
        this.customerAddress = customerAddress;
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

    public Employee getCleaner() {
        return cleaner;
    }

    public void setCleaner(Employee cleaner) {
        this.cleaner = cleaner;
    }
}
