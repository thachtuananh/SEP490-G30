package com.example.homecleanapi.controllers;

import com.example.homecleanapi.services.CleanerJobService;
import com.example.homecleanapi.services.FindCleanerService;
import com.example.homecleanapi.dtos.JobSummaryDTO;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Cleaner Job API")
@RestController
@SecurityRequirement(name = "BearerAuth")
@RequestMapping("/api/cleaner")
public class CleanerJobController {

    @Autowired
    private CleanerJobService cleanerJobService;

    @Autowired
    private FindCleanerService findCleanerService;



    // Xem danh sách các công việc "Open"
    @GetMapping(value = "/jobs/{cleanerId}")
    public ResponseEntity<List<JobSummaryDTO>> getNearbyOpenJobs(@PathVariable Long cleanerId) {
        List<JobSummaryDTO> nearbyOpenJobs = findCleanerService.getNearbyOpenJobs(cleanerId, 6);
        return ResponseEntity.ok(nearbyOpenJobs);
    }

//    @GetMapping(value = "/jobs/{cleanerId}")
//    public ResponseEntity<List<JobSummaryDTO>> getOpenJobs(@PathVariable Long cleanerId) {
//        List<JobSummaryDTO> openJobs = cleanerJobService.getOpenJobs(cleanerId);
//        return ResponseEntity.ok(openJobs);
//    }



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


        if (response.get("message").equals("Bạn đang ứng tuyển hoặc đã có lịch làm việc trong một công việc cách công việc này nhỏ hơn 2 giờ")) {
            return ResponseEntity.badRequest().body(response);
        }

        return ResponseEntity.ok(response);
    }

    // hủy job mà cleaner đã apply
    @PostMapping(value = "/cancel-application/{jobId}")
    public ResponseEntity<Map<String, Object>> cancelJobApplication(@PathVariable Long jobId) {
        Map<String, Object> response = cleanerJobService.cancelJobApplication(jobId);
        if (response.containsKey("message") && response.get("message").equals("không tìm thấy công việc đã ứng tuyển")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of(Map.of("message", "không có công việc hoàn thành")));
        }

        return ResponseEntity.ok(completedJobs);
    }
    
    // ds jobs đang làm
    @GetMapping("/{cleanerId}/jobs/doing")
    public ResponseEntity<List<Map<String, Object>>> getInProgressJobs(@PathVariable Long cleanerId) {
        List<Map<String, Object>> inProgressJobs = cleanerJobService.getInProgressJobs(cleanerId);
        if (inProgressJobs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of(Map.of("message", "không có công việc đang tiến hành")));
        }
        return ResponseEntity.ok(inProgressJobs);
    }

    // ds job mà cleaner đã apply
    @GetMapping("/{cleanerId}/jobs/applied")
    public ResponseEntity<List<Map<String, Object>>> getAppliedJobs2(@PathVariable Long cleanerId) {
        List<Map<String, Object>> appliedJobs = cleanerJobService.getAppliedJobsForCleaner(cleanerId);
        if (appliedJobs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of(Map.of("message", "không có công việc nào mà bạn đã ứng tuyển")));
        }
        return ResponseEntity.ok(appliedJobs);
    }


    // list job theo service và số lượng 
    @GetMapping("/jobs/by-service/{cleanerId}")
    public ResponseEntity<Map<String, Object>> getJobsByService(@PathVariable Long cleanerId) {
        Map<String, Object> jobsByService = cleanerJobService.getJobsByService(cleanerId);

        if (jobsByService.isEmpty()) {
            jobsByService.put("message", "khoong có công việc nào thuộc dịch vụ này");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(jobsByService);
        }

        return ResponseEntity.ok(jobsByService);
    }



    // xem job thuộc filter service
    @GetMapping("/jobs/details/by-service/{serviceId}/cleaner/{cleanerId}")
    public ResponseEntity<List<Map<String, Object>>> getJobsDetailsByService(
            @PathVariable Long serviceId,
            @PathVariable Long cleanerId) {

        List<Map<String, Object>> jobDetails = cleanerJobService.getJobsDetailsByService(serviceId, cleanerId);

        if (jobDetails.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(List.of(Map.of("message", "không tìm thấy công viec nào")));
        }

        return ResponseEntity.ok(jobDetails);
    }



    // lấy job đang là combo
    @GetMapping("/jobs/combo/{cleanerId}")
    public ResponseEntity<List<Map<String, Object>>> getComboJobs(@PathVariable Long cleanerId) {
        List<Map<String, Object>> comboJobs = cleanerJobService.getComboJobs(cleanerId);

        if (comboJobs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of(Map.of("message", "không có công việc combo")));
        }

        return ResponseEntity.ok(comboJobs);
    }


    @PutMapping("/{cleanerId}/addresses/{addressId}/set-current")
    public ResponseEntity<String> setCurrentAddress(@PathVariable("cleanerId") Integer cleanerId,
                                                    @PathVariable("addressId") Integer addressId) {
        boolean success = cleanerJobService.setCurrentAddress(cleanerId, addressId);

        if (success) {
            return ResponseEntity.ok("Address set as current successfully");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("cập nhật vị trí thất bại");
        }
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

    @GetMapping("/{cleanerId}/viewcustomer/{customerId}")
    public ResponseEntity<Map<String, Object>> getCustomerDetails(@PathVariable Long cleanerId, @PathVariable Long customerId) {
        // Call service to get customer details
        Map<String, Object> response = cleanerJobService.getCustomerDetails(cleanerId, customerId);

        // Kiểm tra xem trạng thái của response có phải là HttpStatus hay không
        if (response.get("status") instanceof HttpStatus) {
            return new ResponseEntity<>(response, (HttpStatus) response.get("status"));
        } else {
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);  // Nếu có lỗi, trả về lỗi server
        }
    }



}
