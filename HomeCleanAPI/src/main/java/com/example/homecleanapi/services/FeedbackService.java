package com.example.homecleanapi.services;

import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.Feedback;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.repositories.FeedbackRepository;
import com.example.homecleanapi.repositories.JobRepository;
import com.example.homecleanapi.CustomerError.CustomException;  // Import CustomException
import org.springframework.beans.factory.annotation.Autowired;
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

    public Map<String, Object> submitFeedback(Long customerId, Long jobId, Integer rating, String comment) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra job có tồn tại không
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            throw new CustomException("Không tìm thấy công việc với ID: " + jobId, "JOB_NOT_FOUND", "Không tồn tại công việc với ID bạn đã cung cấp.");
        }

        Job job = jobOpt.get();

        // Kiểm tra trạng thái job phải là DONE
        if (!job.getStatus().equals(JobStatus.DONE)) {
            throw new CustomException("Chỉ có thể gửi đánh giá cho công việc đã hoàn thành.", "JOB_NOT_DONE", "Công việc chưa hoàn thành, không thể đánh giá.");
        }

        // Kiểm tra rating phải trong khoảng từ 1 đến 5
        if (rating < 1 || rating > 5) {
            throw new CustomException("Đánh giá không hợp lệ.", "INVALID_RATING", "Đánh giá phải từ 1 đến 5.");
        }
        
        if (job.getCustomer().getId().longValue() != customerId) {
            throw new CustomException("Chỉ khách hàng đã đặt công việc mới có quyền đánh giá.", "UNAUTHORIZED", "Bạn không phải là người đã đặt công việc này.");
        }

        // Kiểm tra xem công việc này đã có feedback chưa
        Optional<Feedback> existingFeedbackOpt = feedbackRepository.findByJob_Id(jobId); // Kiểm tra jobId trong feedback
        if (existingFeedbackOpt.isPresent()) {
            throw new CustomException("Công việc này đã có đánh giá.", "FEEDBACK_ALREADY_EXISTS", "Mỗi công việc chỉ có thể có một đánh giá.");
        }

        // Tạo feedback mới
        Feedback feedback = new Feedback();
        feedback.setJob(job);
        feedback.setRating(rating);
        feedback.setComment(comment);

        // Lưu feedback vào cơ sở dữ liệu
        feedbackRepository.save(feedback);

        response.put("message", "Đánh giá đã được gửi thành công.");
        return response;
    }

    
    public Map<String, Object> updateFeedback(Long customerId, Long jobId, Integer rating, String comment) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra job có tồn tại không
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            throw new CustomException("Không tìm thấy công việc với ID: " + jobId, "JOB_NOT_FOUND", "Không tồn tại công việc với ID bạn đã cung cấp.");
        }

        Job job = jobOpt.get();

        // Kiểm tra trạng thái job phải là DONE
        if (!job.getStatus().equals(JobStatus.DONE)) {
            throw new CustomException("Chỉ có thể gửi đánh giá cho công việc đã hoàn thành.", "JOB_NOT_DONE", "Công việc chưa hoàn thành, không thể đánh giá.");
        }

        // Kiểm tra rating phải trong khoảng từ 1 đến 5
        if (rating < 1 || rating > 5) {
            throw new CustomException("Đánh giá không hợp lệ.", "INVALID_RATING", "Đánh giá phải từ 1 đến 5.");
        }

        // Kiểm tra xem công việc này đã có feedback chưa
        Optional<Feedback> existingFeedbackOpt = feedbackRepository.findByJob_Id(jobId); // Kiểm tra jobId trong feedback
        if (!existingFeedbackOpt.isPresent()) {
            throw new CustomException("Công việc này chưa có đánh giá.", "FEEDBACK_NOT_FOUND", "Không có đánh giá nào cho công việc này.");
        }

        Feedback feedback = existingFeedbackOpt.get();

        // Kiểm tra customerId, chỉ cho phép người tạo job chỉnh sửa feedback
        if (job.getCustomer().getId().longValue() != customerId) {
            throw new CustomException("Chỉ khách hàng đã tạo công việc mới có thể chỉnh sửa đánh giá.", "UNAUTHORIZED", "Bạn không phải là người đã tạo công việc này.");
        }

        // Cập nhật rating và comment của feedback
        feedback.setRating(rating);
        feedback.setComment(comment);

        // Lưu feedback đã cập nhật vào cơ sở dữ liệu
        feedbackRepository.save(feedback);

        response.put("message", "Đánh giá đã được cập nhật thành công.");
        return response;
    }

}
