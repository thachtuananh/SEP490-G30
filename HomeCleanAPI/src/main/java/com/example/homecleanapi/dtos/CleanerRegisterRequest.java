package com.example.homecleanapi.dtos;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CleanerRegisterRequest {
    private String password;
    private String name;
    private String phone;
    private String email;
    private Integer age;
    private String address;
    private String identity_number;
    private String experience;

    public CleanerRegisterRequest() {
    }

}