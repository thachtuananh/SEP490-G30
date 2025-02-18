package com.example.homecleanapi.controllers;


import com.example.homecleanapi.dtos.CleanerRegisterRequest;
import com.example.homecleanapi.dtos.EmployeeLocationsDTO;
import com.example.homecleanapi.dtos.ForgotPasswordRequest;
import com.example.homecleanapi.dtos.LoginRequest;
import com.example.homecleanapi.services.EmployeeAddressService;
import com.example.homecleanapi.services.EmployeeAuthService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {
    private final EmployeeAuthService cleanerAuthService;
    private final EmployeeAddressService employeeAddressService;

    public EmployeeController(EmployeeAuthService cleanerAuthService, EmployeeAddressService employeeAddressService) {
        this.cleanerAuthService = cleanerAuthService;
        this.employeeAddressService = employeeAddressService;
    }

    @PostMapping(value = "/create-address", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createEmployeeAddress(@RequestBody EmployeeLocationsDTO request) {
        return employeeAddressService.employeeCreateAddress(request);
    }

    @PutMapping(value = "/update_address", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateEmployeeAddress(@RequestBody EmployeeLocationsDTO request) {
        // Gọi service để xử lý update địa chỉ
        return employeeAddressService.updateEmployeeAddress(request);
    }

    // API xóa địa chỉ theo locationId
    @DeleteMapping(value = "/delete_address/{locationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> deleteEmployeeAddress(@PathVariable int locationId) {
        return employeeAddressService.deleteEmployeeAddress(locationId);
    }

    // API lấy danh sách địa chỉ của employee theo employeeId
    @GetMapping(value = "/all-addresses/{employeeId}",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAllEmployeeAddresses(@PathVariable int employeeId) {
        return employeeAddressService.getAllEmployeeAddresses(employeeId);
    }

    @PostMapping(value = "/register",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> register(@RequestBody CleanerRegisterRequest request) {
        return cleanerAuthService.cleanerRegister(request);
    }

    @PostMapping(value = "/login",   produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        return cleanerAuthService.cleanerLogin(request);
    }

    @PostMapping(value = "/forgot-password", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return cleanerAuthService.cleanerForgotPassword(request);
    }
}
