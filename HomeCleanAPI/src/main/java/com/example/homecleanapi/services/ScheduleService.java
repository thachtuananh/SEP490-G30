package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.NotificationDTO;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.JobApplication;
import com.example.homecleanapi.repositories.JobApplicationRepository;
import com.example.homecleanapi.repositories.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleService {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final JobRepository jobRepository;
    private final NotificationService notificationService;
    private final JobApplicationRepository jobApplicationRepository;

    public ScheduleService(JobRepository jobRepository, NotificationService notificationService, JobApplicationRepository jobApplicationRepository) {
        this.jobRepository = jobRepository;
        this.notificationService = notificationService;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    @Scheduled(cron = "0 * * * * *")
    public void checkJobAndDelete() {
        System.out.println("Check Job and Delete");

        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(zoneId);
        System.out.println("Check Job and Delete at: " + now);

        // Lấy tất cả job OPEN
        List<Job> jobs = jobRepository.findAllByStatus(JobStatus.OPEN);
        System.out.println("Tổng số job OPEN: " + jobs.size());

        List<Job> updatedJobs = new ArrayList<>();
        List<JobApplication> applicationsToUpdate = new ArrayList<>();

        for (Job job : jobs) {
            // Kiểm tra nếu đã quá thời gian
            if (job.getScheduledTime().isBefore(now)) {
                if (job.getStatus() != JobStatus.AUTO_CANCELLED) {
                    // Đổi trạng thái Job
                    job.setStatus(JobStatus.AUTO_CANCELLED);
                    updatedJobs.add(job);

                    // Gửi thông báo đến Customer
                    NotificationDTO notification = new NotificationDTO(
                            job.getCustomer().getId(),
                            "Đơn hàng của bạn đã bị hủy do không có người nhận việc",
                            "AUTO_MESSAGE",
                            LocalDate.now(zoneId)
                    );
                    notificationService.processNotification(notification, "CUSTOMER", job.getCustomer().getId());

                    System.out.println("Đã tự động hủy Job " + job.getId());
                }

                // Lấy tất cả JobApplication liên quan đến Job
                List<JobApplication> jobApplications = jobApplicationRepository.findByJob_Customer_Id(job.getId());
                for (JobApplication application : jobApplications) {
                    String status = application.getStatus();
                    if (!"Rejected".equals(status) && !"Accepted".equals(status)) {
                        application.setStatus("Rejected");
                        applicationsToUpdate.add(application);

                        // Gửi thông báo đến Cleaner
                        NotificationDTO cleanerNotification = new NotificationDTO(
                                job.getCustomer().getId(),
                                "Công việc của bạn đã bị hủy do người thuê chưa xác nhận thuê",
                                "AUTO_MESSAGE",
                                LocalDate.now(zoneId)
                        );
                        notificationService.processNotification(cleanerNotification, "CLEANER", application.getCleaner().getId());
                    }
                }
            } else {
                System.out.println("Job " + job.getId() + " vẫn còn thời gian hợp lệ.");
            }
        }

        // Lưu các thay đổi nếu có
        if (!updatedJobs.isEmpty()) {
            jobRepository.saveAll(updatedJobs);
            System.out.println("Đã cập nhật trạng thái cho " + updatedJobs.size() + " công việc.");
        }

        if (!applicationsToUpdate.isEmpty()) {
            jobApplicationRepository.saveAll(applicationsToUpdate);
            System.out.println("Đã cập nhật trạng thái cho " + applicationsToUpdate.size() + " ứng tuyển.");
        }
    }
}


