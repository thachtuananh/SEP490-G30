package com.example.homecleanapi.dtos;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerRegisterRequest {
    private String phone;
    private String password;
    private String name;
    private String email;
}