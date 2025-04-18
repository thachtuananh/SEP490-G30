package com.example.homecleanapi.dtos;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CustomerProfileAdminDTO {
    private String phone;
    private String fullName;
    private String email;
    private String password;
    private Boolean accountStatus;

}
