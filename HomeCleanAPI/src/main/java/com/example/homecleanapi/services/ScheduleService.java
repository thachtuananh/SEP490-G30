package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.NotificationDTO;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.CustomerWallet;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.JobApplication;
import com.example.homecleanapi.models.TransactionHistory;
import com.example.homecleanapi.repositories.CustomerWalletRepository;
import com.example.homecleanapi.repositories.JobApplicationRepository;
import com.example.homecleanapi.repositories.JobRepository;
import com.example.homecleanapi.repositories.TransactionHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final JobRepository jobRepository;
    private final NotificationService notificationService;
    private final JobApplicationRepository jobApplicationRepository;
    private final CustomerWalletRepository customerWalletRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;

    public ScheduleService(JobRepository jobRepository, NotificationService notificationService, JobApplicationRepository jobApplicationRepository, CustomerWalletRepository customerWalletRepository, TransactionHistoryRepository transactionHistoryRepository) {
        this.jobRepository = jobRepository;
        this.notificationService = notificationService;
        this.jobApplicationRepository = jobApplicationRepository;
        this.customerWalletRepository = customerWalletRepository;
        this.transactionHistoryRepository = transactionHistoryRepository;
    }

    @Scheduled(cron = "0 * * * * *")
    public void checkJobAndDelete() {
        System.out.println("Check Job and Delete");

        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(zoneId).minusMinutes(30);
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
                    jobRepository.save(job);

                    // Hoàn tiền cho customer vào ví
                    Optional<CustomerWallet> walletOpt = customerWalletRepository.findByCustomerId(Long.valueOf(job.getCustomer().getId()));
                    if (walletOpt.isPresent()) {
                        CustomerWallet wallet = walletOpt.get();
                        // Cộng lại số tiền vào ví
                        wallet.setBalance(wallet.getBalance() + job.getTotalPrice());
                        customerWalletRepository.save(wallet);  // Lưu ví cập nhật
                        System.out.println("Đã hoàn tiền cho customer " + job.getCustomer().getId());

                        TransactionHistory transactionHistory = new TransactionHistory();
                        transactionHistory.setCustomer(wallet.getCustomer());  // Gán thông tin customer
                        transactionHistory.setAmount(job.getTotalPrice());  // Số tiền hoàn lại
                        transactionHistory.setTransactionType("Refund");  // Loại giao dịch là hoàn tiền
                        transactionHistory.setTransactionDate(LocalDateTime.now(zoneId));  // Ngày giờ giao dịch
                        transactionHistory.setPaymentMethod(job.getPaymentMethod());  // Phương thức thanh toán là ví
                        transactionHistory.setStatus("SUCCESS");  // Trạng thái giao dịch là hoàn tất

                        // Lưu thông tin vào bảng transaction_history
                        transactionHistoryRepository.save(transactionHistory);

                        System.out.println("Đã hoàn tiền cho customer " + job.getCustomer().getId());
                    }

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
                List<JobApplication> jobApplications = jobApplicationRepository.findJobApplicationById(job.getId());
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


