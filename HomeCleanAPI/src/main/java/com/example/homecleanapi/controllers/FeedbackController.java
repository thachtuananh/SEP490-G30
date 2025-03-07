package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.FeedbackRequest;
import com.example.homecleanapi.services.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    // feedback cho job
    @PostMapping("/submit/{customerId}/{jobId}")
    public Map<String, Object> submitFeedback(@PathVariable Long customerId, 
                                              @PathVariable Long jobId, 
                                              @RequestBody FeedbackRequest request) {
        return feedbackService.submitFeedback(customerId, jobId, request.getRating(), request.getComment());
    }
    
    @PutMapping("/update/{customerId}/{jobId}")
    public Map<String, Object> updateFeedback(@PathVariable Long customerId, 
                                              @PathVariable Long jobId, 
                                              @RequestBody FeedbackRequest request) {
        // Truyền cả customerId, jobId, rating và comment vào service
        return feedbackService.updateFeedback(customerId, jobId, request.getRating(), request.getComment());
    }
}
