package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.WithdrawalDTO;
import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

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

        response.put("message", "Yêu cầu rút tiền đã được tạo thành công, đang chờ quản trị viên chấp thuận");
        response.put("status", HttpStatus.CREATED);

        return response;
    }




    public Map<String, Object> approveOrRejectWithdrawalRequest(Long withdrawalRequestId, String action) {
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
            // Kiểm tra số dư ví của customer hoặc cleaner trước khi approve
            Double withdrawalAmount = withdrawalRequest.getAmount();
            if (withdrawalRequest.getCustomer() != null) {
                // Kiểm tra ví của customer
                Optional<CustomerWallet> customerWalletOpt = customerWalletRepository.findByCustomerId(Long.valueOf(withdrawalRequest.getCustomer().getId()));
                if (!customerWalletOpt.isPresent()) {
                    response.put("message", "Không tìm thấy ví của customer");
                    response.put("status", HttpStatus.NOT_FOUND);
                    return response;
                }

                CustomerWallet customerWallet = customerWalletOpt.get();
                // Kiểm tra số dư ví của customer
                if (customerWallet.getBalance() < withdrawalAmount) {
                    response.put("message", "Số dư ví của customer không đủ để thực hiện yêu cầu rút tiền");
                    response.put("status", HttpStatus.BAD_REQUEST);
                    return response;
                }

                // Trừ số tiền đã rút vào ví của customer
                customerWallet.setBalance(customerWallet.getBalance() - withdrawalAmount);
                customerWalletRepository.save(customerWallet);
            } else if (withdrawalRequest.getCleaner() != null) {
                // Kiểm tra ví của cleaner
                Optional<Wallet> cleanerWalletOpt = walletRepository.findByCleanerId(withdrawalRequest.getCleaner().getId());
                if (!cleanerWalletOpt.isPresent()) {
                    response.put("message", "Không tìm thấy ví của cleaner");
                    response.put("status", HttpStatus.NOT_FOUND);
                    return response;
                }

                Wallet cleanerWallet = cleanerWalletOpt.get();
                // Kiểm tra số dư ví của cleaner
                if (cleanerWallet.getBalance() < withdrawalAmount) {
                    response.put("message", "Số dư ví của cleaner không đủ để thực hiện yêu cầu rút tiền");
                    response.put("status", HttpStatus.BAD_REQUEST);
                    return response;
                }

                // Trừ số tiền đã rút vào ví của cleaner
                cleanerWallet.setBalance(cleanerWallet.getBalance() - withdrawalAmount);
                walletRepository.save(cleanerWallet);
            } else {
                response.put("message", "Không tìm thấy thông tin ví người yêu cầu");
                response.put("status", HttpStatus.BAD_REQUEST);
                return response;
            }

            // Nếu approve, cập nhật trạng thái là "APPROVED"
            withdrawalRequest.setStatus("WITHDREW");
        } else if ("REJECT".equalsIgnoreCase(action)) {
            // Nếu reject, cập nhật trạng thái là "REJECTED"
            withdrawalRequest.setStatus("REJECTED");
        } else {
            // Trường hợp hành động không hợp lệ
            response.put("message", "Invalid action, must be APPROVE or REJECT");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        // Cập nhật lại yêu cầu rút tiền trong cơ sở dữ liệu
        withdrawalRequestRepository.save(withdrawalRequest);

        response.put("message", "Thành công");
        response.put("status", HttpStatus.OK);

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
