package com.example.homecleanapi.controllers;


import com.example.homecleanapi.dtos.CleanerRegisterRequest;
import com.example.homecleanapi.dtos.ForgotPasswordRequest;
import com.example.homecleanapi.dtos.LoginRequest;
import com.example.homecleanapi.services.CleanerAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/employee")
public class CleanerController {
    private final CleanerAuthService cleanerAuthService;

    public CleanerController(CleanerAuthService cleanerAuthService) {
        this.cleanerAuthService = cleanerAuthService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody CleanerRegisterRequest request) {
        return cleanerAuthService.cleanerRegister(request);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        return cleanerAuthService.cleanerLogin(request);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return cleanerAuthService.cleanerForgotPassword(request);
    }
}
