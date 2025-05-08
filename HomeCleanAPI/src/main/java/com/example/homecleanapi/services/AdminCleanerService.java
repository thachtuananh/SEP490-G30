package com.example.homecleanapi.services;
import com.example.homecleanapi.dtos.*;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.JobApplication;
import com.example.homecleanapi.repositories.CleanerRepository;
import com.example.homecleanapi.repositories.JobApplicationRepository;
import com.example.homecleanapi.repositories.JobRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
public class AdminCleanerService {

    private final CleanerRepository cleanerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public AdminCleanerService(CleanerRepository cleanerRepository, PasswordEncoder passwordEncoder, JobRepository jobRepository, JobApplicationRepository jobApplicationRepository) {
        this.cleanerRepository = cleanerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    public ResponseEntity<Map<String, Object>> addCleaner(CleanerRegisterRequest request) {
        if (cleanerRepository.findByPhone(request.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Số điện thoại đã tồn tại"));
        }

        Employee cleaner = new Employee();
        cleaner.setName(request.getName());
        cleaner.setPhone(request.getPhone());
        cleaner.setEmail(request.getEmail());
        cleaner.setPassword(passwordEncoder.encode(request.getPassword()));
        cleaner.setAge(request.getAge());
        cleaner.setAddress(request.getAddress());
        cleaner.setIdentityNumber(request.getIdentity_number());
        cleaner.setIs_verified(false); // Mặc định chưa xác minh
        cleaner.setExperience(request.getExperience());

        cleaner.setIsDeleted(false);
        cleaner.setStatus(true);
        cleaner.setCreated_at(LocalDateTime.now());
        cleaner.setUpdated_at(LocalDateTime.now());

        if (request.getProfileImageBase64() != null && !request.getProfileImageBase64().isEmpty()) {
            try {
                byte[] imageBytes = Base64.getDecoder().decode(request.getProfileImageBase64());
                cleaner.setProfile_image(imageBytes);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Ảnh không hợp lệ (Base64)"));
            }
        }

        cleanerRepository.save(cleaner);

        return ResponseEntity.ok(Map.of(
                "message", "Thêm cleaner thành công",
                "cleanerId", cleaner.getId()
        ));
    }


    public ResponseEntity<Map<String, Object>> updateCleaner(Long id, CleanerProfileRequest request) {
        Optional<Employee> cleanerOpt = cleanerRepository.findById(id);
        if (cleanerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cleaner không tồn tại"));
        }

        Employee cleaner = cleanerOpt.get();

        if (request.getName() != null) cleaner.setName(request.getName());
        if (request.getPhone() != null) cleaner.setPhone(request.getPhone());
        if (request.getEmail() != null) cleaner.setEmail(request.getEmail());
        if (request.getAddress() != null) cleaner.setAddress(request.getAddress());
        if (request.getAge() != null) cleaner.setAge(request.getAge());
        if (request.getIdentityNumber() != null) cleaner.setIdentityNumber(request.getIdentityNumber());
        if (request.getExperience() != null) cleaner.setExperience(request.getExperience());
        if (request.getIsVerified() != null) cleaner.setIs_verified(request.getIsVerified());

        if (request.getAccountStatus() != null) cleaner.setIsDeleted(request.getAccountStatus());

        // Nếu có password mới
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            cleaner.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Nếu có ảnh base64
        if (request.getProfileImageBase64() != null && !request.getProfileImageBase64().isEmpty()) {
            try {
                byte[] imageBytes = Base64.getDecoder().decode(request.getProfileImageBase64());
                cleaner.setProfile_image(imageBytes);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Ảnh đại diện không hợp lệ (Base64)"));
            }
        }

        cleaner.setUpdated_at(LocalDateTime.now());
        cleanerRepository.save(cleaner);

        return ResponseEntity.ok(Map.of("message", "Cập nhật thông tin cleaner thành công"));
    }


    public ResponseEntity<Map<String, Object>> softDeleteCleaner(Long cleanerId) {
        Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
        if (cleanerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cleaner không tồn tại"));
        }

        Employee cleaner = cleanerOpt.get();
        cleaner.setIsDeleted(true);
        cleanerRepository.save(cleaner);

        return ResponseEntity.ok(Map.of("message", "Đã khóa tài khoản cleaner"));
    }

    public ResponseEntity<Map<String, Object>> getCleanerInfo(Long id) {
        Optional<Employee> cleanerOpt = cleanerRepository.findById(id);
        if (cleanerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cleaner không tồn tại"));
        }

        Employee c = cleanerOpt.get();

        Map<String, Object> result = new HashMap<>();
        result.put("cleanerId", c.getId());
        result.put("name", c.getName());
        result.put("phone", c.getPhone());
        result.put("email", c.getEmail());
        result.put("is_deleted", c.getIsDeleted());
        result.put("status", c.getStatus());
        result.put("created_at", c.getCreated_at());
        result.put("updated_at", c.getUpdated_at());
        result.put("password_hash", c.getPassword());
        result.put("age", c.getAge());
        result.put("address", c.getAddress());
        result.put("identity_number", c.getIdentityNumber());
        result.put("identity_verified", c.getIs_verified());
        result.put("experience", c.getExperience());

        if (c.getProfile_image() != null && c.getProfile_image().length > 0) {
            String base64Image = Base64.getEncoder().encodeToString(c.getProfile_image());
            result.put("profile_image_base64", base64Image);
        } else {
            result.put("profile_image_base64", null);
        }

        return ResponseEntity.ok(result);
    }


    public ResponseEntity<List<Map<String, Object>>> getAllCleaners() {
        // Lấy tất cả các cleaner có identity_verified = true
        List<Employee> cleaners = cleanerRepository.findVerifiedCleaners();

        List<Map<String, Object>> result = cleaners.stream().map(cleaner -> {
            Map<String, Object> map = new HashMap<>();
            map.put("cleanerId", cleaner.getId());
            map.put("phone", cleaner.getPhone());
            map.put("name", cleaner.getName());
            map.put("email", cleaner.getEmail());
            map.put("created_at", cleaner.getCreated_at());
            map.put("is_deleted", cleaner.getIsDeleted());
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }


    public ResponseEntity<List<JobHistoryResponse>> getJobHistoryByCleanerId(Long cleanerId) {
        // Lấy tất cả job mà cleaner đã thực hiện
        List<Job> jobs = jobRepository.findByCleanerId(cleanerId);

        // Chuyển danh sách jobs thành danh sách JobHistoryResponse
        List<JobHistoryResponse> jobHistoryResponses = jobs.stream()
                .map(job -> {
                    JobHistoryResponse response = new JobHistoryResponse();
                    response.setJobId(job.getId());
                    response.setFullName(job.getCustomer().getFull_name());
                    response.setPhone(job.getCustomer().getPhone());
                    response.setJobStatus(job.getStatus().name());
                    response.setScheduledTime(job.getScheduledTime());
                    response.setPaymentMethod(job.getPaymentMethod());
                    response.setTotalPrice(job.getTotalPrice());
                    response.setReminder(job.getReminder());
                    response.setCleanerId(cleanerId);
                    response.setCleanerName(job.getCleaner().getName());

                    // Thêm mã đơn hàng vào response
                    if (job.getOrderCode() != null) {
                        response.setOrderCode(job.getOrderCode());  // Thêm orderCode vào response
                    }

                    // Lấy thông tin service của job (job_service_detail)
                    List<String> services = job.getJobServiceDetails().stream()
                            .map(jobServiceDetail -> jobServiceDetail.getService().getName()) // Lấy tên dịch vụ
                            .collect(Collectors.toList());

                    // Thêm dịch vụ vào response
                    response.setServices(services);

                    return response;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(jobHistoryResponses);
    }


    public ResponseEntity<List<JobHistoryResponse>> getJobHistoryByCleanerIdnull(Long cleanerId) {
        // Lấy danh sách các job mà cleaner đã apply từ bảng job_application
        List<JobApplication> jobApplications = jobApplicationRepository.findByCleanerId(cleanerId);

        // Lọc ra những job mà cleaner chưa được giao (tức là cleaner_id = null trong bảng jobs)
        List<JobHistoryResponse> jobHistoryResponses = jobApplications.stream()
                .map(jobApplication -> {
                    Job job = jobApplication.getJob(); // Lấy job từ job application
                    JobHistoryResponse response = new JobHistoryResponse();

                    // Kiểm tra nếu job chưa có cleaner (cleaner_id trong bảng jobs là null)
                    if (job.getCleaner() == null) {
                        // Lấy thông tin công việc nếu cleaner_id là null trong bảng jobs
                        response.setJobId(job.getId());
                        response.setFullName(job.getCustomer().getFull_name());
                        response.setPhone(job.getCustomer().getPhone());
                        response.setJobStatus(job.getStatus().name());
                        response.setScheduledTime(job.getScheduledTime());
                        response.setPaymentMethod(job.getPaymentMethod());
                        response.setTotalPrice(job.getTotalPrice());
                        response.setReminder(job.getReminder());

                        // Cleaner chưa được giao, nên id và name sẽ là null
                        response.setCleanerId(null);
                        response.setCleanerName(null);

                        // Thêm mã đơn hàng vào response
                        if (job.getOrderCode() != null) {
                            response.setOrderCode(job.getOrderCode()); // Thêm orderCode vào response
                        }

                        // Lấy thông tin dịch vụ của job
                        List<String> services = job.getJobServiceDetails().stream()
                                .map(jobServiceDetail -> jobServiceDetail.getService().getName())
                                .collect(Collectors.toList());
                        response.setServices(services);

                        return response; // Trả về response nếu job có cleaner_id = null
                    }

                    return null; // Trả về null nếu job đã có cleaner
                })
                .filter(Objects::nonNull) // Lọc bỏ những job đã có cleaner
                .collect(Collectors.toList()); // Thu thập các job thành list

        return ResponseEntity.ok(jobHistoryResponses);
    }


    public ResponseEntity<List<Map<String, Object>>> getUnverifiedCleaners() {
        List<Employee> unverifiedCleaners = cleanerRepository.findUnverifiedCleaners();

        List<Map<String, Object>> result = unverifiedCleaners.stream()
                .map(cleaner -> {
                    Map<String, Object> map = Map.of(
                            "cleanerId", cleaner.getId(),
                            "name", cleaner.getName(),
                            "phone", cleaner.getPhone(),
                            "email", cleaner.getEmail(),
                            "identity_verified", cleaner.getIs_verified(),
                            "status", cleaner.getStatus(),
                            "created_at", cleaner.getCreated_at()
                    );
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }


    public void updateIdentityVerifiedAndDeletedStatus(Integer cleanerId, Boolean status, Boolean isDeleted) {
        cleanerRepository.updateIdentityVerifiedAndDeletedStatus(cleanerId, status, isDeleted);
    }






}

