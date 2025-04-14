package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.FeedbackRequest;
import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;
import com.example.homecleanapi.enums.JobStatus; // Import Enum JobStatus

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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



    @Autowired
    private EmployeeRepository cleanerRepository;

    @Autowired
    private CleanerFeedbackRepository cleanerFeedbackRepository;

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

        // Kiểm tra xem đã quá 24 giờ chưa kể từ khi feedback được tạo
        LocalDateTime createdAt = existingFeedback.getCreatedAt(); // Giả sử bạn lưu thời gian tạo feedback trong trường createdAt
        LocalDateTime currentTime = LocalDateTime.now();

        long hoursDifference = ChronoUnit.HOURS.between(createdAt, currentTime);
        if (hoursDifference > 24) {
            response.put("message", "Bạn chỉ có thể cập nhật đánh giá trong 24h từ khi đánh giá lần đầu");
            response.put("status", HttpStatus.FORBIDDEN);
            return response;
        }

        // Kiểm tra nếu feedback đã được cập nhật trước đó
        if (existingFeedback.getUpdatedAt() != null) {
            response.put("message", "Bạn chỉ có thể chỉnh sửa đánh giá một lần");
            response.put("status", HttpStatus.FORBIDDEN);
            return response;
        }

        // Cập nhật rating nếu có giá trị mới
        if (feedbackRequest.getRating() != null) {
            existingFeedback.setRating(feedbackRequest.getRating());
        }

        // Cập nhật comment nếu có giá trị mới
        if (feedbackRequest.getComment() != null && !feedbackRequest.getComment().isEmpty()) {
            existingFeedback.setComment(feedbackRequest.getComment());
        }

        // Cập nhật thời gian cập nhật feedback
        existingFeedback.setUpdatedAt(LocalDateTime.now());

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


            if (!jobApplication.getStatus().equals("Accepted")) {
                continue; 
            }

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


// CLEANER
    public Map<String, Object> createFeedbackCleaner(Long cleanerId, Long jobId, FeedbackRequest feedbackRequest) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem job có tồn tại không
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        Job job = jobOpt.get();

        // Kiểm tra xem cleaner có phải là người thực hiện công việc này không
        Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
        if (!cleanerOpt.isPresent()) {
            response.put("message", "Cleaner not found");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        Employee cleaner = cleanerOpt.get();

        // Kiểm tra nếu job đã có feedback từ cleaner này rồi
        Optional<CleanerFeedback> existingFeedbackOpt = cleanerFeedbackRepository
                .findByJobAndCleaner(job, cleaner);
        if (existingFeedbackOpt.isPresent()) {
            response.put("message", "Cleaner has already provided feedback for this job");
            response.put("status", HttpStatus.BAD_REQUEST);
            return response;
        }

        // Tạo mới feedback cho job
        CleanerFeedback feedback = new CleanerFeedback();
        feedback.setJob(job);
        feedback.setCleaner(cleaner);
        feedback.setRating(feedbackRequest.getRating());
        feedback.setComment(feedbackRequest.getComment());
        feedback.setCreatedAt(LocalDateTime.now());

        // Lưu feedback vào cơ sở dữ liệu
        cleanerFeedbackRepository.save(feedback);

        // Thành công, trả về phản hồi
        response.put("message", "Feedback created successfully");
        response.put("status", HttpStatus.CREATED);
        return response;
    }



    public Map<String, Object> updateCleanerFeedback(Long cleanerId, Long jobId, FeedbackRequest feedbackRequest) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem job có tồn tại không
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        // Kiểm tra xem cleaner có phải là người thực hiện công việc này không
        Job job = jobOpt.get();
//        if (job.getCleaner() == null || job.getCleaner().getId().longValue() != cleanerId.longValue()) {
//            response.put("message", "You are not authorized to update feedback for this job");
//            response.put("status", HttpStatus.FORBIDDEN);
//            return response;
//        }

        // Kiểm tra trạng thái công việc là DONE
        if (!job.getStatus().equals(JobStatus.DONE)) {
            response.put("message", "Feedback can only be updated for completed jobs (status = DONE)");
            response.put("status", HttpStatus.FORBIDDEN);
            return response;
        }

        // Kiểm tra xem cleaner đã đánh giá cho công việc này chưa
        Optional<CleanerFeedback> existingFeedbackOpt = cleanerFeedbackRepository.findByJob_IdAndCleaner_Id(jobId, cleanerId);
        if (!existingFeedbackOpt.isPresent()) {
            response.put("message", "No feedback found to update");
            response.put("status", HttpStatus.NOT_FOUND);
            return response;
        }

        // Lấy feedback hiện tại
        CleanerFeedback existingFeedback = existingFeedbackOpt.get();

        // Kiểm tra xem đã quá 24 giờ chưa kể từ khi feedback được tạo
        LocalDateTime createdAt = existingFeedback.getCreatedAt(); // Giả sử bạn lưu thời gian tạo feedback trong trường createdAt
        LocalDateTime currentTime = LocalDateTime.now();

        long hoursDifference = ChronoUnit.HOURS.between(createdAt, currentTime);
        if (hoursDifference > 24) {
            response.put("message", "Bạn chỉ có thể cập nhật đánh giá trong 24h từ khi đánh giá lần đầu");
            response.put("status", HttpStatus.FORBIDDEN);
            return response;
        }

        // Kiểm tra nếu feedback đã được cập nhật trước đó
        if (existingFeedback.getUpdatedAt() != null) {
            response.put("message", "Bạn chỉ có thể chỉnh sửa đánh giá một lần");
            response.put("status", HttpStatus.FORBIDDEN);
            return response;
        }

        // Cập nhật rating nếu có giá trị mới
        if (feedbackRequest.getRating() != null) {
            existingFeedback.setRating(feedbackRequest.getRating());
        }

        // Cập nhật comment nếu có giá trị mới
        if (feedbackRequest.getComment() != null && !feedbackRequest.getComment().isEmpty()) {
            existingFeedback.setComment(feedbackRequest.getComment());
        }

        // Cập nhật thời gian cập nhật feedback
        existingFeedback.setUpdatedAt(LocalDateTime.now());

        // Lưu feedback cập nhật vào cơ sở dữ liệu
        cleanerFeedbackRepository.save(existingFeedback);

        // Thành công, trả về phản hồi
        response.put("message", "Feedback updated successfully");
        response.put("status", HttpStatus.OK);
        return response;
    }




}






