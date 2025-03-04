package com.example.homecleanapi.controllers;


import com.example.homecleanapi.dtos.CleanerRegisterRequest;
import com.example.homecleanapi.dtos.EmployeeLocationsDTO;
import com.example.homecleanapi.dtos.ForgotPasswordRequest;
import com.example.homecleanapi.dtos.LoginRequest;
import com.example.homecleanapi.services.EmployeeService;
import com.example.homecleanapi.services.EmployeeAuthService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@Tag(name = "Employee API")
@SecurityRequirement(name = "BearerAuth")
@RequestMapping("/api/employee")
public class EmployeeController {
    private final EmployeeAuthService cleanerAuthService;
    private final EmployeeService employeeService;

    public EmployeeController(EmployeeAuthService cleanerAuthService, EmployeeService employeeService) {
        this.cleanerAuthService = cleanerAuthService;
        this.employeeService = employeeService;
    }

    @GetMapping(value = "/{employeeId}/get-employee-profile", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getEmployeeProfile(@PathVariable int employeeId) {
        return employeeService.getEmployeeInformation(employeeId);
    }

    @PostMapping(value = "/{employeeId}/create-address", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createEmployeeAddress(@RequestBody EmployeeLocationsDTO request, @PathVariable int employeeId) throws IOException {
        return employeeService.employeeCreateAddress(request, employeeId);
    }

    @PutMapping(value = "/{employeeId}/update-address", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateEmployeeAddress(@RequestBody EmployeeLocationsDTO request, @PathVariable int employeeId) throws IOException {
        // Gọi service để xử lý update địa chỉ
        return employeeService.updateEmployeeAddress(request, employeeId);
    }

    // API xóa địa chỉ theo locationId
    @DeleteMapping(value = "/{locationId}/delete_address", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> deleteEmployeeAddress(@PathVariable int locationId) {
        return employeeService.deleteEmployeeAddress(locationId);
    }

    // API lấy danh sách địa chỉ của employee theo employeeId
    @GetMapping(value = "/{employeeId}/all-addresses",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAllEmployeeAddresses(@PathVariable int employeeId) {
        return employeeService.getAllEmployeeAddresses(employeeId);
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
