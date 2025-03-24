package com.example.homecleanapi.services;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.homecleanapi.Payment.VnpayRequest;
import com.example.homecleanapi.Payment.VnpayService;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.models.Wallet;
import com.example.homecleanapi.repositories.CleanerRepository;
import com.example.homecleanapi.repositories.WalletRepository;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private CleanerRepository cleanerRepository; 
    
    @Autowired
    private VnpayService vnpayService; 

    public Map<String, Object> getWalletBalance(Long cleanerId) {
        Map<String, Object> response = new HashMap<>();

        // Tìm cleaner dựa trên cleanerId
        Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
        if (!cleanerOpt.isPresent()) {
            response.put("message", "Cleaner not found");
            return response;
        }

        Employee cleaner = cleanerOpt.get();

        // Tìm ví của cleaner
        Optional<Wallet> walletOpt = walletRepository.findByCleanerId(cleaner.getId());
        if (!walletOpt.isPresent()) {
            response.put("message", "Cleaner wallet not found");
            return response;
        }

        Wallet wallet = walletOpt.get();

        // Tạo phản hồi trả về số dư ví
        response.put("message", "Wallet balance retrieved successfully");
        response.put("walletBalance", wallet.getBalance());
        return response;
    }
    
    
    // cleaner nạp tiền
    public Map<String, Object> createPaymentForDeposit(Long cleanerId, double amount) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra số tiền nạp vào ví phải là một giá trị hợp lệ (lớn hơn 0)
        if (amount <= 0) {
            response.put("message", "Số tiền nạp phải lớn hơn 0.");
            return response;
        }

        try {
            // Tạo VNPay Request với số tiền thanh toán
            VnpayRequest vnpayRequest = new VnpayRequest();
            vnpayRequest.setAmount(String.valueOf(amount));

            // Tạo URL thanh toán VNPay
            String paymentUrl = vnpayService.createPayment(vnpayRequest);

            // Tạo txnRef từ VNPay để theo dõi giao dịch
            String txnRef = extractTxnRefFromUrl(paymentUrl);  // Lấy txnRef từ URL của VNPay

            // Tạo Wallet nếu chưa có
            Optional<Wallet> walletOpt = walletRepository.findByCleanerId(cleanerId);
            Wallet wallet;
            if (walletOpt.isPresent()) {
                wallet = walletOpt.get();
            } else {
                wallet = new Wallet();
                wallet.setCleaner(cleanerRepository.findById(cleanerId).orElseThrow());
                wallet.setBalance(0.0);  // Khởi tạo ví mới với số dư 0
            }

            // Cập nhật txnRef vào Wallet
            wallet.setTxnRef(txnRef);
            walletRepository.save(wallet);

            // Trả về URL thanh toán cho cleaner
            response.put("paymentUrl", paymentUrl);
            response.put("txnRef", txnRef);  // Trả lại txnRef cho cleaner để theo dõi

            return response;

        } catch (Exception e) {
            response.put("message", "Failed to create payment through VNPay: " + e.getMessage());
            return response;
        }
    }

    // Hàm để trích xuất txnRef từ URL trả về của VNPay
    private String extractTxnRefFromUrl(String paymentUrl) {
        try {
            // Trích xuất txnRef từ URL
            String[] urlParts = paymentUrl.split("\\?");
            for (String part : urlParts[1].split("&")) {
                if (part.startsWith("vnp_TxnRef")) {
                    return part.split("=")[1];
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }


    

}
