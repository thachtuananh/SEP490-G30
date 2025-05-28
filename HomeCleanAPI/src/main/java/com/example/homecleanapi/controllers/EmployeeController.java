package com.example.homecleanapi.controllers;


import com.example.homecleanapi.services.EmployeeAuthService;
import com.example.homecleanapi.dtos.EmployeeLocationsDTO;
import com.example.homecleanapi.services.EmployeeService;
import com.example.homecleanapi.dtos.*;
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

    @GetMapping(value = "/{employeeId}/get_employee_profile", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getEmployeeProfile(@PathVariable Integer employeeId) {
        return employeeService.getEmployeeInformation(employeeId);
    }

    @PostMapping(value = "/{employeeId}/create_address", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createEmployeeAddress(@RequestBody EmployeeLocationsDTO request, @PathVariable Integer employeeId) throws IOException {
        return employeeService.employeeCreateAddress(request, employeeId);
    }

    @PostMapping(value = "/{employeeId}/update_address/{addressId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateEmployeeAddress(@RequestBody EmployeeLocationsDTO request, @PathVariable Integer employeeId, @PathVariable int addressId) throws IOException {
        // Gọi service để xử lý update địa chỉ
        return employeeService.updateEmployeeAddress(request, employeeId, addressId);
    }

    // API xóa địa chỉ theo locationId
    @DeleteMapping(value = "/{locationId}/delete_address", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> deleteEmployeeAddress(@PathVariable Integer locationId) {
        return employeeService.deleteEmployeeAddress(locationId);
    }

    // API lấy danh sách địa chỉ của employee theo employeeId
    @GetMapping(value = "/{employeeId}/all-addresses",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAllEmployeeAddresses(@PathVariable Integer employeeId) {
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

    @PatchMapping(value = "/{employeeId}/update_profile", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateEmployeeProfile(@RequestBody CleanerUpdateProfile request, @PathVariable Integer employeeId) throws IOException {
        return employeeService.updateEmployeeInformation(request, employeeId);
    }

    @DeleteMapping(value = "/{employeeId}/delete_account", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> deleteEmployeeAccount(@PathVariable Integer employeeId) throws IOException {
        return employeeService.deleteEmployeeAccount(employeeId);
    }

    @PutMapping(value = "/{cleanerId}/change_password", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> changePassword(@PathVariable Integer cleanerId, @RequestBody ChangePasswordRequest request) {
        return cleanerAuthService.cleanerChangePassword(request, cleanerId);
    }
}