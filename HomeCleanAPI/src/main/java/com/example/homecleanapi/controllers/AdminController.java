package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.LoginRequest;
import com.example.homecleanapi.services.AdminAuthService;
import com.example.homecleanapi.services.DashboardService;
import com.example.homecleanapi.services.WithdrawalRequestService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Admin API")
@RestController
@SecurityRequirement(name = "BearerAuth")
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminAuthService adminAuthService;
    private final WithdrawalRequestService withdrawalRequestService;
    private final DashboardService dashboardService;

    public AdminController(AdminAuthService adminAuthService, WithdrawalRequestService withdrawalRequestService, DashboardService dashboardService) {
        this.adminAuthService = adminAuthService;
        this.withdrawalRequestService = withdrawalRequestService;
        this.dashboardService = dashboardService;
    }

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> adminLogin(@RequestBody LoginRequest request) {
        return adminAuthService.adminLogin(request);
    }

    @PutMapping("/{withdrawalRequestId}")
    public ResponseEntity<Map<String, Object>> approveOrRejectWithdrawal(
            @PathVariable Long withdrawalRequestId,
            @RequestParam String action) {

        Map<String, Object> response = withdrawalRequestService.approveOrRejectWithdrawalRequest(withdrawalRequestId, action);

        return new ResponseEntity<>(response, (HttpStatus) response.get("status"));
    }


    // lấy ra ds các yêu cầu rutts tiền
    @GetMapping("/withdrawalRequests")
    public ResponseEntity<Map<String, Object>> getWithdrawalRequests(
            @RequestParam(required = false) String status) {
        Map<String, Object> response = withdrawalRequestService.getWithdrawalRequests(status);
        return new ResponseEntity<>(response, (HttpStatus) response.get("status"));
    }

    @GetMapping("/get-total-job")
    public ResponseEntity<?> getTotalJob() {
        return dashboardService.countJobByStatus();
    }
}
