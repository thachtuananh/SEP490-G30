package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.ForgotPasswordRequest;
import com.example.homecleanapi.dtos.LoginRequest;
import com.example.homecleanapi.dtos.CustomerRegisterRequest;
import com.example.homecleanapi.services.CustomerAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerAuthService customerAuthService;

    public CustomerController(CustomerAuthService customerAuthService) {
        this.customerAuthService = customerAuthService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody CustomerRegisterRequest request) {
        return customerAuthService.customerRegister(request);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        return customerAuthService.customerLogin(request);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return customerAuthService.customerForgotPassword(request);
    }
}
