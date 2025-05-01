package com.example.homecleanapi.controllers;

import com.example.homecleanapi.services.WithdrawalRequestService;
import com.example.homecleanapi.services.JobService;
import com.example.homecleanapi.dtos.AdminTransactionHistoryDTO;
import com.example.homecleanapi.dtos.JobDTO;
import com.example.homecleanapi.dtos.LoginRequest;
import com.example.homecleanapi.services.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "Admin API")
@RestController
@SecurityRequirement(name = "BearerAuth")
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminAuthService adminAuthService;
    private final WithdrawalRequestService withdrawalRequestService;
    private final DashboardService dashboardService;
    private final AdminTransactionHistoryService adminTransactionHistoryService;
    private final JobService jobService;

    public AdminController(AdminAuthService adminAuthService, WithdrawalRequestService withdrawalRequestService, DashboardService dashboardService, AdminTransactionHistoryService adminTransactionHistoryService, JobService jobService) {
        this.adminAuthService = adminAuthService;
        this.withdrawalRequestService = withdrawalRequestService;
        this.dashboardService = dashboardService;
        this.adminTransactionHistoryService = adminTransactionHistoryService;
        this.jobService = jobService;
    }

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> adminLogin(@RequestBody LoginRequest request) {
        return adminAuthService.adminLogin(request);
    }

    @PutMapping("/{withdrawalRequestId}")
    public ResponseEntity<Map<String, Object>> approveOrRejectWithdrawal(
            @PathVariable Long withdrawalRequestId,
            @RequestParam String action,
            @RequestBody Map<String, Object> body) {  // Thêm @RequestBody cho lý do từ chối

        // Lấy lý do từ chối và transactionCode từ body nếu có
        String rejectionReason = body != null && body.containsKey("rejectionReason") ? (String) body.get("rejectionReason") : null;
        String transactionCode = body != null && body.containsKey("transactionCode") ? (String) body.get("transactionCode") : null;

        Map<String, Object> response = withdrawalRequestService.approveOrRejectWithdrawalRequest(
                withdrawalRequestId, action, rejectionReason, transactionCode); // Thêm transactionCode

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


    @GetMapping("/totalBalance")
    public ResponseEntity<Map<String, Object>> getTotalBalance() {
        Map<String, Object> response = new HashMap<>();

        try {
            // Gọi service để tính tổng doanh thu
            double totalBalance = adminTransactionHistoryService.calculateTotalRevenue();

            // Trả về tổng doanh thu
            response.put("totalBalance", totalBalance);
            response.put("message", "Tính toán tổng doanh thu thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/transactionHistory")
    public ResponseEntity<Map<String, Object>> getAllTransactionHistory() {
        Map<String, Object> response = new HashMap<>();

        try {
            // Lấy tất cả lịch sử giao dịch từ service
            List<AdminTransactionHistoryDTO> transactions = adminTransactionHistoryService.getAllTransactionHistory();

            response.put("message", "Lịch sử giao dịch được lấy thành công");
            response.put("data", transactions);
            response.put("status", HttpStatus.OK);
        } catch (Exception e) {
            response.put("message", "Có lỗi xảy ra khi lấy lịch sử giao dịch");
            response.put("status", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/real-revenue")
    public ResponseEntity<Map<String, Object>> getRealRevenue() {
        Map<String, Object> response = new HashMap<>();
        try {
            Double totalRevenue = adminTransactionHistoryService.calculateRealRevenue();

            response.put("totalRevenue", totalRevenue);
            response.put("message", "Tính toán doanh thu thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Đã có lỗi trong quá trình tính toán doanh thu");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobDTO>> getAllJobs() {
        List<JobDTO> jobs = jobService.getAllJobs();
        if (jobs.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(jobs, HttpStatus.OK);
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getTotalRevenue() {
        double totalRevenue = adminTransactionHistoryService.calculateTotalRevenues();

        // Tạo response
        Map<String, Object> response = new HashMap<>();
        response.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(response);
    }



}
