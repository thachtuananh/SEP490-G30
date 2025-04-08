package com.example.homecleanapi.services;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.homecleanapi.paymentForWallets.VnpayRequestWallet;
import com.example.homecleanapi.paymentForWallets.VnpayServiceWallet;
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
    private VnpayServiceWallet vnpayServiceWallet; 

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
    public Map<String, Object> createPaymentForDeposit(Long cleanerId, double amount, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra số tiền nạp vào ví phải là một giá trị hợp lệ (lớn hơn 0)
        if (amount <= 0) {
            response.put("message", "Số tiền nạp phải lớn hơn 0.");
            return response;
        }

        try {
            long paymentAmount = (long) (amount);

            // Tạo VNPay Request với số tiền thanh toán
            VnpayRequestWallet vnpayRequest = new VnpayRequestWallet();
            vnpayRequest.setAmount(String.valueOf(paymentAmount));

            // Tạo URL thanh toán VNPay
            String paymentUrl = vnpayServiceWallet.createPayment(vnpayRequest, request);

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
    
    public void updateWalletBalance(String txnRef, double depositAmount) {
        // Tìm ví theo txnRef
        Optional<Wallet> walletOpt = walletRepository.findByTxnRef(txnRef);

        if (walletOpt.isPresent()) {
            Wallet wallet = walletOpt.get();

            System.out.println("đây là tiền ban đầu" + wallet.getBalance());
            System.out.println("đây là tiền muốn cộng" + depositAmount);
            // Cập nhật số dư ví của cleaner
            double newBalance = wallet.getBalance() + depositAmount;  
            wallet.setBalance(newBalance);  
            walletRepository.save(wallet);  // Lưu cập nhật số dư ví

            
            
        } else {
            // Xử lý trường hợp không tìm thấy giao dịch ví theo txnRef
            throw new RuntimeException("Wallet not found for txnRef: " + txnRef);
        }
    }

    


    

}
