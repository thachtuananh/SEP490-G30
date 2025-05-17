package com.example.homecleanapi.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import com.example.homecleanapi.dtos.NotificationDTO;
import com.example.homecleanapi.services.NotificationService;
import com.example.homecleanapi.services.WalletService;
import com.example.homecleanapi.models.AdminTransactionHistory;
import com.example.homecleanapi.models.TransactionHistory;
import com.example.homecleanapi.repositories.AdminTransactionHistoryRepository;
import com.example.homecleanapi.repositories.TransactionHistoryRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    @Autowired
    private AdminTransactionHistoryRepository adminTransactionHistoryRepository;
    @Autowired
    private NotificationService notificationService;


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

    @GetMapping("/{customerId}/walletcustomer")
    public ResponseEntity<Map<String, Object>> getCustomerWalletBalance(@PathVariable Long customerId) {
        // Gọi service để lấy số dư ví của customer
        Map<String, Object> response = walletService.getCustomerWalletBalance(customerId);

        // Kiểm tra response để quyết định trả về status code và message
        if (response.containsKey("message") && response.get("message").equals("Customer not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response); // Trả về 404 nếu không tìm thấy customer
        }

        return ResponseEntity.ok(response); // Trả về 200 OK nếu tìm thấy thông tin ví
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

            // Lấy transaction từ txnRef
            Optional<TransactionHistory> transactionOpt = transactionHistoryRepository.findByTxnRef(txnRef);
            if (!transactionOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Transaction not found");
            }

            TransactionHistory transaction = transactionOpt.get();

            // Kiểm tra xem giao dịch là của customer hay cleaner, và cập nhật số dư ví tương ứng
            if (transaction.getCustomer() != null) {
                // Cập nhật số dư ví cho customer
                walletService.updateCustomerWalletBalance(Long.valueOf(transaction.getCustomer().getId()), depositAmount);
            }else if (transaction.getCleaner() != null) {
                // Cập nhật số dư ví cho cleaner (nếu giao dịch là của cleaner)
                walletService.updateCleanerWalletBalance(Long.valueOf(transaction.getCleaner().getId()), depositAmount);
            }
            else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid transaction");
            }

            // Cập nhật trạng thái giao dịch thành "SUCCESS"
            transaction.setStatus("SUCCESS");
            transactionHistoryRepository.save(transaction); // Lưu trạng thái

            AdminTransactionHistory adminTransactionHistory = new AdminTransactionHistory();
            adminTransactionHistory.setCustomer(transaction.getCustomer()); // Gán customer
            adminTransactionHistory.setCleaner(transaction.getCleaner()); // Gán cleaner (nếu có)
            adminTransactionHistory.setTransactionType("DEPOSIT");
            adminTransactionHistory.setAmount(depositAmount); // Số tiền đã nạp
            adminTransactionHistory.setTransactionDate(LocalDateTime.now());
            adminTransactionHistory.setPaymentMethod("VNPay");
            adminTransactionHistory.setStatus("SUCCESS");
            adminTransactionHistory.setDescription("Nạp tiền thành công");


            // Lưu vào bảng AdminTransactionHistory
            adminTransactionHistoryRepository.save(adminTransactionHistory);
            String redirectUrl = "https://house-clean-platform.web.app/DepositOwner?status=success";
            return ResponseEntity.status(HttpStatus.FOUND).header(HttpHeaders.LOCATION, redirectUrl).body(redirectUrl);
        } else {
            // Cập nhật trạng thái giao dịch thành "FAILED"
//            Optional<TransactionHistory> transactionOpt = transactionHistoryRepository.findByTxnRef(txnRef);
//            if (transactionOpt.isPresent()) {
//                TransactionHistory transaction = transactionOpt.get();
//                transaction.setStatus("FAILED");
//                transactionHistoryRepository.save(transaction); // Lưu thay đổi
//            } else {
//                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Transaction not found");
//            }
            String redirectUrl = "https://house-clean-platform.web.app/depositOwnerfail?status=fail";
            return ResponseEntity.status(HttpStatus.FOUND).header(HttpHeaders.LOCATION, redirectUrl).build();
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Thanh toán thất bại! Mã lỗi: " + responseCode);
        }
    }


    @GetMapping("/{cleanerId}/transaction-historycleaner")
    public ResponseEntity<List<TransactionHistory>> getTransactionHistorycleaner(@PathVariable Long cleanerId) {
        // Lấy danh sách giao dịch có status là SUCCESS và sắp xếp theo thời gian giao dịch
        List<TransactionHistory> transactionHistoryList = walletService.getTransactionHistoryByCleanerId(cleanerId);

        if (transactionHistoryList.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        transactionHistoryList.forEach(transaction -> {
            if (transaction.getTransactionDate() == null) {
                transaction.setTransactionDate(LocalDateTime.now());
            }
        });

        transactionHistoryList.sort(Comparator.comparing(TransactionHistory::getTransactionDate).reversed());

        List<TransactionHistory> filteredTransactionHistoryList = transactionHistoryList.stream()
                .map(transaction -> {
                    transaction.setCleaner(null);
                    return transaction;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredTransactionHistoryList);
    }



    @GetMapping("/{customerId}/transaction-historycustomer")
    public ResponseEntity<List<TransactionHistory>> getTransactionHistorycustomer(@PathVariable Long customerId) {
        // Lấy danh sách giao dịch có status là SUCCESS cho customer
        List<TransactionHistory> transactionHistoryList = walletService.getTransactionHistoryByCustomerId(customerId);

        if (transactionHistoryList.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        transactionHistoryList.forEach(transaction -> {
            if (transaction.getTransactionDate() == null) {
                transaction.setTransactionDate(LocalDateTime.now());
            }
        });
        transactionHistoryList.sort(Comparator.comparing(TransactionHistory::getTransactionDate).reversed());

        List<TransactionHistory> filteredTransactionHistoryList = transactionHistoryList.stream()
                .map(transaction -> {
                    transaction.setCustomer(null);
                    return transaction;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredTransactionHistoryList);
    }






    // customer nạp tiền
    @PostMapping("/{customerId}/depositforcustomer")
    public ResponseEntity<Map<String, Object>> depositMoneyCustomer(@PathVariable Long customerId,
                                                            @RequestBody Map<String, Object> depositRequest, HttpServletRequest request) {
        try {
            // Lấy phương thức thanh toán từ request
            String paymentMethod = (String) depositRequest.get("payment_method");

            // Lấy số tiền từ request và đảm bảo chuyển đổi đúng
            double amount = 0.0;
            if (depositRequest.get("amount") instanceof String) {
                amount = Double.parseDouble((String) depositRequest.get("amount"));
            } else if (depositRequest.get("amount") instanceof Double) {
                amount = (Double) depositRequest.get("amount");
            }

            if ("vnpay".equalsIgnoreCase(paymentMethod)) {
                // Xử lý thanh toán qua VNPay
                Map<String, Object> response = walletService.depositMoney(customerId, amount, request);
                String message = "Bạn đã nạp tiền vào ví thành công";
                NotificationDTO customerNotification = new NotificationDTO();
                customerNotification.setUserId(Math.toIntExact(customerId));
                customerNotification.setMessage(message);
                customerNotification.setType("AUTO_MESSAGE");
                customerNotification.setTimestamp(LocalDate.now());
                customerNotification.setRead(false); // ✅ set read = false
                notificationService.processNotification(customerNotification, "CUSTOMER", Math.toIntExact(customerId));
                return ResponseEntity.ok(response);
//                return ResponseEntity.ok(response);
            }else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid payment method"));
            }
        } catch (Exception e) {
            // Xử lý khi có lỗi trong quá trình tạo thanh toán
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }
}
