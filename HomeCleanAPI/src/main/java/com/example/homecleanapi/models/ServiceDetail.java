package com.example.homecleanapi.models;



import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "service_details")
public class ServiceDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
<<<<<<< HEAD
    private Services service; // Quan hệ với bảng Service
=======
    private Service service; // Quan hệ với bảng Service
>>>>>>> 9a0130a (new commit with new API)

    private String name;
    private Double additionalPrice;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

<<<<<<< HEAD
    public Services getService() {
        return service;
    }

    public void setService(Services service) {
=======
    public Service getService() {
        return service;
    }

    public void setService(Service service) {
>>>>>>> 9a0130a (new commit with new API)
        this.service = service;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getAdditionalPrice() {
        return additionalPrice;
    }

    public void setAdditionalPrice(Double additionalPrice) {
        this.additionalPrice = additionalPrice;
    }
<<<<<<< HEAD
}  
=======
}
>>>>>>> 9a0130a (new commit with new API)
