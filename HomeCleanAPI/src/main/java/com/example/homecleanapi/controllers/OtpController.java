package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.OtpRequest;
import com.example.homecleanapi.dtos.VerifyOtpRequest;
import com.example.homecleanapi.services.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/customer/otp")
public class OtpController {
    @Autowired
    private OtpService otpService;

    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequest request) {
        otpService.sendOtp(request.getPhone());
        return ResponseEntity.ok(Map.of("message", "OTP đã được gửi!"));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        boolean result = otpService.verifyOtp(request.getPhone(), request.getOtpCode());
        if (result) {
            return ResponseEntity.ok(Map.of("message", "OTP hợp lệ!"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "OTP không hợp lệ hoặc đã hết hạn!"));
        }
    }
}
