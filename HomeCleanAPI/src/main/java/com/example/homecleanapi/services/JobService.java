package com.example.homecleanapi.services;



import com.example.homecleanapi.dtos.BookJobRequest;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private CustomerAddressRepository customerAddressRepository; 
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    @Autowired
    private ServiceDetailRepository serviceDetailRepository;
    
    @Autowired JobDetailsRepository jobDetailsRepository;

    // Tạo job mới cho customer
    public Map<String, Object> bookJob(BookJobRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Lấy userType từ context
        String userType = (String) SecurityContextHolder.getContext().getAuthentication().getDetails();
        if (userType == null || !userType.equals("customer")) {
            response.put("message", "Unauthorized - Only customers can book jobs");
            return response;
        }

        // Lấy phone từ SecurityContext
        String phone = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Tìm customer theo phone number từ SecurityContext
        Customers customer = customerRepository.findByPhone(phone);
        if (customer == null) {
            response.put("message", "Customer not found");
            return response;
        }

        // Lấy địa chỉ của customer từ customerAddressId
        Optional<CustomerAddress> customerAddressOpt = customerAddressRepository.findById(request.getCustomerAddressId());
        if (!customerAddressOpt.isPresent()) {
            response.put("message", "Customer address not found");
            return response;
        }
        CustomerAddress customerAddress = customerAddressOpt.get();

        // Tạo một Job mới
        Job job = new Job();

        // Kiểm tra và lấy đối tượng Service
        Optional<Services> serviceOpt = serviceRepository.findById(request.getServiceId());
        if (!serviceOpt.isPresent()) {
            response.put("message", "Service not found");
            return response;
        }
        Services service = serviceOpt.get();

        // Kiểm tra và lấy đối tượng ServiceDetail
        Optional<ServiceDetail> serviceDetailOpt = serviceDetailRepository.findById(request.getServiceDetailId());
        if (!serviceDetailOpt.isPresent()) {
            response.put("message", "Service Detail not found");
            return response;
        }
        ServiceDetail serviceDetail = serviceDetailOpt.get();

        // Gán thông tin cho job
        job.setService(service);  // Gán Service cho Job
        job.setServiceDetail(serviceDetail);  // Gán ServiceDetail cho Job

        // Chuyển jobTime từ String sang LocalDateTime
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            LocalDateTime jobTime = LocalDateTime.parse(request.getJobTime(), formatter);
            job.setScheduledTime(jobTime);  // Gán thời gian cho job
        } catch (Exception e) {
            response.put("message", "Invalid job time format");
            return response;
        }

        job.setCustomerAddress(customerAddress);  // Địa chỉ khách hàng
        job.setStatus(JobStatus.OPEN);  // Trạng thái ban đầu của job
        job.setCustomer(customer);  // Gán Customer cho Job

        // Tạo một JobDetails mới
        JobDetails jobDetails = new JobDetails();
        jobDetails.setRoomSize(request.getRoomSize());  // Kích thước phòng
        jobDetails.setImageUrl(request.getImageUrl());  // URL hình ảnh

        // Gán JobDetails cho Job trước khi lưu Job vào cơ sở dữ liệu
        job.setJobDetails(jobDetails);

        // Lưu JobDetails vào cơ sở dữ liệu
        jobDetailsRepository.save(jobDetails);

        // Lưu Job vào cơ sở dữ liệu
        jobRepository.save(job);

        // Trả về thông tin công việc vừa được tạo
        response.put("message", "Job booked successfully");
        response.put("jobId", job.getId());  // jobId sẽ được tự động sinh ra bởi cơ sở dữ liệu
        response.put("status", job.getStatus());

        return response;
    }







    // Chuyển trạng thái job sang started
    public Map<String, Object> updateJobStatusToStarted(Long jobId) {
        Map<String, Object> response = new HashMap<>();

        // Lấy userType từ context
        String userType = (String) SecurityContextHolder.getContext().getAuthentication().getDetails();
        if (userType == null || !userType.equals("cleaner")) {
            response.put("message", "Unauthorized - Only cleaners can start jobs");
            return response;
        }

        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }

        Job job = jobOpt.get();

        // Kiểm tra trạng thái công việc và sự tồn tại của job application
        JobApplication jobApplication = jobApplicationRepository.findByJobIdAndStatus(jobId, "Accepted");
        if (jobApplication == null) {
            response.put("message", "No cleaner assigned or job application is not in 'Accepted' state");
            return response;
        }

        if (!job.getStatus().equals(JobStatus.ARRIVED)) {
            response.put("message", "Job is not in ARRIVED state");
            return response;
        }

        // Cập nhật trạng thái công việc thành 'STARTED'
        job.setStatus(JobStatus.STARTED);
        jobRepository.save(job);

        response.put("message", "Job status updated to STARTED");
        return response;
    }

}

