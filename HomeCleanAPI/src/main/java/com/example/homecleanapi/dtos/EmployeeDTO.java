package com.example.homecleanapi.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeDTO {
    private long id;
    private String fullName;
    private String email;
    private String experience;
    private String phoneNumber;
    private byte[] profileImage;
    private double latitude;
    private double longitude;
    private double distance;
}
