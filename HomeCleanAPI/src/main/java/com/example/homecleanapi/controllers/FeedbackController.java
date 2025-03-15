package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.FeedbackRequest;
import com.example.homecleanapi.services.FeedbackService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Feedback API")
@SecurityRequirement(name = "BearerAuth")
@RequestMapping("/api/customer")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    // Customer tạo feedback và đánh giá cho job
    @PostMapping("/{customerId}/job/{jobId}/createfeedback")
    public ResponseEntity<Map<String, Object>> createFeedback(@PathVariable Long customerId,@PathVariable Long jobId,@RequestBody FeedbackRequest feedbackRequest) {

        Map<String, Object> response = feedbackService.createFeedback(customerId, jobId, feedbackRequest);
        return new ResponseEntity<>(response, (HttpStatus) response.get("status"));
    }
    
    
    @PutMapping("/{customerId}/job/{jobId}/updatefeedback")
    public ResponseEntity<Map<String, Object>> updateFeedback(@PathVariable Long customerId,@PathVariable Long jobId,@RequestBody FeedbackRequest feedbackRequest) {

        Map<String, Object> response = feedbackService.updateFeedback(customerId, jobId, feedbackRequest);
        return new ResponseEntity<>(response, (HttpStatus) response.get("status"));
    }
    
    
    @GetMapping("/{customerId}/feedbacks")
    public ResponseEntity<List<Map<String, Object>>> getCustomerFeedbacks(@PathVariable Long customerId) {
        List<Map<String, Object>> feedbacks = feedbackService.getFeedbacksByCustomerId(customerId);

        if (feedbacks.isEmpty()) {
            return ResponseEntity.noContent().build();  
        }

        return ResponseEntity.ok(feedbacks); 
    }
    
    @GetMapping("/{customerId}/job/{jobId}/feedback")
    public ResponseEntity<Map<String, Object>> getFeedbackDetails(@PathVariable Long customerId, @PathVariable Long jobId) {
        Map<String, Object> response = feedbackService.getFeedbackDetails(customerId, jobId);
        return new ResponseEntity<>(response, (HttpStatus) response.get("status"));
    }
}
