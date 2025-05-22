package com.example.homecleanapi.services;



import com.example.homecleanapi.dtos.*;
import com.example.homecleanapi.models.Services;
import com.example.homecleanapi.models.Wallet;
import com.example.homecleanapi.repositories.WalletRepository;
import com.example.homecleanapi.repositories.JobApplicationRepository;
import com.example.homecleanapi.repositories.JobRepository;
import com.example.homecleanapi.repositories.CustomerRepository;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.repositories.ServiceRepository;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.repositories.CustomerRepo;
import com.example.homecleanapi.vnPay.VnpayRequest;
import com.example.homecleanapi.vnPay.VnpayService;
import com.example.homecleanapi.dtos.BookJobRequest.ServiceRequest;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;
    
    @Autowired
    private CustomerRepo customerRepo;
    
    @Autowired
    private CustomerAddressRepository customerAddressRepository;
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    @Autowired
    private ServiceDetailRepository serviceDetailRepository;
    
    @Autowired 
    private JobDetailsRepository jobDetailsRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private JobServiceDetailRepository jobServiceDetailRepository; 
    
    @Autowired
    private WalletRepository walletRepository;
    
    @Autowired
    private VnpayService vnpayService;

    @Autowired
    private CustomerWalletRepository customerWalletRepository;
    @Autowired
    private TransactionHistoryRepository transactionHistoryRepository;
    @Autowired
    private WorkHistoryRepository workHistoryRepository;
    @Autowired
    private NotificationService notificationService;

    public List<JobDTO> getAllJobs() {
        List<Job> jobs = jobRepository.findAll();  // Lấy tất cả các job

        List<JobDTO> jobDTOList = new ArrayList<>();
        for (Job job : jobs) {
            JobDTO jobDTO = new JobDTO();
            jobDTO.setId(job.getId());
            jobDTO.setStatus(job.getStatus().toString());
            jobDTO.setTotalPrice(job.getTotalPrice());
            jobDTO.setPaymentMethod(job.getPaymentMethod());
            jobDTO.setScheduledTime(job.getScheduledTime().toString());
            jobDTO.setOrderCode(job.getOrderCode());
            jobDTO.setBookingType(job.getBookingType());

            // Lấy thông tin dịch vụ của job từ JobServiceDetail
            List<String> serviceNames = new ArrayList<>();


            for (JobServiceDetail jobServiceDetail : job.getJobServiceDetails()) {
                Services service = jobServiceDetail.getService();
                if (service != null) {
                    serviceNames.add(service.getName());  // Lấy tên dịch vụ

                }
            }

            // Set các dịch vụ vào JobDTO
            jobDTO.setServiceNames(serviceNames);

            // Chỉ lấy các trường liên quan mà không bị lặp lại
            jobDTOList.add(jobDTO);
        }
        return jobDTOList;
    }




    public Map<String, Object> bookJob(@PathVariable Long customerId, @RequestBody BookJobRequest request, HttpServletRequest requestIp) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra khách hàng
        Optional<Customers> customerOpt = customerRepo.findById(customerId);
        if (!customerOpt.isPresent()) {
            response.put("message", "Customer not found with customerId: " + customerId);
            return response;
        }
        Customers customer = customerOpt.get();

        // Kiểm tra địa chỉ khách hàng
        Optional<CustomerAddresses> customerAddressOpt = customerAddressRepository.findById(request.getCustomerAddressId());
        if (!customerAddressOpt.isPresent()) {
            response.put("message", "Customer address not found");
            return response;
        }
        CustomerAddresses customerAddress = customerAddressOpt.get();

        // Parse thời gian job
        LocalDateTime jobTime;
        try {
            jobTime = LocalDateTime.parse(request.getJobTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            response.put("message", "Invalid job time format");
            return response;
        }

        // Tạo job
        Job job = new Job();
        job.setCustomer(customer);
        job.setCustomerAddress(customerAddress);
        job.setScheduledTime(jobTime);
        job.setReminder(request.getReminder());
        job.setBookingType("CREATE");
        job.setPaymentMethod(request.getPaymentMethod());

        // Tính tổng giá dịch vụ
        double totalPrice = 0;
        List<JobServiceDetail> jobServiceDetails = new ArrayList<>();

        for (ServiceRequest serviceRequest : request.getServices()) {
            Optional<Services> serviceOpt = serviceRepository.findById(serviceRequest.getServiceId());
            if (!serviceOpt.isPresent()) {
                response.put("message", "Service not found with serviceId: " + serviceRequest.getServiceId());
                return response;
            }

            Optional<ServiceDetail> serviceDetailOpt = serviceDetailRepository.findById(serviceRequest.getServiceDetailId());
            if (!serviceDetailOpt.isPresent()) {
                response.put("message", "Service Detail not found with serviceDetailId: " + serviceRequest.getServiceDetailId());
                return response;
            }

            Services service = serviceOpt.get();
            ServiceDetail serviceDetail = serviceDetailOpt.get();
            totalPrice += serviceDetail.getPrice();

            JobServiceDetail jobServiceDetail = new JobServiceDetail();
            jobServiceDetail.setJob(job);
            jobServiceDetail.setService(service);
            jobServiceDetail.setServiceDetail(serviceDetail);
            jobServiceDetails.add(jobServiceDetail);
        }

        // Tính phụ phí
        LocalDateTime scheduledTime = job.getScheduledTime();
        DayOfWeek day = scheduledTime.getDayOfWeek();
        int hour = scheduledTime.getHour();
        double priceIncrease = 0;

        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            if (hour >= 18 && hour < 22) {
                priceIncrease = 0.2;
            } else if (hour >= 6 && hour < 18) {
                priceIncrease = 0.0;
            }
        } else {
            if (hour >= 18 && hour < 22) {
                priceIncrease = 0.1;
            }
        }


        if (priceIncrease > 0) {
            totalPrice += totalPrice * priceIncrease;
            response.put("notice", "Giá đã bao gồm phụ phí " + (priceIncrease * 100) + "% do thời gian/Ngày");
        }

        // Xử lý phương thức thanh toán
        switch (request.getPaymentMethod().toLowerCase()) {
            case "vnpay":
                job.setStatus(JobStatus.PAID);
                break;
            case "wallet":
                Optional<CustomerWallet> walletOpt = customerWalletRepository.findByCustomerId(customerId);
                if (!walletOpt.isPresent()) {
                    response.put("message", "Customer wallet not found");
                    return response;
                }
                CustomerWallet wallet = walletOpt.get();
                if (wallet.getBalance() < totalPrice) {
                    response.put("message", "Không đủ tiền trong ví, hãy nạp thêm");
                    return response;
                }
                wallet.setBalance(wallet.getBalance() - totalPrice);
                customerWalletRepository.save(wallet);
                job.setStatus(JobStatus.OPEN);

                TransactionHistory transaction = new TransactionHistory();
                transaction.setCustomer(customer);
                transaction.setAmount(totalPrice);
                transaction.setTransactionType("BOOKING");
                transaction.setPaymentMethod("WALLET");
                transaction.setStatus("SUCCESS");

                transactionHistoryRepository.save(transaction);


                break;
            default:
                response.put("message", "Phương thức thanh toán không hợp lệ");
                return response;
        }

        // Xác định loại job
        job.setJobType(request.getServices().size() > 1 ? "COMBO" : "SINGLE");

        // Tạo orderCode
        String orderCode = customerId + LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyy")) +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        job.setOrderCode(orderCode);

        job.setTotalPrice(totalPrice);
        // Lưu job và chi tiết
        job = jobRepository.save(job);
        for (JobServiceDetail jsd : jobServiceDetails) {
            jsd.setJob(job);
        }
        jobServiceDetailRepository.saveAll(jobServiceDetails);

        if ("vnpay".equalsIgnoreCase(request.getPaymentMethod())) {
            try {
                // Tạo VNPay Request với số tiền thanh toán
                VnpayRequest vnpayRequest = new VnpayRequest();
                long amount = (long) (totalPrice);
                vnpayRequest.setAmount(String.valueOf(amount));

                String paymentUrl = vnpayService.createPayment(vnpayRequest, requestIp);

                String txnRef = extractTxnRefFromUrl(paymentUrl);

                job.setTxnRef(txnRef);
                jobRepository.save(job);

                // Trả về URL thanh toán cho người dùng
                response.put("paymentUrl", paymentUrl);
                return response;
            } catch (Exception e) {
                response.put("message", "Failed to create payment through VNPay: " + e.getMessage());
                return response;
            }
        }

        NotificationDTO customerNotification = new NotificationDTO();
        customerNotification.setUserId(job.getCustomer().getId());
        customerNotification.setMessage("Công việc đã được tạo thành công");
        customerNotification.setType("AUTO_MESSAGE");
        customerNotification.setTimestamp(LocalDate.now());
        customerNotification.setRead(false);
        notificationService.processNotification(customerNotification, "CUSTOMER", Math.toIntExact(customerId));

        response.put("message", "Đặt lịch thành công");
        response.put("jobId", job.getId());
        response.put("orderCode", job.getOrderCode());
        response.put("status", job.getStatus());
        response.put("totalPrice", totalPrice);

        return response;
    }



    // tạo job gồm nhiều dịch vụ + nhều thời điểm khác nhau
    public Map<String, Object> bookMultiJob(@PathVariable Long customerId, @RequestBody BookMultiJobRequest request, HttpServletRequest requestIp) {
        Map<String, Object> response = new HashMap<>();

        Optional<Customers> customerOpt = customerRepo.findById(customerId);
        if (!customerOpt.isPresent()) {
            response.put("message", "Customer not found with customerId: " + customerId);
            return response;
        }
        Customers customer = customerOpt.get();

        Optional<CustomerAddresses> customerAddressOpt = customerAddressRepository.findById(request.getCustomerAddressId().intValue());
        if (!customerAddressOpt.isPresent()) {
            response.put("message", "Customer address not found");
            return response;
        }
        CustomerAddresses customerAddress = customerAddressOpt.get();

        String orderCode = customerId + LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyy")) +
                UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String jobGroupCode = "JG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        double grandTotalPrice = 0;
        List<Job> allJobs = new ArrayList<>();
        List<JobServiceDetail> allDetails = new ArrayList<>();

        for (MultiJobRequest jobReq : request.getJobs()) {
            LocalDateTime jobTime;
            try {
                jobTime = LocalDateTime.parse(jobReq.getJobTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (Exception e) {
                response.put("message", "Invalid job time format in one of the entries");
                return response;
            }

            Job job = new Job();
            job.setCustomer(customer);
            job.setCustomerAddress(customerAddress);
            job.setScheduledTime(jobTime);
            job.setReminder(request.getReminder());
            job.setBookingType("CREATE");
            job.setPaymentMethod(request.getPaymentMethod());
            job.setJobType(jobReq.getServices().size() > 1 ? "COMBO" : "SINGLE");
            job.setOrderCode(orderCode);
            job.setJobGroupCode(jobGroupCode);

            double totalPrice = 0;
            List<JobServiceDetail> jobDetails = new ArrayList<>();

            for (ServiceRequest serviceRequest : jobReq.getServices()) {
                Optional<Services> serviceOpt = serviceRepository.findById(serviceRequest.getServiceId());
                Optional<ServiceDetail> detailOpt = serviceDetailRepository.findById(serviceRequest.getServiceDetailId());

                if (!serviceOpt.isPresent() || !detailOpt.isPresent()) {
                    response.put("message", "Service or ServiceDetail not found for job time: " + jobTime);
                    return response;
                }

                Services service = serviceOpt.get();
                ServiceDetail detail = detailOpt.get();
                totalPrice += detail.getPrice();

                JobServiceDetail jsd = new JobServiceDetail();
                jsd.setJob(job);
                jsd.setService(service);
                jsd.setServiceDetail(detail);
                jobDetails.add(jsd);
            }

            // Tính phụ phí
            DayOfWeek day = jobTime.getDayOfWeek();
            int hour = jobTime.getHour();
            double priceIncrease = 0;

            boolean isWeekend = (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY);
            boolean isPeakHour = (hour >= 18 && hour < 22);

            if (!isWeekend) {
                // Từ Thứ 2 đến Thứ 6
                if (isPeakHour) {
                    priceIncrease = 0.1;
                }
            } else {
                // Thứ 7 & CN
                if (isPeakHour) {
                    priceIncrease = 0.2;
                } else {
                    priceIncrease = 0.1;
                }
            }

            if (priceIncrease > 0) {
                totalPrice += totalPrice * priceIncrease;
                response.put("notice", "Giá đã bao gồm phụ phí " + (priceIncrease * 100) + "% do thời gian/Ngày");
            }



            job.setTotalPrice(totalPrice);
            grandTotalPrice += totalPrice;
            allJobs.add(job);
            allDetails.addAll(jobDetails);
        }

        // Xử lý thanh toán
        if ("wallet".equalsIgnoreCase(request.getPaymentMethod())) {
            Optional<CustomerWallet> walletOpt = customerWalletRepository.findByCustomerId(customerId);
            if (!walletOpt.isPresent()) {
                response.put("message", "Customer wallet not found");
                return response;
            }
            CustomerWallet wallet = walletOpt.get();
            if (wallet.getBalance() < grandTotalPrice) {
                response.put("message", "Không đủ tiền trong ví");
                return response;
            }

            wallet.setBalance(wallet.getBalance() - grandTotalPrice);
            customerWalletRepository.save(wallet);

            TransactionHistory tx = new TransactionHistory();
            tx.setCustomer(customer);
            tx.setAmount(grandTotalPrice);
            tx.setTransactionType("BOOKING");
            tx.setPaymentMethod("WALLET");
            tx.setStatus("SUCCESS");
            transactionHistoryRepository.save(tx);

            for (Job job : allJobs) job.setStatus(JobStatus.OPEN);

        } else if ("vnpay".equalsIgnoreCase(request.getPaymentMethod())) {
            for (Job job : allJobs) job.setStatus(JobStatus.PAID);
        } else {
            response.put("message", "Phương thức thanh toán không hợp lệ");
            return response;
        }

        // Save jobs and job details
        jobRepository.saveAll(allJobs);
        for (JobServiceDetail detail : allDetails) {
            Job matchedJob = allJobs.stream()
                    .filter(j -> j.getScheduledTime().equals(detail.getJob().getScheduledTime()))
                    .findFirst().get();
            detail.setJob(matchedJob);
        }
        jobServiceDetailRepository.saveAll(allDetails);

        // Xử lý thanh toán VNPay
        if ("vnpay".equalsIgnoreCase(request.getPaymentMethod())) {
            try {
                VnpayRequest vnpayRequest = new VnpayRequest();
                long amount = (long) (grandTotalPrice);
                vnpayRequest.setAmount(String.valueOf(amount));

                String paymentUrl = vnpayService.createPayment(vnpayRequest, requestIp);
                String txnRef = extractTxnRefFromUrl(paymentUrl);

                for (Job job : allJobs) {
                    job.setTxnRef(txnRef);
                }
                jobRepository.saveAll(allJobs); // Cập nhật txnRef

                response.put("paymentUrl", paymentUrl);
            } catch (Exception e) {
                response.put("message", "Failed to create payment through VNPay: " + e.getMessage());
                return response;
            }
        }

        // Notification
        NotificationDTO noti = new NotificationDTO();
        noti.setUserId(Math.toIntExact(customerId));
        noti.setMessage("Đặt nhiều lịch dọn dẹp thành công");
        noti.setType("AUTO_MESSAGE");
        noti.setTimestamp(LocalDate.now());
        noti.setRead(false);
        notificationService.processNotification(noti, "CUSTOMER", Math.toIntExact(customerId));


        response.put("message", "Đặt lịch thành công");
        response.put("orderCode", orderCode);
        response.put("jobGroupCode", jobGroupCode);
        response.put("totalJobs", allJobs.size());
        response.put("totalPrice", grandTotalPrice);

        return response;
    }






    public Map<String, Object> retryPayment(Long jobId, HttpServletRequest requestIp) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra job tồn tại
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }

        Job job = jobOpt.get();

        // Kiểm tra trạng thái job, chỉ cho phép thanh toán lại khi job có trạng thái PAID
        if (!job.getStatus().equals(JobStatus.PAID)) {
            response.put("message", "Job is not in a valid state for payment retry");
            return response;
        }

        // Tạo lại VNPay request hoặc các phương thức thanh toán khác
        try {
            double totalPrice = job.getTotalPrice();
            VnpayRequest vnpayRequest = new VnpayRequest();
            long amount = (long) (totalPrice);
            vnpayRequest.setAmount(String.valueOf(amount));

            // Tạo lại URL thanh toán
            String paymentUrl = vnpayService.createPayment(vnpayRequest, requestIp);

            // Cập nhật txnRef cho job để theo dõi giao dịch
            String txnRef = extractTxnRefFromUrl(paymentUrl);
            job.setTxnRef(txnRef);  // Lưu txnRef vào job
            jobRepository.save(job);  // Lưu cập nhật txnRef vào job

            // Trả về URL thanh toán cho người dùng
            response.put("paymentUrl", paymentUrl);
            return response;

        } catch (Exception e) {
            response.put("message", "Failed to create payment link: " + e.getMessage());
            return response;
        }
    }




    // Hàm để trích xuất txnRef từ URL trả về của VNPay
    private String extractTxnRefFromUrl(String paymentUrl) {
        try {
            // Trích xuất txnRef từ URL
            String[] urlParts = paymentUrl.split("\\?");
            for (String part : urlParts[1].split("&")) {
                if (part.startsWith("vnp_TxnRef")) {
                    return part.split("=")[1];
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }








    public Map<String, Object> updateJobStatusToStarted(Long jobId, @PathVariable Long customerId) { // Dùng @PathVariable cho customerId
        Map<String, Object> response = new HashMap<>();

        // Tìm công việc theo jobId
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }

        Job job = jobOpt.get();

        // Kiểm tra quyền của customer (sử dụng customerId từ @PathVariable)
        if (!customerId.equals(job.getCustomer().getId().longValue())) {
            response.put("message", "You are not authorized to start this job");
            return response;
        }


        // Kiểm tra trạng thái công việc và sự tồn tại của job application
        JobApplication jobApplication = jobApplicationRepository.findByJobIdAndStatus(jobId, "Accepted");
        if (jobApplication == null) {
            response.put("message", "No cleaner assigned or job application is not in 'Accepted' state");
            return response;
        }

        if (!job.getStatus().equals(JobStatus.ARRIVED)) {
            response.put("message", "Job is not in ARRIVED state");
            return response;
        }

        // Cập nhật trạng thái công việc thành 'STARTED'
        job.setStatus(JobStatus.STARTED);
        jobRepository.save(job);

        response.put("message", "Job status updated to STARTED");
        return response;
    }

    
    public List<CustomerAddresses> getAddressesByCustomerId(Integer customerId) {
        return customerAddressRepository.findByCustomerId(customerId);
    }
    
    
    public boolean setDefaultAddressForCustomer(Integer customerId, Integer addressId) {
        // Lấy tất cả các địa chỉ của customer
        List<CustomerAddresses> addresses = customerAddressRepository.findByCustomerId(customerId);

        if (addresses.isEmpty()) {
            return false; // Nếu không có địa chỉ nào
        }

        // Cập nhật trạng thái is_default của tất cả các địa chỉ của customer thành false
        for (CustomerAddresses address : addresses) {
            address.setCurrent(false); // Hoặc nếu bạn dùng "is_default", hãy đổi theo thuộc tính đó
            customerAddressRepository.save(address);
        }

        // Cập nhật địa chỉ được chọn thành mặc định
        CustomerAddresses defaultAddress = customerAddressRepository.findById(addressId).orElse(null);
        if (defaultAddress != null) {
            defaultAddress.setCurrent(true); // Hoặc nếu bạn dùng "is_default", hãy đổi theo thuộc tính đó
            customerAddressRepository.save(defaultAddress);
            return true;
        }

        return false;
    }

    public Map<String, Object> updateJobStatusToDone(Long jobId) {
        Map<String, Object> response = new HashMap<>();

        // Lấy thông tin job từ jobId
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }

        Job job = jobOpt.get();

        // Kiểm tra nếu job đã có trạng thái "COMPLETED"
        if (!job.getStatus().equals(JobStatus.COMPLETED)) {
            response.put("message", "Job must be in 'COMPLETED' state before marking as DONE");
            return response;
        }

        // Kiểm tra xem có cleaner nào đã ứng tuyển và được chấp nhận cho công việc này
        JobApplication jobApplication = jobApplicationRepository.findByJobIdAndStatus(jobId, "Accepted");

        if (jobApplication == null) {
            response.put("message", "No cleaner assigned to this job");
            return response;
        }

        // Lấy cleaner từ jobApplication
        Employee cleaner = jobApplication.getCleaner();

        // Cập nhật trạng thái công việc sang "DONE"
        job.setStatus(JobStatus.DONE);
        jobRepository.save(job);

        // Cập nhật end_time trong work_history
        Optional<WorkHistory> workHistoryOpt = workHistoryRepository.findByJobAndCleaner(job, cleaner);
        if (workHistoryOpt.isPresent()) {
            WorkHistory workHistory = workHistoryOpt.get();
            workHistory.setEndTime(LocalDateTime.now());  // Set current time as end time
            workHistoryRepository.save(workHistory);
        }

        // Tính toán số tiền sẽ trả cho cleaner (85% tổng giá trị đơn hàng)
        double totalPrice = job.getTotalPrice();
        double cleanerPayment = totalPrice * 0.85;
//        List<JobServiceDetail> jobServiceDetails = jobDetailsRepository.findByJob_id(jobId);
//        String serviceNames = jobServiceDetails.size() == 1
//                ? jobServiceDetails.get(0).getService().getName()
//                : jobServiceDetails.stream()
//                .map(detail -> detail.getService().getName())
//                .collect(Collectors.joining(","));

        // Lấy ví của cleaner
        Optional<Wallet> walletOpt = walletRepository.findByCleanerId(cleaner.getId());
        if (!walletOpt.isPresent()) {
            response.put("message", "Cleaner wallet not found");
            return response;
        }
        Wallet wallet = walletOpt.get();

        // Cộng 85% giá trị đơn vào ví của cleaner
        wallet.setBalance(wallet.getBalance() + cleanerPayment);
        walletRepository.save(wallet);

        TransactionHistory txn = new TransactionHistory();
        txn.setCleaner(cleaner);
        txn.setAmount(cleanerPayment);
        txn.setTransactionType("CREDIT");
        txn.setPaymentMethod("WALLET");
        txn.setStatus("SUCCESS");

        transactionHistoryRepository.save(txn);
        String message = "Chủ nhà " + job.getCustomer().getFull_name() + "đã xác nhận bạn hoàn thành công việc" + "Vui lòng kiểm tra ví.";
        NotificationDTO customerNotification = new NotificationDTO();
        customerNotification.setUserId(cleaner.getId());
        customerNotification.setMessage(message);
        customerNotification.setType("AUTO_MESSAGE");
        customerNotification.setTimestamp(LocalDate.now());
        customerNotification.setRead(false); // ✅ set read = false
        notificationService.processNotification(customerNotification, "CLEANER", cleaner.getId());
        response.put("message", "Job status updated to DONE, and cleaner's wallet has been credited with 85% of the job value");
        return response;
    }







    // list tất cả job đã book
    public List<Map<String, Object>> getBookedJobsForCustomer(Long customerId) {
        List<Map<String, Object>> bookedJobs = new ArrayList<>();
        List<Job> jobs = jobRepository.findByCustomerId(customerId);
        jobs.sort((job1, job2) -> {
            int cmp = job2.getUpdatedAt().compareTo(job1.getUpdatedAt());
            return (cmp != 0) ? cmp : job2.getScheduledTime().compareTo(job1.getScheduledTime());
        });

        Map<String, Map<String, Object>> jobGroupMap = new LinkedHashMap<>();

        for (Job job : jobs) {
            String groupKey = (job.getJobGroupCode() != null) ? job.getJobGroupCode() : "JOB-" + job.getId();

            Map<String, Object> jobInfo = jobGroupMap.getOrDefault(groupKey, new HashMap<>());

            if (jobInfo.isEmpty()) {
                jobInfo.put("jobId", (job.getJobGroupCode() != null) ? job.getJobGroupCode() : job.getId());
                jobInfo.put("orderCode", job.getOrderCode());
                jobInfo.put("scheduledTime", job.getScheduledTime());
                jobInfo.put("status", job.getStatus());
                jobInfo.put("totalPrice", 0.0);
                jobInfo.put("services", new ArrayList<Map<String, Object>>());
                jobInfo.put("subJobs", new ArrayList<Map<String, Object>>());
                jobInfo.put("booking_type", job.getBookingType());

                if (job.getCustomerAddress() != null) {
                    jobInfo.put("customerAddress", job.getCustomerAddress().getAddress());
                    jobInfo.put("customerAddressId", job.getCustomerAddress().getId());
                    jobInfo.put("latitude", job.getCustomerAddress().getLatitude());
                    jobInfo.put("longitude", job.getCustomerAddress().getLongitude());
                }

                if (job.getCustomer() != null) {
                    jobInfo.put("customerId", job.getCustomer().getId());
                    jobInfo.put("customerName", job.getCustomer().getFull_name());
                    jobInfo.put("customerPhone", job.getCustomer().getPhone());
                }

                // ✅ Luôn gán cleanerId từ bảng Job, kể cả null
                if (job.getCleaner() != null) {
                    jobInfo.put("cleanerId", job.getCleaner().getId());
                } else {
                    jobInfo.put("cleanerId", null);
                }
            }

            Double currentTotal = (Double) jobInfo.get("totalPrice");
            jobInfo.put("totalPrice", currentTotal + job.getTotalPrice());

            LocalDateTime currentTime = (LocalDateTime) jobInfo.get("scheduledTime");
            if (job.getScheduledTime().isBefore(currentTime)) {
                jobInfo.put("scheduledTime", job.getScheduledTime());
            }

            List<JobServiceDetail> jobServiceDetails = jobServiceDetailRepository.findByJobId(job.getId());
            List<Map<String, Object>> overallServiceList = (List<Map<String, Object>>) jobInfo.get("services");
            List<Map<String, Object>> subJobServices = new ArrayList<>();

            for (JobServiceDetail jobServiceDetail : jobServiceDetails) {
                Services service = jobServiceDetail.getService();
                if (service != null) {
                    Map<String, Object> serviceInfo = new HashMap<>();
                    serviceInfo.put("serviceName", service.getName());
                    serviceInfo.put("serviceDescription", service.getDescription());

                    ServiceDetail serviceDetail = jobServiceDetail.getServiceDetail();
                    if (serviceDetail != null) {
                        serviceInfo.put("serviceDetailId", serviceDetail.getId());
                        serviceInfo.put("serviceDetailName", serviceDetail.getName());
                        serviceInfo.put("serviceDetailPrice", serviceDetail.getPrice());
                        serviceInfo.put("serviceDetailAdditionalPrice", serviceDetail.getAdditionalPrice());
                        serviceInfo.put("serviceDetailAreaRange", serviceDetail.getAreaRange());
                        serviceInfo.put("serviceDetailDescription", serviceDetail.getDescription());
                        serviceInfo.put("serviceDetailDiscounts", serviceDetail.getDiscounts());
                    }

                    subJobServices.add(serviceInfo);
                    overallServiceList.add(serviceInfo);
                }
            }

            List<Map<String, Object>> subJobs = (List<Map<String, Object>>) jobInfo.get("subJobs");

            Map<String, Object> subJobInfo = new HashMap<>();
            subJobInfo.put("jobId", job.getId());
            subJobInfo.put("scheduledTime", job.getScheduledTime());
            subJobInfo.put("status", job.getStatus());
            subJobInfo.put("totalPrice", job.getTotalPrice());
            subJobInfo.put("services", subJobServices);

            // Không gán cleanerId vào subJobInfo
            // CŨ: Lấy cleaner từ jobApplication (giữ nguyên nếu cần fallback cho nhóm JOB-GROUP)
            JobApplication jobApplication = jobApplicationRepository.findByJobIdAndStatus(job.getId(), "Accepted");
            if (jobApplication != null && jobApplication.getCleaner() != null) {
                jobInfo.put("cleanerId", jobApplication.getCleaner().getId()); // Gán vào jobInfo (tổng)
            }

            subJobs.add(subJobInfo);
            jobGroupMap.put(groupKey, jobInfo);
        }

        // Cập nhật status cho job group nếu là nhiều ngày
        for (Map.Entry<String, Map<String, Object>> entry : jobGroupMap.entrySet()) {
            String groupKey = entry.getKey();
            Map<String, Object> jobInfo = entry.getValue();
            List<Map<String, Object>> subJobs = (List<Map<String, Object>>) jobInfo.get("subJobs");

            boolean isMultiDayGroup = groupKey.startsWith("JG");

            if (isMultiDayGroup) {
                long total = subJobs.size();

                long cancelledCount = subJobs.stream().filter(subJob -> {
                    String status = String.valueOf(subJob.get("status")).toUpperCase();
                    return "CANCELLED".equals(status) || "AUTO_CANCELLED".equals(status);
                }).count();

                long doneCount = subJobs.stream().filter(subJob -> {
                    String status = String.valueOf(subJob.get("status")).toUpperCase();
                    return "DONE".equals(status);
                }).count();

                if (cancelledCount == total) {
                    jobInfo.put("status", "CANCELLED");
                } else if ((doneCount + cancelledCount) == total && doneCount > 0) {
                    jobInfo.put("status", "DONE");
                } else {
                    jobInfo.put("status", "DOING");
                }
            }


        }

        return new ArrayList<>(jobGroupMap.values());
    }









    // xem detail job
    public Map<String, Object> getJobDetails(String jobIdOrGroupCode) {
        Map<String, Object> jobInfo = new HashMap<>();

        // Nếu là số -> thử parse thành Long để tìm theo jobId
        if (jobIdOrGroupCode.matches("\\d+")) {
            Long jobId = Long.valueOf(jobIdOrGroupCode);
            Optional<Job> jobOpt = jobRepository.findById(jobId);

            if (jobOpt.isPresent()) {
                Job job = jobOpt.get();

                // Nếu không có job_group_code, là job đơn
                if (job.getJobGroupCode() == null) {
                    return buildJobDetail(job);
                } else {
                    // Là job con trong 1 nhóm → truy ra toàn bộ job cùng group
                    jobIdOrGroupCode = job.getJobGroupCode(); // chuyển qua xử lý group code
                }
            }
        }

        // Đến đây chắc chắn là xử lý theo group code
        List<Job> groupJobs = jobRepository.findByJobGroupCode(jobIdOrGroupCode);
        if (groupJobs == null || groupJobs.isEmpty()) {
            throw new NoSuchElementException("Job or Job Group not found");
        }

        Job firstJob = groupJobs.get(0); // dùng để lấy thông tin chung
        jobInfo.put("jobId", jobIdOrGroupCode);
        jobInfo.put("orderCode", firstJob.getOrderCode());
        jobInfo.put("scheduledTime", firstJob.getScheduledTime());
        jobInfo.put("status", firstJob.getStatus());
        jobInfo.put("totalPrice", 0.0);
        jobInfo.put("services", new ArrayList<>());
        jobInfo.put("subJobs", new ArrayList<>());

        if (firstJob.getCustomerAddress() != null) {
            jobInfo.put("customerAddress", firstJob.getCustomerAddress().getAddress());
            jobInfo.put("customerAddressId", firstJob.getCustomerAddress().getId());
            jobInfo.put("latitude", firstJob.getCustomerAddress().getLatitude());
            jobInfo.put("longitude", firstJob.getCustomerAddress().getLongitude());
        }

        if (firstJob.getCustomer() != null) {
            jobInfo.put("customerId", firstJob.getCustomer().getId());
            jobInfo.put("customerName", firstJob.getCustomer().getFull_name());
            jobInfo.put("customerPhone", firstJob.getCustomer().getPhone());
        }

        Double totalPrice = 0.0;
        List<Map<String, Object>> overallServices = (List<Map<String, Object>>) jobInfo.get("services");
        List<Map<String, Object>> subJobs = (List<Map<String, Object>>) jobInfo.get("subJobs");

        for (Job j : groupJobs) {
            totalPrice += j.getTotalPrice();

            List<Map<String, Object>> subServices = new ArrayList<>();
            List<JobServiceDetail> jobServiceDetails = jobServiceDetailRepository.findByJobId(j.getId());
            for (JobServiceDetail detail : jobServiceDetails) {
                Map<String, Object> serviceMap = buildServiceInfo(detail);
                subServices.add(serviceMap);
                overallServices.add(serviceMap); // Optional
            }

            Map<String, Object> subJob = new HashMap<>();
            subJob.put("jobId", j.getId());
            subJob.put("scheduledTime", j.getScheduledTime());
            subJob.put("status", j.getStatus());
            subJob.put("totalPrice", j.getTotalPrice());
            subJob.put("services", subServices);

            JobApplication jobApp = jobApplicationRepository.findByJobIdAndStatus(j.getId(), "Accepted");
            if (jobApp != null && jobApp.getCleaner() != null) {
                subJob.put("cleanerId", jobApp.getCleaner().getId());
                jobInfo.put("cleanerId", jobApp.getCleaner().getId());
            }

            subJobs.add(subJob);
        }

        jobInfo.put("totalPrice", totalPrice);
        return jobInfo;
    }




    private Map<String, Object> buildJobDetail(Job job) {
        Map<String, Object> jobInfo = new HashMap<>();
        jobInfo.put("jobId", job.getId());
        jobInfo.put("orderCode", job.getOrderCode());
        jobInfo.put("scheduledTime", job.getScheduledTime());
        jobInfo.put("status", job.getStatus());
        jobInfo.put("totalPrice", job.getTotalPrice());

        if (job.getCustomer() != null) {
            jobInfo.put("customerId", job.getCustomer().getId());
            jobInfo.put("customerName", job.getCustomer().getFull_name());
            jobInfo.put("customerPhone", job.getCustomer().getPhone());
        }

        if (job.getCustomerAddress() != null) {
            jobInfo.put("customerAddressId", job.getCustomerAddress().getId());
            jobInfo.put("customerAddress", job.getCustomerAddress().getAddress());
            jobInfo.put("latitude", job.getCustomerAddress().getLatitude());
            jobInfo.put("longitude", job.getCustomerAddress().getLongitude());
        }

        List<JobServiceDetail> jobServiceDetails = jobServiceDetailRepository.findByJobId(job.getId());
        List<Map<String, Object>> serviceList = new ArrayList<>();

        for (JobServiceDetail detail : jobServiceDetails) {
            serviceList.add(buildServiceInfo(detail));
        }

        jobInfo.put("services", serviceList);

        JobApplication jobApp = jobApplicationRepository.findByJobIdAndStatus(job.getId(), "Accepted");
        if (jobApp != null && jobApp.getCleaner() != null) {
            jobInfo.put("cleanerId", jobApp.getCleaner().getId());
        }

        return jobInfo;
    }

    private Map<String, Object> buildServiceInfo(JobServiceDetail detail) {
        Map<String, Object> serviceInfo = new HashMap<>();

        Services service = detail.getService();
        if (service != null) {
            serviceInfo.put("serviceName", service.getName());
            serviceInfo.put("serviceDescription", service.getDescription());
        }

        ServiceDetail sd = detail.getServiceDetail();
        if (sd != null) {
            serviceInfo.put("serviceDetailId", sd.getId());
            serviceInfo.put("serviceDetailName", sd.getName());
            serviceInfo.put("serviceDetailPrice", sd.getPrice());
            serviceInfo.put("serviceDetailAdditionalPrice", sd.getAdditionalPrice());
            serviceInfo.put("serviceDetailAreaRange", sd.getAreaRange());
            serviceInfo.put("serviceDetailDescription", sd.getDescription());
            serviceInfo.put("serviceDetailDiscounts", sd.getDiscounts());
        }

        return serviceInfo;
    }




    // huy job da book  ( phan nay nhieu bug nay)
    public Map<String, Object> cancelJobForCustomer(Long customerId, Long jobId) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem customer có tồn tại không
        Optional<Customers> customerOpt = customerRepository.findById(customerId);
        if (!customerOpt.isPresent()) {
            response.put("message", "Customer not found");
            return response;
        }
        Customers customer = customerOpt.get();

        // Tìm job theo jobId
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }
        Job job = jobOpt.get();

        // Kiểm tra xem customer có phải là người tạo job này không
        if (job.getCustomer().getId().longValue() != customerId) {
            response.put("message", "You are not authorized to cancel this job");
            return response;
        }

        // Kiểm tra trạng thái của job
        if (job.getStatus().equals(JobStatus.ARRIVED) || job.getStatus().equals(JobStatus.COMPLETED) || job.getStatus().equals(JobStatus.DONE)) {
            response.put("message", "You cannot cancel a job that has already ARRIVED or completed");
            return response;
        }


        // Tính toán số tiền hoàn lại
        double totalPrice = job.getTotalPrice();
        double refundAmount = totalPrice;

        // Lấy ví của customer
        Optional<CustomerWallet> walletOpt = customerWalletRepository.findByCustomerId(customerId);
        if (!walletOpt.isPresent()) {
            response.put("message", "Customer wallet not found");
            return response;
        }
        CustomerWallet wallet = walletOpt.get();

        // Cộng tiền vào ví của customer
        wallet.setBalance(wallet.getBalance() + refundAmount);
        customerWalletRepository.save(wallet);  // Lưu cập nhật vào ví của customer

        // Lưu giao dịch hoàn tiền vào bảng transaction_history
        TransactionHistory transactionHistory = new TransactionHistory();
        transactionHistory.setCustomer(customer);
        transactionHistory.setCleaner(null);
        transactionHistory.setAmount(refundAmount);
        transactionHistory.setTransactionType("Refund");
        transactionHistory.setStatus("SUCCESS");
        transactionHistory.setPaymentMethod("Wallet");


        // Lưu vào bảng transaction_history
        transactionHistoryRepository.save(transactionHistory);

        // Thêm thông báo hoàn tiền
        response.put("message", "đã hủy job thành công");

        // Cập nhật trạng thái công việc thành "CANCELLED"
        job.setStatus(JobStatus.CANCELLED);
        jobRepository.save(job);

        NotificationDTO customerNotification = new NotificationDTO();
        customerNotification.setUserId(job.getCustomer().getId());
        customerNotification.setMessage("Mã công việc [" + job.getOrderCode() + "] Bạn đã huỷ công việc thành công");
        customerNotification.setType("AUTO_MESSAGE");
        customerNotification.setTimestamp(LocalDate.now());
        customerNotification.setRead(false); // ✅ set read = false
        notificationService.processNotification(customerNotification, "CUSTOMER", Math.toIntExact(customerId));
        response.put("message", "Job has been cancelled successfully");
        response.put("jobId", jobId);
        response.put("status", job.getStatus());
        return response;


    }





    // LU


    



}

