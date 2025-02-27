package com.example.homecleanapi.services;



import com.example.homecleanapi.dtos.BookJobRequest;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

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
    private CustomerRepo customerRepo;
    
    
    
    @Autowired
    private CustomerAddressRepository customerAddressRepository; 
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    @Autowired
    private ServiceDetailRepository serviceDetailRepository;
    
    @Autowired JobDetailsRepository jobDetailsRepository;

    // Tạo job mới cho customer
    public Map<String, Object> bookJob( @PathVariable Long customerId, BookJobRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Lấy customerId từ tham số trực tiếp
        System.out.println("customerId = " + customerId);

        // Tìm customer theo customerId
        Optional<Customers> customerOpt = customerRepo.findById(customerId);
        if (!customerOpt.isPresent()) {
            response.put("message", "Customer not found with customerId: " + customerId);
            return response;
        }

        Customers customer = customerOpt.get();

        // Tìm địa chỉ của customer
        Optional<CustomerAddresses> customerAddressOpt = customerAddressRepository.findById(request.getCustomerAddressId());
        if (!customerAddressOpt.isPresent()) {
            response.put("message", "Customer address not found");
            return response;
        }
        CustomerAddresses customerAddress = customerAddressOpt.get();

        // Tạo mới Job
        Job job = new Job();

        // Kiểm tra Service
        Optional<Services> serviceOpt = serviceRepository.findById(request.getServiceId());
        if (!serviceOpt.isPresent()) {
            response.put("message", "Service not found");
            return response;
        }
        Services service = serviceOpt.get();

        // Kiểm tra Service Detail
        Optional<ServiceDetail> serviceDetailOpt = serviceDetailRepository.findById(request.getServiceDetailId());
        if (!serviceDetailOpt.isPresent()) {
            response.put("message", "Service Detail not found");
            return response;
        }
        ServiceDetail serviceDetail = serviceDetailOpt.get();

        // Gán thông tin cho Job
        job.setService(service);
        job.setServiceDetail(serviceDetail);

        // Chuyển jobTime từ String sang LocalDateTime
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            LocalDateTime jobTime = LocalDateTime.parse(request.getJobTime(), formatter);
            job.setScheduledTime(jobTime);
        } catch (Exception e) {
            response.put("message", "Invalid job time format");
            return response;
        }

        job.setCustomerAddress(customerAddress);
        job.setStatus(JobStatus.OPEN);
        job.setCustomer(customer);

        // Tạo JobDetails mới và liên kết với Job
        JobDetails jobDetails = new JobDetails();
        jobDetails.setRoomSize(request.getRoomSize());
        jobDetails.setImageUrl(request.getImageUrl());

        // Gán Job cho JobDetails trước khi lưu
        jobDetails.setJob(job); // Liên kết Job với JobDetails

        // Lưu Job vào cơ sở dữ liệu trước
        jobRepository.save(job);

        // Lưu JobDetails vào cơ sở dữ liệu
        jobDetailsRepository.save(jobDetails);

        response.put("message", "Job booked successfully");
        response.put("jobId", job.getId());
        response.put("status", job.getStatus());

        return response;
    }








    public Map<String, Object> updateJobStatusToStarted(Long jobId, @PathVariable Long customerId) {
        Map<String, Object> response = new HashMap<>();

        // Tìm công việc theo jobId
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }

        Job job = jobOpt.get();

        // Kiểm tra quyền của customer (sử dụng customerId từ @RequestParam)
        if (!job.getCustomer().getId().equals(customerId)) {
            response.put("message", "You are not authorized to start this job");
            return response;
        }

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

