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
    private JwtUtils jwtUtils; 

    public ResponseEntity<Map<String, Object>> bookJob(BookJobRequest request, String token) {
        Map<String, Object> response = new HashMap<>();

        
        String phone = jwtUtils.getUsernameFromToken(token);  
        Customers customer = customerRepository.findByPhone(phone);  

        if (customer == null) {
            response.put("message", "Customer not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        
        Services service = servicesRepository.findById(request.getServiceId()).orElse(null);
        if (service == null) {
            response.put("message", "HomeCleanService not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        
        ServiceDetail serviceDetail = serviceDetailRepository.findById(request.getServiceDetailId()).orElse(null);
        if (serviceDetail == null) {
            response.put("message", "HomeCleanService detail not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        
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

        
        jobRepository.save(job);

        
        JobDetails jobDetails = new JobDetails();
        jobDetails.setJob(job);
        jobDetails.setRoomSize(3);  
        jobDetails.setImageUrl("http://example.com/sample.jpg");  

        jobDetailsRepository.save(jobDetails);

       
        response.put("message", "Job booked successfully.");
        response.put("jobId", job.getId());
        response.put("jobDetailsId", jobDetails.getId());
        response.put("customer", customer.getFull_name());
        response.put("service", service.getName());  
        response.put("totalPrice", job.getTotalPrice());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
