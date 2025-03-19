package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.JobSummaryDTO;
import com.example.homecleanapi.services.CleanerJobService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Employee Jobs API")
@SecurityRequirement(name = "BearerAuth")
@RequestMapping("/api/cleaner")
public class CleanerJobController {

    @Autowired
    private CleanerJobService cleanerJobService;

    // Xem danh sách các công việc "Open"
    @GetMapping(value = "/jobs")
    public ResponseEntity<List<JobSummaryDTO>> getOpenJobs() {
        List<JobSummaryDTO> openJobs = cleanerJobService.getOpenJobs();
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
    // LUỒNG 2 
    
    @GetMapping(value = "/{cleanerId}/jobs")
    public ResponseEntity<List<Map<String, Object>>> getJobsBookedForCleaner(@RequestParam Long cleanerId) {
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
