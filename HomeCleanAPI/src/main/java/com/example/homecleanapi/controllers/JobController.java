package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.BookJobRequest;
import com.example.homecleanapi.services.CleanerJobService;
import com.example.homecleanapi.services.JobService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Employee API")
@SecurityRequirement(name = "BearerAuth")
@RequestMapping("/api/customer")
public class JobController {

    @Autowired
    private JobService jobService;

    @Autowired
    private CleanerJobService cleanerJobService;

    // API cho customer tạo job
    @PostMapping("/create-job/{customerId}")
    public ResponseEntity<Map<String, Object>> createJob(@PathVariable Long customerId, @RequestBody BookJobRequest request) {
        Map<String, Object> response = jobService.bookJob(customerId, request); 
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }



    // Xem danh sách cleaner đã apply cho job
    @GetMapping("/applications/{jobId}")
    public ResponseEntity<List<Map<String, Object>>> getJobApplications(@PathVariable Long jobId) {
        List<Map<String, Object>> jobApplications = cleanerJobService.getApplicationsForJob(jobId);
        if (jobApplications.isEmpty()) {
            return ResponseEntity.status(404).body(List.of(Map.of("message", "No applications found")));
        }
        return ResponseEntity.ok(jobApplications);
    }



    @PostMapping("/accept-job/{customerId}/{jobId}/cleaner/{cleanerId}")
    public ResponseEntity<Map<String, Object>> acceptCleanerForJob(@PathVariable Long customerId, @PathVariable Long jobId, @PathVariable Long cleanerId) {
        Map<String, Object> response = cleanerJobService.acceptOrRejectApplication(customerId, jobId, cleanerId, "accept");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reject-job/{customerId}/{jobId}/cleaner/{cleanerId}")
    public ResponseEntity<Map<String, Object>> rejectCleanerForJob(@PathVariable Long customerId, @PathVariable Long jobId, @PathVariable Long cleanerId) {
        Map<String, Object> response = cleanerJobService.acceptOrRejectApplication(customerId, jobId, cleanerId, "reject");
        return ResponseEntity.ok(response);
    }


    // Chuyển trạng thái job sang STARTED
    @PostMapping("/job/start/{jobId}/customer/{customerId}")
    public ResponseEntity<Map<String, Object>> startJob(@PathVariable("jobId") Long jobId, @PathVariable("customerId") Long customerId) {
        Map<String, Object> response = jobService.updateJobStatusToStarted(jobId, customerId);
        return ResponseEntity.ok(response);
    }

}
