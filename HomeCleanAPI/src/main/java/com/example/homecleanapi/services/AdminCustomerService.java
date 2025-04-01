

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
        customer.setIs_deleted(false); // Mặc định là không bị xóa

        // Lưu vào cơ sở dữ liệu
        customerRepository.save(customer);

        // Trả về phản hồi
        return ResponseEntity.ok(Map.of(
                "message", "Thêm khách hàng thành công",
                "customerId", customer.getId(),
                "phone", customer.getPhone(),
                "name", customer.getFull_name(),
                "is_deleted", customer.isIs_deleted() // Cập nhật với is_deleted
        ));
    }



    // Cập nhật thông tin khách hàng
    public ResponseEntity<Map<String, Object>> updateCustomer(Integer customerId, CustomerProfileRequest request) {
        Optional<Customers> existingCustomerOpt = customerRepo.findById(customerId);

        if (existingCustomerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Khách hàng không tồn tại"));
        }

        Customers customer = existingCustomerOpt.get();

        // Chỉ cập nhật nếu client truyền lên
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
            customer.setIs_deleted(request.getAccountStatus());  // Cập nhật is_deleted
        }

        customerRepository.save(customer);

        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật thông tin khách hàng thành công",
                "customerId", customer.getId(),
                "phone", customer.getPhone(),
                "name", customer.getFull_name(),
                "is_deleted", customer.isIs_deleted()
        ));
    }




    // Xóa khách hàng
    public ResponseEntity<Map<String, Object>> deleteCustomer(Integer customerId) {
        Optional<Customers> existingCustomerOpt = customerRepo.findById(customerId);

        if (existingCustomerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Khách hàng không tồn tại"));
        }

        Customers customer = existingCustomerOpt.get();

        customer.setIs_deleted(true);
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
                "is_deleted", customer.isIs_deleted(),  // Cập nhật với is_deleted
                "password_hash", customer.getPassword_hash()
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
            map.put("is_deleted", customer.isIs_deleted());  // Cập nhật với is_deleted
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }


}

