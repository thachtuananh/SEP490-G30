package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.CustomerProfileRequest;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.repositories.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CustomerProfileService {

    private final CustomerRepository customerRepository;

    public CustomerProfileService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // Xem thông tin profile của khách hàng
    public ResponseEntity<Map<String, Object>> getProfile(String phone) {
        Map<String, Object> response = new HashMap<>();

        Customers customer = customerRepository.findByPhone(phone);
        if (customer == null) {
            response.put("message", "Khách hàng không tồn tại!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        
        response.put("phone", customer.getPhone());
        response.put("name", customer.getFull_name());
        response.put("created_at", customer.getCreated_at());
        return ResponseEntity.ok(response);
    }

    // Cập nhật thông tin profile của khách hàng
    public ResponseEntity<Map<String, Object>> updateProfile(CustomerProfileRequest request) {
        Map<String, Object> response = new HashMap<>();

        Customers customer = customerRepository.findByPhone(request.getPhone());
        if (customer == null) {
            response.put("message", "Khách hàng không tồn tại!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        
        customer.setFull_name(request.getFullName());
        
        customerRepository.save(customer);  

        response.put("message", "Cập nhật thông tin profile thành công!");
        response.put("phone", customer.getPhone());
        response.put("name", customer.getFull_name());
        return ResponseEntity.ok(response);
    }
}
