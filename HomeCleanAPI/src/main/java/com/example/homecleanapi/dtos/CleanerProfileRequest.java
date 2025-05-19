package com.example.homecleanapi.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CleanerProfileRequest {
    private String name;
    private String phone;
    private String email;
    private String password;
    private Integer age;
    private String identityNumber;
    private String experience;
    private Boolean isVerified;
    private Boolean accountStatus;
}

