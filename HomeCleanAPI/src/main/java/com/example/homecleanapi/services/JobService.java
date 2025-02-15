package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.BookJobRequest;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;
import com.example.homecleanapi.utils.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;  
import java.util.HashMap;
import java.util.Map;

@Service
public class JobService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ServiceRepository servicesRepository;

    @Autowired
    private ServiceDetailRepository serviceDetailRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobDetailsRepository jobDetailsRepository;

    @Autowired
    private JwtUtils jwtUtils;  // Thêm inject JwtUtils

    public ResponseEntity<Map<String, Object>> bookJob(BookJobRequest request, String token) {
        Map<String, Object> response = new HashMap<>();

        // Lấy phone từ token (đây là cách lấy thông tin customer từ token)
        String phone = jwtUtils.getUsernameFromToken(token);  // Sử dụng jwtUtils thay vì jwtTokenProvider
        Customers customer = customerRepository.findByPhone(phone);  // Tìm khách hàng theo phone trong token

        if (customer == null) {
            response.put("message", "Customer not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Kiểm tra xem dịch vụ có tồn tại không
        Services service = servicesRepository.findById(request.getServiceId()).orElse(null);
        if (service == null) {
            response.put("message", "Service not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Kiểm tra chi tiết dịch vụ
        ServiceDetail serviceDetail = serviceDetailRepository.findById(request.getServiceDetailId()).orElse(null);
        if (serviceDetail == null) {
            response.put("message", "Service detail not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Tạo một job mới
        Job job = new Job();
        job.setCustomer(customer);
        job.setService(service);
        job.setServiceDetail(serviceDetail);
        job.setAddress(request.getAddress());
        job.setLatitude(request.getLatitude());
        job.setLongitude(request.getLongitude());
        job.setRequestedAddress(request.getRequestedAddress());
        job.setRequestedLatitude(request.getRequestedLatitude());
        job.setRequestedLongitude(request.getRequestedLongitude());
        job.setScheduledTime(request.getScheduledTime());
        job.setTotalPrice(request.getTotalPrice());
        job.setStatus(JobStatus.Open);

        // Lưu job vào cơ sở dữ liệu
        jobRepository.save(job);

        // Tạo và lưu thông tin chi tiết của job
        JobDetails jobDetails = new JobDetails();
        jobDetails.setJob(job);
        jobDetails.setRoomSize(3);  // Giá trị mặc định cho room size, có thể thay đổi theo yêu cầu
        jobDetails.setImageUrl("http://example.com/sample.jpg");  // Hình ảnh mặc định

        jobDetailsRepository.save(jobDetails);

        // Phản hồi thành công
        response.put("message", "Job booked successfully.");
        response.put("jobId", job.getId());
        response.put("jobDetailsId", jobDetails.getId());
        response.put("customer", customer.getFull_name());
        response.put("service", service.getName());  // Đảm bảo rằng dịch vụ được trả về tên chính xác
        response.put("totalPrice", job.getTotalPrice());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
