package com.example.homecleanapi.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

import com.example.homecleanapi.enums.JobStatus;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<JobServiceDetail> jobServiceDetails;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customers customer;


    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Feedback> feedback;
    
    @OneToOne(mappedBy = "job", fetch = FetchType.LAZY)
    private JobDetails jobDetails;
    
    @ManyToOne
    @JoinColumn(name = "cleaner_id")
    private Employee cleaner;

//    @ManyToOne
//    @JoinColumn(name = "service_detail_id")
//    private ServiceDetail serviceDetail;

    
    @ManyToOne
    @JoinColumn(name = "customer_address_id", referencedColumnName = "id")
    private CustomerAddresses customerAddress; // Mối quan hệ với CustomerAddress

    @Column(name = "scheduled_time")
    private LocalDateTime scheduledTime;


    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;


    private Double totalPrice;
    
    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    private JobStatus status;  // Import JobStatus ở đây 
    
    @Column(name = "txn_ref")
    private String txnRef;
    
    @Column(name = "reminder")
    private String reminder;  

    // Getters and Setters


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<Feedback> getFeedback() {
        return feedback;
    }

    public void setFeedback(List<Feedback> feedback) {
        this.feedback = feedback;
    }

    public Long getId() {
        return id;
    }

    public String getReminder() {
		return reminder;
	}

	public void setReminder(String reminder) {
		this.reminder = reminder;
	}

	public String getTxnRef() {
		return txnRef;
	}

	public void setTxnRef(String txnRef) {
		this.txnRef = txnRef;
	}

	public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public List<JobServiceDetail> getJobServiceDetails() {
		return jobServiceDetails;
	}

	public void setJobServiceDetails(List<JobServiceDetail> jobServiceDetails) {
		this.jobServiceDetails = jobServiceDetails;
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

//    public Services getService() {
//        return service;
//    }
//
//    public void setService(Services service) {
//        this.service = service;
//    }
//
//    public ServiceDetail getServiceDetail() {
//        return serviceDetail;
//    }
//
//    public void setServiceDetail(ServiceDetail serviceDetail) {
//        this.serviceDetail = serviceDetail;
//    }

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
