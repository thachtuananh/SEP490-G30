package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.BookJobRequest;
import com.example.homecleanapi.models.CustomerAddresses;
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
@Tag(name = "Customer API")
@SecurityRequirement(name = "BearerAuth")
@RequestMapping("/api/customer")
public class JobController {

	@Autowired
	private JobService jobService;

	@Autowired
	private CleanerJobService cleanerJobService;

	// API cho customer tạo job
	@PostMapping(value = "/{customerId}/createjob")
	public ResponseEntity<Map<String, Object>> createJob(@RequestBody BookJobRequest request,
			@RequestParam Long customerId) {
		Map<String, Object> response = jobService.bookJob(customerId, request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	// Xem danh sách cleaner đã apply cho job
	@GetMapping(value = "/applications/{jobId}")
	public ResponseEntity<List<Map<String, Object>>> getJobApplications(@PathVariable Long jobId) {
		List<Map<String, Object>> jobApplications = cleanerJobService.getApplicationsForJob(jobId);
		if (jobApplications.isEmpty()) {
			return ResponseEntity.status(404).body(List.of(Map.of("message", "No applications found")));
		}
		return ResponseEntity.ok(jobApplications);
	}

	@PostMapping(value = "/accept-job/{jobId}/cleaner/{cleanerId}/customer/{customerId}")
	public ResponseEntity<Map<String, Object>> acceptCleanerForJob(@PathVariable Long jobId,
			@PathVariable Long cleanerId, @PathVariable Long customerId) {
		// Gọi service để accept cleaner cho job
		Map<String, Object> response = cleanerJobService.acceptOrRejectApplication(jobId, cleanerId, customerId,
				"accept");
		return ResponseEntity.ok(response);
	}

	@PostMapping(value = "/reject-job/{jobId}/cleaner/{cleanerId}/customer/{customerId}")
	public ResponseEntity<Map<String, Object>> rejectCleanerForJob(@PathVariable Long jobId,
			@PathVariable Long cleanerId, @PathVariable Long customerId) {
		// Gọi service để reject cleaner cho job
		Map<String, Object> response = cleanerJobService.acceptOrRejectApplication(jobId, cleanerId, customerId,
				"reject");
		return ResponseEntity.ok(response);
	}

	// Chuyển trạng thái job sang STARTED
	@PostMapping(value = "/job/start/{jobId}/{customerId}")
	public ResponseEntity<Map<String, Object>> startJob(
	        @PathVariable("jobId") Long jobId,
	        @RequestParam Long customerId) {
	    Map<String, Object> response = jobService.updateJobStatusToStarted(jobId, customerId);
	    return ResponseEntity.ok(response);
	}
	
	@GetMapping("/{customerId}/addresses")
    public ResponseEntity<List<CustomerAddresses>> getCustomerAddresses(@PathVariable("customerId") Integer customerId) {
        List<CustomerAddresses> addresses = jobService.getAddressesByCustomerId(customerId);
        if (addresses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(addresses);
    }
	
	
	
	// LUỒNG CODE 2 
	
	@GetMapping("/cleaners/online")
    public ResponseEntity<List<Map<String, Object>>> getOnlineCleaners() {
        List<Map<String, Object>> onlineCleaners = cleanerJobService.getOnlineCleaners();

        if (onlineCleaners.isEmpty()) {
            return ResponseEntity.status(404).body(List.of(Map.of("message", "No online cleaners found")));
        }

        return ResponseEntity.ok(onlineCleaners);
    }
	
	@GetMapping("/cleaner/{cleanerId}")
    public ResponseEntity<Map<String, Object>> getCleanerDetails(@PathVariable Long cleanerId) {
        Map<String, Object> cleanerDetails = cleanerJobService.getCleanerDetails(cleanerId);

        if (cleanerDetails.containsKey("message")) {
            return ResponseEntity.status(404).body(cleanerDetails);
        }

        return ResponseEntity.ok(cleanerDetails);
    }
	
	@PostMapping(value = "/{customerId}/bookjob/{cleanerId}")
    public ResponseEntity<Map<String, Object>> bookJobForCleaner(
            @RequestParam Long customerId, 
            @PathVariable Long cleanerId, 
            @RequestBody BookJobRequest request) {

        Map<String, Object> response = cleanerJobService.bookJobForCleaner(customerId, cleanerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
	


}
