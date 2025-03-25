package com.example.homecleanapi.controllers;


import com.example.homecleanapi.dtos.EmployeeDTO;
import com.example.homecleanapi.dtos.ServiceDTO;
import com.example.homecleanapi.services.FindCleanerService;
import com.example.homecleanapi.services.ServiceDisplayService;

import java.util.List;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Customer Service API")
@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceDisplayService serviceDisplayService;
    @Autowired
    private FindCleanerService findCleanerService;


    // api lấy ra hết dịch vụ ở trang homepage

    @GetMapping("/all")
    public ResponseEntity<List<ServiceDTO>> getAllServices() {
        List<ServiceDTO> services = serviceDisplayService.getAllServices();
        return ResponseEntity.ok(services);
    }

    // API lấy chi tiết của một dịch vụ theo serviceDetailId
    @GetMapping("/details/{serviceId}")
    public ResponseEntity<ServiceDTO> getServiceDetailsByServiceId(@PathVariable("serviceId") Long serviceId) {
        // Lấy thông tin dịch vụ và các service_details từ serviceId
        ServiceDTO serviceDTO = serviceDisplayService.getServiceDetailsByServiceId(serviceId);
        
        // Kiểm tra nếu không tìm thấy dịch vụ
        if (serviceDTO == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(serviceDTO);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<EmployeeDTO>> getNearbyEmployees(
            @RequestParam double latitude,
            @RequestParam double longitude,
//            @RequestParam(defaultValue = "20000") double radius,
            @RequestParam(defaultValue = "10") int limit) {

        List<EmployeeDTO> employees = findCleanerService.findNearbyEmployees(latitude, longitude, 15000, limit);
        return ResponseEntity.ok(employees);
    }

}
