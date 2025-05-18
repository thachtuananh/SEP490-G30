package com.example.homecleanapi.services;

import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.EmployeeRepository;
import com.example.homecleanapi.dtos.ChangePasswordRequest;
import com.example.homecleanapi.dtos.CleanerRegisterRequest;
import com.example.homecleanapi.dtos.ForgotPasswordRequest;
import com.example.homecleanapi.dtos.LoginRequest;
import com.example.homecleanapi.repositories.OtpVerificationCleanerRepository;
import com.example.homecleanapi.repositories.WalletRepository;
import com.example.homecleanapi.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class EmployeeAuthService {
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AvatarService avatarService;
    private final EmailService emailService;
    private final WalletRepository walletRepository;
    private final OtpVerificationCleanerRepository otpVerificationCleanerRepository;

    public EmployeeAuthService(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils, AvatarService avatarService, EmailService emailService, WalletRepository walletRepository, OtpVerificationCleanerRepository otpVerificationCleanerRepository) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.avatarService = avatarService;
        this.emailService = emailService;
        this.walletRepository = walletRepository;
        this.otpVerificationCleanerRepository = otpVerificationCleanerRepository;
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

        // Kiểm tra căn cước công dân đã tồn tại
        if (employeeRepository.existsByIdentityNumber(request.getIdentity_number())) {
            response.put("message", "Căn cước công dân đã tồn tại!");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        Optional<OtpVerificationCleaner> otpOpt = otpVerificationCleanerRepository.findTopByPhoneOrderByCreatedAtDesc(request.getPhone());
        if (otpOpt.isEmpty() || !otpOpt.get().getVerified()) {
            response.put("message", "Số điện thoại chưa được xác minh bằng OTP!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
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
        employee.setIdentityNumber(request.getIdentity_number());
        employee.setProfile_image(avatarService.generateIdenticon(request.getName()));

        // Thiết lập các giá trị mặc định cho identity_verified và is_deleted
        employee.setIs_verified(false);  // identity_verified = false
        employee.setIsDeleted(false);     // is_deleted = false

        // Lưu thông tin cleaner vào database
        employeeRepository.save(employee);

        Wallet cleanerWallet = new Wallet();
        cleanerWallet.setCleaner(employee);
        cleanerWallet.setBalance(0.0);
        cleanerWallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(cleanerWallet);

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
        if (employee.getIsDeleted()) {
            response.put("message", "Tài khoản của bạn không tồn tại.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        // Kiểm tra nếu tài khoản bị khóa hoặc chưa xác thực
        if (!employee.getIs_verified() && !employee.getIsDeleted()) {
            response.put("message", "Tài khoản của bạn chưa xác thực");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
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
        response.put("image", employee.getProfile_image());
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