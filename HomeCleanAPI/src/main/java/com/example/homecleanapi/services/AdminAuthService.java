package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.LoginRequest;
import com.example.homecleanapi.models.Administrator;
import com.example.homecleanapi.repositories.AdministratorRepository;
import com.example.homecleanapi.utils.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminAuthService {

    private final AdministratorRepository administratorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AdminAuthService(AdministratorRepository administratorRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.administratorRepository = administratorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public ResponseEntity<Map<String, Object>> adminLogin(LoginRequest request) {
        Administrator admin = administratorRepository.findByEmail(request.getPhone());  // Here, assuming login with email

        Map<String, Object> response = new HashMap<>();

        if (admin == null) {
            response.put("message", "Email không tồn tại!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Kiểm tra mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            response.put("message", "Sai mật khẩu!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Generate JWT token for the admin
        String token = jwtUtils.generateToken(admin.getEmail(), admin.getFullName(), admin.getId().toString(), admin.getRole().getRoleName());

        // Add role in the response
        response.put("token", token);
        response.put("email", admin.getEmail());
        response.put("adminId", admin.getId());
        response.put("name", admin.getFullName());
        response.put("role", admin.getRole().getRoleName());  // Return the role of the admin

        return ResponseEntity.ok(response);
    }
}
