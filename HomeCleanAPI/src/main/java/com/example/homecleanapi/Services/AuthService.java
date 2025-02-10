package com.example.homecleanapi.Services;

import com.example.homecleanapi.DTOs.ForgotPasswordRequest;
import com.example.homecleanapi.DTOs.LoginRequest;
import com.example.homecleanapi.DTOs.RegisterRequest;
import com.example.homecleanapi.Models.Customers;
import com.example.homecleanapi.Repositories.CustomerRepository;
import com.example.homecleanapi.Utils.JwtUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(CustomerRepository customerRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public String register(RegisterRequest request) {
        if (request == null || request.getPhone() == null || request.getPassword() == null) {
            throw new RuntimeException("Thông tin đăng ký không hợp lệ!");
        }

        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại đã tồn tại!");
        }

        Customers customer = new Customers();
        customer.setPhone(request.getPhone());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setRole("USER"); // Kiểm tra lại nếu role là enum hoặc bảng riêng

        customerRepository.save(customer);
        return "Đăng ký thành công! ID: " + customer.getId();
    }

    public String login(LoginRequest request) {
        Customers customer = customerRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("Số điện thoại không tồn tại!"));

        if (!passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            throw new RuntimeException("Sai mật khẩu!");
        }

        return jwtUtils.generateToken(customer.getPhone());
    }


    public String forgotPassword(ForgotPasswordRequest request) {
        Customers customer = customerRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("Số điện thoại không tồn tại!"));

        String newPassword = UUID.randomUUID().toString().substring(0, 8);
        customer.setPassword(passwordEncoder.encode(newPassword));
        customerRepository.save(customer);

        System.out.println("Gửi mật khẩu mới: " + newPassword + " đến email: " + request.getEmail());

        return "Mật khẩu mới đã được gửi!";
    }
}
