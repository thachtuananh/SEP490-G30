package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.JobSummaryDTO;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.Cleaner;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.JobApplication;
import com.example.homecleanapi.models.JobDetails;
import com.example.homecleanapi.repositories.CleanerRepository;
import com.example.homecleanapi.repositories.JobApplicationRepository;
import com.example.homecleanapi.repositories.JobRepository;
import com.example.homecleanapi.utils.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CleanerJobService {

    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private JobApplicationRepository jobApplicationRepository;
    
    @Autowired
    private CleanerRepository cleanerRepository; 

    // Lấy danh sách các công việc đang mở
    public List<JobSummaryDTO> getOpenJobs() {
        List<Job> openJobs = jobRepository.findByStatus(JobStatus.Open);

        return openJobs.stream()
                .map(job -> new JobSummaryDTO(
                    job.getId(),
                    job.getService() != null ? job.getService().getName() : "N/A", 
                    job.getAddress(),
                    job.getTotalPrice(),
                    job.getScheduledTime()
                ))
                .collect(Collectors.toList());
    }

    // Lấy chi tiết công việc
    public Map<String, Object> getJobDetails(Long jobId) {
        
        Map<String, Object> jobDetails = new HashMap<>();
        
        
        Job job = jobRepository.findById(jobId).orElse(null);
        
        if (job != null) {
            
            jobDetails.put("jobId", job.getId());
            jobDetails.put("status", job.getStatus());
            jobDetails.put("address", job.getAddress());
            jobDetails.put("totalPrice", job.getTotalPrice());
            jobDetails.put("scheduledTime", job.getScheduledTime());

            
            jobDetails.put("customer", job.getCustomer().getFull_name());
            jobDetails.put("customerPhone", job.getCustomer().getPhone());
            
           
            JobDetails jobDetailsInfo = job.getJobDetails();  
            if (jobDetailsInfo != null) {
                jobDetails.put("roomSize", jobDetailsInfo.getRoomSize());
                jobDetails.put("imageUrl", jobDetailsInfo.getImageUrl());
                jobDetails.put("scheduledTimeDetails", jobDetailsInfo.getScheduledTime());
            }
        }
        
        return jobDetails.isEmpty() ? null : jobDetails;
    }

}

