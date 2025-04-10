package com.example.homecleanapi.controllers;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.example.homecleanapi.models.TransactionHistory;
import com.example.homecleanapi.repositories.TransactionHistoryRepository;
import jakarta.servlet.http.HttpServletRequest;
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

    @Autowired
    private TransactionHistoryRepository transactionHistoryRepository;



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
    public ResponseEntity<Map<String, Object>> depositMoney(@PathVariable Long cleanerId, @RequestBody Map<String, Object> orderRequest, HttpServletRequest request) {
        try {
            // Lấy phương thức thanh toán từ request
            String paymentMethod = (String) orderRequest.get("payment_method");

            // Lấy số tiền từ request và đảm bảo chuyển đổi đúng
            double amount = 0.0;
            if (orderRequest.get("amount") instanceof String) {
                amount = Double.parseDouble((String) orderRequest.get("amount"));
            } else if (orderRequest.get("amount") instanceof Double) {
                amount = (Double) orderRequest.get("amount");
            }

            if ("vnpay".equalsIgnoreCase(paymentMethod)) {
                Map<String, Object> response = walletService.createPaymentForDepositVnpay(cleanerId, amount, request);
                return ResponseEntity.ok(response);
            } else if ("zalopay".equalsIgnoreCase(paymentMethod)) {
                Map<String, Object> response = walletService.createPaymentForDepositZalopay(cleanerId, amount);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid payment method"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error creating payment: " + e.getMessage()));
        }
    }


    // API trả về kết quả thanh toán VNPay
    @GetMapping("/return")
    public ResponseEntity<String> returnPayment(@RequestParam("vnp_ResponseCode") String responseCode,
                                                @RequestParam("vnp_TxnRef") String txnRef,
                                                @RequestParam("vnp_Amount") String amount) {
        if ("00".equals(responseCode)) {
            // Chuyển số tiền về đơn vị phù hợp (VNPay trả tiền trong đơn vị đồng, bạn cần chuyển thành VND)
            double depositAmount = Double.parseDouble(amount) / 100;

            // Cập nhật số dư ví trong WalletService
            walletService.updateWalletBalance(txnRef, depositAmount);

            // Cập nhật trạng thái của giao dịch trong bảng transaction_history là "SUCCESS"
            Optional<TransactionHistory> transactionOpt = transactionHistoryRepository.findByTxnRef(txnRef);
            if (transactionOpt.isPresent()) {
                TransactionHistory transaction = transactionOpt.get();
                transaction.setStatus("SUCCESS");
                transactionHistoryRepository.save(transaction); // Lưu thay đổi
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Transaction not found");
            }

            return ResponseEntity.ok("Thanh toán thành công! Số dư ví đã được cập nhật.");
        } else {
            // Cập nhật trạng thái của giao dịch trong bảng transaction_history là "FAILED"
            Optional<TransactionHistory> transactionOpt = transactionHistoryRepository.findByTxnRef(txnRef);
            if (transactionOpt.isPresent()) {
                TransactionHistory transaction = transactionOpt.get();
                transaction.setStatus("FAILED");
                transactionHistoryRepository.save(transaction); // Lưu thay đổi
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Transaction not found");
            }

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Thanh toán thất bại! Mã lỗi: " + responseCode);
        }
    }

    @GetMapping("/{cleanerId}/transaction-history")
    public ResponseEntity<List<TransactionHistory>> getTransactionHistory(@PathVariable Long cleanerId) {
        List<TransactionHistory> transactionHistoryList = walletService.getTransactionHistoryByCleanerId(cleanerId);

        if (transactionHistoryList.isEmpty()) {
            return ResponseEntity.noContent().build();
        }


        return ResponseEntity.ok(transactionHistoryList);
    }


}
