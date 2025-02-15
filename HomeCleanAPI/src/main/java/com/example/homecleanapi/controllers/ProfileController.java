package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.CustomerProfileRequest;
import com.example.homecleanapi.services.CustomerProfileService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class ProfileController {
	
	@Autowired
	private CustomerProfileService customerProfileService;

    

    // API xem profile khách hàng
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@RequestParam String phone) {
        return customerProfileService.getProfile(phone);
    }

    // API cập nhật profile khách hàng
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody CustomerProfileRequest request) {
        return customerProfileService.updateProfile(request);
    }

}
