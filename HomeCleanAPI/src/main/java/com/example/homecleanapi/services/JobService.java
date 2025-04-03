package com.example.homecleanapi.services;



import com.example.homecleanapi.Payment.VnpayConfig;
import com.example.homecleanapi.Payment.VnpayRequest;
import com.example.homecleanapi.Payment.VnpayService;
import com.example.homecleanapi.dtos.BookJobRequest;
import com.example.homecleanapi.dtos.BookJobRequest.ServiceRequest;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    

    
  
    public Map<String, Object> bookJob(@PathVariable Long customerId, @RequestBody BookJobRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra khách hàng có tồn tại không
        Optional<Customers> customerOpt = customerRepo.findById(customerId);
        if (!customerOpt.isPresent()) {
            response.put("message", "Customer not found with customerId: " + customerId);
            return response;
        }
        Customers customer = customerOpt.get();

        // Kiểm tra địa chỉ của customer
        Optional<CustomerAddresses> customerAddressOpt = customerAddressRepository.findById(request.getCustomerAddressId());
        if (!customerAddressOpt.isPresent()) {
            response.put("message", "Customer address not found");
            return response;
        }
        CustomerAddresses customerAddress = customerAddressOpt.get();

        // Chuyển jobTime từ String sang LocalDateTime
        LocalDateTime jobTime = null;
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            jobTime = LocalDateTime.parse(request.getJobTime(), formatter);
        } catch (Exception e) {
            response.put("message", "Invalid job time format");
            return response;
        }

        // Tạo Job và gán các thuộc tính cần thiết
        Job job = new Job();
        job.setCustomer(customer);
        job.setCustomerAddress(customerAddress);
        job.setScheduledTime(jobTime);
        job.setReminder(request.getReminder());

        // Kiểm tra phương thức thanh toán
        if ("cash".equalsIgnoreCase(request.getPaymentMethod())) {
            job.setStatus(JobStatus.OPEN);  // Nếu thanh toán bằng tiền mặt, đặt status là OPEN
        } else if ("vnpay".equalsIgnoreCase(request.getPaymentMethod())) {
            job.setStatus(JobStatus.PAID);  // Nếu thanh toán qua VNPay, đặt status là PAID
        }

        job.setPaymentMethod(request.getPaymentMethod());

        // Tính tổng giá cho tất cả các dịch vụ
        double totalPrice = 0;
        for (ServiceRequest serviceRequest : request.getServices()) {
            Optional<Services> serviceOpt = serviceRepository.findById(serviceRequest.getServiceId());
            if (!serviceOpt.isPresent()) {
                response.put("message", "Service not found with serviceId: " + serviceRequest.getServiceId());
                return response;
            }
            Services service = serviceOpt.get();
            Optional<ServiceDetail> serviceDetailOpt = serviceDetailRepository.findById(serviceRequest.getServiceDetailId());
            if (!serviceDetailOpt.isPresent()) {
                response.put("message", "Service Detail not found for serviceId: " + serviceRequest.getServiceDetailId());
                return response;
            }
            ServiceDetail serviceDetail = serviceDetailOpt.get();

            // Tính toán giá dịch vụ
            totalPrice += serviceDetail.getPrice() + serviceDetail.getAdditionalPrice();
        }

        // Kiểm tra nếu totalPrice lớn hơn 1 triệu và phương thức thanh toán là tiền mặt
        if (totalPrice > 1000000 && "cash".equalsIgnoreCase(request.getPaymentMethod())) {
            response.put("message", "Total price exceeds 1 million. Cash payment is not allowed.");
            return response;  // Dừng lại và trả về phản hồi, không tạo job
        }

        // Lưu Job vào cơ sở dữ liệu
        job.setTotalPrice(totalPrice);
        job = jobRepository.save(job);

        // Lưu các JobServiceDetail nếu có
        List<JobServiceDetail> jobServiceDetails = new ArrayList<>();
        for (ServiceRequest serviceRequest : request.getServices()) {
            Optional<Services> serviceOpt = serviceRepository.findById(serviceRequest.getServiceId());
            if (!serviceOpt.isPresent()) {
                response.put("message", "Service not found with serviceId: " + serviceRequest.getServiceId());
                return response;
            }
            Services service = serviceOpt.get();
            Optional<ServiceDetail> serviceDetailOpt = serviceDetailRepository.findById(serviceRequest.getServiceDetailId());
            if (!serviceDetailOpt.isPresent()) {
                response.put("message", "Service Detail not found for serviceId: " + serviceRequest.getServiceDetailId());
                return response;
            }
            ServiceDetail serviceDetail = serviceDetailOpt.get();

            // Tạo JobServiceDetail và lưu vào danh sách
            JobServiceDetail jobServiceDetail = new JobServiceDetail();
            jobServiceDetail.setJob(job);
            jobServiceDetail.setService(service);
            jobServiceDetail.setServiceDetail(serviceDetail);

            jobServiceDetails.add(jobServiceDetail);
        }

        // Lưu các JobServiceDetail vào cơ sở dữ liệu
        jobServiceDetailRepository.saveAll(jobServiceDetails);

        // Nếu chọn phương thức thanh toán VNPay
        if ("vnpay".equalsIgnoreCase(request.getPaymentMethod())) {
            try {
                // Tạo VNPay Request với số tiền thanh toán
                VnpayRequest vnpayRequest = new VnpayRequest();
                long amount = (long) (totalPrice);  // Đảm bảo chuyển đổi tổng tiền thành đơn vị tiền tệ hợp lệ
                vnpayRequest.setAmount(String.valueOf(amount)); // Gửi số tiền đã được nhân với 100

                // Tạo URL thanh toán VNPay
                String paymentUrl = vnpayService.createPayment(vnpayRequest);

                // Lấy txnRef từ URL của VNPay
                String txnRef = extractTxnRefFromUrl(paymentUrl);  // Lấy txnRef từ URL của VNPay

                // Lưu txnRef vào Job ngay sau khi tạo paymentUrl
                job.setTxnRef(txnRef);  // Lưu txnRef vào Job
                jobRepository.save(job);  // Lưu cập nhật txnRef vào database

                // Trả về URL thanh toán cho người dùng
                response.put("paymentUrl", paymentUrl);
                return response;
            } catch (Exception e) {
                response.put("message", "Failed to create payment through VNPay: " + e.getMessage());
                return response;
            }
        }

        // Nếu chọn phương thức thanh toán tiền mặt, hoàn tất tạo job
        response.put("message", "Job booked successfully");
        response.put("jobId", job.getId());
        response.put("status", job.getStatus());
        response.put("totalPrice", totalPrice);

        return response;
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
            address.setIs_current(false); // Hoặc nếu bạn dùng "is_default", hãy đổi theo thuộc tính đó
            customerAddressRepository.save(address);
        }

        // Cập nhật địa chỉ được chọn thành mặc định
        CustomerAddresses defaultAddress = customerAddressRepository.findById(addressId).orElse(null);
        if (defaultAddress != null) {
            defaultAddress.setIs_current(true); // Hoặc nếu bạn dùng "is_default", hãy đổi theo thuộc tính đó
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

        // Chuyển trạng thái công việc sang "DONE"
        job.setStatus(JobStatus.DONE);
        jobRepository.save(job);

        // Nếu phương thức thanh toán là "Cash", tiến hành trừ tiền hoa hồng từ ví của cleaner
        if (job.getPaymentMethod().equalsIgnoreCase("Cash")) {
            // Lấy thông tin ví của cleaner
            Optional<Wallet> walletOpt = walletRepository.findByCleanerId(cleaner.getId());
            if (!walletOpt.isPresent()) {
                response.put("message", "Cleaner wallet not found");
                return response;
            }

            Wallet wallet = walletOpt.get();

            // Tính hoa hồng (20% của tổng giá)
            double commission = 0.2 * job.getTotalPrice();

            // Kiểm tra số dư ví của cleaner có đủ để trừ hoa hồng không
            if (wallet.getBalance() < commission) {
                response.put("message", "Insufficient balance in cleaner's wallet to cover the commission");
                return response;
            }

            // Trừ đi hoa hồng từ ví của cleaner
            wallet.setBalance(wallet.getBalance() - commission);
            walletRepository.save(wallet);

            response.put("message", "Commission deducted from cleaner's wallet");
        }

        response.put("message", "Job status updated to DONE");
        return response;
    }





    
    // list tất cả job đã book
    public List<Map<String, Object>> getBookedJobsForCustomer(Long customerId) {
        List<Map<String, Object>> bookedJobs = new ArrayList<Map<String,Object>>();

        // Lấy tất cả các job mà customer đã đặt
        List<Job> jobs = jobRepository.findByCustomerId(customerId);

        for (Job job : jobs) {
            Map<String, Object> jobInfo = new HashMap<>();

            // Thêm các thông tin chi tiết của job vào jobInfo
            jobInfo.put("jobId", job.getId());
            jobInfo.put("scheduledTime", job.getScheduledTime());  // Thời gian
            jobInfo.put("customerAddress", job.getCustomerAddress().getAddress());  // Địa chỉ
            jobInfo.put("status", job.getStatus());  // Trạng thái
            jobInfo.put("totalPrice", job.getTotalPrice());  // Giá
//            jobInfo.put("createdAt", job.getCreatedAt());  // Thời gian tạo

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

            bookedJobs.add(jobInfo);
        }

        return bookedJobs;
    }


    
    // huy job ddax book
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
        if (job.getStatus().equals(JobStatus.STARTED) || job.getStatus().equals(JobStatus.COMPLETED) || job.getStatus().equals(JobStatus.DONE) ) {
            response.put("message", "You cannot cancel a job that has already started");
            return response;
        }

        // Cập nhật trạng thái công việc thành "CANCELLED"
        job.setStatus(JobStatus.CANCELLED);
        jobRepository.save(job);

        response.put("message", "Job has been cancelled successfully");
        response.put("jobId", jobId);
        response.put("status", job.getStatus());
        return response;
    }
    
    
    
    
    // LU


    



}

