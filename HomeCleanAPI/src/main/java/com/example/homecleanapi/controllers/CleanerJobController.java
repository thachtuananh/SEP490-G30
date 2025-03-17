package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.JobSummaryDTO;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.services.CleanerJobService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Employee API")
@SecurityRequirement(name = "BearerAuth")
@RequestMapping("/api/cleaner")
public class CleanerJobController {

    @Autowired
    private CleanerJobService cleanerJobService;

    // Xem danh sách các công việc "Open"
    @GetMapping(value = "/jobs/{cleanerId}")
    public ResponseEntity<List<JobSummaryDTO>> getOpenJobs(@PathVariable Long cleanerId) {
        List<JobSummaryDTO> openJobs = cleanerJobService.getOpenJobs(cleanerId);
        return ResponseEntity.ok(openJobs);
    }


    // Xem chi tiết công việc
    @GetMapping(value = "/job/{jobId}")
    public ResponseEntity<Map<String, Object>> getJobDetails(@PathVariable("jobId") Long jobId) {
        Map<String, Object> jobDetails = cleanerJobService.getJobDetails(jobId);
        if (jobDetails == null) {
            return ResponseEntity.status(404).body(null);
        }
        return ResponseEntity.ok(jobDetails);
    }

    // Cleaner apply vào job
    @PostMapping(value = "/apply-job/{jobId}")
    public ResponseEntity<Map<String, Object>> applyForJob(@PathVariable("jobId") Long jobId) {
        Map<String, Object> response = cleanerJobService.applyForJob(jobId);
        return ResponseEntity.ok(response);
    }


    // Chuyển trạng thái công việc sang ARRIVED
    @PostMapping(value = "/job/arrived/{jobId}")
    public ResponseEntity<Map<String, Object>> setJobArrived(@PathVariable("jobId") Long jobId) {
        Map<String, Object> response = cleanerJobService.updateJobStatusToArrived(jobId);
        return ResponseEntity.ok(response);
    }


    // Chuyển trạng thái công việc sang COMPLETED
    @PostMapping(value = "/job/completed/{jobId}")
    public ResponseEntity<Map<String, Object>> completeJob(@PathVariable("jobId") Long jobId) {
        Map<String, Object> response = cleanerJobService.updateJobStatusToCompleted(jobId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{cleanerId}/listjobsapply")
    public ResponseEntity<List<Map<String, Object>>> getAppliedJobs(@PathVariable("cleanerId") Long cleanerId) {
        List<Map<String, Object>> appliedJobs = cleanerJobService.getAppliedJobsForCleaner(cleanerId);
        if (appliedJobs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(appliedJobs);
    }
    
    // danh sách các job đã hoàn thành 
    @GetMapping(value = "/{cleanerId}/jobs/done")
    public ResponseEntity<List<Map<String, Object>>> getCompletedJobs(@PathVariable Long cleanerId) {
        List<Map<String, Object>> completedJobs = cleanerJobService.getCompletedJobs(cleanerId);

        if (completedJobs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of(Map.of("message", "No completed jobs")));
        }

        return ResponseEntity.ok(completedJobs);
    }
    
    // ds jobs đang làm
    @GetMapping("/{cleanerId}/jobs/doing")
    public ResponseEntity<List<Map<String, Object>>> getInProgressJobs(@PathVariable Long cleanerId) {
        List<Map<String, Object>> inProgressJobs = cleanerJobService.getInProgressJobs(cleanerId);
        if (inProgressJobs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of(Map.of("message", "No in-progress jobs")));
        }
        return ResponseEntity.ok(inProgressJobs);
    }

    // ds job mà cleaner đã apply
    @GetMapping("/{cleanerId}/jobs/applied")
    public ResponseEntity<List<Map<String, Object>>> getAppliedJobs2(@PathVariable Long cleanerId) {
        List<Map<String, Object>> appliedJobs = cleanerJobService.getAppliedJobsForCleaner2(cleanerId);
        if (appliedJobs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of(Map.of("message", "No applied jobs")));
        }
        return ResponseEntity.ok(appliedJobs);
    }


    // list job theo service và số lượng 
    @GetMapping("/jobs/by-service")
    public ResponseEntity<Map<String, Object>> getJobsByService() {
        Map<String, Object> jobsByService = cleanerJobService.getJobsByService();

        if (jobsByService.isEmpty()) {
            jobsByService.put("message", "No jobs found by service");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(jobsByService);
        }

        return ResponseEntity.ok(jobsByService);
    }
    
    // xem job thuộc filter service
    @GetMapping("/jobs/details/by-service/{serviceId}")
    public ResponseEntity<List<Map<String, Object>>> getJobsDetailsByService(@PathVariable Long serviceId) {
        List<Map<String, Object>> jobDetails = cleanerJobService.getJobsDetailsByService(serviceId);
        
        if (jobDetails.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of(Map.of("message", "No jobs found for this service")));
        }

        return ResponseEntity.ok(jobDetails);
    }
    
    
    // lấy job đang là combo
    @GetMapping("/jobs/combo")
    public ResponseEntity<List<Map<String, Object>>> getComboJobs() {
        List<Map<String, Object>> comboJobs = cleanerJobService.getComboJobs();
        
        if (comboJobs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of(Map.of("message", "No combo jobs found")));
        }

        return ResponseEntity.ok(comboJobs);
    }



    



    

    
    
    // LUỒNG 2 
    
    @GetMapping(value = "/{cleanerId}/jobs")
    public ResponseEntity<List<Map<String, Object>>> getJobsBookedForCleaner(@PathVariable Long cleanerId) {
        List<Map<String, Object>> jobs = cleanerJobService.getJobsBookedForCleaner(cleanerId);
        if (jobs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of(Map.of("message", "No jobs found for cleaner")));
        }
        return ResponseEntity.ok(jobs);
    }
    
 // Cleaner chấp nhận hoặc từ chối công việc mà customer đã đặt cho mình
    @PutMapping("/job/{jobId}/accept-reject")
    public ResponseEntity<Map<String, Object>> acceptOrRejectJob(
            @PathVariable("jobId") Long jobId, 
            @RequestParam("action") String action) {
        
        Map<String, Object> response = cleanerJobService.acceptOrRejectJob(jobId, action);
        
        return ResponseEntity.ok(response);
    }


}
