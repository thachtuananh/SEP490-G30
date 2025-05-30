package com.example.homecleanapi.services;

import com.example.homecleanapi.models.Wallet;
import com.example.homecleanapi.repositories.WalletRepository;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.JobApplication;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.repositories.JobApplicationRepository;
import com.example.homecleanapi.repositories.JobRepository;
import com.example.homecleanapi.dtos.NotificationDTO;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
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
    private final WalletRepository walletRepository;
    private final WorkHistoryRepository workHistoryRepository;
    private final JobDetailsRepository jobDetailsRepository;
    private final ProfitRepository profitRepository;
    private final JobApp jobApp;

    public ScheduleService(JobRepository jobRepository, NotificationService notificationService, JobApplicationRepository jobApplicationRepository, CustomerWalletRepository customerWalletRepository, TransactionHistoryRepository transactionHistoryRepository, WalletRepository walletRepository, WorkHistoryRepository workHistoryRepository, JobDetailsRepository jobDetailsRepository, ProfitRepository profitRepository, JobApp jobApp) {
        this.jobRepository = jobRepository;
        this.notificationService = notificationService;
        this.jobApplicationRepository = jobApplicationRepository;
        this.customerWalletRepository = customerWalletRepository;
        this.transactionHistoryRepository = transactionHistoryRepository;
        this.walletRepository = walletRepository;
        this.workHistoryRepository = workHistoryRepository;
        this.jobDetailsRepository = jobDetailsRepository;
        this.profitRepository = profitRepository;
        this.jobApp = jobApp;
    }



    @Scheduled(cron = "0 * * * * *")
    public void checkJobAndDelete() {
        System.out.println("Check Job and Delete");

        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(zoneId).plusMinutes(30);
        System.out.println("Check Job and Delete at: " + now);

        List<Job> jobs = jobRepository.findAllByStatusIn(Arrays.asList(JobStatus.OPEN, JobStatus.BOOKED));
        System.out.println("Tổng số job OPEN và BOOKED: " + jobs.size());

        List<Job> updatedJobs = new ArrayList<>();
        List<JobApplication> applicationsToUpdate = new ArrayList<>();

        for (Job job : jobs) {
            if (job.getScheduledTime().isBefore(now)) {
                if (job.getStatus() != JobStatus.AUTO_CANCELLED) {
                    job.setStatus(JobStatus.AUTO_CANCELLED);
                    updatedJobs.add(job);

                    Optional<CustomerWallet> walletOpt = customerWalletRepository.findByCustomerId(Long.valueOf(job.getCustomer().getId()));
                    if (walletOpt.isPresent()) {
                        CustomerWallet wallet = walletOpt.get();
                        wallet.setBalance(wallet.getBalance() + job.getTotalPrice());
                        customerWalletRepository.save(wallet);

                        TransactionHistory transactionHistory = new TransactionHistory();
                        transactionHistory.setCustomer(wallet.getCustomer());
                        transactionHistory.setAmount(job.getTotalPrice());
                        transactionHistory.setTransactionType("Refund");
                        transactionHistory.setTransactionDate(LocalDateTime.now(zoneId));
                        transactionHistory.setPaymentMethod(job.getPaymentMethod());
                        transactionHistory.setStatus("SUCCESS");
                        transactionHistoryRepository.save(transactionHistory);

                        System.out.println("Đã hoàn tiền cho customer " + job.getCustomer().getId());
                    }

                    NotificationDTO notification = new NotificationDTO();
                    notification.setUserId(job.getCustomer().getId());
                    notification.setMessage("Mã công việc: [" + job.getOrderCode() + "] Công việc bị hủy vì không có người nhận đúng hạn. Tiền sẽ được hoàn vào ví của bạn.");
                    notification.setType("AUTO_MESSAGE");
                    notification.setTimestamp(LocalDateTime.now(zoneId));
                    notification.setRead(false);
                    notificationService.processNotification(notification, "CUSTOMER", job.getCustomer().getId());

                    System.out.println("Đã tự động hủy Job " + job.getId());

                    List<JobApplication> jobApplications = jobApplicationRepository.findAllByJobIdAndStatus(job.getId(), "Pending");

                  
                List<JobApplication> jobApplications1 = jobApp.findByJobId(job.getId());
                for (JobApplication application : jobApplications1) {
                    String status = application.getStatus();
                    application.setStatus("Cancelled");
                    applicationsToUpdate.add(application);

                    NotificationDTO cleanerNotification = new NotificationDTO();
                    cleanerNotification.setUserId(application.getCleaner().getId());
                    cleanerNotification.setMessage("Mã công việc: [" + job.getOrderCode() + "] Công việc của bạn đã bị hủy do chủ nhà chưa xác nhận thuê");
                    cleanerNotification.setType("AUTO_MESSAGE");
                    cleanerNotification.setTimestamp(LocalDateTime.now(zoneId));
                    cleanerNotification.setRead(false);
                    notificationService.processNotification(cleanerNotification, "CLEANER", application.getCleaner().getId());
                    }
                }
            } else {
                System.out.println("Job " + job.getId() + " vẫn còn thời gian hợp lệ.");
            }
        }

        // Lưu tất cả job đã cập nhật trạng thái
        if (!updatedJobs.isEmpty()) {
            jobRepository.saveAll(updatedJobs);
            System.out.println("Đã cập nhật trạng thái cho " + updatedJobs.size() + " công việc.");
        }

        // Lưu tất cả ứng dụng đã cập nhật trạng thái
        if (!applicationsToUpdate.isEmpty()) {
            jobApplicationRepository.saveAll(applicationsToUpdate);
            System.out.println("Đã cập nhật trạng thái cho " + applicationsToUpdate.size() + " ứng tuyển.");
        }
    }


//    NotificationDTO cleanerNotification = new NotificationDTO();
//                    cleanerNotification.setUserId(application.getCleaner().getId());
//                    cleanerNotification.setMessage("Mã công việc: [" + job.getOrderCode() + "] Công việc của bạn đã bị hủy do chủ nhà chưa xác nhận thuê");
//                    cleanerNotification.setType("AUTO_MESSAGE");
//                    cleanerNotification.setTimestamp(LocalDate.now(zoneId));
//                    cleanerNotification.setRead(false);
//                    notificationService.processNotification(cleanerNotification, "CLEANER", application.getCleaner().getId());





    @Scheduled(cron = "0 * * * * *")
    public void autoCompleteJobs() {
        System.out.println("Check Completed Jobs and Auto Update");

        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(zoneId);  // Lấy thời gian hiện tại
        System.out.println("Check Completed Jobs at: " + now);

        // Lấy tất cả các job có trạng thái COMPLETED
        List<Job> jobs = jobRepository.findAllByStatus(JobStatus.COMPLETED);
        System.out.println("Tổng số job COMPLETED: " + jobs.size());

        List<Job> updatedJobs = new ArrayList<>();
        List<TransactionHistory> transactionHistories = new ArrayList<>();

        for (Job job : jobs) {
            // Kiểm tra nếu job có trạng thái COMPLETED và đã quá 5 phút kể từ thời gian updated_at
            if (job.getUpdatedAt() != null && job.getUpdatedAt().isBefore(now.minusMinutes(5))) {

                // Đổi trạng thái job thành DONE
                job.setStatus(JobStatus.DONE);
                updatedJobs.add(job);
                jobRepository.saveAll(updatedJobs);

                Employee cleaner = null;

                // Xử lý khi booking_type là BOOKED (cleaner_id có trong bảng jobs)
                if ("BOOKED".equals(job.getBookingType())) {
                    cleaner = job.getCleaner();  // Lấy cleaner từ job trực tiếp
                }

                // Xử lý khi booking_type là CREATE (cleaner_id có trong bảng job_application và status = "Accepted")
                else if ("CREATE".equals(job.getBookingType())) {
                    List<JobApplication> jobApplications = jobApplicationRepository.findJobApplicationByJobIdAndStatus(job.getId(), "Accepted");
                    if (!jobApplications.isEmpty()) {
                        cleaner = jobApplications.get(0).getCleaner();  // Lấy cleaner từ bảng job_application
                    }
                }

                // Nếu có cleaner hợp lệ, tiến hành thanh toán và tạo giao dịch
                if (cleaner != null) {
                    Long cleanerId = Long.valueOf(cleaner.getId());
                    // Lấy ID của cleaner
                    double totalPrice = job.getTotalPrice();
                    double cleanerAmount = totalPrice * 0.85;  // Chỉ cộng 85% giá trị đơn hàng vào ví

                    // Lấy thông tin ví của cleaner
                    Optional<Wallet> walletOpt = walletRepository.findByCleanerId(cleanerId);
                    if (walletOpt.isPresent()) {
                        Wallet wallet = walletOpt.get();
                        wallet.setBalance(wallet.getBalance() + cleanerAmount);  // Cộng tiền vào ví của cleaner
                        walletRepository.save(wallet);


                        // Cập nhật thông tin vào bảng transaction_history
                        TransactionHistory transactionHistory = new TransactionHistory();
                        transactionHistory.setAmount(cleanerAmount);
                        transactionHistory.setCleaner(cleaner);  // Lưu cleanerId vào transactionHistory
                        transactionHistory.setTransactionType("Refund");
                        transactionHistory.setTransactionDate(LocalDateTime.now(zoneId));
                        transactionHistory.setPaymentMethod(job.getPaymentMethod());
                        transactionHistory.setStatus("SUCCESS");

                        transactionHistories.add(transactionHistory);
                        transactionHistoryRepository.saveAll(transactionHistories);
                        System.out.println("Cộng " + cleanerAmount + " vào ví cleaner " + cleanerId);
                    }

                    Optional<JobServiceDetail> jobServiceDetail = jobDetailsRepository.findByJob_id(job.getId());
                    if (jobServiceDetail.isPresent()) {
                        Profit profit = new Profit();
                        profit.setTransactionCode(job.getOrderCode());
                        profit.setServiceType(jobServiceDetail.get().getService().getName());
                        profit.setExecutionDate(LocalDate.now(zoneId));
                        profit.setCustomerName(job.getCustomer().getFull_name());
                        profit.setCleanerName(cleaner.getName());
                        profit.setAmount(totalPrice);
                        double profitAmount = totalPrice * 0.15;
                        profit.setProfitReceived(profitAmount);


                        profitRepository.save(profit);
                        System.out.println("Đã lưu thông tin lợi nhuận vào bảng profit cho job " + job.getId());
                    } else {
                        System.out.println("Không tìm thấy jobServiceDetail cho job " + job.getId());
                    }

                    Integer cleanerIdInt = Math.toIntExact(cleanerId);  // Chuyển Long sang Integer


                    // Gửi thông báo cho cleaner
//                    NotificationDTO notification = new NotificationDTO(
//                            cleanerIdInt,
//                            "Công việc của bạn đã được hoàn thành ",
//                            "AUTO_MESSAGE",
//                            LocalDate.now(zoneId),
//                            false,
//                    );
                    NotificationDTO notification = new NotificationDTO();
                    notification.setUserId(cleanerIdInt);
                    notification.setMessage("Mã công việc: ["+ job.getOrderCode() +"] Công việc của bạn đã được hoàn thành. Tiền công đã được gửi vào ví của bạn.");
                    notification.setType("AUTO_MESSAGE");
                    notification.setTimestamp(LocalDateTime.now(zoneId));
                    notification.setRead(false); // ✅ set read = false

                    notificationService.processNotification(notification, "CLEANER", cleanerIdInt);

                    System.out.println("Đã tự động cập nhật trạng thái Job " + job.getId() + " thành DONE và thanh toán cho cleaner.");
                } else {
                    System.out.println("Không tìm thấy cleaner cho job " + job.getId());
                }
            }
        }

        // Lưu các thay đổi nếu có
        if (!updatedJobs.isEmpty()) {
            jobRepository.saveAll(updatedJobs);
            System.out.println("Đã cập nhật trạng thái cho " + updatedJobs.size() + " công việc.");
        }

        // Lưu lịch sử giao dịch vào bảng transaction_history
        if (!transactionHistories.isEmpty()) {
            transactionHistoryRepository.saveAll(transactionHistories);
            System.out.println("Đã cập nhật " + transactionHistories.size() + " giao dịch.");
        }
    }


    @Scheduled(cron = "0 * * * * *")  // Thực thi mỗi phút
    public void autoCancelPaidJobs() {
        System.out.println("Check Paid Jobs for Auto Cancel");

        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(zoneId);  // Lấy thời gian hiện tại
        System.out.println("Check Paid Jobs at: " + now);

        // Lấy tất cả các job có trạng thái PAID
        List<Job> jobs = jobRepository.findAllByStatus(JobStatus.PAID);
        System.out.println("Tổng số job PAID: " + jobs.size());

        List<Job> updatedJobs = new ArrayList<>();
        List<TransactionHistory> transactionHistories = new ArrayList<>();

        for (Job job : jobs) {
            // Kiểm tra nếu job có trạng thái PAID và đã quá 5 phút kể từ thời gian cập nhật
            if (job.getUpdatedAt() != null && job.getUpdatedAt().isBefore(now.minusMinutes(5))) {

                // Kiểm tra nếu job vẫn chưa chuyển sang OPEN hoặc BOOKED
                if (job.getStatus() == JobStatus.PAID) {

                    // Đổi trạng thái job thành AUTO_CANCELLED
                    job.setStatus(JobStatus.AUTO_CANCELLED);
                    updatedJobs.add(job);

                    // Gửi thông báo cho customer
//                    NotificationDTO customerNotification = new NotificationDTO(
//                            job.getCustomer().getId(),
//                            "Đơn hàng của bạn đã bị hủy do chưa thanh toán",
//                            "AUTO_MESSAGE",
//                            LocalDate.now(zoneId)
//                    );
                    NotificationDTO customerNotification = new NotificationDTO();
                    customerNotification.setUserId(job.getCustomer().getId());
                    customerNotification.setMessage("Mã công việc: ["+ job.getOrderCode() +"] Đơn hàng của bạn đã bị hủy do chưa thanh toán");
                    customerNotification.setType("AUTO_MESSAGE");
                    customerNotification.setTimestamp(LocalDateTime.now(zoneId));
                    customerNotification.setRead(false); // ✅ set read = false

                    notificationService.processNotification(customerNotification, "CUSTOMER", job.getCustomer().getId());

                    // Gửi thông báo cho cleaner
                    if (job.getCleaner() != null) {
//                        NotificationDTO cleanerNotification = new NotificationDTO(
//                                job.getCleaner().getId(),
//                                "Công việc của bạn đã bị hủy do khách hàng chưa thanh toán",
//                                "AUTO_MESSAGE",
//                                LocalDate.now(zoneId)
//                        );
                        NotificationDTO cleanerNotification = new NotificationDTO();
                        cleanerNotification.setUserId(job.getCleaner().getId());
                        cleanerNotification.setMessage("Mã công việc: ["+ job.getOrderCode() +"] Công việc của bạn đã bị hủy do chủ nhà chưa thanh toán");
                        cleanerNotification.setType("AUTO_MESSAGE");
                        cleanerNotification.setTimestamp(LocalDateTime.now(zoneId));
                        cleanerNotification.setRead(false); // ✅ set read = false
                        notificationService.processNotification(cleanerNotification, "CLEANER", job.getCleaner().getId());
                    }

                    System.out.println("Đã tự động hủy Job " + job.getId());
                }
            }
        }

        // Lưu các thay đổi nếu có
        if (!updatedJobs.isEmpty()) {
            jobRepository.saveAll(updatedJobs);
            System.out.println("Đã cập nhật trạng thái cho " + updatedJobs.size() + " công việc.");
        }

        // Lưu lịch sử giao dịch vào bảng transaction_history
        if (!transactionHistories.isEmpty()) {
            transactionHistoryRepository.saveAll(transactionHistories);
            System.out.println("Đã cập nhật " + transactionHistories.size() + " giao dịch.");
        }
    }


    // tự động hủy job hoặc hủy apply nếu trùng lịch
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void autoCheckJobAndCleanerSchedule() {
        System.out.println("Checking cleaner schedule for job conflicts...");

        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(zoneId);
        System.out.println("Checking cleaner schedules at: " + now);

        List<JobApplication> applicationsToUpdate = new ArrayList<>();
        List<Job> jobsToCancel = new ArrayList<>();

        // 1. Huỷ apply Pending nếu cleaner đã nhận job khác trùng lịch
        List<JobApplication> pendingApplications = jobApplicationRepository.findAllByStatus("Pending");

        for (JobApplication pendingApp : pendingApplications) {
            Long cleanerId = Long.valueOf(pendingApp.getCleaner().getId());
            LocalDateTime pendingJobTime = pendingApp.getJob().getScheduledTime();
            LocalDateTime pendingEndTime = pendingJobTime.plusHours(2);

            List<JobApplication> acceptedApps = jobApplicationRepository.findByCleanerIdAndStatus(cleanerId, "Accepted");

            for (JobApplication acceptedApp : acceptedApps) {
                Job acceptedJob = acceptedApp.getJob();

                if (acceptedJob.getStatus() == JobStatus.DONE ||
                        acceptedJob.getStatus() == JobStatus.CANCELLED ||
                        acceptedJob.getStatus() == JobStatus.AUTO_CANCELLED) {
                    continue;
                }

                LocalDateTime acceptedTime = acceptedJob.getScheduledTime();
                LocalDateTime acceptedEndTime = acceptedTime.plusHours(2);

                if (!pendingApp.getJob().getId().equals(acceptedJob.getId()) &&
                        acceptedTime.isBefore(pendingEndTime) &&
                        acceptedEndTime.isAfter(pendingJobTime)) {

                    pendingApp.setStatus("Cancelled");
                    applicationsToUpdate.add(pendingApp);
                    System.out.println("Cancelled pending application for job " + pendingApp.getJob().getId() +
                            " because cleaner accepted another job " + acceptedJob.getId());
                }
            }
        }

        // 2. Huỷ Job BOOKED nếu cleaner đang làm job khác
        List<Job> bookedJobs = jobRepository.findAllByStatus(JobStatus.BOOKED);

        for (Job bookedJob : bookedJobs) {
            if (bookedJob.getCleaner() != null) {
                Long cleanerId = Long.valueOf(bookedJob.getCleaner().getId());
                LocalDateTime bookedTime = bookedJob.getScheduledTime();
                LocalDateTime bookedEndTime = bookedTime.plusHours(2);

                List<Job> inProgressJobs = jobRepository.findByCleanerIdAndStatus(cleanerId, JobStatus.IN_PROGRESS);

                boolean conflict = false;
                for (Job inProgressJob : inProgressJobs) {
                    LocalDateTime inProgressTime = inProgressJob.getScheduledTime();
                    LocalDateTime inProgressEndTime = inProgressTime.plusHours(2);

                    if (!bookedJob.getId().equals(inProgressJob.getId()) &&
                            inProgressTime.isBefore(bookedEndTime) &&
                            inProgressEndTime.isAfter(bookedTime)) {
                        conflict = true;
                        break;
                    }
                }

                List<JobApplication> acceptedApps = jobApplicationRepository.findByCleanerIdAndStatus(cleanerId, "Accepted");

                for (JobApplication acceptedApp : acceptedApps) {
                    Job acceptedJob = acceptedApp.getJob();

                    if (acceptedJob.getStatus() == JobStatus.DONE ||
                            acceptedJob.getStatus() == JobStatus.CANCELLED ||
                            acceptedJob.getStatus() == JobStatus.AUTO_CANCELLED) {
                        continue;
                    }

                    LocalDateTime acceptedTime = acceptedJob.getScheduledTime();
                    LocalDateTime acceptedEndTime = acceptedTime.plusHours(2);

                    if (!bookedJob.getId().equals(acceptedJob.getId()) &&
                            acceptedTime.isBefore(bookedEndTime) &&
                            acceptedEndTime.isAfter(bookedTime)) {
                        conflict = true;
                        break;
                    }
                }

                if (conflict) {
                    bookedJob.setStatus(JobStatus.AUTO_CANCELLED);
                    jobsToCancel.add(bookedJob);

                    System.out.println("Auto-cancelled booked job " + bookedJob.getId() + " because cleaner has another job.");

                    // HOÀN TIỀN CHO CUSTOMER nếu là job được book trực tiếp ---
                    Customers customer = bookedJob.getCustomer();
                    double refundAmount = bookedJob.getTotalPrice();

                    Optional<CustomerWallet> customerWalletOpt = customerWalletRepository.findByCustomerId(Long.valueOf((customer.getId()))) ;
                    if (customerWalletOpt.isPresent()) {
                        CustomerWallet customerWallet = customerWalletOpt.get();
                        customerWallet.setBalance(customerWallet.getBalance() + refundAmount);
                        customerWalletRepository.save(customerWallet);
                        System.out.println("Refunded " + refundAmount + " to customer wallet for cancelled job " + bookedJob.getId());

                        TransactionHistory transaction = new TransactionHistory();
                        transaction.setAmount(refundAmount);
                        transaction.setTransactionType("Refund");
                        transaction.setCustomer(customer);
                        transaction.setCleaner(null);
                        transaction.setPaymentMethod("Wallet");
                        transaction.setStatus("SUCCESS");


                        transactionHistoryRepository.save(transaction);
                    }
                }
            }
        }

        // Lưu thay đổi
        if (!jobsToCancel.isEmpty()) {
            jobRepository.saveAll(jobsToCancel);
            System.out.println("Cancelled " + jobsToCancel.size() + " jobs.");
        }

        if (!applicationsToUpdate.isEmpty()) {
            jobApplicationRepository.saveAll(applicationsToUpdate);
            System.out.println("Updated " + applicationsToUpdate.size() + " job applications.");
        }
    }












}


