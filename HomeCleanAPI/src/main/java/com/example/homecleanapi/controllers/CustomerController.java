package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.CustomerProfileRequest;
import com.example.homecleanapi.dtos.ForgotPasswordRequest;
import com.example.homecleanapi.dtos.LoginRequest;
import com.example.homecleanapi.dtos.CustomerRegisterRequest;
import com.example.homecleanapi.services.CustomerAuthService;
import com.example.homecleanapi.services.CustomerProfileService;
import com.example.homecleanapi.utils.JwtUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@Tag(name = "Customer API")
@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private JwtUtils jwtUtils;

    private final CustomerAuthService customerAuthService;

    private CustomerProfileService customerProfileService;

    public CustomerController(CustomerAuthService customerAuthService, JwtUtils jwtUtils, CustomerProfileService customerProfileService) {
        this.customerAuthService = customerAuthService;
        this.jwtUtils = jwtUtils;
        this.customerProfileService = customerProfileService;
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

    @PutMapping("/{customer_id}/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody CustomerProfileRequest request, @RequestParam int customer_id) {

        return customerProfileService.updateProfile(customer_id, request);
    }

    @GetMapping("/{customer_id}/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@RequestParam int customer_id) {
        return customerProfileService.getProfile(customer_id);
    }
}