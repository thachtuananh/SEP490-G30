package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.FeedbackRequest;
import com.example.homecleanapi.models.Feedback;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.JobApplication;
import com.example.homecleanapi.repositories.FeedbackRepository;
import com.example.homecleanapi.repositories.JobApplicationRepository;
import com.example.homecleanapi.repositories.JobRepository;
import com.example.homecleanapi.enums.JobStatus; // Import Enum JobStatus

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private JobApplicationRepository jobApplicationRepository;

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

        // Lấy feedback hiện tại
        Feedback existingFeedback = existingFeedbackOpt.get();

        // Cập nhật rating nếu có giá trị mới
        if (feedbackRequest.getRating() != null) {
            existingFeedback.setRating(feedbackRequest.getRating());
        }

        // Cập nhật comment nếu có giá trị mới
        if (feedbackRequest.getComment() != null && !feedbackRequest.getComment().isEmpty()) {
            existingFeedback.setComment(feedbackRequest.getComment());
        }

        // Lưu feedback cập nhật vào cơ sở dữ liệu
        feedbackRepository.save(existingFeedback);

        // Thành công, trả về phản hồi
        response.put("message", "Feedback updated successfully");
        response.put("status", HttpStatus.OK);
        return response;
    }

    
    public List<Map<String, Object>> getFeedbacksByCustomerId(Long customerId) {
        // Tìm tất cả các job mà customer đã thực hiện
        List<JobApplication> jobApplications = jobApplicationRepository.findByJob_Customer_Id(customerId);
        List<Map<String, Object>> feedbackList = new ArrayList<Map<String,Object>>();

        // Duyệt qua các job mà customer đã thực hiện và lấy các feedback
        for (JobApplication jobApplication : jobApplications) {
            Job job = jobApplication.getJob(); // Lấy Job từ JobApplication

            // Lấy các feedback cho Job này
            List<Feedback> feedbacks = feedbackRepository.findByJobId(job.getId());

            // Lấy thông tin feedback
            for (Feedback feedback : feedbacks) {
                Map<String, Object> feedbackInfo = new HashMap<>();
                feedbackInfo.put("jobId", job.getId());
                feedbackInfo.put("rating", feedback.getRating());
                feedbackInfo.put("comment", feedback.getComment());
                feedbackList.add(feedbackInfo);
            }
        }

        return feedbackList;
    }
    
    
    public Map<String, Object> getFeedbackDetails(Long customerId, Long jobId) {
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
            response.put("message", "You are not authorized to view feedback for this job");
            response.put("status", HttpStatus.FORBIDDEN);
            return response;
        }

        // Lấy feedback cho job này của customer
        Optional<Feedback> feedbackOpt = feedbackRepository.findByJob_IdAndJob_Customer_Id(jobId, customerId);
        if (!feedbackOpt.isPresent()) {
            response.put("message", "Feedback not found");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        Feedback feedback = feedbackOpt.get();

        // Tạo response với thông tin feedback
        Map<String, Object> feedbackInfo = new HashMap<>();
        feedbackInfo.put("jobId", job.getId());
        feedbackInfo.put("rating", feedback.getRating());
        feedbackInfo.put("comment", feedback.getComment());

        response.put("feedback", feedbackInfo);
        response.put("status", HttpStatus.OK);
        return response;
    }
    
    public List<Map<String, Object>> getAllFeedbacksForCleaner(Long cleanerId) {
        List<Map<String, Object>> feedbackList = new ArrayList<>();

        List<JobApplication> jobApplications = jobApplicationRepository.findByCleanerId(cleanerId);

        for (JobApplication jobApplication : jobApplications) {
            Job job = jobApplication.getJob(); 

            // Lấy tất cả feedbacks cho Job này
            List<Feedback> feedbacks = feedbackRepository.findByJobId(job.getId());

            // Lấy thông tin feedback
            for (Feedback feedback : feedbacks) {
                Map<String, Object> feedbackInfo = new HashMap<>();
                feedbackInfo.put("jobId", job.getId());
                feedbackInfo.put("rating", feedback.getRating());
                feedbackInfo.put("comment", feedback.getComment());
                feedbackList.add(feedbackInfo);
            }
        }

        return feedbackList;
    }
    
    
}






