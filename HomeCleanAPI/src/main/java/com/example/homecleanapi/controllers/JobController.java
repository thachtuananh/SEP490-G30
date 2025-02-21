package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.BookJobRequest;
import com.example.homecleanapi.services.JobService;
import com.example.homecleanapi.utils.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class JobController {

	@Autowired
    private JobService jobService;

    @Autowired
    private JwtUtils jwtUtils;  
    //new job
    
    // customer tạo job
    @PostMapping("/book-job")
    public ResponseEntity<Map<String, Object>> bookJob(@RequestBody BookJobRequest request, @RequestHeader("Authorization") String authorizationHeader) {
        
    	String token = authorizationHeader.substring(7);  

        if (!jwtUtils.validateToken(token)) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }

        String userType = jwtUtils.getClaimFromToken(token, "userType");
        if (!userType.equals("customer")) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }



        return jobService.bookJob(request, token);
    }
}
