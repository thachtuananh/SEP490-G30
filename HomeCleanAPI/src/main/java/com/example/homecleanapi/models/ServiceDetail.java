package com.example.homecleanapi.models;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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

    private String name;
    private String description;
    private Double price;
    private Integer minRoomSize;    
    private Integer maxRoomSize; 
          // Chiết khấu hoặc ưu đãi

    @OneToMany(mappedBy = "serviceDetail", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<JobServiceDetail> jobServiceDetails; 
    
    
    
    
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


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }



    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

 


	public List<JobServiceDetail> getJobServiceDetails() {
		return jobServiceDetails;
	}

	public void setJobServiceDetails(List<JobServiceDetail> jobServiceDetails) {
		this.jobServiceDetails = jobServiceDetails;
	}
    
}
