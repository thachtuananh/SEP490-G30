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
import java.util.Date;
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
    @Scheduled(cron = "0 0 * * * *")
    public void checkJobAndDelete() {
        System.out.println("Check Job and Delete");
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourAgo = now.minusHours(1); // Lấy thời gian cách đây 1 tiếng

        System.out.println("Check Job and Delete: " + now);

        List<Job> jobs = jobRepository.getJobsByStatus(JobStatus.OPEN);
        for (Job job : jobs) {
            if (job.getScheduledTime().isBefore(oneHourAgo)) { // Nếu scheduledTime < now - 1h
                job.setStatus(JobStatus.AUTO_CANCELLED);
                jobRepository.save(job); // Cập nhật vào DB
                NotificationDTO notification = new NotificationDTO(job.getCustomer().getId(), "Đơn hàng của bạn đã bị hủy do không có người nhận việc", "AUTO_MESSAGE", LocalDate.now());
                notificationService.processNotification(notification, "CUSTOMER", job.getCustomer().getId());
                System.out.println("Job " + job.getId() + " đã bị hủy.");
            }
        }
    }
}
