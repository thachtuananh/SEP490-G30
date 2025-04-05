package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.*;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.services.AdminCustomerService;
import com.example.homecleanapi.services.CustomerService;
import com.example.homecleanapi.services.CustomerAuthService;
import com.example.homecleanapi.utils.JwtUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Admin Manager Customer API")
@RestController
@RequestMapping("/api/admin/customers")
public class AdminCustomerController {

//    @Autowired
//    private JobHistoryService jobHistoryService;

    private final AdminCustomerService customerService;
    private final JwtUtils jwtUtils;

    public AdminCustomerController(AdminCustomerService customerService, JwtUtils jwtUtils) {
        this.customerService = customerService;
        this.jwtUtils = jwtUtils;
    }

    // API thêm khách hàng
    @PostMapping(value = "/add", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> addCustomer(
            @RequestBody CustomerRegisterRequest request,
            HttpServletRequest httpRequest
    ) {
        if (isAuthorizedRole(httpRequest)) {
            return customerService.addCustomer(request);
        }
        return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
    }


    // API cập nhật thông tin khách hàng
    @PutMapping(value = "/{customer_id}/update", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateCustomer(
            @PathVariable("customer_id") Integer customerId,
            @RequestBody CustomerProfileRequest request,
            HttpServletRequest httpRequest) {

        if (isAuthorizedRole(httpRequest)) {
            return customerService.updateCustomer(customerId, request);
        }
        return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin or Manager role required"));
    }


    // API xóa khách hàng
    @DeleteMapping(value = "/{customer_id}/delete", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> deleteCustomer(
            @PathVariable("customer_id") Integer customerId,
            HttpServletRequest httpRequest) {

        if (isAuthorizedRole(httpRequest)) {
            return customerService.deleteCustomer(customerId);
        }

        return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin or Manager role required"));
    }


    @GetMapping(value = "/{customer_id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getCustomerInfo(
            @PathVariable("customer_id") Integer customerId,
            HttpServletRequest httpRequest) {

        if (isAuthorizedRole(httpRequest)) {
            return customerService.getCustomerInfo(customerId);
        }
        return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin or Manager role required"));
    }

    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllCustomers(HttpServletRequest request) {
        if (isAuthorizedRole(request)) {
            return customerService.getAllCustomers();
        }
        return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin or Manager role required"));
    }

    @GetMapping("/historycreatejob/{customerId}")
    public ResponseEntity<List<JobHistoryResponse>> getJobHistory(@PathVariable("customerId") Long customerId) {
        List<JobHistoryResponse> jobHistoryResponses = customerService.getJobHistoryByCustomerId(customerId);
        return ResponseEntity.ok(jobHistoryResponses);
    }

    @GetMapping("/historybookjob/{customerId}")
    public ResponseEntity<List<JobHistoryResponse>> getJobbookHistory(@PathVariable("customerId") Long customerId) {
        List<JobHistoryResponse> jobHistoryResponses = customerService.getJobHistoryByCustomerIdForCleaner(customerId);
        return ResponseEntity.ok(jobHistoryResponses);
    }

    @GetMapping("/jobdetail/{jobId}")
    public ResponseEntity<JobHistoryResponse> getJobDetails(@PathVariable("jobId") Long jobId) {
        JobHistoryResponse response = customerService.getJobDetailsByJobId(jobId);
        if (response == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(response);
    }








    // Kiểm tra xem người dùng có quyền là Admin hoặc Manager không
    private boolean isAuthorizedRole(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        String token = authHeader.substring(7);
        String role = jwtUtils.getClaimFromToken(token, "role");
        return "Admin".equals(role) || "Manager".equals(role);
    }

}
