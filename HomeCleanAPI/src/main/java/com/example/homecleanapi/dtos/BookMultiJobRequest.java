package com.example.homecleanapi.dtos;

import java.util.List;

public class BookMultiJobRequest {
    private Long customerAddressId;
    private String paymentMethod;
    private String reminder;
    private List<MultiJobRequest> jobs;


    public Long getCustomerAddressId() {
        return customerAddressId;
    }

    public void setCustomerAddressId(Long customerAddressId) {
        this.customerAddressId = customerAddressId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getReminder() {
        return reminder;
    }

    public void setReminder(String reminder) {
        this.reminder = reminder;
    }

    public List<MultiJobRequest> getJobs() {
        return jobs;
    }

    public void setJobs(List<MultiJobRequest> jobs) {
        this.jobs = jobs;
    }
}
