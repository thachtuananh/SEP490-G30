package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.WithdrawalRequest;
import com.example.homecleanapi.services.WithdrawalRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/withdraw")
public class WithdrawalRequestController {

    @Autowired
    private WithdrawalRequestService withdrawalRequestService;

    @PostMapping("/{customerId}/requestWithdrawal")
    public ResponseEntity<Map<String, Object>> createWithdrawalRequest(@PathVariable Long customerId,
                                                                       @RequestBody WithdrawalRequest request) {
        Map<String, Object> response = withdrawalRequestService.createWithdrawalRequest(customerId, request);

        return new ResponseEntity<>(response, (HttpStatus) response.get("status"));
    }

    @PostMapping("/cleaners/{cleanerId}/requestWithdrawal")
    public ResponseEntity<Map<String, Object>> createWithdrawalRequestForCleaner(@PathVariable Long cleanerId,
                                                                                 @RequestBody WithdrawalRequest request) {
        Map<String, Object> response = withdrawalRequestService.createWithdrawalRequestForCleaner(cleanerId, request);

        return new ResponseEntity<>(response, (HttpStatus) response.get("status"));
    }

}
