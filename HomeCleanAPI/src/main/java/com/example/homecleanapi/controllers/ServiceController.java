package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.ServiceDTO;
import com.example.homecleanapi.services.ServiceDisplayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceDisplayService serviceDisplayService;

    
    // api lấy ra hết dịch vụ ở trang homepage
    @GetMapping("/all")
    public ResponseEntity<List<ServiceDTO>> getAllServices() {
        List<ServiceDTO> services = serviceDisplayService.getAllServices();
        return ResponseEntity.ok(services);
    }
    
    
}
