package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.JobSummaryDTO;
import com.example.homecleanapi.services.CleanerJobService;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cleaner")
public class CleanerJobController {

    @Autowired
    private CleanerJobService cleanerJobService;

    // Xem danh sách các công việc "Open"
    @GetMapping("/jobs")
    public ResponseEntity<List<JobSummaryDTO>> getOpenJobs() {
        List<JobSummaryDTO> openJobs = cleanerJobService.getOpenJobs();
        return ResponseEntity.ok(openJobs);
    }

    // Xem chi tiết công việc
    @GetMapping("/job/{jobId}")
    public ResponseEntity<Map<String, Object>> getJobDetails(@PathVariable("jobId") Long jobId) {
        Map<String, Object> jobDetails = cleanerJobService.getJobDetails(jobId);
        if (jobDetails == null) {
            return ResponseEntity.status(404).body(null);
        }
        return ResponseEntity.ok(jobDetails);
    }

    // Cleaner apply vào job
    @PostMapping("/apply-job/{jobId}")
    public ResponseEntity<Map<String, Object>> applyForJob(@PathVariable("jobId") Long jobId) {
        Map<String, Object> response = cleanerJobService.applyForJob(jobId);
        return ResponseEntity.ok(response);
    }

    // Chuyển trạng thái công việc sang ARRIVED
    @PostMapping("/job/arrived/{jobId}")
    public ResponseEntity<Map<String, Object>> setJobArrived(@PathVariable("jobId") Long jobId) {
        Map<String, Object> response = cleanerJobService.updateJobStatusToArrived(jobId);
        return ResponseEntity.ok(response);
    }

    // Chuyển trạng thái công việc sang COMPLETED
    @PostMapping("/job/completed/{jobId}")
    public ResponseEntity<Map<String, Object>> completeJob(@PathVariable("jobId") Long jobId) {
        Map<String, Object> response = cleanerJobService.updateJobStatusToCompleted(jobId);
        return ResponseEntity.ok(response);
    }
}
