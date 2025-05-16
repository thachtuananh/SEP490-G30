package com.example.homecleanapi.dtos;

import java.util.List;

public class MultiJobRequest {
    private String jobTime;
    private List<BookJobRequest.ServiceRequest> services;

    public String getJobTime() {
        return jobTime;
    }

    public void setJobTime(String jobTime) {
        this.jobTime = jobTime;
    }

    public List<BookJobRequest.ServiceRequest> getServices() {
        return services;
    }

    public void setServices(List<BookJobRequest.ServiceRequest> services) {
        this.services = services;
    }
}
