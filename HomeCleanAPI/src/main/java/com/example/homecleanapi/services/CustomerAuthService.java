package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.*;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.repositories.CustomerRepository;
import com.example.homecleanapi.utils.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailSender;
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
    private final EmailService emailService;

    public CustomerAuthService(CustomerRepository customerRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils, EmailService emailService) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
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

    public ResponseEntity<Map<String, Object>> customerForgotPassword(ForgotPasswordRequest request, Integer customerId) {
        Customers customer = customerRepository.findCustomersById(customerId);

        Map<String, Object> response = new HashMap<>();

        if (customer == null) {
            response.put("message", "Số điện thoại không tồn tại!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        String newPassword = UUID.randomUUID().toString().substring(0, 8);
        customer.setPassword_hash(passwordEncoder.encode(newPassword));
        customerRepository.save(customer);
        String subject = "Password Reset Request";
        String text = "<p>Your new password is: <strong>" + newPassword + "</strong></p>"
                + "<p>Please change it after logging in.</p>";
        emailService.sendEmail(request.getEmail(), subject, text, true);

        System.out.println("Gửi mật khẩu mới: " + newPassword + " đến số điện thoại: " + request.getEmail());

        response.put("message", "Mật khẩu mới đã được gửi!");
        response.put("newPassword", newPassword);
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, String>> customerChangePassword(ChangePasswordRequest request, Integer customerId) {
        Customers customer = customerRepository.findCustomersById(customerId);
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Khách hàng không tồn tại"));
        }

        if (!passwordEncoder.matches(request.getOldPassword(), customer.getPassword_hash())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Mật khẩu cũ không chính xác"));
        }

        customer.setPassword_hash(passwordEncoder.encode(request.getNewPassword()));
        customerRepository.save(customer);

        return ResponseEntity.ok(Map.of("message", "Mật khẩu đã được cập nhật thành công"));
    }
}