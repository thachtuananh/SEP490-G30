package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.NotificationDTO;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.repositories.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduleService {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final JobRepository jobRepository;
    private final NotificationService notificationService;

    public ScheduleService(JobRepository jobRepository, NotificationService notificationService) {
        this.jobRepository = jobRepository;
        this.notificationService = notificationService;
    }

    // Chạy mỗi tiếng 1 lần
    @Scheduled(cron = "0 * * * * *")
    public void checkJobAndDelete() {
        System.out.println("Check Job and Delete");

        // Tạo một lần và sử dụng lại
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourAgo = now.minusHours(1); // Lấy thời gian cách đây 1 tiếng

        System.out.println("Check Job and Delete at: " + now);

        // Lấy tất cả các công việc với trạng thái OPEN và scheduledTime < one hour ago
        List<Job> jobs = jobRepository.getJobsByStatusAndScheduledTimeBefore(JobStatus.OPEN, oneHourAgo);

        // Kiểm tra nếu có job cần cập nhật
        if (jobs.isEmpty()) {
            System.out.println("Không có công việc nào cần hủy.");
            return;
        }

        // Duyệt qua tất cả các job cần hủy
        for (Job job : jobs) {
            job.setStatus(JobStatus.AUTO_CANCELLED);
            // Tạo NotificationDTO và gửi thông báo
            NotificationDTO notification = new NotificationDTO(job.getCustomer().getId(),
                    "Đơn hàng của bạn đã bị hủy do không có người nhận việc",
                    "AUTO_MESSAGE",
                    LocalDate.now());
            notificationService.processNotification(notification, "CUSTOMER", job.getCustomer().getId());

            System.out.println("Job " + job.getId() + " đã bị hủy.");
        }

        // Lưu tất cả các job đã bị hủy vào DB cùng một lúc
        jobRepository.saveAll(jobs);
        System.out.println("Đã cập nhật trạng thái cho " + jobs.size() + " công việc.");
    }

}
