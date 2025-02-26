package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.*;
import com.example.homecleanapi.services.CustomerAuthService;
import com.example.homecleanapi.services.CustomerService;
import com.example.homecleanapi.utils.JwtUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@Tag(name = "Customer API")
@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private JwtUtils jwtUtils;
    private final CustomerAuthService customerAuthService;
    private CustomerService customerService;


    public CustomerController(CustomerAuthService customerAuthService, JwtUtils jwtUtils, CustomerService customerService) {
        this.customerAuthService = customerAuthService;
        this.jwtUtils = jwtUtils;
        this.customerService = customerService;
    }

    @PostMapping(value = "/register", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> register(@RequestBody CustomerRegisterRequest request) {
        return customerAuthService.customerRegister(request);
    }

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        return customerAuthService.customerLogin(request);
    }

    @PostMapping(value = "/forgot-password",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return customerAuthService.customerForgotPassword(request);
    }

    @PutMapping(value = "/{customer_id}/profile",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody CustomerProfileRequest request, @RequestParam int customer_id) {

        return customerService.updateProfile(customer_id, request);
    }

    @GetMapping(value = "/profile", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable int customer_id) {
        return customerService.getProfile(customer_id);
    }

    @PostMapping(value = "/{customer_id}/create-address",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createAddress(@RequestBody CustomerAddressesDTO request, @RequestParam int customer_id) {
        return customerService.addAddress(request, customer_id);
    }

    @PutMapping(value = "/{customer_id}/update-address", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateEmployeeAddress(@RequestBody CustomerAddressesDTO request, @RequestParam int employeeId) {
        // Gọi service để xử lý update địa chỉ
        return customerService.updateCustomerAddress(request, employeeId);
    }

    // API xóa địa chỉ theo locationId
    @DeleteMapping(value = "/{locationId}/delete_address", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> deleteEmployeeAddress(@PathVariable int locationId) {
        return customerService.deleteCustomerAddress(locationId);
    }

    // API lấy danh sách địa chỉ của employee theo employeeId
    @GetMapping(value = "/{customer_id}/all-addresses",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAllEmployeeAddresses(@PathVariable int employeeId) {
        return customerService.getAllCusomterAddresses(employeeId);
    }
}