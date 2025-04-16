package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.*;
import com.example.homecleanapi.services.CustomerAuthService;
import com.example.homecleanapi.services.CustomerService;
import com.example.homecleanapi.utils.JwtUtils;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;


@Tag(name = "Customer Profile API")
@RestController
@RequestMapping("/api/customer")
@SecurityRequirement(name = "BearerAuth")
public class CustomerController {

    private final CustomerAuthService customerAuthService;
    private CustomerService customerService;


    public CustomerController(CustomerAuthService customerAuthService, CustomerService customerService) {
        this.customerAuthService = customerAuthService;
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

    @PatchMapping(value = "/{customer_id}/profile",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody CustomerProfileRequest request, @PathVariable Long customer_id) {

        return customerService.updateProfile(customer_id, request);
    }

    @GetMapping(value = "/{customer_id}/profile", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable Long customer_id) {
        return customerService.getProfile(customer_id);
    }

    @PostMapping(value = "/{customer_id}/create_address",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createAddress(@RequestBody CustomerAddressesDTO request, @PathVariable Long customer_id) throws IOException {
        return customerService.addAddress(request, customer_id);
    }

    @PutMapping(value = "/{customerId}/update_address/{addressId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateEmployeeAddress(@RequestBody CustomerAddressesDTO request, @PathVariable Long customerId, @PathVariable Integer addressId) throws IOException {
        return customerService.updateCustomerAddress(request, customerId, addressId);
    }

    // API xóa địa chỉ theo locationId
    @DeleteMapping(value = "/{locationId}/delete_address", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> deleteEmployeeAddress(@PathVariable Integer locationId) {
        return customerService.deleteCustomerAddress(locationId);
    }

    // API lấy danh sách địa chỉ của employee theo employeeId
    @GetMapping(value = "/{customerId}/all-addresses",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAllEmployeeAddresses(@PathVariable Long customerId) {
        return customerService.getAllCustomerAddresses(customerId);
    }

    // API xóa account
    @DeleteMapping(value = "/{customer_id}/delete_account", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> deleteAccount(@PathVariable Long customer_id) {
        return customerService.deleteCustomerAccount(customer_id);
    }

    @PutMapping(value = "/{customerId}/change_password", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> changePassword(@PathVariable Integer customerId, @RequestBody ChangePasswordRequest request) {
        return customerAuthService.customerChangePassword(request, customerId);
    }
}