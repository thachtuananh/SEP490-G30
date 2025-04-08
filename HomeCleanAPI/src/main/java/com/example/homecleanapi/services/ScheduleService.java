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
import java.util.ArrayList;
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

    @Scheduled(cron = "0 * * * * *")
    public void checkJobAndDelete() {
        System.out.println("Check Job and Delete");

        LocalDateTime now = LocalDateTime.now();
        System.out.println("Check Job and Delete at: " + now);

        // Lấy tất cả job OPEN
        List<Job> jobs = jobRepository.findAllByStatus(JobStatus.OPEN);
        System.out.println("Tổng số job OPEN: " + jobs.size());

        List<Job> updatedJobs = new ArrayList<>();

        for (Job job : jobs) {
            if (job.getScheduledTime().isBefore(now)) {
                if (job.getStatus() != JobStatus.AUTO_CANCELLED) {
                    job.setStatus(JobStatus.AUTO_CANCELLED);
                    updatedJobs.add(job);

                    // Gửi thông báo đến customer
                    NotificationDTO notification = new NotificationDTO(
                            job.getCustomer().getId(),
                            "Đơn hàng của bạn đã bị hủy do không có người nhận việc",
                            "AUTO_MESSAGE",
                            LocalDate.now()
                    );
                    notificationService.processNotification(notification, "CUSTOMER", job.getCustomer().getId());

                    System.out.println("Đã tự động hủy Job " + job.getId());
                }
            } else {
                System.out.println("Job " + job.getId() + " vẫn còn thời gian hợp lệ.");
            }
        }

        if (!updatedJobs.isEmpty()) {
            jobRepository.saveAll(updatedJobs);
            System.out.println("Đã cập nhật trạng thái cho " + updatedJobs.size() + " công việc.");
        } else {
            System.out.println("Không có công việc nào cần cập nhật trạng thái.");
        }
    }
}


