package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.BookJobRequest;
import com.example.homecleanapi.dtos.CleanerSessionInfo;
import com.example.homecleanapi.models.CustomerAddresses;
import com.example.homecleanapi.services.CleanerJobService;
import com.example.homecleanapi.services.JobService;
import com.example.homecleanapi.utils.UserStatusWebSocketHandler;

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
@Tag(name = "Customer API")
@SecurityRequirement(name = "BearerAuth")
@RequestMapping("/api/customer")
public class CustomerJobController {

	@Autowired
	private JobService jobService;

	@Autowired
	private CleanerJobService cleanerJobService;

	// API cho customer tạo job
	@PostMapping(value = "/{customerId}/createjob")
	public ResponseEntity<Map<String, Object>> createJob(@RequestBody BookJobRequest request,
			@PathVariable Long customerId) {
		Map<String, Object> response = jobService.bookJob(customerId, request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	// Xem danh sách cleaner đã apply cho job
	@GetMapping(value = "/applications/{customerId}/{jobId}")
	public ResponseEntity<List<Map<String, Object>>> getJobApplications(
	    @PathVariable Long customerId, 
	    @PathVariable Long jobId) {
	    
	    // Truyền customerId và jobId vào phương thức để xác thực
	    List<Map<String, Object>> jobApplications = cleanerJobService.getApplicationsForJob(jobId, customerId);
	    
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
	        @PathVariable("customerId") Long customerId) { 
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
	
	@PutMapping("/{customerId}/addresses/{addressId}/set-default")
    public ResponseEntity<String> setDefaultAddress(@PathVariable("customerId") Integer customerId,
                                                    @PathVariable("addressId") Integer addressId) {
        boolean success = jobService.setDefaultAddressForCustomer(customerId, addressId);
        if (success) {
            return ResponseEntity.ok("Default address updated successfully");
        } else {
            return ResponseEntity.status(400).body("Failed to update default address");
        }
    }
	
	// Chuyển trạng thái công việc sang DONE sau khi Cleaner đã hoàn thành
	@PostMapping(value = "/job/done/customer/{jobId}")
    public ResponseEntity<Map<String, Object>> markJobAsDone(@PathVariable("jobId") Long jobId) {
        Map<String, Object> response = jobService.updateJobStatusToDone(jobId); 
        return ResponseEntity.ok(response);
    }
	
	@GetMapping("/{customerId}/listjobsbook")
    public ResponseEntity<List<Map<String, Object>>> getBookedJobs(@PathVariable("customerId") Long customerId) {
        List<Map<String, Object>> bookedJobs = jobService.getBookedJobsForCustomer(customerId);
        if (bookedJobs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(bookedJobs);
    }
	
	@GetMapping("/viewdetailcleaner/{cleanerId}")
	public ResponseEntity<Map<String, Object>> getCleanerDetailnonedk(@PathVariable Long cleanerId) {
	    Map<String, Object> cleanerDetails = cleanerJobService.getCleanerDetailnone(cleanerId);

	    if (cleanerDetails.containsKey("message")) {
	        return ResponseEntity.status(404).body(cleanerDetails);  
	    }

	    return ResponseEntity.ok(cleanerDetails);  
	}


	
	// hủy job
	@PostMapping("/{customerId}/cancel-job/{jobId}")
    public ResponseEntity<Map<String, Object>> cancelJob(@PathVariable("customerId") Long customerId, @PathVariable("jobId") Long jobId) {
        Map<String, Object> response = jobService.cancelJobForCustomer(customerId, jobId);
        return ResponseEntity.ok(response);
    }
	
	// LUỒNG CODE 2 
	
//	@GetMapping("/cleaners/online")
//    public ResponseEntity<List<Map<String, Object>>> getOnlineCleaners() {
//        List<Map<String, Object>> onlineCleaners = cleanerJobService.getOnlineCleaners();
//
//        if (onlineCleaners.isEmpty()) {
//            return ResponseEntity.status(404).body(List.of(Map.of("message", "No online cleaners found")));
//        }
//
//        return ResponseEntity.ok(onlineCleaners);
//    }
	@GetMapping("/cleaners/online")
	public ResponseEntity<List<Map<String, Object>>> getOnlineCleaners() {
	    Map<String, CleanerSessionInfo> onlineCleanersMap = UserStatusWebSocketHandler.getOnlineCleaners();

	    if (onlineCleanersMap.isEmpty()) {
	        return ResponseEntity.status(404).body(List.of(Map.of("message", "No online cleaners found")));
	    }

	    List<Map<String, Object>> onlineCleanersList = onlineCleanersMap.entrySet().stream()
	        .map(entry -> {
	            Map<String, Object> cleanerInfo = new HashMap<String, Object>();
	            cleanerInfo.put("id", entry.getKey());
	            cleanerInfo.put("name", entry.getValue().getCleanerName());
	            cleanerInfo.put("profileImage", entry.getValue().getProfileImage());
	            return cleanerInfo;
	        })
	        .toList();

	    return ResponseEntity.ok(onlineCleanersList);
	}

	
	@GetMapping("/viewdetailcleaneron/{cleanerId}")
    public ResponseEntity<Map<String, Object>> getCleanerDetails(@PathVariable Long cleanerId) {
        Map<String, Object> cleanerDetails = cleanerJobService.getCleanerDetails(cleanerId);

        if (cleanerDetails.containsKey("message")) {
            return ResponseEntity.status(404).body(cleanerDetails);
        }

        return ResponseEntity.ok(cleanerDetails);
    }
	
	@PostMapping(value = "/{customerId}/bookjob/{cleanerId}")
    public ResponseEntity<Map<String, Object>> bookJobForCleaner(
    		@PathVariable Long customerId, 
            @PathVariable Long cleanerId, 
            @RequestBody BookJobRequest request) {

        Map<String, Object> response = cleanerJobService.bookJobForCleaner(customerId, cleanerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
	


}
