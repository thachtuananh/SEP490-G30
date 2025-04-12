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
