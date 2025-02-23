package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.CleanerRegisterRequest;
import com.example.homecleanapi.dtos.ForgotPasswordRequest;
import com.example.homecleanapi.dtos.LoginRequest;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.repositories.EmployeeRepository;
import com.example.homecleanapi.utils.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class EmployeeAuthService {
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AvatarService avatarService;

    public EmployeeAuthService(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils, AvatarService avatarService) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.avatarService = avatarService;
    }

    public ResponseEntity<Map<String, Object>> cleanerRegister(CleanerRegisterRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (request == null || request.getPhone() == null || request.getPassword() == null || request.getName() == null
                || request.getAge() == null || request.getAddress() == null || request.getExperience() == null || request.getIdentity_number() == null) {
            response.put("message", "Thông tin đăng ký không hợp lệ!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (employeeRepository.existsByPhone(request.getPhone())) {
            response.put("message", "Số điện thoại đã tồn tại!");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        Employee employee = new Employee();
        employee.setPhone(request.getPhone());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setAge(request.getAge());
        employee.setAddress(request.getAddress());
        employee.setExperience(request.getExperience());
        employee.setIdentity_number(request.getIdentity_number().toString());
        employee.setProfile_image(avatarService.generateIdenticon(request.getName()));
//    customer.setRole("USER"); // Kiểm tra lại nếu role là enum hoặc bảng riêng

        employeeRepository.save(employee);

        response.put("EmployeeID", employee.getId());
        response.put("phone", employee.getPhone());
        response.put("name", employee.getName());
        response.put("created_at", employee.getCreated_at());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    public ResponseEntity<Map<String, Object>> cleanerLogin(LoginRequest request) {
        Employee employee = employeeRepository.findByPhone(request.getPhone());

        Map<String, Object> response = new HashMap<>();

        if (employee == null) {
            response.put("message", "Số điện thoại không tồn tại!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (!passwordEncoder.matches(request.getPassword(), employee.getPassword())) {
            response.put("message", "Sai mật khẩu!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String token = jwtUtils.generateToken(employee.getPhone(), employee.getName(), employee.getId().toString());

        response.put("message", "Đăng nhập thành công!");
        response.put("token", token);
        response.put("phone", employee.getPhone());
        response.put("cleanerId", employee.getId());

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, Object>> cleanerForgotPassword(ForgotPasswordRequest request) {
        Employee employee = employeeRepository.findByPhone(request.getPhone());

        Map<String, Object> response = new HashMap<>();

        if (employee == null) {
            response.put("message", "Số điện thoại không tồn tại!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        String newPassword = UUID.randomUUID().toString().substring(0, 8);
        employee.setPassword(passwordEncoder.encode(newPassword));
        employeeRepository.save(employee);

        // Gửi mật khẩu mới qua SMS (giả lập)
        System.out.println("Gửi mật khẩu mới: " + newPassword + " đến số điện thoại: " + request.getPhone());

        response.put("message", "Mật khẩu mới đã được gửi!");
        response.put("phone", request.getPhone());
        response.put("newPassword", newPassword); // Chỉ hiển thị trong môi trường phát triển, có thể ẩn trong production.
        return ResponseEntity.ok(response);
    }
}