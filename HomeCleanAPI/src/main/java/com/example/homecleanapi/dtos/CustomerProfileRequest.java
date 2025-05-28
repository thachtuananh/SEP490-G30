package com.example.homecleanapi.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerProfileRequest {
    private String phone;
    private String fullName;
    private String email;
}
