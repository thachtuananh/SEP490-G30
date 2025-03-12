package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.ForgotPasswordRequest;
import com.example.homecleanapi.dtos.LoginRequest;
import com.example.homecleanapi.dtos.CustomerRegisterRequest;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.repositories.CustomerRepository;
import com.example.homecleanapi.utils.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public CustomerAuthService(CustomerRepository customerRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public ResponseEntity<Map<String, Object>> customerRegister(CustomerRegisterRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (request == null || request.getPhone() == null || request.getPassword() == null || request.getName() == null) {
            response.put("message", "Thông tin đăng ký không hợp lệ!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (customerRepository.existsByPhone(request.getPhone())) {
            response.put("message", "Số điện thoại đã tồn tại!");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        Customers customer = new Customers();
        customer.setPhone(request.getPhone());
        customer.setPassword_hash(passwordEncoder.encode(request.getPassword()));
        customer.setFull_name(request.getName());
//    customer.setRole("USER"); // Kiểm tra lại nếu role là enum hoặc bảng riêng

        customerRepository.save(customer);

        response.put("message", "Đăng ký thành công!");
        response.put("customerId", customer.getId());
        response.put("phone", customer.getPhone());
        response.put("name", customer.getFull_name());
        response.put("created_at", customer.getCreated_at());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    public ResponseEntity<Map<String, Object>> customerLogin(LoginRequest request) {
        Customers customer = customerRepository.findByPhone(request.getPhone());

        Map<String, Object> response = new HashMap<>();

        if (customer == null) {
            response.put("message", "Số điện thoại không tồn tại!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (!passwordEncoder.matches(request.getPassword(), customer.getPassword_hash())) {
            response.put("message", "Sai mật khẩu!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String token = jwtUtils.generateToken(customer.getPhone(), customer.getFull_name(), customer.getId().toString(), "Customer");

        response.put("token", token);
        response.put("phone", customer.getPhone());
        response.put("customerId", customer.getId());
        response.put("name", customer.getFull_name());

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, Object>> customerForgotPassword(ForgotPasswordRequest request) {
        Customers customer = customerRepository.findByPhone(request.getPhone());

        Map<String, Object> response = new HashMap<>();

        if (customer == null) {
            response.put("message", "Số điện thoại không tồn tại!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        String newPassword = UUID.randomUUID().toString().substring(0, 8);
        customer.setPassword_hash(passwordEncoder.encode(newPassword));
        customerRepository.save(customer);

        // Gửi mật khẩu mới qua SMS (giả lập)
        System.out.println("Gửi mật khẩu mới: " + newPassword + " đến số điện thoại: " + request.getPhone());

        response.put("message", "Mật khẩu mới đã được gửi!");
        response.put("phone", request.getPhone());
        response.put("newPassword", newPassword); // Chỉ hiển thị trong môi trường phát triển, có thể ẩn trong production.
        return ResponseEntity.ok(response);
    }

}