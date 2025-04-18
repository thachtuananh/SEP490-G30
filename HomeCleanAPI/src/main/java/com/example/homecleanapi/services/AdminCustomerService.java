

package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.*;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.JobApplication;
import com.example.homecleanapi.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminCustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomerRepo customerRepo;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;


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
        customer.setDeleted(false); // Mặc định là không bị xóa

        // Lưu vào cơ sở dữ liệu
        customerRepository.save(customer);

        // Trả về phản hồi
        return ResponseEntity.ok(Map.of(
                "message", "Thêm khách hàng thành công",
                "customerId", customer.getId(),
                "phone", customer.getPhone(),
                "name", customer.getFull_name(),
                "is_deleted", customer.isDeleted() // Cập nhật với is_deleted
        ));
    }



    // Cập nhật thông tin khách hàng
    public ResponseEntity<Map<String, Object>> updateCustomer(Integer customerId, CustomerProfileAdminDTO request) {
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
            customer.setDeleted(request.getAccountStatus());  // Cập nhật is_deleted
        }

        customerRepository.save(customer);

        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật thông tin khách hàng thành công",
                "customerId", customer.getId(),
                "phone", customer.getPhone(),
                "name", customer.getFull_name(),
                "is_deleted", customer.isDeleted()
        ));
    }




    // Xóa khách hàng
    public ResponseEntity<Map<String, Object>> deleteCustomer(Integer customerId) {
        Optional<Customers> existingCustomerOpt = customerRepo.findById(customerId);

        if (existingCustomerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Khách hàng không tồn tại"));
        }

        Customers customer = existingCustomerOpt.get();

        customer.setDeleted(true);
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
                "is_deleted", customer.isDeleted(),  // Cập nhật với is_deleted
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
            map.put("is_deleted", customer.isDeleted());  // Cập nhật với is_deleted
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    public List<JobHistoryResponse> getJobHistoryByCustomerId(Long customerId) {
        // Lấy tất cả job của customer từ JobRepository
        List<Job> jobs = jobRepository.findByCustomerId(customerId);

        // Chuyển danh sách jobs thành danh sách JobHistoryResponse và lọc chỉ những job mà cleaner_id là null
        return jobs.stream()
                .filter(job -> job.getCleaner() == null) // Lọc chỉ những job mà cleaner_id là null
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

                    // Set thông tin của cleaner nếu có (đối với job này, cleaner sẽ là null)
                    response.setCleanerId(null); // Cái này luôn là null vì job không có cleaner
                    response.setCleanerName(null); // Tương tự với cleanerName

                    // Lấy thông tin service của job (job_service_detail)
                    List<String> services = job.getJobServiceDetails().stream()
                            .map(jobServiceDetail -> jobServiceDetail.getService().getName()) // Lấy tên dịch vụ
                            .collect(Collectors.toList());

                    // Thêm dịch vụ vào response (nếu là combo, sẽ có nhiều dịch vụ)
                    response.setServices(services);

                    // Thêm orderCode vào response
                    if (job.getOrderCode() != null) {
                        response.setOrderCode(job.getOrderCode()); // Thêm orderCode vào JobHistoryResponse
                    }

                    return response;
                })
                .collect(Collectors.toList()); // Thu thập các job thành list
    }



    public List<JobHistoryResponse> getJobHistoryByCustomerIdForCleaner(Long customerId) {
        // Lấy tất cả job của customer từ JobRepository
        List<Job> jobs = jobRepository.findByCustomerId(customerId);

        // Chuyển danh sách jobs thành danh sách JobHistoryResponse và lọc chỉ những job mà cleaner_id có dữ liệu
        return jobs.stream()
                .filter(job -> job.getCleaner() != null) // Lọc chỉ những job mà cleaner_id có dữ liệu (không phải null)
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

                    // Set thông tin của cleaner (job đã có cleaner)
                    response.setCleanerId(job.getCleaner() != null ? Long.valueOf(job.getCleaner().getId()) : null);
                    response.setCleanerName(job.getCleaner() != null ? job.getCleaner().getName() : null);

                    // Lấy thông tin service của job (job_service_detail)
                    List<String> services = job.getJobServiceDetails().stream()
                            .map(jobServiceDetail -> jobServiceDetail.getService().getName()) // Lấy tên dịch vụ
                            .collect(Collectors.toList());

                    // Thêm dịch vụ vào response (nếu là combo, sẽ có nhiều dịch vụ)
                    response.setServices(services);

                    // Thêm orderCode vào response
                    if (job.getOrderCode() != null) {
                        response.setOrderCode(job.getOrderCode()); // Thêm orderCode vào JobHistoryResponse
                    }

                    return response;
                })
                .collect(Collectors.toList());
    }



    public JobHistoryResponse getJobDetailsByJobId(Long jobId) {
        // Tìm job từ JobRepository
        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null) {
            return null; // Nếu job không tồn tại, trả về null
        }

        // Tạo đối tượng JobHistoryResponse và điền thông tin từ Job
        JobHistoryResponse response = new JobHistoryResponse();
        response.setJobId(job.getId());
        response.setFullName(job.getCustomer().getFull_name());
        response.setPhone(job.getCustomer().getPhone());
        response.setJobStatus(job.getStatus().name());
        response.setScheduledTime(job.getScheduledTime());
        response.setPaymentMethod(job.getPaymentMethod());
        response.setTotalPrice(job.getTotalPrice());
        response.setReminder(job.getReminder());

        // Lấy thông tin của cleaner nếu có
        response.setCleanerId(job.getCleaner() != null ? Long.valueOf(job.getCleaner().getId()) : null);
        response.setCleanerName(job.getCleaner() != null ? job.getCleaner().getName() : null);

        // Lấy thông tin service của job (job_service_detail)
        List<String> services = job.getJobServiceDetails().stream()
                .map(jobServiceDetail -> jobServiceDetail.getService().getName()) // Lấy tên dịch vụ
                .collect(Collectors.toList());
        response.setServices(services);

        // Lấy thông tin feedback của job (feedback)
        List<String> feedbacks = job.getFeedback().stream()
                .map(feedback -> "Rating: " + feedback.getRating() + ", Comment: " + feedback.getComment())
                .collect(Collectors.toList());
        response.setFeedback(feedbacks);

        // Lấy danh sách cleaner đã ứng tuyển cho job
        List<JobApplication> jobApplications = jobApplicationRepository.findByJob(job); // Giả sử bạn có phương thức này để lấy danh sách ứng tuyển
        List<String> cleanerApplications = jobApplications.stream()
                .map(jobApplication -> jobApplication.getCleaner().getName() + " (" + jobApplication.getStatus() + ")") // Lấy tên cleaner và status ứng tuyển
                .collect(Collectors.toList());
        response.setCleanerApplications(cleanerApplications);

        // Thêm orderCode vào response
        if (job.getOrderCode() != null) {
            response.setOrderCode(job.getOrderCode()); // Thêm orderCode vào JobHistoryResponse
        }

        return response;
    }







}

