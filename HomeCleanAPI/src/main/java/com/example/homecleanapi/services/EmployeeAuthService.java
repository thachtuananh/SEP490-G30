package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.ChangePasswordRequest;
import com.example.homecleanapi.dtos.CleanerRegisterRequest;
import com.example.homecleanapi.dtos.ForgotPasswordRequest;
import com.example.homecleanapi.dtos.LoginRequest;
import com.example.homecleanapi.models.Customers;
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
    private final EmailService emailService;

    public EmployeeAuthService(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils, AvatarService avatarService, EmailService emailService) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.avatarService = avatarService;
        this.emailService = emailService;
    }

    public ResponseEntity<Map<String, Object>> cleanerRegister(CleanerRegisterRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra dữ liệu đầu vào
        if (request == null || request.getPhone() == null || request.getPassword() == null || request.getName() == null
                || request.getAge() == null || request.getAddress() == null || request.getExperience() == null || request.getIdentity_number() == null) {
            response.put("message", "Thông tin đăng ký không hợp lệ!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Kiểm tra số điện thoại đã tồn tại
        if (employeeRepository.existsByPhone(request.getPhone())) {
            response.put("message", "Số điện thoại đã tồn tại!");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        // Tạo mới đối tượng Employee và thiết lập các thông tin
        Employee employee = new Employee();
        employee.setPhone(request.getPhone());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setAge(request.getAge());
        employee.setAddress(request.getAddress());
        employee.setExperience(request.getExperience());
        employee.setIdentity_number(request.getIdentity_number());
        employee.setProfile_image(avatarService.generateIdenticon(request.getName()));

        // Thiết lập các giá trị mặc định cho identity_verified và is_deleted
        employee.setIs_verified(false);  // identity_verified = false
        employee.setIsDeleted(true);     // is_deleted = true

        // Lưu thông tin cleaner vào database
        employeeRepository.save(employee);

        // Thiết lập thông báo thành công
        response.put("message", "Đăng ký tài khoản thành công, chờ xác thực phía houseclean");
        response.put("EmployeeID", employee.getId());
        response.put("phone", employee.getPhone());
        response.put("name", employee.getName());
        response.put("created_at", employee.getCreated_at());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }



    public ResponseEntity<Map<String, Object>> cleanerLogin(LoginRequest request) {
        // Tìm employee dựa trên số điện thoại
        Employee employee = employeeRepository.findByPhone(request.getPhone());

        Map<String, Object> response = new HashMap<>();

        // Kiểm tra nếu không tìm thấy employee
        if (employee == null) {
            response.put("message", "Số điện thoại không tồn tại!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // kiểm tra tài khoản bị khóa
        if (employee.getIsDeleted() == true) {
            response.put("message", "Tài khoản của bạn đã bị khóa");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        // Kiểm tra nếu tài khoản bị khóa hoặc chưa xác thực
        if (employee.getIs_verified() == false || employee.getIsDeleted() == true) {
            response.put("message", "Tài khoản của bạn chưa xác thực");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        // Kiểm tra mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), employee.getPassword())) {
            response.put("message", "Sai mật khẩu!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Tạo token
        String token = jwtUtils.generateToken(employee.getPhone(), employee.getName(), employee.getId().toString(), "Cleaner");

        // Trả về thông tin tài khoản đã đăng nhập
        response.put("token", token);
        response.put("phone", employee.getPhone());
        response.put("cleanerId", employee.getId());
        response.put("name", employee.getName());
        response.put("role", "Employee");

        return ResponseEntity.ok(response);
    }


    public ResponseEntity<Map<String, Object>> cleanerForgotPassword(ForgotPasswordRequest request) {
        Employee employee = employeeRepository.findByEmail(request.getEmail());

        Map<String, Object> response = new HashMap<>();

        if (employee == null) {
            response.put("message", "Email không đúng hoặc tài khoản không tồn tại!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        String newPassword = UUID.randomUUID().toString().substring(0, 8);
        employee.setPassword(passwordEncoder.encode(newPassword));
        employeeRepository.save(employee);
        String subject = "Password Reset Request";
        String text = "<p>Your new password is: <strong>" + newPassword + "</strong></p>"
                + "<p>Please change it after logging in.</p>";
        emailService.sendEmail(request.getEmail(), subject, text, true);
        // Gửi mật khẩu mới qua SMS (giả lập)
        System.out.println("Gửi mật khẩu mới: " + newPassword + " email: " + request.getEmail());

        response.put("message", "Mật khẩu mới đã được gửi!");
        response.put("newPassword", newPassword);
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, Object>> cleanerChangePassword(ChangePasswordRequest request, Integer clenaerId) {
        Employee employee = employeeRepository.findEmployeeById(clenaerId);
        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Khách hàng không tồn tại"));
        }

        if (!passwordEncoder.matches(request.getOldPassword(), employee.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Mật khẩu cũ không chính xác"));
        }

        employee.setPassword(passwordEncoder.encode(request.getNewPassword()));
        employeeRepository.save(employee);

        return ResponseEntity.ok(Map.of("message", "Mật khẩu đã được cập nhật thành công"));
    }
}