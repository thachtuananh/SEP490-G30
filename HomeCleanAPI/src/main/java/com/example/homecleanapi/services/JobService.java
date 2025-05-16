package com.example.homecleanapi.services;



import com.example.homecleanapi.dtos.NotificationDTO;
import com.example.homecleanapi.models.Services;
import com.example.homecleanapi.models.Wallet;
import com.example.homecleanapi.repositories.WalletRepository;
import com.example.homecleanapi.repositories.JobApplicationRepository;
import com.example.homecleanapi.repositories.JobRepository;
import com.example.homecleanapi.repositories.CustomerRepository;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.dtos.JobDTO;
import com.example.homecleanapi.repositories.ServiceRepository;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.repositories.CustomerRepo;
import com.example.homecleanapi.vnPay.VnpayRequest;
import com.example.homecleanapi.vnPay.VnpayService;
import com.example.homecleanapi.dtos.BookJobRequest;
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
        customerNotification.setRead(false); // ✅ set read = false
        notificationService.processNotification(customerNotification, "CUSTOMER", Math.toIntExact(customerId));

        response.put("message", "Đặt lịch thành công");
        response.put("jobId", job.getId());
        response.put("orderCode", job.getOrderCode());
        response.put("status", job.getStatus());
        response.put("totalPrice", totalPrice);

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
        Optional<JobServiceDetail> jobServiceDetail = jobDetailsRepository.findByJob_id(jobId);
        if (!jobServiceDetail.isPresent()) {
            response.put("message", "Job detail not found");
            return response;
        }
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
        String message = "Chủ nhà " + job.getCustomer().getFull_name() + "đã xác nhận bạn hoàn thành công việc" + jobServiceDetail.get().getService().getName() + job.getScheduledTime() + "Vui lòng kiểm tra ví.";
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
        List<Map<String, Object>> bookedJobs = new ArrayList<Map<String,Object>>();

        // Lấy tất cả các job mà customer đã đặt
        List<Job> jobs = jobRepository.findByCustomerId(customerId);

        // Sắp xếp các công việc theo scheduledTime giảm dần (công việc mới nhất sẽ được hiện đầu tiên)
        jobs.sort((job1, job2) -> job2.getScheduledTime().compareTo(job1.getScheduledTime()));

        for (Job job : jobs) {
            Map<String, Object> jobInfo = new HashMap<>();

            // Thêm các thông tin chi tiết của job vào jobInfo
            jobInfo.put("jobId", job.getId());
            jobInfo.put("orderCode", job.getOrderCode());  // Thêm order_code
            jobInfo.put("scheduledTime", job.getScheduledTime());  // Thời gian
            jobInfo.put("customerAddress", job.getCustomerAddress().getAddress());  // Địa chỉ
            jobInfo.put("status", job.getStatus());  // Trạng thái
            jobInfo.put("totalPrice", job.getTotalPrice());  // Giá

            // Thêm thông tin về customer đã đặt job
            Customers customer = job.getCustomer();
            if (customer != null) {
                jobInfo.put("customerId", customer.getId());
                jobInfo.put("customerName", customer.getFull_name());
                jobInfo.put("customerPhone", customer.getPhone());
            }

            // Thêm thông tin về địa chỉ của customer
            CustomerAddresses customerAddress = job.getCustomerAddress();
            if (customerAddress != null) {
                jobInfo.put("customerAddressId", customerAddress.getId());
                jobInfo.put("customerAddress", customerAddress.getAddress());
                jobInfo.put("latitude", customerAddress.getLatitude());
                jobInfo.put("longitude", customerAddress.getLongitude());
            }

            // Lấy tất cả các JobServiceDetail cho job này
            List<JobServiceDetail> jobServiceDetails = jobServiceDetailRepository.findByJobId(job.getId());
            if (jobServiceDetails != null && !jobServiceDetails.isEmpty()) {
                List<Map<String, Object>> serviceList = new ArrayList<>();

                // Duyệt qua tất cả các dịch vụ trong bảng job_service_detail
                for (JobServiceDetail jobServiceDetail : jobServiceDetails) {
                    Services service = jobServiceDetail.getService();
                    if (service != null) {
                        Map<String, Object> serviceInfo = new HashMap<>();
                        serviceInfo.put("serviceName", service.getName());
                        serviceInfo.put("serviceDescription", service.getDescription());

                        // Lấy các chi tiết dịch vụ
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

                        serviceList.add(serviceInfo);
                    }
                }

                // Thêm thông tin dịch vụ vào jobInfo
                jobInfo.put("services", serviceList);
            } else {
                jobInfo.put("services", "No services found for this job");
            }

            // Lấy thông tin cleaner đã nhận công việc này (nếu có)
            JobApplication jobApplication = jobApplicationRepository.findByJobIdAndStatus(job.getId(), "Accepted");
            if (jobApplication != null) {
                Employee cleaner = jobApplication.getCleaner();
                if (cleaner != null) {
                    jobInfo.put("cleanerId", cleaner.getId());
                }
            }

            bookedJobs.add(jobInfo);
        }

        return bookedJobs;
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
        customerNotification.setMessage("Bạn đã huỷ công việc thành công");
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

