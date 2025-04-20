package com.example.homecleanapi.services;

import java.net.http.HttpRequest;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;
import com.example.homecleanapi.zaloPay.ZalopayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.homecleanapi.paymentForWallets.VnpayRequestWallet;
import com.example.homecleanapi.paymentForWallets.VnpayServiceWallet;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private CleanerRepository cleanerRepository; 
    
    @Autowired
    private VnpayServiceWallet vnpayServiceWallet;

    @Autowired
    private ZalopayService zalopayService;

    @Autowired
    private TransactionHistoryRepository transactionHistoryRepository;

    @Autowired
    private CustomerWalletRepository customerWalletRepository;

    @Autowired
    private CustomerRepository customerRepository;


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

    public Map<String, Object> getCustomerWalletBalance(Long customerId) {
        Map<String, Object> response = new HashMap<>();

        // Tìm customer dựa trên customerId
        Optional<Customers> customerOpt = customerRepository.findById(customerId);
        if (!customerOpt.isPresent()) {
            response.put("message", "Customer not found");
            return response;
        }

        Customers customer = customerOpt.get();

        // Tìm ví của customer
        Optional<CustomerWallet> walletOpt = customerWalletRepository.findByCustomerId(customerId);
        if (!walletOpt.isPresent()) {
            response.put("message", "Customer wallet not found");
            return response;
        }

        CustomerWallet wallet = walletOpt.get();

        // Tạo phản hồi trả về số dư ví
        response.put("message", "Wallet balance retrieved successfully");
        response.put("walletBalance", wallet.getBalance());
        return response;
    }





    // cleaner nạp tiền
    public Map<String, Object> createPaymentForDepositVnpay(Long cleanerId, double amount, HttpServletRequest request) {
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

            // Lưu thông tin vào Wallet và cập nhật txnRef
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

            // Lưu thông tin vào bảng transaction_history
            TransactionHistory transactionHistory = new TransactionHistory();
            transactionHistory.setCleaner(wallet.getCleaner());
            transactionHistory.setAmount(amount);
            transactionHistory.setTransactionType("DEPOSIT");
            transactionHistory.setPaymentMethod("VNPay");
            transactionHistory.setStatus("PENDING");
            transactionHistory.setTxnRef(txnRef);
            transactionHistoryRepository.save(transactionHistory);

            // Trả về URL thanh toán cho cleaner
            response.put("paymentUrl", paymentUrl);
            response.put("txnRef", txnRef);  // Trả lại txnRef cho cleaner để theo dõi

            return response;

        } catch (Exception e) {
            response.put("message", "Failed to create payment through VNPay: " + e.getMessage());
            return response;
        }
    }



    public Map<String, Object> createPaymentForDepositZalopay(Long cleanerId, double amount) {
        Map<String, Object> response = new HashMap<>();
        if (amount <= 0) {
            response.put("message", "Số tiền nạp phải lớn hơn 0.");
            return response;
        }

        try {
            // Gọi ZaloPay service để tạo thanh toán
            Map<String, Object> orderRequest = new HashMap<>();

            orderRequest.put("amount", String.valueOf((long) (amount * 100)));


            // Lấy paymentUrl từ ZaloPay
            String paymentUrl = zalopayService.createOrder(orderRequest);

            // Lưu thông tin vào Wallet và cập nhật txnRef
            Optional<Wallet> walletOpt = walletRepository.findByCleanerId(cleanerId);
            Wallet wallet = walletOpt.orElseGet(() -> {
                Wallet newWallet = new Wallet();
                newWallet.setCleaner(cleanerRepository.findById(cleanerId).orElseThrow());
                newWallet.setBalance(0.0);  // Khởi tạo ví mới với số dư 0
                return newWallet;
            });

            // Tạo txnRef duy nhất cho ZaloPay và lưu vào Wallet
            String txnRef = "ZALOPAY_" + System.currentTimeMillis();  // Tạo txnRef cho ZaloPay
            wallet.setTxnRef(txnRef);
            walletRepository.save(wallet);

            response.put("paymentUrl", paymentUrl);  // Trả lại paymentUrl từ ZaloPay để cleaner thực hiện thanh toán
            response.put("txnRef", txnRef);  // Trả txnRef để theo dõi giao dịch

        } catch (Exception e) {
            response.put("message", "Failed to create payment through ZaloPay: " + e.getMessage());
        }

        return response;
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

    public void updateCleanerWalletBalance(Long cleanerId, double depositAmount) {
        Optional<Wallet> walletOpt = walletRepository.findByCleanerId(cleanerId); // Tìm ví theo cleanerId

        if (walletOpt.isPresent()) {
            Wallet wallet = walletOpt.get();

            // Debug thông tin ví trước khi cập nhật
            System.out.println("Cleaner ID: " + cleanerId);
            System.out.println("Current Balance: " + wallet.getBalance());
            System.out.println("Deposit Amount: " + depositAmount);

            double newBalance = wallet.getBalance() + depositAmount;

            // Debug thông tin sau khi tính số dư mới
            System.out.println("New Balance: " + newBalance);

            wallet.setBalance(newBalance); // Cập nhật số dư ví
            walletRepository.save(wallet); // Lưu ví cập nhật

            // Debug sau khi lưu ví
            System.out.println("Wallet updated successfully for Cleaner ID: " + cleanerId);
        } else {
            throw new RuntimeException("Wallet not found for cleanerId: " + cleanerId); // Nếu không tìm thấy ví, ném ngoại lệ
        }
    }




    public void updateCustomerWalletBalance(Long customerId, double depositAmount) {
        Optional<CustomerWallet> walletOpt = customerWalletRepository.findByCustomerId(customerId);

        if (walletOpt.isPresent()) {
            CustomerWallet wallet = walletOpt.get();

            // Debug thông tin ví trước khi cập nhật
            System.out.println("Customer ID: " + customerId);
            System.out.println("Current Balance: " + wallet.getBalance());
            System.out.println("Deposit Amount: " + depositAmount);

            double newBalance = wallet.getBalance() + depositAmount;

            // Debug thông tin sau khi tính số dư mới
            System.out.println("New Balance: " + newBalance);

            wallet.setBalance(newBalance); // Cập nhật số dư ví
            wallet.setUpdatedAt(LocalDateTime.now());

            customerWalletRepository.save(wallet); // Lưu ví cập nhật

            // Debug sau khi lưu ví
            System.out.println("Customer wallet updated successfully for Customer ID: " + customerId);
        } else {
            System.out.println("Customer wallet not found for Customer ID: " + customerId);
            throw new RuntimeException("Customer wallet not found"); // Nếu không tìm thấy ví, ném ngoại lệ
        }
    }


    public List<TransactionHistory> getTransactionHistoryByCleanerId(Long cleanerId) {
        List<TransactionHistory> allTransactions = transactionHistoryRepository.findByCleanerId(cleanerId);
        return allTransactions.stream()
                .filter(transaction -> "SUCCESS".equals(transaction.getStatus()))
                .collect(Collectors.toList());
    }


    // Phương thức lấy lịch sử giao dịch của customer
    public List<TransactionHistory> getTransactionHistoryByCustomerId(Long customerId) {
        // Lọc các giao dịch có status = "SUCCESS" cho customer
        List<TransactionHistory> allTransactions = transactionHistoryRepository.findByCustomerId(customerId);
        return allTransactions.stream()
                .filter(transaction -> "SUCCESS".equals(transaction.getStatus())) // Lọc chỉ những giao dịch thành công
                .collect(Collectors.toList());
    }





    // nạp tiền vào ví của customer
    public Map<String, Object> depositMoney(Long customerId, double amount, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra số tiền nạp vào ví phải là một giá trị hợp lệ (lớn hơn 0)
        if (amount <= 0) {
            response.put("message", "Số tiền nạp phải lớn hơn 0.");
            return response;
        }

        // Lấy thông tin customer
        Optional<Customers> customerOpt = customerRepository.findById(customerId);
        if (!customerOpt.isPresent()) {
            response.put("message", "Customer not found");
            return response;
        }
        Customers customer = customerOpt.get();

        // Tạo VNPay Request với số tiền thanh toán
        VnpayRequestWallet vnpayRequest = new VnpayRequestWallet();
        long paymentAmount = (long) (amount); // Chuyển số tiền thành long và nhân với 100
        vnpayRequest.setAmount(String.valueOf(paymentAmount));  // VNPay yêu cầu số tiền nhân với 100

        try {
            // Tạo URL thanh toán VNPay
            String paymentUrl = vnpayServiceWallet.createPayment(vnpayRequest, request);

            // Tạo txnRef từ VNPay để theo dõi giao dịch
            String txnRef = extractTxnRefFromUrl(paymentUrl);  // Lấy txnRef từ URL của VNPay

            // Lưu thông tin vào bảng transaction_history (với trạng thái PENDING)
            TransactionHistory transactionHistory = new TransactionHistory();
            transactionHistory.setCustomer(customer);
            transactionHistory.setCleaner(null); // Không có cleaner đối với customer
            transactionHistory.setAmount(amount);
            transactionHistory.setTransactionType("DEPOSIT");
            transactionHistory.setPaymentMethod("VNPay");
            transactionHistory.setStatus("PENDING");
            transactionHistory.setTxnRef(txnRef);  // Lấy txnRef từ VNPay và lưu vào transaction history
            transactionHistoryRepository.save(transactionHistory);

            // Trả về URL thanh toán cho customer
            response.put("paymentUrl", paymentUrl);
            response.put("txnRef", txnRef);  // Trả lại txnRef cho customer để theo dõi

        } catch (Exception e) {
            response.put("message", "Failed to create payment through VNPay: " + e.getMessage());
            return response;
        }

        response.put("message", "Nạp tiền vào ví thành công!");
        return response;
    }
}
