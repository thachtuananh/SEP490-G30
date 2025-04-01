

package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.*;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.repositories.CustomerRepo;
import com.example.homecleanapi.repositories.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminCustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomerRepo customerRepo;


    // Thêm khách hàng
    public ResponseEntity<Map<String, Object>> addCustomer(CustomerRegisterRequest request) {
        // Kiểm tra xem số điện thoại đã tồn tại chưa
        if (customerRepository.existsByPhone(request.getPhone())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Số điện thoại đã tồn tại"));
        }

        // Tạo mới khách hàng
        Customers customer = new Customers();
        customer.setPhone(request.getPhone());
        customer.setPassword_hash(passwordEncoder.encode(request.getPassword()));
        customer.setFull_name(request.getName());
        customer.setAccountStatus(true);

        // Lưu vào cơ sở dữ liệu
        customerRepository.save(customer);

        // Trả về phản hồi
        return ResponseEntity.ok(Map.of(
                "message", "Thêm khách hàng thành công",
                "customerId", customer.getId(),
                "phone", customer.getPhone(),
                "name", customer.getFull_name(),
                "account_status", customer.getAccountStatus()
        ));
    }


    // Cập nhật thông tin khách hàng
    public ResponseEntity<Map<String, Object>> updateCustomer(Integer customerId, CustomerProfileRequest request) {
        Optional<Customers> existingCustomerOpt = customerRepo.findById(customerId);

        if (existingCustomerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Khách hàng không tồn tại"));
        }

        Customers customer = existingCustomerOpt.get();

        // 👇 Chỉ cập nhật nếu client truyền lên
        if (request.getFullName() != null) {
            customer.setFull_name(request.getFullName());
        }

        if (request.getPhone() != null) {
            customer.setPhone(request.getPhone());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            customer.setPassword_hash(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getAccountStatus() != null) {
            customer.setAccountStatus(request.getAccountStatus());
        }

        customerRepository.save(customer);

        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật thông tin khách hàng thành công",
                "customerId", customer.getId(),
                "phone", customer.getPhone(),
                "name", customer.getFull_name(),
                "account_status", customer.getAccountStatus()
        ));
    }



    // Xóa khách hàng
    public ResponseEntity<Map<String, Object>> deleteCustomer(Integer customerId) {
        Optional<Customers> existingCustomerOpt = customerRepo.findById(customerId);

        if (existingCustomerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Khách hàng không tồn tại"));
        }

        Customers customer = existingCustomerOpt.get();

        // Soft delete - đặt account_status = false
        customer.setAccountStatus(false);
        customerRepository.save(customer);

        return ResponseEntity.ok(Map.of("message", "Khóa tài khoản khách hàng thành công"));
    }


    // Lấy thông tin khách hàng
    public ResponseEntity<Map<String, Object>> getCustomerInfo(Integer customerId) {
        Optional<Customers> existingCustomerOpt = customerRepo.findById(customerId);

        if (existingCustomerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Khách hàng không tồn tại"));
        }

        Customers customer = existingCustomerOpt.get();

        return ResponseEntity.ok(Map.of(
                "customerId", customer.getId(),
                "phone", customer.getPhone(),
                "name", customer.getFull_name(),
                "created_at", customer.getCreated_at(),
                "account_status", customer.getAccountStatus(),
                "password_hash", customer.getPassword_hash() // 👈 Thêm dòng này
        ));
    }


    public ResponseEntity<List<Map<String, Object>>> getAllCustomers() {
        List<Customers> customers = customerRepo.findAll();

        List<Map<String, Object>> result = customers.stream().map(customer -> {
            Map<String, Object> map = new HashMap<>();
            map.put("customerId", customer.getId());
            map.put("phone", customer.getPhone());
            map.put("name", customer.getFull_name());
            map.put("created_at", customer.getCreated_at());
            map.put("account_status", customer.getAccountStatus());
            return map;
        }).toList();


        return ResponseEntity.ok(result);
    }

}

