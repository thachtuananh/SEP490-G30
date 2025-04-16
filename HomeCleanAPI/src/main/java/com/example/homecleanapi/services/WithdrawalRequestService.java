package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.WithdrawalRequest;
import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
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

    public Map<String, Object> createWithdrawalRequest(Long customerId, WithdrawalRequest request) {
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
            response.put("message", "Customer wallet not found");
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
            response.put("message", "Card number cannot be empty");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        if (request.getBankName() == null || request.getBankName().isEmpty()) {
            response.put("message", "Bank name cannot be empty");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        if (request.getAccountHolderName() == null || request.getAccountHolderName().isEmpty()) {
            response.put("message", "Account holder name cannot be empty");
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

        response.put("message", "Withdrawal request created successfully, waiting for admin approval");
        response.put("status", HttpStatus.CREATED);

        return response;
    }


    public Map<String, Object> createWithdrawalRequestForCleaner(Long cleanerId, WithdrawalRequest request) {
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
            response.put("message", "Cleaner wallet not found");
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
            response.put("message", "Card number cannot be empty");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        if (request.getBankName() == null || request.getBankName().isEmpty()) {
            response.put("message", "Bank name cannot be empty");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        if (request.getAccountHolderName() == null || request.getAccountHolderName().isEmpty()) {
            response.put("message", "Account holder name cannot be empty");
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

        response.put("message", "Withdrawal request created successfully, waiting for admin approval");
        response.put("status", HttpStatus.CREATED);

        return response;
    }


}
