package com.example.homecleanapi.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.homecleanapi.dtos.DepositRequest;
import com.example.homecleanapi.services.WalletService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Wallet API")
@SecurityRequirement(name = "BearerAuth")
@RequestMapping("/api/cleaner")
public class WalletController {
	
	@Autowired
    private WalletService walletService;

	@GetMapping("/{cleanerId}/wallet")
    public ResponseEntity<Map<String, Object>> getWalletBalance(@PathVariable Long cleanerId) {
        // Gọi service để lấy số dư ví của cleaner
        Map<String, Object> response = walletService.getWalletBalance(cleanerId);

        // Kiểm tra response để quyết định trả về status code và message
        if (response.containsKey("message") && response.get("message").equals("Cleaner not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        return ResponseEntity.ok(response);
    }
	
	@PostMapping("/{cleanerId}/deposit")
    public ResponseEntity<Map<String, Object>> depositMoney(@PathVariable Long cleanerId, @RequestBody DepositRequest depositRequest) {
        // Gọi service để tạo yêu cầu thanh toán VNPay
        Map<String, Object> response = walletService.createPaymentForDeposit(cleanerId, depositRequest.getAmount());

        if (response.containsKey("message")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response); // Nếu có thông báo lỗi
        }

        return ResponseEntity.ok(response); // Nếu thành công
    }

    // API trả về kết quả thanh toán VNPay
    @GetMapping("/return")
    public ResponseEntity<String> returnPayment(@RequestParam("vnp_ResponseCode") String responseCode,
                                                @RequestParam("vnp_TxnRef") String txnRef) {
        // Trực tiếp xử lý cập nhật số dư ví sau khi thanh toán thành công
        if ("00".equals(responseCode)) {
            // Cập nhật ví trong WalletService
            walletService.updateWalletBalance(txnRef);
            return ResponseEntity.ok("Thanh toán thành công! Số dư ví đã được cập nhật.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Thanh toán thất bại! Mã lỗi: " + responseCode);
        }
    }

}
