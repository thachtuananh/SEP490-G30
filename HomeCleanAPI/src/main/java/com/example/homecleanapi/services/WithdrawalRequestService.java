package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.WithdrawalDTO;
import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;

@Service
public class WithdrawalRequestService {

    @Autowired
    private CustomerWalletRepository customerWalletRepository;

    @Autowired
    private WithdrawalRequestRepository withdrawalRequestRepository;

    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private CleanerRepository cleanerRepository;
    @Autowired
    private WalletRepository walletRepository;
    @Autowired
    private TransactionHistoryRepository transactionHistoryRepository;
    @Autowired
    private AdminTransactionHistoryRepository adminTransactionHistoryRepository;


    public Map<String, Object> createWithdrawalRequest(Long customerId, WithdrawalDTO request) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem customer có tồn tại không
        if (!customerRepository.existsById(customerId)) {
            response.put("message", "Customer not found");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        // Kiểm tra ví của customer
        Optional<CustomerWallet> walletOpt = customerWalletRepository.findByCustomerId(customerId);
        if (!walletOpt.isPresent()) {
            response.put("message", "Ví không tồn tại");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        CustomerWallet wallet = walletOpt.get();

        // Kiểm tra số dư trong ví có đủ để rút không
        if (wallet.getBalance() < request.getAmount()) {
            response.put("message", "Số dư ví không đủ");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        // Kiểm tra các trường thông tin rút tiền không được để trống
        if (request.getCardNumber() == null || request.getCardNumber().isEmpty()) {
            response.put("message", "Số thẻ không được để trống");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        if (request.getBankName() == null || request.getBankName().isEmpty()) {
            response.put("message", "Tên ngân hàng không được để trống");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        if (request.getAccountHolderName() == null || request.getAccountHolderName().isEmpty()) {
            response.put("message", "Tên chủ tài khoản không được để trống");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        // Tạo yêu cầu rút tiền
        com.example.homecleanapi.models.WithdrawalRequest withdrawalRequest = new com.example.homecleanapi.models.WithdrawalRequest();
        withdrawalRequest.setCustomer(wallet.getCustomer());
        withdrawalRequest.setAmount(request.getAmount());
        withdrawalRequest.setStatus("PENDING");
        withdrawalRequest.setCardNumber(request.getCardNumber());
        withdrawalRequest.setBankName(request.getBankName());
        withdrawalRequest.setAccountHolderName(request.getAccountHolderName());

        // Lưu yêu cầu rút tiền vào cơ sở dữ liệu
        withdrawalRequestRepository.save(withdrawalRequest);

        // Trừ số tiền yêu cầu rút từ ví của khách hàng
        wallet.setBalance(wallet.getBalance() - request.getAmount());
        customerWalletRepository.save(wallet);  // Lưu lại ví của customer với số dư đã được trừ


        TransactionHistory transactionHistory = new TransactionHistory();
        transactionHistory.setAmount(request.getAmount());  // Số tiền đã rút
        transactionHistory.setCustomer(wallet.getCustomer());  // Gán khách hàng vào transactionHistory (có thể là cleaner hoặc customer)
        transactionHistory.setTransactionType("Withdraw");  // Loại giao dịch là rút tiền
        transactionHistory.setTransactionDate(LocalDateTime.now());  // Ngày giờ giao dịch
        transactionHistory.setPaymentMethod("Bank Transfer");  // Phương thức thanh toán (có thể thay đổi tùy vào yêu cầu)
        transactionHistory.setStatus("SUCCESS");  // Trạng thái giao dịch là thành công

        // Lưu vào bảng transaction_history
        transactionHistoryRepository.save(transactionHistory);


        response.put("message", "Yêu cầu rút tiền đã được tạo thành công, đang chờ quản trị viên chấp thuận");
        response.put("status", HttpStatus.CREATED);

        return response;
    }



    public Map<String, Object> createWithdrawalRequestForCleaner(Long cleanerId, WithdrawalDTO request) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem cleaner có tồn tại không
        if (!cleanerRepository.existsById(cleanerId)) {
            response.put("message", "Cleaner not found");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        // Kiểm tra ví của cleaner
        Optional<Wallet> walletOpt = walletRepository.findByCleanerId(cleanerId);
        if (!walletOpt.isPresent()) {
            response.put("message", "Ví không tồn tại");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        Wallet wallet = walletOpt.get();

        // Kiểm tra số dư trong ví có đủ để rút không
        if (wallet.getBalance() < request.getAmount()) {
            response.put("message", "Insufficient balance for withdrawal");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        // Kiểm tra các trường thông tin rút tiền không được để trống
        if (request.getCardNumber() == null || request.getCardNumber().isEmpty()) {
            response.put("message", "Số thẻ không được để trống");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        if (request.getBankName() == null || request.getBankName().isEmpty()) {
            response.put("message", "Tên ngân hàng không được để trống");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        if (request.getAccountHolderName() == null || request.getAccountHolderName().isEmpty()) {
            response.put("message", "Tên chủ tài khoản không được để trống");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        // Tạo yêu cầu rút tiền cho cleaner
        com.example.homecleanapi.models.WithdrawalRequest withdrawalRequest = new com.example.homecleanapi.models.WithdrawalRequest();
        withdrawalRequest.setCleaner(wallet.getCleaner());  // Set cleaner vào withdrawalRequest
        withdrawalRequest.setAmount(request.getAmount());
        withdrawalRequest.setStatus("PENDING");
        withdrawalRequest.setCardNumber(request.getCardNumber());
        withdrawalRequest.setBankName(request.getBankName());
        withdrawalRequest.setAccountHolderName(request.getAccountHolderName());

        // Lưu yêu cầu rút tiền vào cơ sở dữ liệu
        withdrawalRequestRepository.save(withdrawalRequest);

        // Trừ số tiền yêu cầu rút từ ví của cleaner
        wallet.setBalance(wallet.getBalance() - request.getAmount());
        walletRepository.save(wallet);  // Lưu lại ví của cleaner với số dư đã được trừ

        // Lưu thông tin giao dịch vào bảng transaction_history
        TransactionHistory transactionHistory = new TransactionHistory();
        transactionHistory.setAmount(request.getAmount());  // Số tiền đã rút
        transactionHistory.setCleaner(wallet.getCleaner());  // Gán cleaner vào transactionHistory
        transactionHistory.setTransactionType("Withdraw");  // Loại giao dịch là rút tiền
        transactionHistory.setTransactionDate(LocalDateTime.now());  // Ngày giờ giao dịch
        transactionHistory.setPaymentMethod("Bank Transfer");  // Phương thức thanh toán (có thể thay đổi tùy vào yêu cầu)
        transactionHistory.setStatus("SUCCESS");  // Trạng thái giao dịch là thành công

        // Lưu vào bảng transaction_history
        transactionHistoryRepository.save(transactionHistory);

        response.put("message", "Yêu cầu rút tiền đã được tạo thành công, đang chờ quản trị viên chấp thuận");
        response.put("status", HttpStatus.CREATED);

        return response;
    }





    public Map<String, Object> approveOrRejectWithdrawalRequest(Long withdrawalRequestId, String action, String rejectionReason, String transactionCode) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem yêu cầu rút tiền có tồn tại không
        Optional<WithdrawalRequest> withdrawalRequestOpt = withdrawalRequestRepository.findById(withdrawalRequestId);
        if (!withdrawalRequestOpt.isPresent()) {
            response.put("message", "Không tìm thấy yêu cầu");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        WithdrawalRequest withdrawalRequest = withdrawalRequestOpt.get();

        // Kiểm tra trạng thái hiện tại của yêu cầu rút tiền
        if (!"PENDING".equalsIgnoreCase(withdrawalRequest.getStatus())) {
            response.put("message", "Bạn đã chấp nhận hoặc từ chối yêu cầu này");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        // Kiểm tra hành động của admin (APPROVE hoặc REJECT)
        if ("APPROVE".equalsIgnoreCase(action)) {
            // Kiểm tra xem transactionCode có được cung cấp không
            if (transactionCode == null || transactionCode.trim().isEmpty()) {
                response.put("message", "Mã giao dịch là bắt buộc khi chấp nhận yêu cầu");
                response.put("status", HttpStatus.BAD_REQUEST);
                return response;
            }

            // Nếu APPROVE, cập nhật trạng thái là "WITHDREW" và lưu mã giao dịch
            withdrawalRequest.setStatus("WITHDREW");
            withdrawalRequest.setTransactionCode(transactionCode); // Lưu mã giao dịch

            // Cập nhật lại yêu cầu rút tiền trong cơ sở dữ liệu
            withdrawalRequestRepository.save(withdrawalRequest);

            AdminTransactionHistory transactionHistory = new AdminTransactionHistory();
            transactionHistory.setCustomer(withdrawalRequest.getCustomer());
            transactionHistory.setCleaner(withdrawalRequest.getCleaner());
            transactionHistory.setTransactionType("WITHDREW");
            transactionHistory.setAmount(withdrawalRequest.getAmount());
            transactionHistory.setTransactionDate(LocalDateTime.now());
            transactionHistory.setPaymentMethod("Bank Transfer");
            transactionHistory.setStatus("SUCCESS");
            transactionHistory.setDescription("Quản lý chấp nhận yêu cầu rút tiền");

            // Lưu vào bảng AdminTransactionHistory
            adminTransactionHistoryRepository.save(transactionHistory);

            response.put("message", "Yêu cầu rút tiền đã được chấp nhận và chuyển trạng thái thành WITHDREW");
            response.put("status", HttpStatus.OK);

        } else if ("REJECT".equalsIgnoreCase(action)) {
            // Nếu REJECT, cập nhật trạng thái là "REJECTED" và hoàn tiền lại cho người yêu cầu
            withdrawalRequest.setStatus("REJECTED");
            withdrawalRequest.setRejectionReason(rejectionReason);  // Cập nhật lý do từ chối

            Double withdrawalAmount = withdrawalRequest.getAmount();

            if (withdrawalRequest.getCustomer() != null) {
                // Hoàn tiền vào ví của customer
                Optional<CustomerWallet> customerWalletOpt = customerWalletRepository.findByCustomerId(Long.valueOf(withdrawalRequest.getCustomer().getId()));
                if (customerWalletOpt.isPresent()) {
                    CustomerWallet customerWallet = customerWalletOpt.get();
                    customerWallet.setBalance(customerWallet.getBalance() + withdrawalAmount); // Hoàn tiền lại
                    customerWalletRepository.save(customerWallet);
                }
            } else if (withdrawalRequest.getCleaner() != null) {
                // Hoàn tiền vào ví của cleaner
                Optional<Wallet> cleanerWalletOpt = walletRepository.findByCleanerId(withdrawalRequest.getCleaner().getId());
                if (cleanerWalletOpt.isPresent()) {
                    Wallet cleanerWallet = cleanerWalletOpt.get();
                    cleanerWallet.setBalance(cleanerWallet.getBalance() + withdrawalAmount); // Hoàn tiền lại
                    walletRepository.save(cleanerWallet);
                }
            }

            // Lưu vào transaction_history khi yêu cầu bị từ chối
            TransactionHistory transactionHistory = new TransactionHistory();
            transactionHistory.setAmount(withdrawalAmount);  // Số tiền đã hoàn lại
            if (withdrawalRequest.getCustomer() != null) {
                transactionHistory.setCustomer(withdrawalRequest.getCustomer());
            } else {
                transactionHistory.setCleaner(withdrawalRequest.getCleaner());
            }
            transactionHistory.setTransactionType("WITHDRAWAL REJECTED");
            transactionHistory.setTransactionDate(LocalDateTime.now());
            transactionHistory.setPaymentMethod("Bank Transfer");
            transactionHistory.setStatus("FAILED");  // Trạng thái giao dịch là thất bại

            // Lưu vào bảng transaction_history
            transactionHistoryRepository.save(transactionHistory);

            // Cập nhật trạng thái yêu cầu là "REJECTED"
            withdrawalRequestRepository.save(withdrawalRequest);

            response.put("message", "Yêu cầu rút tiền đã bị từ chối và tiền đã được hoàn lại");
            response.put("status", HttpStatus.OK);
        } else {
            response.put("message", "Hành động không hợp lệ, phải là APPROVE hoặc REJECT");
            response.put("status", HttpStatus.BAD_REQUEST);
        }

        return response;
    }






    public Map<String, Object> getWithdrawalRequests(String status) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem status có hợp lệ không
        if (status != null && !status.isEmpty() && !List.of("PENDING", "APPROVED", "REJECTED").contains(status.toUpperCase())) {
            response.put("message", "Invalid status. Must be PENDING, APPROVED, or REJECTED.");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        // Lọc theo status nếu có, nếu không thì lấy tất cả
        List<WithdrawalRequest> withdrawalRequests;
        if (status != null && !status.isEmpty()) {
            // Lọc theo trạng thái cụ thể (PENDING, APPROVED, REJECTED)
            withdrawalRequests = withdrawalRequestRepository.findByStatus(status.toUpperCase());
        } else {
            // Nếu không có status thì lấy tất cả
            withdrawalRequests = withdrawalRequestRepository.findAll();
        }

        if (withdrawalRequests.isEmpty()) {
            response.put("message", "No withdrawal requests found");
            response.put("status", HttpStatus.NOT_FOUND);
        } else {
            response.put("data", withdrawalRequests);
            response.put("status", HttpStatus.OK);
        }

        return response;
    }


    public Map<String, Object> getWithdrawalRequestsForCustomer(Long customerId) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem customer có tồn tại không
        if (!customerRepository.existsById(customerId)) {
            response.put("message", "Customer not found");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        // Lấy tất cả yêu cầu rút tiền của customer
        List<WithdrawalRequest> withdrawalRequests = withdrawalRequestRepository.findByCustomerId(customerId);

        if (withdrawalRequests.isEmpty()) {
            response.put("message", "No withdrawal requests found");
            response.put("status", HttpStatus.NOT_FOUND);
        } else {
            response.put("data", withdrawalRequests);
            response.put("status", HttpStatus.OK);
        }

        return response;
    }

    public Map<String, Object> getWithdrawalRequestsForCleaner(Long cleanerId) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem cleaner có tồn tại không
        if (!cleanerRepository.existsById(cleanerId)) {
            response.put("message", "Cleaner not found");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        // Lấy tất cả yêu cầu rút tiền của cleaner
        List<WithdrawalRequest> withdrawalRequests = withdrawalRequestRepository.findByCleanerId(cleanerId);

        if (withdrawalRequests.isEmpty()) {
            response.put("message", "No withdrawal requests found");
            response.put("status", HttpStatus.NOT_FOUND);
        } else {
            response.put("data", withdrawalRequests);
            response.put("status", HttpStatus.OK);
        }

        return response;
    }




}
