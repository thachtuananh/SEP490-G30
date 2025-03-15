package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.FeedbackRequest;
import com.example.homecleanapi.models.Feedback;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.repositories.FeedbackRepository;
import com.example.homecleanapi.repositories.JobRepository;
import com.example.homecleanapi.enums.JobStatus; // Import Enum JobStatus

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private JobRepository jobRepository;

    // Kiểm tra xem customer đã đánh giá cho công việc này chưa
    private boolean checkIfAlreadyReviewed(Long customerId, Long jobId) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findByJob_IdAndJob_Customer_Id(jobId, customerId);
        return feedbackOpt.isPresent();
    }

    // Tạo feedback mới
    public Map<String, Object> createFeedback(Long customerId, Long jobId, FeedbackRequest feedbackRequest) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem job có tồn tại không
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        // Kiểm tra xem customer có phải là người tạo công việc này không
        Job job = jobOpt.get();
        if (job.getCustomer().getId().longValue() != customerId.longValue()) {
            response.put("message", "You are not authorized to leave feedback for this job");
            response.put("status", HttpStatus.FORBIDDEN);
            return response;
        }

        // Kiểm tra trạng thái công việc là DONE
        if (!job.getStatus().equals(JobStatus.DONE)) {
            response.put("message", "Feedback can only be provided for completed jobs (status = DONE)");
            response.put("status", HttpStatus.FORBIDDEN);
            return response;
        }

        // Kiểm tra xem customer đã đánh giá cho công việc này chưa
        if (checkIfAlreadyReviewed(customerId, jobId)) {
            response.put("message", "You have already reviewed this job");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        // Tạo feedback mới
        Feedback feedback = new Feedback();
        feedback.setJob(job);
        feedback.setRating(feedbackRequest.getRating());
        feedback.setComment(feedbackRequest.getComment());

        // Lưu feedback vào cơ sở dữ liệu
        feedbackRepository.save(feedback);

        // Thành công, trả về phản hồi
        response.put("message", "Feedback created successfully");
        response.put("status", HttpStatus.CREATED);
        return response;
    }
    
    public Map<String, Object> updateFeedback(Long customerId, Long jobId, FeedbackRequest feedbackRequest) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem job có tồn tại không
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        // Kiểm tra xem customer có phải là người tạo công việc này không
        Job job = jobOpt.get();
        if (job.getCustomer().getId().longValue() != customerId.longValue()) {
            response.put("message", "You are not authorized to update feedback for this job");
            response.put("status", HttpStatus.FORBIDDEN);
            return response;
        }

        // Kiểm tra trạng thái công việc là DONE
        if (!job.getStatus().equals(JobStatus.DONE)) {
            response.put("message", "Feedback can only be updated for completed jobs (status = DONE)");
            response.put("status", HttpStatus.FORBIDDEN);
            return response;
        }

        // Kiểm tra xem customer đã đánh giá cho công việc này chưa
        Optional<Feedback> existingFeedbackOpt = feedbackRepository.findByJob_IdAndJob_Customer_Id(jobId, customerId);
        if (!existingFeedbackOpt.isPresent()) {
            response.put("message", "No feedback found to update");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        // Cập nhật feedback
        Feedback existingFeedback = existingFeedbackOpt.get();
        existingFeedback.setRating(feedbackRequest.getRating());
        existingFeedback.setComment(feedbackRequest.getComment());

        // Lưu feedback cập nhật vào cơ sở dữ liệu
        feedbackRepository.save(existingFeedback);

        // Thành công, trả về phản hồi
        response.put("message", "Feedback updated successfully");
        response.put("status", HttpStatus.OK);
        return response;
    }
}
