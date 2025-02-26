package com.example.homecleanapi.dtos;


import java.util.Date;

public class EmployeeLocationsDTO {
    private String address;
    private Double latitude;
    private Double longitude;

    public EmployeeLocationsDTO() {
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
}